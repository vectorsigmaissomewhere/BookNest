namespace Backend.Controllers;

using System;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Backend.DTOs;
using Backend.Models;
using Backend.API.Data;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;
using System.Collections.Generic;
using System.Linq;

[ApiController]
[Route("api/[controller]")]
public class AdminController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly IWebHostEnvironment _env;

    public AdminController(AppDbContext db, IWebHostEnvironment env)
    {
        _db = db;
        _env = env;
    }

    [HttpPost("books")]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> CreateBook([FromForm] CreateBookDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        // 1) Save image
        // 1) Save image
        string imageUrl = null;
        if (dto.ImageFile != null && dto.ImageFile.Length > 0)
        {
            // Point explicitly at wwwroot/images under your project folder:
            var uploadsRoot = Path.Combine(_env.ContentRootPath, "wwwroot", "images");
            if (!Directory.Exists(uploadsRoot))
                Directory.CreateDirectory(uploadsRoot);

            var fileName = Guid.NewGuid() + Path.GetExtension(dto.ImageFile.FileName);
            var filePath = Path.Combine(uploadsRoot, fileName);

            using var stream = new FileStream(filePath, FileMode.Create);
            await dto.ImageFile.CopyToAsync(stream);

            imageUrl = $"/images/{fileName}";
        }


        // 2) Create book
        var book = new Book
        {
            Title = dto.Title,
            ISBN = dto.ISBN,
            Price = dto.Price,
            AvailabilityStatus = dto.AvailabilityStatus,
            PublicationDate = dto.PublicationDate,
            Publisher = dto.Publisher,
            Format = dto.Format,
            Language = dto.Language,
            Description = dto.Description,
            InventoryQuantity = dto.InventoryQuantity,
            ImageUrl = imageUrl,
            CreatedAt = DateTime.UtcNow
        };

        _db.Books.Add(book);
        await _db.SaveChangesAsync();

        // 3) Associate authors & genres
        if (dto.AuthorIds != null)
            foreach (var aid in dto.AuthorIds)
                _db.BookAuthors.Add(new BookAuthor { BookId = book.BookId, AuthorId = aid });

        if (dto.GenreIds != null)
            foreach (var gid in dto.GenreIds)
                _db.BookGenres.Add(new BookGenre { BookId = book.BookId, GenreId = gid });

        await _db.SaveChangesAsync();

        return Ok(new { Message = "Book created successfully.", BookId = book.BookId });
    }

    [HttpGet("books")]
    public async Task<IActionResult> GetBooks()
    {
        var books = await _db.Books
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
                CreatedAt = b.CreatedAt,
                InventoryQuantity = b.InventoryQuantity,
                ImageUrl = b.ImageUrl ?? string.Empty,
                Authors = b.BookAuthors.Select(ba => ba.Author.Name).ToList(),
                Genres = b.BookGenres.Select(bg => bg.Genre.Name).ToList()
            }).ToListAsync();

        return Ok(books);
    }

    [HttpPut("books/{id}")]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> UpdateBook(int id, [FromForm] UpdateBookDto dto)
    {
        var book = await _db.Books.FindAsync(id);
        if (book == null) return NotFound(new { Error = "Book not found." });
        if (!ModelState.IsValid) return BadRequest(ModelState);

        // 1) If a new image was uploaded, replace it
        // 1) Save image
        string imageUrl = null;
        if (dto.ImageFile != null && dto.ImageFile.Length > 0)
        {
            // Point explicitly at wwwroot/images under your project folder:
            var uploadsRoot = Path.Combine(_env.ContentRootPath, "wwwroot", "images");
            if (!Directory.Exists(uploadsRoot))
                Directory.CreateDirectory(uploadsRoot);

            var fileName = Guid.NewGuid() + Path.GetExtension(dto.ImageFile.FileName);
            var filePath = Path.Combine(uploadsRoot, fileName);

            using var stream = new FileStream(filePath, FileMode.Create);
            await dto.ImageFile.CopyToAsync(stream);

            imageUrl = $"/images/{fileName}";
        }


        // 2) Update other fields
        book.Title = dto.Title;
        book.ISBN = dto.ISBN;
        book.Price = dto.Price;
        book.AvailabilityStatus = dto.AvailabilityStatus;
        book.PublicationDate = dto.PublicationDate;
        book.Publisher = dto.Publisher;
        book.Format = dto.Format;
        book.Language = dto.Language;
        book.Description = dto.Description;
        book.InventoryQuantity = dto.InventoryQuantity;


        // 3) Re‐attach authors & genres
        _db.BookAuthors.RemoveRange(_db.BookAuthors.Where(ba => ba.BookId == id));
        _db.BookGenres.RemoveRange(_db.BookGenres.Where(bg => bg.BookId == id));
        if (dto.AuthorIds != null)
            foreach (var aid in dto.AuthorIds)
                _db.BookAuthors.Add(new BookAuthor { BookId = id, AuthorId = aid });
        if (dto.GenreIds != null)
            foreach (var gid in dto.GenreIds)
                _db.BookGenres.Add(new BookGenre { BookId = id, GenreId = gid });

        await _db.SaveChangesAsync();
        return Ok(new { Message = "Book updated successfully." });
    }

    [HttpDelete("books/{id}")]
    public async Task<IActionResult> DeleteBook(int id)
    {
        var book = await _db.Books.FindAsync(id);
        if (book == null)
            return NotFound(new { Error = "Book not found." });

        _db.Books.Remove(book);
        await _db.SaveChangesAsync();
        return Ok(new { Message = "Book deleted successfully." });
    }

    [HttpPut("books/{id}/inventory")]
    public async Task<IActionResult> UpdateInventory(int id, [FromBody] int newQuantity)
    {
        var book = await _db.Books.FindAsync(id);
        if (book == null)
            return NotFound(new { Error = "Book not found." });

        book.InventoryQuantity = newQuantity;
        await _db.SaveChangesAsync();
        return Ok(new { Message = "Inventory updated successfully.", InventoryQuantity = newQuantity });
    }


    [HttpGet("books/{id}")]
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
                CreatedAt = b.CreatedAt,
                ImageUrl = b.ImageUrl ?? string.Empty,
                Authors = b.BookAuthors.Select(ba => ba.Author.Name).ToList(),
                Genres = b.BookGenres.Select(bg => bg.Genre.Name).ToList()
            })
            .SingleOrDefaultAsync();

        if (dto == null) return NotFound();
        return Ok(dto);
    }

    // POST api/admin/authors
    [HttpPost("authors")]
    public async Task<IActionResult> CreateAuthor([FromBody] CreateAuthorDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var author = new Author { Name = dto.Name };
        _db.Authors.Add(author);
        await _db.SaveChangesAsync();

        return Ok(new AuthorResponseDto
        {
            AuthorId = author.AuthorId,
            Name = author.Name
        });
    }

    // GET api/admin/authors
    [HttpGet("authors")]
    public async Task<IActionResult> GetAuthors()
    {
        var authors = await _db.Authors
            .Select(a => new AuthorResponseDto
            {
                AuthorId = a.AuthorId,
                Name = a.Name
            }).ToListAsync();

        return Ok(authors);
    }

    // POST api/admin/genres
    [HttpPost("genres")]
    public async Task<IActionResult> CreateGenre([FromBody] CreateGenreDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var genre = new Genre { Name = dto.Name };
        _db.Genres.Add(genre);
        await _db.SaveChangesAsync();

        return Ok(new GenreResponseDto
        {
            GenreId = genre.GenreId,
            Name = genre.Name
        });
    }

    // GET api/admin/genres
    [HttpGet("genres")]
    public async Task<IActionResult> GetGenres()
    {
        var genres = await _db.Genres
            .Select(g => new GenreResponseDto
            {
                GenreId = g.GenreId,
                Name = g.Name
            }).ToListAsync();

        return Ok(genres);
    }


    // POST api/admin/announcements
    [HttpPost("announcements")]
    public async Task<IActionResult> CreateAnnouncement([FromBody] CreateAnnouncementDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        if (dto.StartDate >= dto.EndDate)
            return BadRequest(new { Error = "End date must be after start date." });

        var announcement = new Announcement
        {
            Message = dto.Message,
            StartDate = dto.StartDate,
            EndDate = dto.EndDate
        };

        _db.Announcements.Add(announcement);
        await _db.SaveChangesAsync();

        return Ok(new { Message = "Announcement created successfully.", AnnouncementId = announcement.AnnouncementId });
    }

    // GET api/admin/announcements/active
    [AllowAnonymous] // Make this endpoint accessible to all users
    [HttpGet("announcements/active")]
    public async Task<IActionResult> GetActiveAnnouncements()
    {
        var currentDate = DateTime.UtcNow;
        var announcements = await _db.Announcements
            .Where(a => a.StartDate <= currentDate && a.EndDate >= currentDate)
            .Select(a => new AnnouncementResponseDto
            {
                AnnouncementId = a.AnnouncementId,
                Message = a.Message,
                StartDate = a.StartDate,
                EndDate = a.EndDate
            })
            .ToListAsync();

        return Ok(announcements);
    }
}

