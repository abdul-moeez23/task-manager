using Microsoft.OpenApi.Models;
using Microsoft.EntityFrameworkCore;
using TaskManager.API.Data;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using TaskManager.API.Services;

var builder = WebApplication.CreateBuilder(args);

// 🔐 JWT Key (fail fast if missing)
var jwtKey = builder.Configuration["Jwt:Key"]
    ?? throw new Exception("JWT Key is missing in appsettings.json");

// -------------------- SERVICES --------------------

// Controllers
builder.Services.AddControllers();

builder.Services.AddScoped<EmailService>();


// DbContext
builder.Services.AddDbContext<TaskDbContext>(options =>
    options.UseSqlServer(
        builder.Configuration.GetConnectionString("DefaultConnection")
    )
);

// CORS (Angular)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngular",
        policy => policy.SetIsOriginAllowed(origin => true) // Allow any origin (Azure frontend, localhost, etc.)
                        .AllowAnyMethod()
                        .AllowAnyHeader()
                        .AllowCredentials());
});

// 🔐 Authentication + JWT (MUST be before Build)
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,

        ValidIssuer = builder.Configuration["Jwt:Issuer"],
        ValidAudience = builder.Configuration["Jwt:Audience"],

        IssuerSigningKey = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(jwtKey)
        )
    };
    options.Events = new JwtBearerEvents
    {
        OnAuthenticationFailed = context =>
        {
            Console.WriteLine("Authentication failed: " + context.Exception.Message);
            return Task.CompletedTask;
        },
        OnTokenValidated = context =>
        {
            Console.WriteLine("Token validated for user: " + context.Principal?.Identity?.Name);
            return Task.CompletedTask;
        }
    };
});

// Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "TaskManager API",
        Version = "v1",
        Description = "An API for managing tasks efficiently."
    });
});

var app = builder.Build();

// -------------------- MIDDLEWARE --------------------

// Enable Swagger in all environments (including Azure Production)
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "TaskManager API V1");
    c.RoutePrefix = string.Empty; // Launch Swagger at root URL
});

if (app.Environment.IsDevelopment())
{
    // Development-specific middleware can go here
}



app.UseCors("AllowAngular");

// 🔑 ORDER IS CRITICAL
app.UseAuthentication();
app.UseAuthorization();

    app.UseAuthentication();
    app.UseAuthorization();

    app.MapControllers();

    // -------------------- AUTO-MIGRATION --------------------
    // Automatically apply pending migrations on startup (Crucial for Azure)
    using (var scope = app.Services.CreateScope())
    {
        var services = scope.ServiceProvider;
        try
        {
            var context = services.GetRequiredService<TaskDbContext>();
            context.Database.Migrate(); // Creates DB if not exists & applies migrations
            Console.WriteLine("Database migrated successfully.");
        }
        catch (Exception ex)
        {
            var logger = services.GetRequiredService<ILogger<Program>>();
            logger.LogError(ex, "An error occurred while migrating the database.");
        }
    }

    app.Run();
