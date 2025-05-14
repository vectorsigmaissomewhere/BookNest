namespace Backend.Models;

public class Bookmark
{
    public int UserId { get; set; }
    public User User { get; set; }

    public int BookId { get; set; }
    public Book Book { get; set; }
}