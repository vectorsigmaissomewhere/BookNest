namespace Backend.API.Data;

using Microsoft.EntityFrameworkCore;
using Backend.Models;

public class AppDbContext : DbContext
{
	public AppDbContext(DbContextOptions<AppDbContext> options)
		: base(options)
	{
	}

	public DbSet<User> Users { get; set; }
	public DbSet<Book> Books { get; set; }
	public DbSet<Author> Authors { get; set; }
	public DbSet<BookAuthor> BookAuthors { get; set; }
	public DbSet<Genre> Genres { get; set; }
	public DbSet<BookGenre> BookGenres { get; set; }
	public DbSet<Order> Orders { get; set; }
	public DbSet<OrderItem> OrderItems { get; set; }
	public DbSet<Review> Reviews { get; set; }
	public DbSet<Bookmark> Bookmarks { get; set; }
	public DbSet<Discount> Discounts { get; set; }
	public DbSet<Announcement> Announcements { get; set; }
	public DbSet<CartItem> CartItems { get; set; }


	protected override void OnModelCreating(ModelBuilder modelBuilder)
	{
		// Composite primary‐keys for many-to-many join tables:
		modelBuilder.Entity<BookAuthor>()
			.HasKey(ba => new { ba.BookId, ba.AuthorId });

		modelBuilder.Entity<BookGenre>()
			.HasKey(bg => new { bg.BookId, bg.GenreId });

		modelBuilder.Entity<Bookmark>()
			.HasKey(bm => new { bm.UserId, bm.BookId });

		modelBuilder.Entity<CartItem>()
			.HasKey(ci => new { ci.UserId, ci.BookId });

		// (Optional) configure any other relations/indexes here.
	}

}