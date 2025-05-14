namespace Backend.DTOs;

public class AuthResponseDto
{
    public string Token { get; set; }
    public DateTime Expires { get; set; }
    public string Role { get; set; } // Added for role-based navigation
}