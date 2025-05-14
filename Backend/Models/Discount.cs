namespace Backend.Models;

public class Discount
{
    public int DiscountId { get; set; }
    public int BookId { get; set; }
    public Book Book { get; set; }

    public double DiscountPercentage { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public bool IsOnSale { get; set; }
}