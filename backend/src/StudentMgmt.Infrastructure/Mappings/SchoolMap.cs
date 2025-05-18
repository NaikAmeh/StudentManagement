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
    public class SchoolMap : IEntityTypeConfiguration<School>
    {
        public void Configure(EntityTypeBuilder<School> builder)
        {
            builder.ToTable("Schools"); // Explicit table name

            builder.HasKey(s => s.SchoolId);

            builder.Property(s => s.Name)
                .IsRequired()
                .HasMaxLength(150);

            builder.Property(s => s.Address)
                .HasMaxLength(255);

            builder.Property(s => s.CreatedAt)
                   .IsRequired()
                   .HasDefaultValueSql("CURRENT_TIMESTAMP"); // Or appropriate MySQL function

            builder.Property(s => s.UpdatedAt)
                   .IsRequired()
                   .HasDefaultValueSql("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"); // MySQL specific

            // Relationships configured automatically via navigation properties,
            // but you can be explicit here if needed (e.g., DeleteBehavior)
            builder.HasMany(s => s.Students)
                   .WithOne(st => st.School)
                   .HasForeignKey(st => st.SchoolId)
                   .OnDelete(DeleteBehavior.Restrict); // Prevent deleting school if students exist

            // Many-to-Many configuration (EF Core handles join table implicitly if named conventionally)
            // Explicit configuration using the join entity:
            builder.HasMany(s => s.UserLinks)
                   .WithOne(ul => ul.School)
                   .HasForeignKey(ul => ul.SchoolId)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasIndex(s => s.Name); // Add index
        }
    }
}
