namespace Backend.Models;

public class Author
{
    public int AuthorId { get; set; }
    public string Name { get; set; }

    public ICollection<BookAuthor> BookAuthors { get; set; }
}