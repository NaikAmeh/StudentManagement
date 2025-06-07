using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace StudentManagement.Application.Features.Students
{
    /// <summary>
    /// DTO representing a row during Excel import. Matches expected columns.
    /// Includes RowNumber for error reporting.
    /// </summary>
    public class VmStudentImport
    {
        public int RowNumber { get; set; } // To track original row for errors
        public string? FullName { get; set; }
        public string? DateOfBirth { get; set; }
        public string? Gender { get; set; }
        public string? Email { get; set; }
        public string? PhoneNo { get; set; }
        public string? Address { get; set; }
        public string? EnrollmentDate { get; set; }
        public string? StandardName { get; set; } // Expect name from Excel
        public string? DivisionName { get; set; } // Expect name from Excel
        public string? RollNo { get; set; } // Read as string for parsing
        public string? StudentIdentifier { get; set; }
        public string? BloodGroup { get; set; }
        public string? House { get; set; }
        // Add other fields if importing them
    }
}
