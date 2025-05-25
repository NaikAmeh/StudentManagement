using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace StudentManagement.Application.Features.Students
{
    public class VmStudentSummary
    {
        public int StudentId { get; set; }
        public string FullName { get; set; } = string.Empty;
        public int StandardId { get; set; }
        public string StandardName { get; set; } // Name for display
        public int DivisionId { get; set; }
        public string DivisionName { get; set; } // Name for display
        public int RollNo { get; set; }
        public string StudentIdentifier { get; set; } // School-specific ID
        public string? PhotoThumbnailPath { get; set; } // Path/URL to a smaller thumbnail image
        public string? PhotoName { get; set; }
        public bool IsActive { get; set; }
        public int SchoolId { get; set; }
        public string SchoolName { get; set; } = string.Empty; // Include school name for display
    }
}
