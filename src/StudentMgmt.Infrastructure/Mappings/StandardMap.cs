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
    public class StandardMap : IEntityTypeConfiguration<Standard>
    {
        public void Configure(EntityTypeBuilder<Standard> builder)
        {
            builder.ToTable("Standard"); // Explicit join table name

            builder.HasKey(ul => new { ul.StandardID });

            builder.Property(s => s.Name)
                .HasColumnName("StandardName")
                .IsRequired()
                .HasMaxLength(50);

            builder.Property(s => s.SchoolId)
                .HasColumnName("SchoolID");

            //builder.Property(ul => ul.IsDefault)
            //   .IsRequired()
            //   .HasDefaultValue(false);
        }
    }
}
