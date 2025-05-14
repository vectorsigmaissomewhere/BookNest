namespace Backend.DTOs;

public class OrderItemDto
{
    public int BookId { get; set; }
    public decimal UnitPrice { get; set; }
    public int Quantity { get; set; }
}

public class OrderRequestDto
{
    public List<OrderItemDto> Items { get; set; }
}