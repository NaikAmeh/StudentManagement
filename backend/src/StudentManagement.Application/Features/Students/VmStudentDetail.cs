using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace StudentManagement.Application.Features.Students
{
    public class VmStudentDetail
    {
        public int StudentId { get; set; }
        public string FullName { get; set; } = string.Empty;
        public DateTime? DateOfBirth { get; set; }
        public string? Gender { get; set; }
        public string? Email { get; set; }
        public string? PhoneNo { get; set; }
        public string? Address { get; set; }
        public DateTime? EnrollmentDate { get; set; }
        public int StandardId { get; set; } // ID
        public string StandardName { get; set; } // Name for display
        public int DivisionId { get; set; } // ID
        public string DivisionName { get; set; } // Name for display
        public int RollNo { get; set; }
        public string StudentIdentifier { get; set; }
        public string? PhotoName { get; set; }
        public string? PhotoPath { get; set; } // Path/URL to the full-size image
        public bool IsActive { get; set; }
        public string? EmergencyContactNo { get; set; }
        public int? BloodGroupId { get; set; }
        public string? BloodGroupName { get; set; } // For display
        public int? HouseId { get; set; }
        public string? HouseName { get; set; }      // For displ
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }

        // School Info
        public int SchoolId { get; set; }
        public string SchoolName { get; set; } = string.Empty; // Include school name
    }
}
