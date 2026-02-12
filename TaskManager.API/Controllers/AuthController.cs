using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TaskManager.API.Data;
using TaskManager.API.Models;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using BCrypt.Net;
using Microsoft.AspNetCore.Authorization;
using TaskManager.API.DTOs;
using TaskManager.API.Helpers;
using TaskManager.API.Services;

namespace TaskManager.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly TaskDbContext _context;
        private readonly IConfiguration _config;
        private readonly EmailService _emailService;

        public AuthController(TaskDbContext context, IConfiguration config, EmailService emailService)
        {
            _context = context;
            _config = config;
            _emailService = emailService;
        }

       [HttpPost("register")]
        public IActionResult Register([FromBody] RegisterDto dto)
        {
            var userExists = _context.Users.Any(u => u.Email == dto.Email);
            if (userExists) return BadRequest("Email already exists");

            var user = new User
            {
                Username = dto.Username,
                Email = dto.Email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password)
            };

            string code = EmailHelper.GenerateOtp();
            user.EmailVerificationCode = code;
            user.EmailVerificationExpiry = DateTime.UtcNow.AddMinutes(10);

            _context.Users.Add(user);
            _context.SaveChanges();
            
            try 
            {
                _emailService.SendVerificationEmail(user.Email, code);
                return Ok(new { message = "Registration successful. Verification code sent to email." });
            }
            catch (Exception ex)
            {
                return Ok(new { message = "Registration successful, but could not send verification email. Please use 'Resend OTP' to try again.", details = ex.Message });
            }
        }


        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto dto)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Username == dto.Username);
            if (user == null || !BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
                return Unauthorized("Invalid credentials");

            if (!user.IsEmailVerified)
                return BadRequest("Please verify your email before logging in.");

            var token = GenerateJwtToken(user);
            return Ok(new { token, username = user.Username });
        }

        private string GenerateJwtToken(User user)
        {
            var jwtKey = _config["Jwt:Key"]?? throw new Exception("JWT Key missing in appsettings.json");

            var key = Encoding.UTF8.GetBytes(jwtKey);
            var tokenHandler = new JwtSecurityTokenHandler();
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[] {
                    new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                    new Claim(ClaimTypes.Name, user.Username)
                }),
                Expires = DateTime.UtcNow.AddDays(7),
                Issuer = _config["Jwt:Issuer"],
                Audience = _config["Jwt:Audience"],
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key),
                    SecurityAlgorithms.HmacSha256Signature)
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }


        [HttpPost("verify-email")]
        public IActionResult VerifyEmail([FromBody] VerifyEmailDto dto)
        {
            var user = _context.Users.FirstOrDefault(u => u.Email == dto.Email);
            if (user == null) return BadRequest("User not found");
            if (user.IsEmailVerified) return BadRequest("Email already verified");

            if (user.EmailVerificationCode != dto.Otp || user.EmailVerificationExpiry < DateTime.UtcNow)
                return BadRequest("Invalid or expired code");

            user.IsEmailVerified = true;
            user.EmailVerificationCode = null;
            user.EmailVerificationExpiry = null;

            _context.SaveChanges();

            return Ok(new { message = "Email verified successfully" });
        }


        [HttpPost("resend-verification")]
        public IActionResult ResendVerification([FromBody] ResendEmailDto dto)
        {
            var user = _context.Users.FirstOrDefault(u => u.Email == dto.Email);
            if (user == null) return BadRequest("User not found");

            if (user.IsEmailVerified)
                return BadRequest("Email already verified");

            string code = EmailHelper.GenerateOtp();
            user.EmailVerificationCode = code;
            user.EmailVerificationExpiry = DateTime.UtcNow.AddMinutes(10);

            _context.SaveChanges();
            
            try 
            {
                _emailService.SendVerificationEmail(user.Email, code);
                return Ok(new { message = "Verification code resent" });
            }
            catch (Exception ex)
            {
                // Log the exception if you have a logger
                return StatusCode(500, new { message = "Could not send verification email. Please try again later.", details = ex.Message });
            }
        }



        

    }

}



