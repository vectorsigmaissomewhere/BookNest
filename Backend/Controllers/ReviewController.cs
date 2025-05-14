namespace Backend.Controllers;

using Backend.API.Data;
using Backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using System.ComponentModel.DataAnnotations;
using System.Threading.Tasks;
using System.Linq;
using System.IdentityModel.Tokens.Jwt;

[Route("api/[controller]")]
[ApiController]
[Authorize(Roles = "Member")]
public class ReviewController : ControllerBase
{
    private readonly AppDbContext _context;

    public ReviewController(AppDbContext context)
    {
        _context = context;
    }

    private int GetUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
            ?? User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value;
        if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var userId))
        {
            throw new UnauthorizedAccessException("Invalid user ID in token.");
        }
        return userId;
    }

    // POST: api/review
    [HttpPost]
    public async Task<ActionResult> CreateReview([FromBody] CreateReviewRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        try
        {
            var userId = GetUserId();

            // Verify book exists
            var book = await _context.Books.FindAsync(request.BookId);
            if (book == null)
            {
                return NotFound(new { Error = "Book not found." });
            }

            // Check if user has purchased the book (Delivered order)
            var hasPurchased = await _context.Orders
                .Where(o => o.UserId == userId && o.Status == "Delivered")
                .Include(o => o.OrderItems)
                .AnyAsync(o => o.OrderItems.Any(oi => oi.BookId == request.BookId));
            if (!hasPurchased)
            {
                return BadRequest(new { Error = "You can only review books you have purchased." });
            }

            // Check if user already reviewed this book
            var existingReview = await _context.Reviews
                .FirstOrDefaultAsync(r => r.UserId == userId && r.BookId == request.BookId);
            if (existingReview != null)
            {
                return BadRequest(new { Error = "You have already reviewed this book." });
            }

            var review = new Review
            {
                UserId = userId,
                BookId = request.BookId,
                Rating = request.Rating,
                Comment = request.Comment,
                CreatedAt = DateTime.UtcNow
            };

            _context.Reviews.Add(review);
            await _context.SaveChangesAsync();

            return Ok(new ReviewResponse
            {
                ReviewId = review.ReviewId,
                UserId = review.UserId,
                Username = _context.Users.Find(userId)?.Username,
                BookId = review.BookId,
                BookTitle = book.Title,
                Rating = review.Rating,
                Comment = review.Comment,
                CreatedAt = review.CreatedAt
            });
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new { Error = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { Error = "An error occurred while creating the review.", Details = ex.Message });
        }
    }

    // GET: api/review/book/{bookId}
    [HttpGet("book/{bookId}")]
    [AllowAnonymous] // Publicly accessible
    public async Task<ActionResult<IEnumerable<ReviewResponse>>> GetReviewsByBook(int bookId)
    {
        try
        {
            var book = await _context.Books.FindAsync(bookId);
            if (book == null)
            {
                return NotFound(new { Error = "Book not found." });
            }

            var reviews = await _context.Reviews
                .Where(r => r.BookId == bookId)
                .Include(r => r.User)
                .Select(r => new ReviewResponse
                {
                    ReviewId = r.ReviewId,
                    UserId = r.UserId,
                    Username = r.User.Username,
                    BookId = r.BookId,
                    BookTitle = r.Book.Title,
                    Rating = r.Rating,
                    Comment = r.Comment,
                    CreatedAt = r.CreatedAt
                })
                .ToListAsync();

            return Ok(reviews);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { Error = "An error occurred while fetching reviews.", Details = ex.Message });
        }
    }

    // PUT: api/review/{reviewId}
    [HttpPut("{reviewId}")]
    public async Task<ActionResult> UpdateReview(int reviewId, [FromBody] UpdateReviewRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        try
        {
            var userId = GetUserId();

            var review = await _context.Reviews
                .FirstOrDefaultAsync(r => r.ReviewId == reviewId && r.UserId == userId);
            if (review == null)
            {
                return NotFound(new { Error = "Review not found or you are not authorized to update it." });
            }

            review.Rating = request.Rating;
            review.Comment = request.Comment;
            review.CreatedAt = DateTime.UtcNow; // Update timestamp

            await _context.SaveChangesAsync();

            return Ok(new ReviewResponse
            {
                ReviewId = review.ReviewId,
                UserId = review.UserId,
                Username = _context.Users.Find(userId)?.Username,
                BookId = review.BookId,
                BookTitle = _context.Books.Find(review.BookId)?.Title,
                Rating = review.Rating,
                Comment = review.Comment,
                CreatedAt = review.CreatedAt
            });
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new { Error = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { Error = "An error occurred while updating the review.", Details = ex.Message });
        }
    }

    // DELETE: api/review/{reviewId}
    [HttpDelete("{reviewId}")]
    public async Task<ActionResult> DeleteReview(int reviewId)
    {
        try
        {
            var userId = GetUserId();

            var review = await _context.Reviews
                .FirstOrDefaultAsync(r => r.ReviewId == reviewId && r.UserId == userId);
            if (review == null)
            {
                return NotFound(new { Error = "Review not found or you are not authorized to delete it." });
            }

            _context.Reviews.Remove(review);
            await _context.SaveChangesAsync();

            return Ok(new { Message = "Review deleted successfully." });
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new { Error = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { Error = "An error occurred while deleting the review.", Details = ex.Message });
        }
    }
}

public class CreateReviewRequest
{
    [Required]
    public int BookId { get; set; }

    [Required]
    [Range(1, 5, ErrorMessage = "Rating must be between 1 and 5.")]
    public int Rating { get; set; }

    [MaxLength(500, ErrorMessage = "Comment cannot exceed 500 characters.")]
    public string? Comment { get; set; }
}

public class UpdateReviewRequest
{
    [Required]
    [Range(1, 5, ErrorMessage = "Rating must be between 1 and 5.")]
    public int Rating { get; set; }

    [MaxLength(500, ErrorMessage = "Comment cannot exceed 500 characters.")]
    public string? Comment { get; set; }
}

public class ReviewResponse
{
    public int ReviewId { get; set; }
    public int UserId { get; set; }
    public string? Username { get; set; }
    public int BookId { get; set; }
    public string? BookTitle { get; set; }
    public int Rating { get; set; }
    public string? Comment { get; set; }
    public DateTime CreatedAt { get; set; }
}