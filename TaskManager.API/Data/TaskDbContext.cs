using Microsoft.EntityFrameworkCore;
using TaskManager.API.Models;

namespace TaskManager.API.Data
{
    public class TaskDbContext : DbContext
    {
        public TaskDbContext(DbContextOptions<TaskDbContext> options) : base(options) { }

        public DbSet<TaskItem> Tasks { get; set; } = null!;
        public DbSet<User> Users { get; set; } = null!;
        public DbSet<BusinessPartner> BusinessPartners { get; set; } = null!;

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<BusinessPartner>()
                .Property(b => b.TurnoverAmount)
                .HasPrecision(18, 2);
        }
    }
}
