using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace StudentManagement.Domain.Entities
{
    public class School
    {
        public int SchoolId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Address { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }

        // Navigation Property (One-to-Many with Student)
        public virtual ICollection<Student> Students { get; set; } = new List<Student>();
        // Navigation Property (Many-to-Many with User)
        public virtual ICollection<UserSchoolLink> UserLinks { get; set; } = new List<UserSchoolLink>();
    }
}
