using StudentManagement.Domain;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace StudentManagement.Application.Features.Users.ViewModels
{
    public class VmRegisterUser
    {
        [Required]
        [StringLength(100, MinimumLength = 3)]
        public string Username { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        [StringLength(150)]
        public string Email { get; set; } = string.Empty;

        [Required]
        [StringLength(100, MinimumLength = 8)] // Enforce password complexity rules later if needed
        public string Password { get; set; } = string.Empty;

        // Usually only Admins can create users and assign roles
        [Required]
        public StudentEnum.Role Role { get; set; } // Default role, Admin should set explicitly
    }
}
