using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace StudentManagement.Domain.Entities
{
    public class StudentStatus : GenericEntity
    {
        public int StudentStatusID { get; protected set; }
        public string StatusName { get; protected set; }
        public string Description { get; protected set; }
        
        // Navigation property
        public virtual ICollection<Student> Students { get; protected set; }
    }
}