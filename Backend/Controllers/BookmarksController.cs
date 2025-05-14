using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.API.Data;
using Backend.Models;
using Backend.DTOs;

[ApiController]
[Authorize]
[Route("api/[controller]")]
public class BookmarksController : ControllerBase
{
	private readonly AppDbContext _db;
	public BookmarksController(AppDbContext db) => _db = db;

	// POST api/bookmarks
	[HttpPost]
	public async Task<IActionResult> Add([FromBody] CreateBookmarkDto dto)
	{
		var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
		if (await _db.Bookmarks.AnyAsync(b => b.UserId == userId && b.BookId == dto.BookId))
			return BadRequest("Already in wishlist.");

		_db.Bookmarks.Add(new Bookmark
		{
			UserId = userId,
			BookId = dto.BookId
		});
		await _db.SaveChangesAsync();
		return Ok();
	}

	// GET api/bookmarks
	[HttpGet]
	public async Task<IActionResult> Get()
	{
		var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
		var list = await _db.Bookmarks
			.Where(bm => bm.UserId == userId)
			.Select(bm => new BookResponseDto
			{
				BookId = bm.Book.BookId,
				Title = bm.Book.Title,
				ISBN = bm.Book.ISBN,
				Price = bm.Book.Price,
				AvailabilityStatus = bm.Book.AvailabilityStatus,
				PublicationDate = bm.Book.PublicationDate,
				Publisher = bm.Book.Publisher,
				Format = bm.Book.Format,
				Language = bm.Book.Language,
				Description = bm.Book.Description,
				ImageUrl = bm.Book.ImageUrl ?? "",
				Authors = bm.Book.BookAuthors.Select(ba => ba.Author.Name).ToList(),
				Genres = bm.Book.BookGenres.Select(bg => bg.Genre.Name).ToList()
			})
			.ToListAsync();
		return Ok(list);
	}

	// DELETE api/bookmarks/{bookId}
	[HttpDelete("{bookId}")]
	public async Task<IActionResult> Remove(int bookId)
	{
		var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
		var bm = await _db.Bookmarks.FindAsync(userId, bookId);
		if (bm == null) return NotFound();

		_db.Bookmarks.Remove(bm);
		await _db.SaveChangesAsync();
		return Ok();
	}
}

// DTOs/CreateBookmarkDto.cs
public class CreateBookmarkDto
{
	public int BookId { get; set; }
}
