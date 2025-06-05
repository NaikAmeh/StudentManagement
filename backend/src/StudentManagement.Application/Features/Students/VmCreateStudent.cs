using StudentManagement.Domain.Entities;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace StudentManagement.Application.Features.Students
{
    public class VmCreateStudent
    {
        [Required]
        [StringLength(100)]
        public string FullName { get; set; }

        public DateTime? DateOfBirth { get; set; }
        public string? Gender { get; set; } // M, F, O
        [EmailAddress] 
        public string? Email { get; set; }
        public string? PhoneNo { get; set; }
        public string? EmergencyContactNo { get; set; }
        public string? Address { get; set; }
        public DateTime? EnrollmentDate { get; set; }
        [Required(ErrorMessage = "Standard/Class is required.")]
        public int StandardId { get; set; }
        [Required(ErrorMessage = "Division is required.")]
        public int DivisionId { get; set; } // Changed to ID
        [Required] 
        public int RollNo { get; set; }
        public int? BloodGroupId { get; set; }
        public int? HouseId { get; set; }
        //public string photoPath { get; set; }
        //public string photoName { get; set; }
        public bool isActive { get; set; }
        //public int schoolId { get; set; }

        [Required]
        [StringLength(50)]
        public string StudentIdentifier { get; set; } // Optional on creation? Or required?

        // Photo might be handled in a separate upload step or included here as base64/IFormFile depending on API design
        // For now, assume path is set after creation/upload.

        [Required]
        public int SchoolId { get; set; } // Must specify the school
    }
}
