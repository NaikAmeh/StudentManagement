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
    public class DivisionMap : IEntityTypeConfiguration<Division>
    {
        public void Configure(EntityTypeBuilder<Division> builder)
        {
            builder.ToTable("Division"); // Explicit join table name

            builder.HasKey(ul => new { ul.DivisionID });

            builder.Property(s => s.Name)
                .HasColumnName("DivisionName")
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
