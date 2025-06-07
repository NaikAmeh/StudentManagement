using FluentValidation;
using StudentManagement.Application.Features.Students;
using System.Globalization;

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
    .Must(date =>
    {
        if (string.IsNullOrWhiteSpace(date)) return true; // Allow empty if not required
        var formats = new[] { "dd/MM/yyyy", "d/M/yyyy", "dd/M/yyyy", "d/MM/yyyy" };
        return DateOnly.TryParseExact(date, formats, CultureInfo.InvariantCulture, DateTimeStyles.None, out _);
    })
    .WithMessage("Date of Birth must be in dd/MM/yyyy format.");

            RuleFor(x => x.StudentIdentifier)
                .MaximumLength(50).WithMessage("StudentIdentifier cannot exceed 50 characters.")
                .When(x => !string.IsNullOrWhiteSpace(x.StudentIdentifier)); // Only validate if provided

            //// New field validations
            //RuleFor(x => x.EmergencyContactNo)
            //    .MaximumLength(20).WithMessage("Emergency contact number cannot exceed 20 characters.")
            //    .Matches(@"^[0-9\+\-\(\)\s]*$").WithMessage("Emergency contact number should contain only digits, +, -, (), and spaces.")
            //    .When(x => !string.IsNullOrWhiteSpace(x.EmergencyContactNo)); // Only validate if provided

            //RuleFor(x => x.BloodGroupName)
            //    .MaximumLength(10).WithMessage("Blood group name cannot exceed 10 characters.")
            //    .When(x => !string.IsNullOrWhiteSpace(x.BloodGroupName)); // Only validate if provided

            //RuleFor(x => x.HouseName)
            //    .MaximumLength(50).WithMessage("House name cannot exceed 50 characters.")
            //    .When(x => !string.IsNullOrWhiteSpace(x.HouseName)); // Only validate if provided
        }

        private bool BeAValidDate(string? dateString)
        {
            if (string.IsNullOrWhiteSpace(dateString)) return true; // Allow empty
            return DateOnly.TryParse(dateString, out _); // Use DateOnly or DateTime depending on target type
        }
    }
}