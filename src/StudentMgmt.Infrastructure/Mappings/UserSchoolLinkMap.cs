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
    public class UserSchoolLinkMap : IEntityTypeConfiguration<UserSchoolLink>
    {
        public void Configure(EntityTypeBuilder<UserSchoolLink> builder)
        {
            builder.ToTable("UserSchoolLinks"); // Explicit join table name

            // Define the composite primary key
            builder.HasKey(ul => new { ul.UserId, ul.SchoolId });

            // Configure the relationships from the join entity side
            // This ensures foreign keys are set up correctly
            builder.HasOne(ul => ul.User)
                .WithMany(u => u.SchoolLinks) // Relates back to the collection in User
                .HasForeignKey(ul => ul.UserId)
                .OnDelete(DeleteBehavior.Cascade); // If User is deleted, remove links

            builder.HasOne(ul => ul.School)
                .WithMany(s => s.UserLinks) // Relates back to the collection in School
                .HasForeignKey(ul => ul.SchoolId)
                .OnDelete(DeleteBehavior.Cascade); // If School is deleted, remove links

            //builder.Property(ul => ul.IsDefault)
            //   .IsRequired()
            //   .HasDefaultValue(false);
        }
    }
}
