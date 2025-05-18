using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace StudentManagement.Domain.Entities
{
    public class User : GenericEntity  // check for abstract class
    {
        public virtual int UserId { get; protected set; }
        public virtual string Username { get; protected set; } 
        public virtual string Email { get; protected set; } 
        public virtual string PasswordHash { get; protected set; } 
        public virtual string PasswordSalt { get; protected set; }
        public virtual StudentEnum.Role Role { get; protected set; } // Consider an Enum later
        public virtual bool IsActive { get; protected set; }
        public virtual DateTime CreatedAt { get; protected set; }
        public virtual DateTime UpdatedAt { get; protected set; }
        public virtual int? DefaultSchoolId { get;protected set; } // Nullable Foreign Key
        public virtual bool IsPasswordChangeRequired { get; protected set; }// Flag for forced reset

        // Navigation Property (Many-to-Many with School)

        public virtual School? DefaultSchool { get; protected set; } // Navigation to default school
        public virtual ICollection<UserSchoolLink> SchoolLinks { get; protected set; } = new List<UserSchoolLink>();

        protected User()
        {
            // Constructor used by NHibernate.
        }

        public User(string username, string email, string passwordHash, string passwordSalt, StudentEnum.Role role, bool isActive, bool isPasswordChangeRequired)
        {
            Username = username;
            Email = email;
            PasswordHash = passwordHash;
            PasswordSalt = passwordSalt;
            Role = role;
            IsActive = isActive;
            IsPasswordChangeRequired = isPasswordChangeRequired;
        }

    }
}
