using StudentManagement.Application.Interfaces.Factories;
using StudentManagement.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace StudentManagement.Application.Factories
{
    public class StudentFactory: IStudentFactory
    {
        public Student Create(string fullName, DateTime? dateOfBirth, string gender, string email, string phoneNo, string address, DateTime? enrollmentDate,
            int standardId, int divisionId, int rollNo, string studentIdentifier, string photoPath, string photoName, bool isActive, School school, string emergencyContactNo, int? bloodGroupId = null, int? houseId = null, int studentStatusId = 1)
        {
            return new Student(fullName, dateOfBirth, gender, email, phoneNo, address, enrollmentDate, standardId, divisionId, rollNo, studentIdentifier, photoPath, photoName, isActive, school, emergencyContactNo, bloodGroupId, houseId, studentStatusId);
        }
    }
}
