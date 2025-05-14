namespace Backend.Models;

using System.ComponentModel.DataAnnotations;

public class User
{
    public int UserId { get; set; }

    [Required]
    public string Username { get; set; } = null!;

    [Required]
    public string Password { get; set; } = null!;

    [Required]
    [EmailAddress]
    public string Email { get; set; } = null!;

    [Required]
    public string Role { get; set; } = null!;

    public ICollection<Order> Orders { get; set; } = new List<Order>();
    public ICollection<Review> Reviews { get; set; } = new List<Review>();
    public ICollection<Bookmark> Bookmarks { get; set; } = new List<Bookmark>();
}