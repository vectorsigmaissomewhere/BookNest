namespace Backend.Models;

public class Book
{
    public int BookId { get; set; }
    public string Title { get; set; }
    public string ISBN { get; set; }
    public decimal Price { get; set; }
    public string AvailabilityStatus { get; set; }
    public DateTime PublicationDate { get; set; }
    public string Publisher { get; set; }
    public string Format { get; set; }
    public string Language { get; set; }
    public string Description { get; set; }
    public DateTime CreatedAt { get; set; }
    public int InventoryQuantity { get; set; }
    public string ImageUrl { get; set; }

    public ICollection<BookAuthor> BookAuthors { get; set; }
    public ICollection<BookGenre> BookGenres { get; set; }
    public ICollection<OrderItem> OrderItems { get; set; }
    public ICollection<Review> Reviews { get; set; }
    public ICollection<Bookmark> Bookmarks { get; set; }
    public ICollection<Discount> Discounts { get; set; }
}