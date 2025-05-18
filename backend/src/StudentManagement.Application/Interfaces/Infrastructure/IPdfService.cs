using StudentManagement.Application.Features.Students;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace StudentManagement.Application.Interfaces.Infrastructure
{
    /// <summary>
    /// Defines contract for PDF generation services.
    /// </summary>
    public interface IPdfService
    {
        /// <summary>
        /// Generates a PDF ID card for a single student.
        /// </summary>
        /// <param name="studentData">DTO containing the student's details for the card.</param>
        /// <returns>A byte array representing the PDF file content.</returns>
        Task<byte[]> GenerateStudentIdCardAsync(VmStudentDetail studentData); // Use detail DTO

        /// <summary>
        /// Generates a single PDF containing ID cards for multiple students.
        /// </summary>
        /// <param name="studentsData">A list of DTOs containing student details.</param>
        /// <returns>A byte array representing the PDF file content.</returns>
        Task<byte[]> GenerateBulkIdCardsAsync(IEnumerable<VmStudentDetail> studentsData);
    }
}
