using System;
using System.Text;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Pomelo.EntityFrameworkCore.MySql.Infrastructure;
using Backend.API.Data;
using Backend.Models;
using Backend.Services;

var builder = WebApplication.CreateBuilder(args);

// ─── CORS Configuration ───────────────────────────────────
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", builder =>
    {
        builder.WithOrigins("http://localhost:5173")
               .AllowAnyHeader()
               .AllowAnyMethod();
    });
});

// ─── Database ─────────────────────────────────────────────
var conn = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<AppDbContext>(opts =>
    opts.UseMySql(conn, ServerVersion.AutoDetect(conn))
);

// ─── JWT Authentication ───────────────────────────────────
var jwt = builder.Configuration.GetSection("JwtSettings");
var key = Encoding.UTF8.GetBytes(jwt["Key"]!);

builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(o =>
    {
        o.RequireHttpsMetadata = true;
        o.SaveToken = true;
        o.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(key),
            ValidateIssuer = true,
            ValidIssuer = jwt["Issuer"],
            ValidateAudience = true,
            ValidAudience = jwt["Audience"],
            ValidateLifetime = true,
            ClockSkew = TimeSpan.Zero
        };
    });

// Add authorization
builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("AdminOnly", policy => policy.RequireRole("Admin"));
});

// ─── WebSocket Manager ───────────────────────────────────
builder.Services.AddSingleton<Backend.Services.WebSocketManager>();

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// ─── Ensure wwwroot/images exists ─────────────────────────
var imagesPath = Path.Combine(builder.Environment.ContentRootPath, "wwwroot", "images");
if (!Directory.Exists(imagesPath))
    Directory.CreateDirectory(imagesPath);

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseStaticFiles();

using var scope = app.Services.CreateScope();
var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
// db.Database.EnsureDeleted();
db.Database.EnsureCreated();

// Create admin user if it doesn't exist
var adminUsername = "admin";
var adminEmail = "admin@gmail.com";
var adminExists = await db.Users.AnyAsync(u => u.Username == adminUsername || u.Email == adminEmail);

if (!adminExists)
{
    var adminUser = new User
    {
        Username = adminUsername,
        Password = BCrypt.Net.BCrypt.HashPassword("Admin123!"),
        Email = adminEmail,
        Role = "Admin"
    };
    db.Users.Add(adminUser);
    await db.SaveChangesAsync();
    Console.WriteLine("Admin user created successfully.");
}
else
{
    Console.WriteLine("Admin user already exists.");
}

app.UseRouting();
app.UseHttpsRedirection();
app.UseCors("AllowReactApp");
app.UseWebSockets(); // Enable WebSocket support
app.UseMiddleware<WebSocketMiddleware>(); // Add WebSocket middleware
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.Run();