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
    public class UserMap : IEntityTypeConfiguration<User>
    {
        public void Configure(EntityTypeBuilder<User> builder)
        {
            builder.ToTable("Users");

            builder.HasKey(u => u.UserId);

            builder.Property(u => u.Username)
                .IsRequired()
                .HasMaxLength(100);
            builder.HasIndex(u => u.Username).IsUnique(); // Unique constraint

            builder.Property(u => u.Email)
                .IsRequired()
                .HasMaxLength(150);
            builder.HasIndex(u => u.Email).IsUnique();

            builder.Property(u => u.PasswordHash)
                .IsRequired(); // Adjust length if needed via HasMaxLength(bytes) or column type

            builder.Property(u => u.PasswordSalt)
                .IsRequired();

            builder.Property(u => u.Role)
                .IsRequired()
                .HasColumnName("RoleId") // Map the property to the "RoleId" column in the database
                .HasConversion<int>();

            builder.Property(u => u.IsActive)
                .IsRequired()
                .HasDefaultValue(true);

            builder.Property(u => u.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
            builder.Property(u => u.UpdatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP");

            // Many-to-Many via join entity
            builder.HasMany(u => u.SchoolLinks)
                   .WithOne(ul => ul.User)
                   .HasForeignKey(ul => ul.UserId);

            builder.Property(u => u.IsPasswordChangeRequired)
                  .IsRequired()
                  .HasDefaultValue(false); // Default to false

            builder.HasOne(u => u.DefaultSchool)
                  .WithMany() // School doesn't need a direct collection back for this specific relationship
                  .HasForeignKey(u => u.DefaultSchoolId)
                  .IsRequired(false)
                  .OnDelete(DeleteBehavior.SetNull); // If school deleted, just nullify the user's default
        }
    }
}
