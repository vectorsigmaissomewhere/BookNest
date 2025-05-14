

namespace Backend.Controllers;

using Microsoft.AspNetCore.Mvc;
using Backend.DTOs;
using Backend.Models;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Backend.API.Data;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;
using System;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Authentication.JwtBearer;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly IConfiguration _config;

    public AuthController(AppDbContext db, IConfiguration config)
    {
        _db = db;
        _config = config;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterDto dto)
    {
        // Validate input
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        // Check for duplicate username or email
        if (await _db.Users.AnyAsync(u => u.Username == dto.Username))
            return BadRequest(new { Error = "Username already taken." });

        if (await _db.Users.AnyAsync(u => u.Email == dto.Email))
            return BadRequest(new { Error = "Email already registered." });

        // Determine role based on the number of existing users
        int userCount = await _db.Users.CountAsync();
        string role = userCount == 0 ? "Admin" : (userCount == 1 ? "Staff" : "Member");

        // Create new user with hashed password and dynamically assigned role
        var user = new User
        {
            Username = dto.Username,
            Email = dto.Email,
            Password = BCrypt.Net.BCrypt.HashPassword(dto.Password),
            Role = role
        };

        _db.Users.Add(user);
        await _db.SaveChangesAsync();

        return Ok(new { Message = "Registration successful." });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginDto dto)
    {
        // Validate input
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        // Find user
        var user = await _db.Users.SingleOrDefaultAsync(u => u.Username == dto.Username);
        if (user == null || !BCrypt.Net.BCrypt.Verify(dto.Password, user.Password))
            return Unauthorized(new { Error = "Invalid username or password." });

        // Validate JWT settings
        var jwtSection = _config.GetSection("JwtSettings");
        var key = jwtSection["Key"];
        if (string.IsNullOrEmpty(key) || key.Length < 32)
            return StatusCode(500, new { Error = "Invalid JWT configuration." });

        var claims = new[]
 {
    // the "sub" claim
    new Claim(JwtRegisteredClaimNames.Sub, user.UserId.ToString()),

    // ASP.NET Identity expects NameIdentifier
    new Claim(ClaimTypes.NameIdentifier, user.UserId.ToString()),

    // whichever username claim you like
    new Claim(JwtRegisteredClaimNames.UniqueName, user.Username),
    new Claim(ClaimTypes.Name, user.Username),

    // roles
    new Claim(ClaimTypes.Role, user.Role)
};

        // Generate JWT token
        var keyBytes = Encoding.UTF8.GetBytes(key);
        var duration = double.TryParse(jwtSection["DurationInMinutes"], out double minutes) ? minutes : 60.0;
        var token = new JwtSecurityToken(
            issuer: jwtSection["Issuer"],
            audience: jwtSection["Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(duration),
            signingCredentials: new SigningCredentials(
                new SymmetricSecurityKey(keyBytes),
                SecurityAlgorithms.HmacSha256
            )
        );

        return Ok(new AuthResponseDto
        {
            Token = new JwtSecurityTokenHandler().WriteToken(token),
            Expires = token.ValidTo,
            Role = user.Role
        });
    }

    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
    [HttpPost("logout")]
    public IActionResult Logout()
    {
        // No server-side work needed for pure JWT auth
        return Ok(new { Message = "You have been logged out." });
    }


    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
    [HttpGet("me")]
    public async Task<IActionResult> GetCurrentUser()
    {
        // try both standard places for the user-ID
        var sub = User.FindFirstValue(JwtRegisteredClaimNames.Sub)
               ?? User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrEmpty(sub))
            return Unauthorized(new { Error = "No subject claim." });

        if (!int.TryParse(sub, out var userId))
            return Unauthorized(new { Error = "Invalid token subject." });

        var user = await _db.Users
            .AsNoTracking()
            .SingleOrDefaultAsync(u => u.UserId == userId);

        if (user == null)
            return NotFound(new { Error = "User not found." });

        return Ok(new
        {
            user.UserId,
            user.Username,
            user.Email,
            user.Role
        });
    }


}