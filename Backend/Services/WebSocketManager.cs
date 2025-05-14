

using System;
using System.Collections.Concurrent;
using System.Net.WebSockets;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace Backend.Services;

public class WebSocketManager
{
    private readonly ConcurrentDictionary<string, WebSocket> _sockets = new ConcurrentDictionary<string, WebSocket>();

    public string AddSocket(WebSocket socket)
    {
        var socketId = Guid.NewGuid().ToString();
        _sockets.TryAdd(socketId, socket);
        return socketId;
    }

    public async Task RemoveSocket(string socketId)
    {
        if (_sockets.TryRemove(socketId, out var socket))
        {
            await socket.CloseAsync(WebSocketCloseStatus.NormalClosure, "Connection closed", CancellationToken.None);
        }
    }

    public async Task BroadcastMessageAsync(string message)
    {
        var buffer = Encoding.UTF8.GetBytes(message);
        foreach (var socket in _sockets)
        {
            if (socket.Value.State == WebSocketState.Open)
            {
                await socket.Value.SendAsync(
                    new ArraySegment<byte>(buffer),
                    WebSocketMessageType.Text,
                    true,
                    CancellationToken.None
                );
            }
        }
    }
}