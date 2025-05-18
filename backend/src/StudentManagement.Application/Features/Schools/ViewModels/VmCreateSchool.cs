using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace StudentManagement.Application.Features.Schools.ViewModels
{
    public class VmCreateSchool
    {
        [Required]
        [StringLength(150, MinimumLength = 3)]
        public string Name { get; set; } = string.Empty;

        [StringLength(255)]
        public string? Address { get; set; }
    }
}
