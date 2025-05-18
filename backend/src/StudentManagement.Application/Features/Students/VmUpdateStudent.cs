using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace StudentManagement.Application.Features.Students
{
    public class VmUpdateStudent
    {
        [Required]
        [StringLength(100)]
        public string FullName { get; set; } = string.Empty;

        public DateTime? DateOfBirth { get; set; }
        public string? Gender { get; set; }
        [EmailAddress] 
        public string? Email { get; set; }
        public string? PhoneNo { get; set; }
        public string? Address { get; set; }
        public DateTime? EnrollmentDate { get; set; }
        [Required(ErrorMessage = "Standard/Class is required.")]
        public int StandardId { get; set; } // Changed to ID

        [Required(ErrorMessage = "Division is required.")]
        public int DivisionId { get; set; } // Changed to ID
        [Required] 
        public int RollNo { get; set; }

        [Required]
        [StringLength(50)]
        public string StudentIdentifier { get; set; }

        public bool IsActive { get; set; } = true; // Allow updating active status

        // Photo path updates would likely happen via a dedicated photo upload endpoint.
        // SchoolId generally shouldn't be updated directly; requires a "transfer" process if allowed.
    }
}
