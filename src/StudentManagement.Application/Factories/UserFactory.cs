using StudentManagement.Domain.Entities;
using StudentManagement.Domain;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using StudentManagement.Application.Interfaces.Factories;

namespace StudentManagement.Application.Factories
{
    public class UserFactory : IUserFactory 
    {
        public User CreateUser(string username, string email, string passwordHash, string passwordSalt, StudentEnum.Role role, bool isActive, bool isPasswordChangeRequired)
        {
            return new User(username, email, passwordHash, passwordSalt, role, isActive, isPasswordChangeRequired);
        }
    }
}
