using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace StudentManagement.Application.Interfaces.Uitility
{
    public interface IPasswordGenerator
    {
        string GenerateRandomPassword(int length = 12);
    }
}
