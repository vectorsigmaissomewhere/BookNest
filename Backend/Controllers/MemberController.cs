using Microsoft.AspNetCore.Mvc;
using Backend.API.Data;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;
using System.Linq;
using System;
using Backend.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Backend.Models;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

[ApiController]
[Route("api/[controller]")]
public class MemberController : ControllerBase
{
    private readonly AppDbContext _db;

    public MemberController(AppDbContext db)
    {
        _db = db;
    }

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