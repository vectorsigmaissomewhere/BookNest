using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.API.Data;
using Backend.Models;
using Backend.DTOs;

[ApiController]
[Route("api/[controller]")]
public class BooksController : ControllerBase
{
	private readonly AppDbContext _db;
	public BooksController(AppDbContext db) => _db = db;

	// GET api/books
	[HttpGet]
	public async Task<IActionResult> GetBooks(
		[FromQuery] string? search,
		[FromQuery] int pageNumber = 1,
		[FromQuery] int pageSize = 8,
		[FromQuery] decimal? minPrice = null,
		[FromQuery] decimal? maxPrice = null,
		[FromQuery] int? authorId = null,
		[FromQuery] int? genreId = null,
		[FromQuery] string sortBy = "title",
		[FromQuery] string sortOrder = "asc"
	)
	{
		IQueryable<Book> q = _db.Books
			.Include(b => b.BookAuthors).ThenInclude(ba => ba.Author)
			.Include(b => b.BookGenres).ThenInclude(bg => bg.Genre);

		if (!string.IsNullOrWhiteSpace(search))
			q = q.Where(b =>
				b.Title.Contains(search) ||
				b.ISBN.Contains(search) ||
				b.Description.Contains(search)
			);

		if (minPrice.HasValue)
			q = q.Where(b => b.Price >= minPrice.Value);
		if (maxPrice.HasValue)
			q = q.Where(b => b.Price <= maxPrice.Value);

		if (authorId.HasValue)
			q = q.Where(b => b.BookAuthors.Any(ba => ba.AuthorId == authorId.Value));
		if (genreId.HasValue)
			q = q.Where(b => b.BookGenres.Any(bg => bg.GenreId == genreId.Value));

		// Sorting
		q = (sortBy.ToLower(), sortOrder.ToLower()) switch
		{
			("price", "desc") => q.OrderByDescending(b => b.Price),
			("price", "asc") => q.OrderBy(b => b.Price),
			("date", "desc") => q.OrderByDescending(b => b.PublicationDate),
			("date", "asc") => q.OrderBy(b => b.PublicationDate),
			_ => q.OrderBy(b => b.Title)
		};

		var totalItems = await q.CountAsync();
		var books = await q
			.Skip((pageNumber - 1) * pageSize)
			.Take(pageSize)
			.Select(b => new BookResponseDto
			{
				BookId = b.BookId,
				Title = b.Title,
				ISBN = b.ISBN,
				Price = b.Price,
				AvailabilityStatus = b.AvailabilityStatus,
				PublicationDate = b.PublicationDate,
				Publisher = b.Publisher,
				Format = b.Format,
				Language = b.Language,
				Description = b.Description,
				ImageUrl = b.ImageUrl ?? "",
				Authors = b.BookAuthors.Select(ba => ba.Author.Name).ToList(),
				Genres = b.BookGenres.Select(bg => bg.Genre.Name).ToList()
			})
			.ToListAsync();

		return Ok(new PagedResult<BookResponseDto>
		{
			Items = books,
			PageNumber = pageNumber,
			PageSize = pageSize,
			TotalItems = totalItems
		});
	}

	// GET api/books/{id}
	[HttpGet("{id}")]
	public async Task<IActionResult> GetBook(int id)
	{
		var dto = await _db.Books
			.Where(b => b.BookId == id)
			.Select(b => new BookResponseDto
			{
				BookId = b.BookId,
				Title = b.Title,
				ISBN = b.ISBN,
				Price = b.Price,
				AvailabilityStatus = b.AvailabilityStatus,
				PublicationDate = b.PublicationDate,
				Publisher = b.Publisher,
				Format = b.Format,
				Language = b.Language,
				Description = b.Description,
				ImageUrl = b.ImageUrl ?? "",
				Authors = b.BookAuthors.Select(ba => ba.Author.Name).ToList(),
				Genres = b.BookGenres.Select(bg => bg.Genre.Name).ToList()
			})
			.SingleOrDefaultAsync();

		if (dto == null) return NotFound();
		return Ok(dto);
	}
}
