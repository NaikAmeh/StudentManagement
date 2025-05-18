using StudentManagement.Domain;
using StudentManagement.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace StudentManagement.Application.Interfaces.Factories
{
    public interface IUserFactory : IBaseFactory
    {
        User CreateUser(string username, string email, string passwordHash, string passwordSalt, StudentEnum.Role role, bool isActive, bool isPasswordChangeRequired);
    }
}
