using StudentManagement.Domain;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace StudentManagement.Application.Common.Models
{
    public class UserQueryParameters
    {
            const int MaxPageSize = 50;
            private int _pageSize = 10;

            public int PageNumber { get; set; } = 1;
            public int PageSize
            {
                get => _pageSize;
                set => _pageSize = (value > MaxPageSize) ? MaxPageSize : value;
            }

            // Filtering
            public string? Username { get; set; }
            public string? Email { get; set; }
            public StudentEnum.Role? Role { get; set; }
            public bool? IsActive { get; set; }

            // Sorting (e.g., "username_asc", "email_desc")
            public string? SortOrder { get; set; }
    }
}
