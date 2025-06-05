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
    public class BloodGroupMap : IEntityTypeConfiguration<BloodGroup>
    {
        public void Configure(EntityTypeBuilder<BloodGroup> builder)
        {
            builder.ToTable("BloodGroup");

            builder.HasKey(bg => bg.BloodGroupID);

            builder.Property(bg => bg.BloodGroupName)
                .IsRequired()
                .HasMaxLength(20);

            //builder.Property(bg => bg.Description)
            //    .HasMaxLength(255);

            //builder.Property(bg => bg.IsActive)
            //    .IsRequired()
            //    .HasDefaultValue(true);

            //builder.Property(bg => bg.CreatedAt)
            //    .IsRequired()
            //    .HasDefaultValueSql("CURRENT_TIMESTAMP");

            //builder.Property(bg => bg.UpdatedAt)
            //    .IsRequired()
            //    .HasDefaultValueSql("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP");

            // Create a unique index on the name
            builder.HasIndex(bg => bg.BloodGroupName).IsUnique();

            // Configure relationships
            //builder.HasMany(bg => bg.Students)
            //    .WithOne(s => s.BloodGroup)
            //    .HasForeignKey(s => s.BloodGroupId)
            //    .OnDelete(DeleteBehavior.SetNull);
        }
    }
}