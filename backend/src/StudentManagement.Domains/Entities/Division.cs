using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace StudentManagement.Domain.Entities
{
    public class Division: GenericEntity
    {
        public virtual int DivisionID { get; protected set; }
        public virtual string Name { get; protected set; } = string.Empty;
        public virtual int? SchoolId { get; protected set; } // Optional: For school-specific divisions
    }
}
