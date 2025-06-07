using StudentManagement.Domain.Entities;
using StudentManagement.Domain;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using StudentManagement.Application.Features.Schools.ViewModels;

namespace StudentManagement.Application.Interfaces.Factories
{
    public interface IStudentFactory : IBaseFactory
    {
        Student Create(string fullName, DateTime? dateOfBirth, string gender, string email, string phoneNo, string address, DateTime? enrollmentDate,
        int standardId, int divisionId, int rollNo, string studentIdentifier, string photoPath, string photoName, bool isActive, School school, string emergencyContactNo, int? bloodGroupId = null, int? houseId = null, int studentStatusId = 1);
    }
}
