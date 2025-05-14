using System;
using Microsoft.AspNetCore.Http;

namespace Backend.DTOs;

public class CreateBookDto
{
    public string Title { get; set; }
    public string ISBN { get; set; }
    public decimal Price { get; set; }
    public string AvailabilityStatus { get; set; }
    public DateTime PublicationDate { get; set; }
    public string Publisher { get; set; }
    public string Format { get; set; }
    public string Language { get; set; }
    public string Description { get; set; }
    public int InventoryQuantity { get; set; }
    public IFormFile ImageFile { get; set; }
    public List<int> AuthorIds { get; set; }
    public List<int> GenreIds { get; set; }
}

public class UpdateBookDto
{
    public string Title { get; set; }
    public string ISBN { get; set; }
    public decimal Price { get; set; }
    public string AvailabilityStatus { get; set; }
    public DateTime PublicationDate { get; set; }
    public string Publisher { get; set; }
    public string Format { get; set; }
    public string Language { get; set; }
    public string Description { get; set; }
    public int InventoryQuantity { get; set; }
    public IFormFile ImageFile { get; set; }
    public List<int> AuthorIds { get; set; }
    public List<int> GenreIds { get; set; }
}

public class BookResponseDto
{
    public int BookId { get; set; }
    public string Title { get; set; }
    public string ISBN { get; set; }
    public decimal Price { get; set; }
    public string AvailabilityStatus { get; set; }
    public DateTime PublicationDate { get; set; }
    public string Publisher { get; set; }
    public string Format { get; set; }
    public string Language { get; set; }
    public string Description { get; set; }
    public DateTime CreatedAt { get; set; }
    public int InventoryQuantity { get; set; }
    public string ImageUrl { get; set; }
    public List<string> Authors { get; set; }
    public List<string> Genres { get; set; }
}