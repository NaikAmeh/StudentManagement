using StudentManagement.Application.Features.Schools.ViewModels;
using StudentManagement.Domain;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace StudentManagement.Application.Features.Users.ViewModels
{
    public class VmUser
    {
        public int UserId { get; set; }
        public string Username { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }

        public bool IsPasswordChangeRequired { get; set; }
        public List<int> AssignedSchoolIds { get; set; } = new List<int>();
        public int? DefaultSchoolId { get; set; } // This will be calculated from link table
    }

    //public class VmUserDetail : VmUser
    //{
    //}

    public class VmUserList
    {
        public int UserId { get; set; }
        public string Username { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;//change role to enum
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class VmPaginatedUserList
    {
        public List<VmUserList> Users { get; set; } = new List<VmUserList>();
        public int CurrentPage { get; set; }
        public int PageSize { get; set; }
        public int TotalCount { get; set; }
        public int TotalPages { get; set; }
    }   

    public class VmCreateUser
    {
        [Required(ErrorMessage = "Username is required.")]
        [StringLength(100, MinimumLength = 3, ErrorMessage = "Username must be between 3 and 100 characters.")]
        [RegularExpression(@"^[a-zA-Z0-9_.-]+$", ErrorMessage = "Username can only contain letters, numbers, underscore, dot, or hyphen.")]
        public string Username { get; set; } = string.Empty;

        [Required(ErrorMessage = "Email is required.")]
        [EmailAddress(ErrorMessage = "Invalid email address format.")]
        [StringLength(150, ErrorMessage = "Email cannot exceed 150 characters.")]
        public string Email { get; set; } = string.Empty;

        [Required(ErrorMessage = "Role is required.")]
        [StringLength(50, ErrorMessage = "Role cannot exceed 50 characters.")]
        // You might want to use an enum or a predefined list for roles later
        // For now, a string is fine, but ensure validation on the backend.
        public StudentEnum.Role Role { get; set; } // e.g., "Admin", "StandardUser"
    }

    // DTO for retrieving user details for editing
    public class VmUserDetail
    {
        public int UserId { get; set; }
        public string Username { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty; // e.g., "Admin", "StandardUser"
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public List<VmSchool> AssignedSchools { get; set; } = new List<VmSchool>();
        public int? DefaultSchoolId { get; set; } // Add Default School ID
    }

    // DTO for updating user info (roles, status, default school)
    public class VmUpdateUser
    {
        [Required]
        [StringLength(20)] // Matches domain constraint
        public string Role { get; set; } = string.Empty;

        [Required]
        public bool IsActive { get; set; }

        public int? DefaultSchoolId { get; set; } // Allow setting/clearing default school

        // List of school IDs the user should be assigned to
        public List<int> AssignedSchoolIds { get; set; } = new List<int>();
    }

    // DTO for Admin resetting a user's password
    public class VmResetPassword
    {
        [Required]
        public int UserId { get; set; }

        [Required]
        [StringLength(100, MinimumLength = 8)]
        public string NewPassword { get; set; } = string.Empty;
    }
    //Move into respective viewmodels later
    public class VmForcePasswordChange
    {
        [Required(ErrorMessage = "New password is required.")]
        [StringLength(100, MinimumLength = 8, ErrorMessage = "Password must be between 8 and 100 characters.")]
        // Add more specific password complexity rules using regular expressions or custom validation if needed
        // Example: [RegularExpression(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$", ErrorMessage = "Password must meet complexity requirements.")]
        public string NewPassword { get; set; } = string.Empty;

        [Required(ErrorMessage = "Confirm new password is required.")]
        [Compare("NewPassword", ErrorMessage = "The new password and confirmation password do not match.")]
        public string ConfirmNewPassword { get; set; } = string.Empty;
    }

    public class VmAdminResetPassword
    {
        [Required(ErrorMessage = "User ID is required.")]
        public int UserId { get; set; }

    }
}

