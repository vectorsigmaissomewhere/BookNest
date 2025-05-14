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
public class CartController : ControllerBase
{
	private readonly AppDbContext _db;
	public CartController(AppDbContext db) => _db = db;

	// POST api/cart
	[HttpPost]
	public async Task<IActionResult> Add([FromBody] CartItemDto dto)
	{
		var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
		var existing = await _db.CartItems.FindAsync(userId, dto.BookId);

		if (existing != null)
			existing.Quantity += dto.Quantity;
		else
			_db.CartItems.Add(new CartItem
			{
				UserId = userId,
				BookId = dto.BookId,
				Quantity = dto.Quantity
			});

		await _db.SaveChangesAsync();
		return Ok();
	}

	// GET api/cart
	[HttpGet]
	public async Task<IActionResult> Get()
	{
		var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
		var items = await _db.CartItems
			.Where(ci => ci.UserId == userId)
			.Select(ci => new
			{
				ci.BookId,
				ci.Book.Title,
				ci.Book.Price,
				ci.Quantity,
				ci.Book.ImageUrl
			})
			.ToListAsync();
		return Ok(items);
	}

	// PUT api/cart/{bookId}
	[HttpPut("{bookId}")]
	public async Task<IActionResult> Update(int bookId, [FromBody] UpdateCartItemDto dto)
	{
		var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
		var item = await _db.CartItems.FindAsync(userId, bookId);
		if (item == null) return NotFound();
		item.Quantity = dto.Quantity;
		await _db.SaveChangesAsync();
		return Ok();
	}

	// DELETE api/cart/{bookId}
	[HttpDelete("{bookId}")]
	public async Task<IActionResult> Remove(int bookId)
	{
		var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
		var item = await _db.CartItems.FindAsync(userId, bookId);
		if (item == null) return NotFound();
		_db.CartItems.Remove(item);
		await _db.SaveChangesAsync();
		return Ok();
	}
}

// DTOs/CartItemDto.cs
public class CartItemDto
{
	public int BookId { get; set; }
	public int Quantity { get; set; }
}

// DTOs/UpdateCartItemDto.cs
public class UpdateCartItemDto
{
	public int Quantity { get; set; }
}
