using Microsoft.EntityFrameworkCore.ChangeTracking;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;
using StudentManagement.Domain.Entities;
using DocumentFormat.OpenXml.Vml.Office;
using DocumentFormat.OpenXml.Math;


namespace StudentMgmt.Infrastructure.Data.DBContext
{
    public class ApplicationDbContext : DbContext // Or IdentityDbContext if using ASP.NET Core Identity
    {
        public DbSet<School> Schools { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<Student> Students { get; set; }
        public DbSet<UserSchoolLink> UserSchoolLinks { get; set; }
        public DbSet<Standard> Standard { get; set; } = null!; // New
        public DbSet<Division> Division { get; set; } = null!; // New

        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Scan the current assembly (Infrastructure) for all IEntityTypeConfiguration classes
            // and apply them automatically. This keeps the DbContext clean.
            modelBuilder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());
        }

        // Optional: Override SaveChangesAsync to update Timestamps automatically
        public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            var entries = ChangeTracker
                .Entries()
                .Where(e => e.State == EntityState.Added || e.State == EntityState.Modified);

            var now = DateTime.UtcNow; // Use UTC for consistency

            foreach (var entityEntry in entries)
            {
                if (entityEntry.State == EntityState.Added && entityEntry.Entity.GetType().GetProperty("CreatedAt") != null)
                {
                    entityEntry.Property("CreatedAt").CurrentValue = now;
                    // Find and set 'CreatedAt' property if it exists
                    //var createdAtProp = entityEntry.Property("CreatedAt");
                    //if (createdAtProp != null) createdAtProp.CurrentValue = now;
                }

                //// Always set 'UpdatedAt' on modify or add
                //var updatedAtProp = entityEntry.Property("UpdatedAt");
                //if (updatedAtProp != null) updatedAtProp.CurrentValue = now;

                if (entityEntry.Entity.GetType().GetProperty("UpdatedAt") != null)
                {
                    entityEntry.Property("UpdatedAt").CurrentValue = now;
                }
            }

            return await base.SaveChangesAsync(cancellationToken);
        }
    }
}
