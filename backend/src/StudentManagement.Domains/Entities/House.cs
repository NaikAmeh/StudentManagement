using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace StudentManagement.Domain.Entities
{
    public class House : GenericEntity
    {
        public int HouseID { get; protected set; }
        public string HouseName { get; protected set; }
        public int? SchoolId { get; protected set; }

        // Navigation property
        public virtual ICollection<Student> Students { get; protected set; }
    }
}