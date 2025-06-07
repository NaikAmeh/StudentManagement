using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace StudentManagement.Application.Features.Students
{
    public class VmStudentBulkInsert
    {
        public bool IsExistingStudent { get; set; }
        public string FullName { get; set; }
        public string Gender { get; set; }
        public string Email { get; set; }
        public string PhoneNo { get; set; }
        public string Address { get; set; }
        public int StandardId { get; set; }
        public int DivisionId { get; set; }
        public int RollNo { get; set; }
        public string StudentIdentifier { get; set; }
        public int SchoolId { get; set; }
        public int StudentStatusID { get; set; } = 1; // Default to Active
        public string EmergencyContactNo { get; set; }
        public int? BloodGroupId { get; set; }
        public int? HouseId { get; set; }
        public string DateOfBirth { get; set; }
        public string EnrollmentDate { get; set; }
        // Additional fields can be added as needed
    }
}
