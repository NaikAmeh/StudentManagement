using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Microsoft.EntityFrameworkCore;
using StudentManagement.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace StudentMgmt.Infrastructure.Mappings
{
    public class StudentMap : IEntityTypeConfiguration<Student>
    {
        public void Configure(EntityTypeBuilder<Student> builder)
        {
            builder.ToTable("Students");

            builder.HasKey(s => s.StudentId);

            builder.Property(s => s.FullName)
                .IsRequired()
                .HasMaxLength(100);

            builder.Property(s => s.StudentIdentifier)
                .IsRequired()
                .HasMaxLength(50);

            builder.Property(s => s.DateOfBirth);

            builder.Property(s => s.Gender)
                .HasMaxLength(10) // Allow for "Male", "Female", "Other" instead of CHAR(1) for flexibility
                .IsRequired(false);
            builder.Property(s => s.Email)
                .HasMaxLength(100)
                .IsRequired(false);
            builder.HasIndex(s => s.Email).IsUnique().HasFilter("[Email] IS NOT NULL"); // Unique if not null

            builder.Property(s => s.PhoneNo)
                .HasMaxLength(20)
                .IsRequired(false);

            builder.Property(s => s.Address)
                .HasMaxLength(200)
                .IsRequired(false);

            builder.Property(s => s.EnrollmentDate).IsRequired(false);

            builder.Property(s => s.StandardId).IsRequired();
            builder.Property(s => s.DivisionId).IsRequired();

            builder.Property(s => s.RollNo).IsRequired();
            //builder.HasIndex(s => new { s.SchoolId, s.StandardId, s.DivisionId, s.RollNo })
            //       .IsUnique()
            //       .HasName("UX_Student_School_Class_RollNo"); // Give it a specific name

            builder.Property(s => s.PhotoPath)
                .HasMaxLength(500); // Allow ample space for path/URL
            builder.Property(s => s.PhotoName).HasMaxLength(255).IsRequired(false);

            builder.Property(s => s.IsActive)
                .IsRequired()
                .HasDefaultValue(true);

            builder.Property(s => s.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
            builder.Property(s => s.UpdatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP");

            // Define relationship explicitly if needed (already implied by navigation props)
            // builder.HasOne(s => s.School)
            //        .WithMany(sch => sch.Students)
            //        .HasForeignKey(s => s.SchoolId);

            builder.HasOne(s => s.School)
                .WithMany(sch => sch.Students) // Assuming School entity has ICollection<Student> Students
                .HasForeignKey(s => s.SchoolId)
                .OnDelete(DeleteBehavior.Restrict); // Or your chosen delete behavior

            builder.HasOne(s => s.Standard) // Navigation property in Student
                .WithMany() // Assuming Standard doesn't need a collection of Students
                .HasForeignKey(s => s.StandardId)
                .OnDelete(DeleteBehavior.Restrict); // Prevent deleting a Standard if students are assigned

            builder.HasOne(s => s.Division) // Navigation property in Student
                .WithMany() // Assuming Division doesn't need a collection of Students
                .HasForeignKey(s => s.DivisionId)
                .OnDelete(DeleteBehavior.Restrict); // Prevent deleting a Division if students are assigned

            // Indexes
            builder.HasIndex(s => s.SchoolId);
            // Conditional unique index (syntax might vary slightly or need raw SQL depending on EF Core version/provider)
            builder.HasIndex(s => new { s.SchoolId, s.StudentIdentifier })
                   .IsUnique()
                   .HasFilter("[StudentIdentifier] IS NOT NULL"); // SQL Server Syntax, adjust for MySQL
                                                                  // For MySQL, you might need raw SQL in migration or a different approach if filter not supported directly

            builder.HasOne(s => s.BloodGroup)
    .WithMany()
    .HasForeignKey("BloodGroupID") // Use string for shadow property
    .IsRequired(false)
    .OnDelete(DeleteBehavior.SetNull);

            builder.HasOne(s => s.House)
                .WithMany(h => h.Students) // Assuming House doesn't need a collection of Students
                .HasForeignKey(s => s.HouseID)
                .IsRequired(false) // Since HouseID is nullable
                .OnDelete(DeleteBehavior.SetNull); // If a house is deleted, set Student.HouseID to NULL
        }
    }
}
