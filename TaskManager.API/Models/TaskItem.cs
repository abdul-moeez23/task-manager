using System;
using System.ComponentModel.DataAnnotations;
namespace TaskManager.API.Models
{
    public class TaskItem
    {

        public int UserId { get; set; }
        public int Id { get; set; }    // Primary key, auto increment
        [Required]
        [MaxLength(100)]              
        public string Title { get; set; } = null!;
        // [Required]
        // [MaxLength(255)]
        public string Description { get; set; } = null!;
        // [Required]
        // [MaxLength(20)]
        public string Status { get; set; } = "Pending";
        // [Required]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
