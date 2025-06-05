using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace StudentManagement.Domain.Entities
{
    public class BloodGroup : GenericEntity
    {
        public int BloodGroupID { get; protected set; }
        public string BloodGroupName { get; protected set; }

        // Navigation property
       // public virtual ICollection<Student> Students { get; protected set; }
    }
}