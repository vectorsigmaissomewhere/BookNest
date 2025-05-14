using System;
using System.Net.WebSockets;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;

namespace Backend.Services;

public class WebSocketMiddleware
{
    private readonly RequestDelegate _next;
    private readonly WebSocketManager _webSocketManager;

    public WebSocketMiddleware(RequestDelegate next, WebSocketManager webSocketManager)
    {
        _next = next;
        _webSocketManager = webSocketManager;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        if (context.Request.Path == "/ws" && context.WebSockets.IsWebSocketRequest)
        {
            var webSocket = await context.WebSockets.AcceptWebSocketAsync();
            var socketId = _webSocketManager.AddSocket(webSocket);

            await HandleWebSocketAsync(webSocket, socketId);
        }
        else
        {
            await _next(context);
        }
    }

    private async Task HandleWebSocketAsync(WebSocket webSocket, string socketId)
    {
        var buffer = new byte[1024 * 4];
        WebSocketReceiveResult result;

        do
        {
            result = await webSocket.ReceiveAsync(new ArraySegment<byte>(buffer), CancellationToken.None);

            if (result.CloseStatus.HasValue)
            {
                await _webSocketManager.RemoveSocket(socketId);
                break;
            }
        } while (!result.CloseStatus.HasValue);
    }
}