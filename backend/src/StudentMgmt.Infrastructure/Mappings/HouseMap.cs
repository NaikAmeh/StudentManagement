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
    public class HouseMap : IEntityTypeConfiguration<House>
    {
        public void Configure(EntityTypeBuilder<House> builder)
        {
            builder.ToTable("House");

            builder.HasKey(h => h.HouseID);

            builder.Property(h => h.HouseName)
                .IsRequired()
                .HasMaxLength(100);

            // Create a composite index for SchoolId + Name to ensure uniqueness within a school
            builder.HasIndex(h => new { h.SchoolId, h.HouseName }).IsUnique();

            // Configure relationships
            builder.HasMany(h => h.Students)
                .WithOne(s => s.House)
                .HasForeignKey(s => s.HouseID)
                .OnDelete(DeleteBehavior.SetNull);

        }
    }
}