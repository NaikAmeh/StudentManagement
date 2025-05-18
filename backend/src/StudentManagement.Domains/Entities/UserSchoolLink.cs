using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace StudentManagement.Domain.Entities
{
    public class UserSchoolLink
        //change to add primary key
    {
        public int UserId { get; set; }
        public virtual User User { get; set; } = null!;

        public int SchoolId { get; set; }
        public virtual School School { get; set; } = null!;

        // The flag indicating the default school for this user
        //public bool IsDefault { get; set; } // Defaults to false // keep either in users table or in this table
    }
}
