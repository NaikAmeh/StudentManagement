using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace StudentManagement.Domain.Entities
{
    public class Student : GenericEntity
    {
        public virtual int StudentId { get; set; }
        public virtual string FullName { get; protected set; }
        public virtual DateTime? DateOfBirth { get; protected set; }
        public virtual string? Gender { get; protected set; }
        public virtual string? Email { get; protected set; }
        public virtual string? PhoneNo { get; protected set; }
        public virtual string? Address { get; protected set; }
        public virtual DateTime? EnrollmentDate { get; protected set; }

        // --- Changed to Foreign Keys ---
        public virtual int StandardId { get; protected set; } // Foreign Key to Standards table
        public virtual int DivisionId { get; protected set; } // Foreign Key to Divisions table
        // --- End Foreign Key Changes ---

        public virtual int RollNo { get; set; }
        public virtual string StudentIdentifier { get; protected set; } // School-specific ID
        public virtual string? PhotoPath { get; protected set; } // Relative path or identifier
        public string? PhotoName { get; protected set; }
        public virtual bool IsActive { get; protected set; }
        public virtual DateTime CreatedAt { get; protected set; }
        public virtual DateTime UpdatedAt { get; protected set; }

        // Foreign Key Property
        public virtual int SchoolId { get; protected set; }
        // Navigation Property (Many-to-One with School)
        public virtual School School { get; protected set; } = null!; // Required relationship
        public virtual Standard Standard { get; protected set; } = null!; // Navigation to Standard
        public virtual Division Division { get; protected set; } = null!; // Navigation to Division

        public Student()
        {

        }

        public Student(string fullName, DateTime? dateOfBirth, string gender, string email, string phoneNo, string address, DateTime enrollmentDate,
            int standardId, int divisionId, int rollNo, string studentIdentifier, string photoPath, string photoName, bool isActive, School school)
        {
            FullName = fullName;
            DateOfBirth = dateOfBirth;
            Gender = gender;
            Email = email;
            PhoneNo = phoneNo;
            Address = address;
            EnrollmentDate = enrollmentDate;
            StandardId = standardId;
            DivisionId = divisionId;
            RollNo = rollNo;
            StudentIdentifier = studentIdentifier;
            PhotoPath = photoPath;
            PhotoName = photoName;
            IsActive = isActive;
            School = school;
        }
    }

}
