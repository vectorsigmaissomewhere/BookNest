using Microsoft.AspNetCore.Mvc;
using Backend.API.Data;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;
using System.Linq;
using System;
using Backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using System.Security.Claims;
using System.IdentityModel.Tokens.Jwt;
using Backend.DTOs;
using System.Net.Mail;
using System.Text;
using Backend.Services;

[ApiController]
[Route("api/[controller]")]
[Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
public class OrderController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly IConfiguration _config;
    private readonly Backend.Services.WebSocketManager _webSocketManager;

    public OrderController(AppDbContext db, IConfiguration config, Backend.Services.WebSocketManager webSocketManager)
    {
        _db = db;
        _config = config;
        _webSocketManager = webSocketManager;
    }

    [HttpPost]
    public async Task<IActionResult> CreateOrder([FromBody] CreateOrderDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        // Get user ID from JWT token
        var userIdClaim = User.FindFirstValue(JwtRegisteredClaimNames.Sub) 
            ?? User.FindFirstValue(ClaimTypes.NameIdentifier);
        
        if (!int.TryParse(userIdClaim, out var userId))
            return Unauthorized(new { Error = "Invalid user token." });

        // Verify user exists
        var user = await _db.Users.FindAsync(userId);
        if (user == null)
            return NotFound(new { Error = "User not found." });

        // Validate order items
        if (dto.OrderItems == null || !dto.OrderItems.Any())
            return BadRequest(new { Error = "Order must contain at least one item." });

        // Calculate total amount and validate book availability
        decimal totalAmount = 0;
        var orderItems = new List<OrderItem>();
        
        foreach (var item in dto.OrderItems)
        {
            var book = await _db.Books.FindAsync(item.BookId);
            if (book == null)
                return BadRequest(new { Error = $"Book with ID {item.BookId} not found." });
                
            if (book.InventoryQuantity < item.Quantity)
                return BadRequest(new { Error = $"Insufficient inventory for book: {book.Title}" });

            totalAmount += book.Price * item.Quantity;
            
            orderItems.Add(new OrderItem
            {
                BookId = item.BookId,
                Quantity = item.Quantity,
                UnitPrice = book.Price
            });
        }

        // Apply discounts (5% for 5+ books, 10% stackable after 10 orders)
        int totalQuantity = orderItems.Sum(i => i.Quantity);
        decimal discountPercentage = 1.0m;
        if (totalQuantity >= 5)
            discountPercentage *= 0.95m;

        var userOrderCount = await _db.Orders.CountAsync(o => o.UserId == userId && o.Status == "Delivered");
        if (userOrderCount >= 10 && userOrderCount % 10 == 0)
            discountPercentage *= 0.90m;

        totalAmount *= discountPercentage;

        // Create order
        var order = new Order
        {
            UserId = userId,
            Status = "Pending",
            TotalAmount = totalAmount,
            Quantity = totalQuantity,
            ClaimCode = GenerateClaimCode(),
            OrderItems = orderItems
        };

        // Update book inventory
        foreach (var item in orderItems)
        {
            var book = await _db.Books.FindAsync(item.BookId);
            book.InventoryQuantity -= item.Quantity;
        }

        _db.Orders.Add(order);
        await _db.SaveChangesAsync();

        // Send email with claim code and bill
        try
        {
            await SendOrderEmail(user, order, orderItems, "confirmation");
        }
        catch (Exception ex)
        {
            // Log the error but don't fail the order creation
            Console.WriteLine($"Failed to send email: {ex.Message}");
        }

        return Ok(new OrderResponseDto
        {
            OrderId = order.OrderId,
            UserId = order.UserId,
            ClaimCode = order.ClaimCode,
            Status = order.Status,
            TotalAmount = order.TotalAmount,
            Quantity = order.Quantity,
            CustomerName = user.Username,
            OrderItems = orderItems.Select(i => new OrderItemResponseDto
            {
                OrderItemId = i.OrderItemId,
                BookId = i.BookId,
                UnitPrice = i.UnitPrice,
                Quantity = i.Quantity,
                BookTitle = _db.Books.Find(i.BookId)?.Title
            }).ToList()
        });
    }

    [HttpGet]
    [Authorize(Roles = "Admin,Staff")]
    public async Task<IActionResult> GetAllOrders()
    {
        var orders = await _db.Orders
            .Include(o => o.User)
            .Include(o => o.OrderItems)
            .ThenInclude(oi => oi.Book)
            .Select(o => new OrderResponseDto
            {
                OrderId = o.OrderId,
                UserId = o.UserId,
                ClaimCode = o.ClaimCode,
                Status = o.Status,
                TotalAmount = o.TotalAmount,
                Quantity = o.Quantity,
                CustomerName = o.User.Username,
                OrderItems = o.OrderItems.Select(oi => new OrderItemResponseDto
                {
                    OrderItemId = oi.OrderItemId,
                    BookId = oi.BookId,
                    UnitPrice = oi.UnitPrice,
                    Quantity = oi.Quantity,
                    BookTitle = oi.Book.Title
                }).ToList()
            })
            .ToListAsync();

        return Ok(orders);
    }

    [HttpGet("my-orders")]
    public async Task<IActionResult> GetUserOrders()
    {
        var userIdClaim = User.FindFirstValue(JwtRegisteredClaimNames.Sub) 
            ?? User.FindFirstValue(ClaimTypes.NameIdentifier);
        
        if (!int.TryParse(userIdClaim, out var userId))
            return Unauthorized(new { Error = "Invalid user token." });

        var orders = await _db.Orders
            .Where(o => o.UserId == userId)
            .Include(o => o.OrderItems)
            .ThenInclude(oi => oi.Book)
            .Select(o => new OrderResponseDto
            {
                OrderId = o.OrderId,
                UserId = o.UserId,
                ClaimCode = o.ClaimCode,
                Status = o.Status,
                TotalAmount = o.TotalAmount,
                Quantity = o.Quantity,
                CustomerName = o.User.Username,
                OrderItems = o.OrderItems.Select(oi => new OrderItemResponseDto
                {
                    OrderItemId = oi.OrderItemId,
                    BookId = oi.BookId,
                    UnitPrice = oi.UnitPrice,
                    Quantity = oi.Quantity,
                    BookTitle = oi.Book.Title
                }).ToList()
            })
            .ToListAsync();

        return Ok(orders);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetOrder(int id)
    {
        var userIdClaim = User.FindFirstValue(JwtRegisteredClaimNames.Sub) 
            ?? User.FindFirstValue(ClaimTypes.NameIdentifier);
        
        if (!int.TryParse(userIdClaim, out var userId))
            return Unauthorized(new { Error = "Invalid user token." });

        var order = await _db.Orders
            .Where(o => o.OrderId == id && o.UserId == userId)
            .Include(o => o.OrderItems)
            .ThenInclude(oi => oi.Book)
            .Select(o => new OrderResponseDto
            {
                OrderId = o.OrderId,
                UserId = o.UserId,
                ClaimCode = o.ClaimCode,
                Status = o.Status,
                TotalAmount = o.TotalAmount,
                Quantity = o.Quantity,
                CustomerName = o.User.Username,
                OrderItems = o.OrderItems.Select(oi => new OrderItemResponseDto
                {
                    OrderItemId = oi.OrderItemId,
                    BookId = oi.BookId,
                    UnitPrice = oi.UnitPrice,
                    Quantity = oi.Quantity,
                    BookTitle = oi.Book.Title
                }).ToList()
            })
            .FirstOrDefaultAsync();

        if (order == null)
            return NotFound(new { Error = "Order not found." });

        return Ok(order);
    }

    [HttpPut("{claimCode}/process")]
    [Authorize(Roles = "Staff")]
    public async Task<IActionResult> ProcessOrder(string claimCode)
    {
        var order = await _db.Orders
            .Include(o => o.OrderItems)
            .ThenInclude(oi => oi.Book)
            .Include(o => o.User)
            .FirstOrDefaultAsync(o => o.ClaimCode == claimCode);

        if (order == null)
            return NotFound(new { Error = "Order not found with the provided claim code." });

        if (order.Status != "Pending")
            return BadRequest(new { Error = "Order cannot be processed. It is not in Pending status." });

        order.Status = "Delivered";
        await _db.SaveChangesAsync();

        // Broadcast order notification to all WebSocket clients
        var bookTitles = order.OrderItems
            .Select(oi => oi.Book.Title)
            .Where(t => t != null)
            .ToList();
        var message = $"Order processed! Books delivered: {string.Join(", ", bookTitles)} to {order.User.Username} (Total: ${order.TotalAmount:F2})";
        await _webSocketManager.BroadcastMessageAsync(message);

        return Ok(new { Message = "Order processed successfully.", ClaimCode = claimCode });
    }

    [HttpPut("{id}/cancel")]
    public async Task<IActionResult> CancelOrder(int id)
    {
        var userIdClaim = User.FindFirstValue(JwtRegisteredClaimNames.Sub) 
            ?? User.FindFirstValue(ClaimTypes.NameIdentifier);
        
        if (!int.TryParse(userIdClaim, out var userId))
            return Unauthorized(new { Error = "Invalid user token." });

        var order = await _db.Orders
            .Include(o => o.OrderItems)
            .FirstOrDefaultAsync(o => o.OrderId == id && o.UserId == userId);

        if (order == null)
            return NotFound(new { Error = "Order not found or you are not authorized to cancel it." });

        if (order.Status != "Pending")
            return BadRequest(new { Error = "Order cannot be cancelled. It is not in Pending status." });

        // Restore book inventory
        foreach (var item in order.OrderItems)
        {
            var book = await _db.Books.FindAsync(item.BookId);
            if (book != null)
            {
                book.InventoryQuantity += item.Quantity;
            }
        }

        order.Status = "Cancelled";
        await _db.SaveChangesAsync();

        // Send cancellation email
        try
        {
            var user = await _db.Users.FindAsync(userId);
            await SendOrderEmail(user, order, order.OrderItems.ToList(), "cancellation");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Failed to send cancellation email: {ex.Message}");
        }

        return Ok(new { Message = "Order cancelled successfully.", OrderId = id });
    }

    [HttpPut("{id}/status")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateOrderStatus(int id, [FromBody] UpdateOrderStatusDto dto)
    {
        var order = await _db.Orders.FindAsync(id);
        if (order == null)
            return NotFound(new { Error = "Order not found." });

        if (!IsValidStatus(dto.Status))
            return BadRequest(new { Error = "Invalid status value." });

        order.Status = dto.Status;
        await _db.SaveChangesAsync();

        return Ok(new { Message = "Order status updated successfully.", OrderId = id });
    }

    private bool IsValidStatus(string status)
    {
        return new[] { "Pending", "Processing", "Shipped", "Delivered", "Cancelled" }.Contains(status);
    }

    private string GenerateClaimCode()
    {
        return Guid.NewGuid().ToString("N").Substring(0, 8).ToUpper();
    }

    private async Task SendOrderEmail(User user, Order order, List<OrderItem> orderItems, string emailType)
    {
        var smtpSettings = _config.GetSection("SmtpSettings");
        using var client = new SmtpClient(smtpSettings["Host"], int.Parse(smtpSettings["Port"]))
        {
            Credentials = new System.Net.NetworkCredential(smtpSettings["Username"], smtpSettings["Password"]),
            EnableSsl = true
        };

        var mailMessage = new MailMessage
        {
            From = new MailAddress(smtpSettings["Username"], "Book Library Store"),
            IsBodyHtml = true
        };
        mailMessage.To.Add(user.Email);

        var emailBody = new StringBuilder();
        if (emailType == "confirmation")
        {
            mailMessage.Subject = $"Order Confirmation - Claim Code {order.ClaimCode}";
            emailBody.Append("<h2>Order Confirmation</h2>");
            emailBody.Append($"<p>Dear {user.Username},</p>");
            emailBody.Append("<p>Thank you for your order! Below are the details of your purchase:</p>");
            emailBody.Append($"<p><strong>Order ID:</strong> {order.OrderId}</p>");
            emailBody.Append($"<p><strong>Claim Code:</strong> {order.ClaimCode}</p>");
            emailBody.Append("<h3>Order Details</h3>");
            emailBody.Append("<table border='1' cellpadding='5' style='border-collapse: collapse;'>");
            emailBody.Append("<tr><th>Book Title</th><th>Quantity</th><th>Unit Price</th><th>Subtotal</th></tr>");

            foreach (var item in orderItems)
            {
                var book = await _db.Books.FindAsync(item.BookId);
                emailBody.Append("<tr>");
                emailBody.Append($"<td>{book.Title}</td>");
                emailBody.Append($"<td>{item.Quantity}</td>");
                emailBody.Append($"<td>${item.UnitPrice:F2}</td>");
                emailBody.Append($"<td>${(item.Quantity * item.UnitPrice):F2}</td>");
                emailBody.Append("</tr>");
            }

            emailBody.Append("</table>");
            emailBody.Append($"<p><strong>Total Amount:</strong> ${order.TotalAmount:F2}</p>");
            emailBody.Append("<p><strong>Pickup Instructions:</strong> Please present your membership ID and the claim code at the store to complete your purchase.</p>");
            emailBody.Append("<p>Thank you for shopping with us!</p>");
        }
        else if (emailType == "cancellation")
        {
            mailMessage.Subject = $"Order Cancellation - Order ID {order.OrderId}";
            emailBody.Append("<h2>Order Cancellation</h2>");
            emailBody.Append($"<p>Dear {user.Username},</p>");
            emailBody.Append("<p>Your order has been successfully cancelled. Below are the details:</p>");
            emailBody.Append($"<p><strong>Order ID:</strong> {order.OrderId}</p>");
            emailBody.Append($"<p><strong>Claim Code:</strong> {order.ClaimCode}</p>");
            emailBody.Append("<p>If you have any questions, please contact our support team.</p>");
        }

        emailBody.Append("<p>Best regards,<br>Book Library Store Team</p>");
        mailMessage.Body = emailBody.ToString();

        await client.SendMailAsync(mailMessage);
    }
}

namespace Backend.DTOs
{
    public class CreateOrderDto
    {
        public List<CreateOrderItemDto> OrderItems { get; set; }
    }

    public class CreateOrderItemDto
    {
        public int BookId { get; set; }
        public int Quantity { get; set; }
    }

    public class OrderResponseDto
    {
        public int OrderId { get; set; }
        public int UserId { get; set; }
        public string ClaimCode { get; set; }
        public string Status { get; set; }
        public decimal TotalAmount { get; set; }
        public int Quantity { get; set; }
        public string CustomerName { get; set; }
        public List<OrderItemResponseDto> OrderItems { get; set; }
    }

    public class OrderItemResponseDto
    {
        public int OrderItemId { get; set; }
        public int BookId { get; set; }
        public decimal UnitPrice { get; set; }
        public int Quantity { get; set; }
        public string BookTitle { get; set; }
    }

    public class UpdateOrderStatusDto
    {
        public string Status { get; set; }
    }
}