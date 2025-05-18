using FluentValidation;
using StudentManagement.Application.Features.Students;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace StudentManagement.Application.Validation
{
    public class StudentImportDtoValidator : AbstractValidator<VmStudentImport>
    {
        public StudentImportDtoValidator()
        {
            RuleFor(x => x.FullName)
                .NotEmpty().WithMessage("Name is required.")
                .MaximumLength(100).WithMessage("FullName cannot exceed 100 characters.");

            RuleFor(x => x.DateOfBirth)
                .Must(BeAValidDate).WithMessage("DateOfBirth must be a valid date (e.g., YYYY-MM-DD or MM/DD/YYYY).")
                .When(x => !string.IsNullOrWhiteSpace(x.DateOfBirth)); // Only validate if provided

            RuleFor(x => x.StudentIdentifier)
                .MaximumLength(50).WithMessage("StudentIdentifier cannot exceed 50 characters.")
                .When(x => !string.IsNullOrWhiteSpace(x.StudentIdentifier)); // Only validate if provided
        }

        private bool BeAValidDate(string? dateString)
        {
            if (string.IsNullOrWhiteSpace(dateString)) return true; // Allow empty
            return DateOnly.TryParse(dateString, out _); // Use DateOnly or DateTime depending on target type
        }
    }
}
