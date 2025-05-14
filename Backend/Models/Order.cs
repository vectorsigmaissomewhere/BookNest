namespace Backend.Models;

public class Order
{
    public int OrderId { get; set; }
    public int UserId { get; set; }
    public User User { get; set; }
    public string ClaimCode { get; set; }
    public string Status { get; set; }
    public decimal TotalAmount { get; set; }
    public int Quantity { get; set; }

    public ICollection<OrderItem> OrderItems { get; set; }
}