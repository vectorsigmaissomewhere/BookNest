
using System.ComponentModel.DataAnnotations;

namespace Backend.DTOs
{
	public class CreateAuthorDto
	{
		[Required]
		public string Name { get; set; }
	}

	public class AuthorResponseDto
	{
		public int AuthorId { get; set; }
		public string Name { get; set; }
	}

	public class CreateGenreDto
	{
		[Required]
		public string Name { get; set; }
	}

	public class GenreResponseDto
	{
		public int GenreId { get; set; }
		public string Name { get; set; }
	}
}
