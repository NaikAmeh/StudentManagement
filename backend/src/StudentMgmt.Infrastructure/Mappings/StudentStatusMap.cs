using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using StudentManagement.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace StudentMgmt.Infrastructure.Mappings
{
    public class StudentStatusMap : IEntityTypeConfiguration<StudentStatus>
    {
        public void Configure(EntityTypeBuilder<StudentStatus> builder)
        {
            builder.ToTable("StudentStatus");

            builder.HasKey(s => s.StudentStatusID);

            builder.Property(s => s.StatusName)
                .IsRequired()
                .HasMaxLength(50);

            builder.Property(s => s.Description)
                .HasMaxLength(255);

            // Create a unique index on the status name
            builder.HasIndex(s => s.StatusName).IsUnique();

            // Configure relationships
            builder.HasMany(s => s.Students)
                .WithOne(s => s.StudentStatus)
                .HasForeignKey(s => s.StudentStatusID)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}