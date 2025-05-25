using StudentManagement.Application.Features.Students;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace StudentManagement.Application.Interfaces.Services
{
    public interface IStudentService
    {
        /// <summary>
        /// Gets a specific student by their ID, including details.
        /// </summary>
        /// <param name="id">The ID of the student.</param>
        /// <returns>A StudentDetailDto if found; otherwise, null.</returns>
        Task<VmStudentDetail?> GetStudentByIdAsync(int id);

        /// <summary>
        /// Gets a list of student summaries for a specific school.
        /// </summary>
        /// <param name="schoolId">The ID of the school.</param>
        /// <returns>A read-only list of StudentSummaryDto.</returns>
        Task<IReadOnlyList<VmStudentSummary>> GetStudentsBySchoolAsync(int schoolId);

        /// <summary>
        /// Creates a new student.
        /// </summary>
        /// <param name="createDto">The data transfer object containing information for the new student.</param>
        /// <returns>A detailed DTO of the created student.</returns>
        /// <exception cref="ArgumentException">Thrown if validation fails (e.g., duplicate StudentIdentifier in school).</exception>
        Task<VmStudentDetail> AddStudentAsync(VmCreateStudent createDto);

        /// <summary>
        /// Updates an existing student.
        /// </summary>
        /// <param name="id">The ID of the student to update.</param>
        /// <param name="updateDto">The data transfer object containing the updated information.</param>
        /// <returns>True if the update was successful; otherwise, false (e.g., if the student was not found).</returns>
        /// <exception cref="ArgumentException">Thrown if validation fails (e.g., duplicate StudentIdentifier in school).</exception>
       // Task<bool> UpdateStudentAsync(int id, VmUpdateStudent updateDto);

        /// <summary>
        /// Deletes a student by their ID.
        /// </summary>
        /// <param name="id">The ID of the student to delete.</param>
        /// <returns>True if the deletion was successful; otherwise, false (e.g., if the student was not found).</returns>
        Task<bool> DeleteStudentAsync(int id);
        //Implement
        // Add methods for photo upload/update later
        Task<string?> UpdateStudentPhotoAsync(int studentId, Stream photoStream, string contentType, string originalFileName);

        // Add methods for Excel import/export later
        // Task<byte[]> ExportStudentsToExcelAsync(int schoolId);
        // Task<ImportResultDto> ImportStudentsFromExcelAsync(int schoolId, Stream excelStream);

        // Add methods for PDF generation later
        // Task<byte[]> GenerateStudentIdCardPdfAsync(int studentId);
        // Task<byte[]> GenerateBulkIdCardsPdfAsync(int schoolId, IEnumerable<int> studentIds);

        /// <summary>
        /// Generates an Excel file byte array for students of a specific school.
        /// </summary>
        Task<byte[]> ExportStudentsToExcelAsync(int schoolId);

        /// <summary>
        /// Imports students from an Excel stream for a specific school, validates, and saves valid records.
        /// </summary>
        Task<List<VmStudentImportResult>> ImportStudentsFromExcelAsync(int schoolId, Stream excelStream);

        /// <summary>
        /// Generates a PDF ID card for a single student.
        /// </summary>
        Task<byte[]> GenerateStudentIdCardPdfAsync(int studentId);

        /// <summary>
        /// Generates a PDF containing ID cards for all students in a specific school.
        /// </summary>
        Task<byte[]> GenerateBulkIdCardsPdfAsync(int schoolId);
    }
}
