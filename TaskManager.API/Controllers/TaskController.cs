using Microsoft.EntityFrameworkCore;  
using TaskManager.API.Data;
using TaskManager.API.Models;
using Microsoft.AspNetCore.Mvc;
using TaskManager.API.DTOs;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;   
namespace TaskManager.API.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class TaskController : ControllerBase
    {
        private readonly TaskDbContext _context;

        public TaskController(TaskDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public ActionResult<IEnumerable<TaskItem>> GetTasks()
        {
            var claim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (claim == null)
                return Unauthorized("User not authenticated.");

            if (!int.TryParse(claim.Value, out var userId))
                return BadRequest("Invalid user ID in token.");

            try
            {
                var tasks = _context.Tasks.Where(t => t.UserId == userId).ToList();
                return Ok(tasks);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in GetTasks: {ex.Message}");
                return StatusCode(500, "Internal server error while fetching tasks.");
            }
        }

        [HttpGet("{id}")]
        public ActionResult<TaskItem> GetTask(int id)
        {
            var claim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (claim == null)
                return Unauthorized("User not authenticated.");

            if (!int.TryParse(claim.Value, out var userId))
                return BadRequest("Invalid user ID in token.");


            var task = _context.Tasks
                .FirstOrDefault(t => t.Id == id && t.UserId == userId);

            if (task == null)
                return NotFound();

            return Ok(task);
        }

        [HttpPost]
        public ActionResult<TaskItem> CreateTask(CreateTaskDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            
            var task=new TaskItem{
                Title = dto.Title,
                Description = dto.Description,
                Status = "Pending",
                CreatedAt = DateTime.UtcNow
            };
            var claim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (claim == null)
                return Unauthorized("User not authenticated.");

            if (!int.TryParse(claim.Value, out var userId))
                return BadRequest("Invalid user ID in token.");

            task.UserId = userId;
            _context.Tasks.Add(task);
            _context.SaveChanges();
            return CreatedAtAction(nameof(GetTask), new { id = task.Id }, task);
            
        }

        [HttpPut("{id}")]
        public IActionResult UpdateTask(int id, UpdateTaskDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var claim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (claim == null) return Unauthorized();
            if (!int.TryParse(claim.Value, out var userId)) return BadRequest();

            var task = _context.Tasks.FirstOrDefault(t => t.Id == id && t.UserId == userId);
            if (task == null)
            {
                return NotFound("Task not found or you don't have permission to edit it.");
            }

            task.Title = dto.Title;
            task.Description = dto.Description;
            task.Status = dto.Status;
            _context.SaveChanges();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public IActionResult DeleteTask(int id)
        {
            var claim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (claim == null) return Unauthorized();
            if (!int.TryParse(claim.Value, out var userId)) return BadRequest();

            var task = _context.Tasks.FirstOrDefault(t => t.Id == id && t.UserId == userId);
            if (task == null)
            {
                return NotFound("Task not found or you don't have permission to delete it.");
            }

            _context.Tasks.Remove(task);
            _context.SaveChanges();
            return NoContent();
        }

        private bool TaskExists(int id)
        {
            return _context.Tasks.Any(e => e.Id == id);
        }
    }
}