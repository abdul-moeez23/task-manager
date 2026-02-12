/*using System.ComponentModel.DataAnnotations;
namespace TaskManager.API.Models
{
    public class User
    {
        public int Id { get; set; }
        [Required, MaxLength(100)]
        public string Username { get; set; }= null!;
        [Required]
        public string PasswordHash { get; set; }= null!;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}*/



using System.ComponentModel.DataAnnotations;

namespace TaskManager.API.Models
{
    public class User
    {
        public int Id { get; set; }

        [Required, MaxLength(100)]
        public string Username { get; set; } = null!;

        [Required, EmailAddress, MaxLength(200)]
        public string Email { get; set; } = null!;  

        [Required]
        public string PasswordHash { get; set; } = null!;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // OTP verification fields
        public string? EmailVerificationCode { get; set; } 
        public bool IsEmailVerified { get; set; } = false; 
        public DateTime? EmailVerificationExpiry { get; set; } 
    }
}

