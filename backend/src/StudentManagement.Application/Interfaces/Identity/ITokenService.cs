﻿using StudentManagement.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace StudentManagement.Application.Interfaces.Identity
{
    public interface ITokenService
    {
        string GenerateToken(User user);
    }
}
