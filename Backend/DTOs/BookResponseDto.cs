// DTOs/BookResponseDto.cs
public class BookResponseDto
{
	public int BookId { get; set; }
	public string Title { get; set; } = null!;
	public string ISBN { get; set; } = null!;
	public decimal Price { get; set; }
	public string AvailabilityStatus { get; set; } = null!;
	public DateTime PublicationDate { get; set; }
	public string Publisher { get; set; } = null!;
	public string Format { get; set; } = null!;
	public string Language { get; set; } = null!;
	public string Description { get; set; } = null!;
	public string ImageUrl { get; set; } = null!;
	public List<string> Authors { get; set; } = new();
	public List<string> Genres { get; set; } = new();
}

// Shared/PagedResult.cs
public class PagedResult<T>
{
	public int PageNumber { get; set; }
	public int PageSize { get; set; }
	public int TotalItems { get; set; }
	public List<T> Items { get; set; } = new();
}
