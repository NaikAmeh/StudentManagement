using AutoMapper;
using Microsoft.Extensions.Logging;
using StudentManagement.Application.Interfaces.Services;
using StudentManagement.Application.Interfaces;
using StudentManagement.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;
using StudentManagement.Application.Features.Students;
using StudentManagement.Application.Interfaces.Infrastructure;
using FluentValidation;
using Microsoft.Extensions.DependencyInjection;
using StudentManagement.Application.Interfaces.Factories;
using StudentManagement.Application.Features.Schools.ViewModels;

namespace StudentManagement.Application.Services
{
    public class StudentService : IStudentService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly ILogger<StudentService> _logger;
        private readonly IFileStorageService _fileStorageService; // Inject storage service
        private readonly IGenericObjectFactory _objectFactory;

        private readonly IExcelService _excelService; // Inject Excel service
        private readonly IValidator<VmStudentImport> _importValidator; // Inject Validator
        private readonly IPdfService _pdfService;

        // Allowed image content types
        private static readonly string[] AllowedImageTypes = { "image/jpeg", "image/png", "image/gif", "image/webp" };
        // Max file size (e.g., 5MB)
        private const long MaxFileSize = 5 * 1024 * 1024;
        private const string PhotoContainerName = "Students"; // Logical container name // Move to config

        public StudentService(
            IUnitOfWork unitOfWork,
            IMapper mapper,
            ILogger<StudentService> logger,
            IFileStorageService fileStorageService,
            IExcelService excelService, // Add to constructor
            IValidator<VmStudentImport> importValidator, 
            IGenericObjectFactory objectFactory,
            IPdfService pdfService) // Add validator)
        {
            _unitOfWork = unitOfWork ?? throw new ArgumentNullException(nameof(unitOfWork));
            _mapper = mapper ?? throw new ArgumentNullException(nameof(mapper));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _fileStorageService = fileStorageService;
            _excelService = excelService; // Assign
            _importValidator = importValidator; // Assign
            _objectFactory = objectFactory;
            _pdfService = pdfService;
        }

        /// <inheritdoc />
        public async Task<VmStudentDetail?> GetStudentByIdAsync(int id)
        {
            _logger.LogInformation("Attempting to retrieve student with ID: {StudentId}", id);
            // Need to Include School to map SchoolName
            var student = await _unitOfWork.Repository<Student>()
                                      .FirstOrDefaultAsync(s => s.StudentId == id,
                                                           includes: new List<Expression<Func<Student, object>>> { s => s.School });
            if (student == null)
            {
                _logger.LogWarning("Student not found for ID: {StudentId}", id);
                return null;
            }
            _logger.LogDebug("Student retrieved successfully for ID: {StudentId}", id);
            return _mapper.Map<VmStudentDetail>(student);
        }

        /// <inheritdoc />
        public async Task<IReadOnlyList<VmStudentSummary>> GetStudentsBySchoolAsync(int schoolId)
        {
            _logger.LogInformation("Retrieving students for School ID: {SchoolId}", schoolId);
            // Need to Include School to map SchoolName for Summary DTO
            try
            {
                var students = await _unitOfWork.Repository<Student>()
                                          .FindAsync(predicate: s => s.SchoolId == schoolId,
                                                     orderBy: q => q.OrderBy(s => s.FullName),
                                                     includes: new List<Expression<Func<Student, object>>> { s => s.School });

                _logger.LogInformation("Retrieved {StudentCount} students for School ID: {SchoolId}", students.Count, schoolId);
                // Map to Summary DTO list
                var dsd = _mapper.Map<IReadOnlyList<VmStudentSummary>>(students);
                return _mapper.Map<IReadOnlyList<VmStudentSummary>>(students);
            }
            catch(Exception ex)
            {
                var cc = " gh";
                return   _mapper.Map<IReadOnlyList<VmStudentSummary>>(new VmStudentSummary());
            }
        }

        /// <inheritdoc />
        public async Task<VmStudentDetail> AddStudentAsync(VmCreateStudent createDto)
        {
            _logger.LogInformation("Attempting to add student {FullName} for School ID: {SchoolId}",
                createDto.FullName, createDto.SchoolId);

            // --- Validation ---
            // 1. Check if School exists
            var schoolExists = await _unitOfWork.Repository<School>().AnyAsync(s => s.SchoolId == createDto.SchoolId);
            if (!schoolExists)
            {
                string msg = $"Cannot add student: School with ID {createDto.SchoolId} not found.";
                _logger.LogWarning(msg);
                throw new ArgumentException(msg, nameof(createDto.SchoolId));
            }

            // 2. Check for duplicate StudentIdentifier within the same school (if identifier provided)
            if (!string.IsNullOrWhiteSpace(createDto.StudentIdentifier))
            {
                bool idExists = await DoesStudentIdentifierExistInSchoolAsync(createDto.SchoolId, createDto.StudentIdentifier, null);
                if (idExists)
                {
                    string msg = $"Cannot add student: Student Identifier '{createDto.StudentIdentifier}' already exists in School ID {createDto.SchoolId}.";
                    _logger.LogWarning(msg);
                    throw new ArgumentException(msg, nameof(createDto.StudentIdentifier));
                }
            }
            // --- End Validation ---

            var studentEntity = _mapper.Map<Student>(createDto);
            //studentEntity.IsActive = true; // Ensure active on creation

            Student student = new Student();
            try
            {
                School school = await _unitOfWork.Repository<School>().GetByIdAsync(createDto.SchoolId);
                await _unitOfWork.ExecuteInTransactionAsync(async () =>
                {
                    student = _objectFactory.GetFactory<IStudentFactory>().Create(createDto.FullName, createDto.DateOfBirth, createDto.Gender, createDto.Email, createDto.PhoneNo, createDto.Address, createDto.EnrollmentDate.Value, createDto.StandardId, createDto.DivisionId, createDto.RollNo, createDto.StudentIdentifier, null, null, createDto.isActive, school);

                    await _unitOfWork.Repository<Student>().AddAsync(student);
                    await _unitOfWork.CompleteAsync();

                    //throw new Exception("Simulated error for testing transaction rollback."); // Simulate an error to test rollback
                });

                //await _unitOfWork.Repository<Student>().AddAsync(studentEntity);
                //await _unitOfWork.CompleteAsync();
                //_logger.LogInformation("Student added successfully with ID: {StudentId}", studentEntity.StudentId);

                //// Retrieve the newly created student with school details for the response DTO
                var createdStudentDetails = await GetStudentByIdAsync(student.StudentId);
                //// Handle unlikely case where retrieval fails immediately after creation
                return createdStudentDetails ?? throw new InvalidOperationException("Failed to retrieve newly created student details.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding student {FullName} for School ID {SchoolId}",
                   createDto.FullName, createDto.SchoolId);
                throw; // Re-throw
            }
        }

        /// <inheritdoc />
        public async Task<bool> UpdateStudentAsync(int id, VmUpdateStudent updateDto)
        {
            _logger.LogInformation("Attempting to update student with ID: {StudentId}", id);
            var studentEntity = await _unitOfWork.Repository<Student>().GetByIdAsync(id);
            if (studentEntity == null)
            {
                _logger.LogWarning("Update failed: Student not found for ID: {StudentId}", id);
                return false;
            }

            // --- Validation ---
            // Check for duplicate StudentIdentifier within the same school (if identifier provided and changed)
            if (!string.IsNullOrWhiteSpace(updateDto.StudentIdentifier) &&
                 updateDto.StudentIdentifier != studentEntity.StudentIdentifier) // Only check if it changed
            {
                bool idExists = await DoesStudentIdentifierExistInSchoolAsync(studentEntity.SchoolId, updateDto.StudentIdentifier, id);
                if (idExists)
                {
                    string msg = $"Cannot update student: Student Identifier '{updateDto.StudentIdentifier}' already exists in School ID {studentEntity.SchoolId}.";
                    _logger.LogWarning(msg);
                    throw new ArgumentException(msg, nameof(updateDto.StudentIdentifier));
                }
            }
            // --- End Validation ---

            // Map updates onto the tracked entity
            _mapper.Map(updateDto, studentEntity);
            _unitOfWork.Repository<Student>().Update(studentEntity);

            try
            {
                int result = await _unitOfWork.CompleteAsync();
                if (result > 0)
                {
                    _logger.LogInformation("Student updated successfully: ID {StudentId}", id);
                    return true;
                }
                else
                {
                    _logger.LogWarning("Update operation completed for Student ID {StudentId}, but no database rows were affected.", id);
                    return false; // Or true if no change is success
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating student with ID: {StudentId}", id);
                throw; // Re-throw
            }
        }

        /// <inheritdoc />
        public async Task<bool> DeleteStudentAsync(int id)
        {
            _logger.LogInformation("Attempting to delete student with ID: {StudentId}", id);
            var studentEntity = await _unitOfWork.Repository<Student>().GetByIdAsync(id);
            if (studentEntity == null)
            {
                _logger.LogWarning("Delete failed: Student not found for ID: {StudentId}", id);
                return false;
            }

            // Add checks here if needed (e.g., prevent deleting student with active enrollments etc.)

            try
            {
                _unitOfWork.Repository<Student>().Delete(studentEntity);
                int result = await _unitOfWork.CompleteAsync();
                if (result > 0)
                {
                    _logger.LogInformation("Student deleted successfully: ID {StudentId}", id);
                    return true;
                }
                else
                {
                    _logger.LogWarning("Delete operation completed for Student ID {StudentId}, but no database rows were affected.", id);
                    return false;
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting student with ID: {StudentId}", id);
                throw; // Re-throw
            }
        }


        // --- Private Helper Methods ---

        /// <summary>
        /// Checks if a student identifier already exists within a specific school, excluding a given student ID.
        /// </summary>
        private async Task<bool> DoesStudentIdentifierExistInSchoolAsync(int schoolId, string studentIdentifier, int? excludeStudentId)
        {
            if (string.IsNullOrWhiteSpace(studentIdentifier)) return false;

            // Build the predicate dynamically
            Expression<Func<Student, bool>> predicate = s =>
                s.SchoolId == schoolId &&
                s.StudentIdentifier == studentIdentifier;

            // If excludeStudentId has a value, add condition to exclude that student
            if (excludeStudentId.HasValue)
            {
                Expression<Func<Student, bool>> excludePredicate = s => s.StudentId != excludeStudentId.Value;
                // Combine predicates using Expression Trees or a library like LinqKit
                // Simple combination for AND:
                var param = Expression.Parameter(typeof(Student), "s");
                var body = Expression.AndAlso(
                    Expression.Invoke(predicate, param),
                    Expression.Invoke(excludePredicate, param)
                );
                predicate = Expression.Lambda<Func<Student, bool>>(body, param);

                // Alternative (simpler if supported directly):
                // predicate = s => s.SchoolId == schoolId &&
                //                  s.StudentIdentifier == studentIdentifier &&
                //                  s.StudentId != excludeStudentId.Value;
            }


            return await _unitOfWork.Repository<Student>().AnyAsync(predicate);
        }
        //implement 
        public async Task<string?> UpdateStudentPhotoAsync(int studentId, Stream photoStream, string contentType, string originalFileName)
        {
            _logger.LogInformation("Attempting to update photo for Student ID: {StudentId}", studentId);

            if (photoStream == null || photoStream.Length == 0)
            {
                throw new ArgumentException("Photo stream cannot be empty.", nameof(photoStream));
            }
            if (photoStream.Length > MaxFileSize)
            {
                throw new ArgumentException($"Photo size exceeds the limit of {MaxFileSize / 1024 / 1024} MB.");
            }
            if (string.IsNullOrWhiteSpace(contentType) || !AllowedImageTypes.Contains(contentType.ToLowerInvariant()))
            {
                throw new ArgumentException($"Invalid image type '{contentType}'. Allowed types: {string.Join(", ", AllowedImageTypes)}");
            }

            // 1. Find the student
            var studentEntity = await _unitOfWork.Repository<Student>().GetByIdAsync(studentId);
            if (studentEntity == null)
            {
                _logger.LogWarning("Update photo failed: Student not found for ID: {StudentId}", studentId);
                throw new FileNotFoundException($"Student with ID {studentId} not found.");
            }

            //do not update if previous photo is same as new one
            // 2. Delete existing photo (if any) - Best effort
            if (!string.IsNullOrWhiteSpace(studentEntity.PhotoPath))
            {
                _logger.LogInformation("Deleting existing photo for Student ID {StudentId}: {PhotoPath}", studentId, studentEntity.PhotoPath);
                // Assuming PhotoPath stores "container/filename" format used by storage service
                var pathParts = studentEntity.PhotoPath.Split('/');
                if (pathParts.Length == 2)
                {
                    await _fileStorageService.DeleteFileAsync(pathParts[0], pathParts[1]);
                }
                else
                {
                    _logger.LogWarning("Could not parse existing PhotoPath to delete file: {PhotoPath}", studentEntity.PhotoPath);
                }
            }

            // 3. Generate a unique filename
            var fileExtension = Path.GetExtension(originalFileName)?.ToLowerInvariant() ?? ".jpg"; // Use original extension or default
            var uniqueFileName = $"{studentEntity.FullName}_{studentEntity.StudentIdentifier}{fileExtension}"; // Unique name to prevent collisions

            // 4. Save the new file using the storage service
            string savedPath;
            try
            {
                savedPath = await _fileStorageService.SaveFileAsync(photoStream, PhotoContainerName, uniqueFileName, contentType);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error saving new photo to storage for Student ID: {StudentId}", studentId);
                return null; // Indicate save failure
            }


            // 5. Update the student's PhotoPath in the database
            await _unitOfWork.ExecuteInTransactionAsync(async () =>
            {
                studentEntity.UpdatePhoto(uniqueFileName, savedPath);
                _unitOfWork.Repository<Student>().Update(studentEntity);// check if needed
                await _unitOfWork.CompleteAsync();

                //throw new Exception("Simulated error for testing transaction rollback."); // Simulate an error to test rollback
            });

            //studentEntity.PhotoPath = savedPath; // Store the relative path/identifier returned by storage service
            

            try
            {
                //await _unitOfWork.CompleteAsync();
                _logger.LogInformation("Successfully updated photo path for Student ID {StudentId} to {PhotoPath}", studentId, savedPath);
                return uniqueFileName; // Return the new path/identifier
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error saving updated PhotoPath to database for Student ID: {StudentId}", studentId);
                // Attempt to delete the file we just saved if DB update fails (compensating action)
                _logger.LogInformation("Attempting to delete orphaned file due to DB update failure: Container={Container}, FileName={FileName}", PhotoContainerName, uniqueFileName);
                await _fileStorageService.DeleteFileAsync(PhotoContainerName, uniqueFileName);
                return null; // Indicate failure
            }
        }

        public async Task<byte[]> ExportStudentsToExcelAsync(int schoolId)
        {
            _logger.LogInformation("Generating Excel export for School ID: {SchoolId}", schoolId);
            // Get summary data (adjust DTO if different fields needed for export)
            var students = await GetStudentsBySchoolAsync(schoolId);
            if (!students.Any())
            {
                _logger.LogWarning("No students found for School ID {SchoolId} to export.", schoolId);
                // Return empty Excel or throw? Returning empty seems better.
            }

            // Use a simplified DTO if StudentSummaryDto has too much/wrong info
            // var exportData = _mapper.Map<IEnumerable<StudentExportDto>>(students);
            // return await _excelService.GenerateExcelExportAsync(exportData, $"School_{schoolId}_Students");

            // Using StudentSummaryDto for now:
            return await _excelService.GenerateExcelExportAsync(students, $"School_{schoolId}_Students");
        }

        /// <inheritdoc />
        public async Task<List<VmStudentImportResult>> ImportStudentsFromExcelAsync(int schoolId, Stream excelStream)
        {
            _logger.LogInformation("Starting Excel import process for School ID: {SchoolId}", schoolId);
            var results = new List<VmStudentImportResult>();
            var validStudentsToCreate = new List<Student>();

            // 1. Check if school exists
            var schoolExists = await _unitOfWork.Repository<School>().AnyAsync(s => s.SchoolId == schoolId);
            if (!schoolExists)
            {
                _logger.LogError("Import failed: School ID {SchoolId} not found.", schoolId);
                // Return a single error result or throw? Throwing seems appropriate here.
                throw new ArgumentException($"School with ID {schoolId} not found.");
            }

            // 2. Read Raw Data from Excel
            List<VmStudentImport> importedDtos;
            try
            {
                importedDtos = await _excelService.ReadStudentsFromStreamAsync(excelStream);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to read Excel stream for School ID: {SchoolId}", schoolId);
                // Return a single error indicating read failure
                results.Add(new VmStudentImportResult { RowNumber = 0, Success = false, Errors = { $"Failed to read Excel file: {ex.Message}" } });
                return results;
            }

            if (!importedDtos.Any())
            {
                _logger.LogWarning("Excel file contained no student data rows for School ID: {SchoolId}", schoolId);
                results.Add(new VmStudentImportResult { RowNumber = 0, Success = false, Errors = { "No data rows found in the Excel file." } });
                return results;
            }

            // 3. Get existing identifiers for validation (optimize if many students)
            var existingIdentifiers = (await _unitOfWork.Repository<Student>()
                .FindAsync(predicate: s => s.SchoolId == schoolId && s.StudentIdentifier != null))
                .Select(s => s.StudentIdentifier!)
                .ToHashSet(StringComparer.OrdinalIgnoreCase); // Case-insensitive check

            // 4. Validate and Process each row
            foreach (var dto in importedDtos)
            {
                var result = new VmStudentImportResult { RowNumber = dto.RowNumber, ImportedData = dto };
                results.Add(result);

                // Basic DTO Validation
                var validationResult = await _importValidator.ValidateAsync(dto);
                if (!validationResult.IsValid)
                {
                    result.Success = false;
                    result.Errors.AddRange(validationResult.Errors.Select(e => e.ErrorMessage));
                    // Skip further checks if basic validation fails
                    continue;
                }

                // Business Validation: Unique Student Identifier
                if (!string.IsNullOrWhiteSpace(dto.StudentIdentifier))
                {
                    // Check against existing DB identifiers
                    if (existingIdentifiers.Contains(dto.StudentIdentifier!))
                    {
                        result.Success = false;
                        result.Errors.Add($"Student Identifier '{dto.StudentIdentifier}' already exists in this school.");
                    }
                    // Check against identifiers already added in this batch (prevent duplicates within the file)
                    else if (validStudentsToCreate.Any(s => s.StudentIdentifier != null && s.StudentIdentifier.Equals(dto.StudentIdentifier, StringComparison.OrdinalIgnoreCase)))
                    {
                        result.Success = false;
                        result.Errors.Add($"Duplicate Student Identifier '{dto.StudentIdentifier}' found within the import file.");
                    }
                }

                // Add more business validations if needed...

                // If still valid after all checks
                if (!result.Errors.Any())
                {
                    try
                    {
                        // Map to Entity (handle DateOfBirth parsing)
                        var studentEntity = _mapper.Map<Student>(dto);
                        //studentEntity.SchoolId = schoolId;
                        //studentEntity.IsActive = true;
                        if (!string.IsNullOrWhiteSpace(dto.DateOfBirth) && DateOnly.TryParse(dto.DateOfBirth, out var dob))
                        {
                            //studentEntity.DateOfBirth = dob.ToDateTime(TimeOnly.MinValue); // Convert DateOnly if needed
                        }
                        else if (!string.IsNullOrWhiteSpace(dto.DateOfBirth))
                        {
                            // If parsing failed but validator didn't catch it (shouldn't happen with validator above)
                            result.Success = false;
                            result.Errors.Add($"Invalid date format for DateOfBirth: '{dto.DateOfBirth}'");
                            continue; // Skip adding this student
                        }
                        //var student = _objectFactory.GetFactory<IStudentFactory>().Create(dto.FullName, dto.DateOfBirth, dto.Gender, dto.Email, dto.PhoneNo, dto.Address, dto.EnrollmentDate.Value, dto.StandardId, createDto.DivisionId, createDto.RollNo, createDto.StudentIdentifier, null, null, createDto.isActive, school);


                        validStudentsToCreate.Add(studentEntity);
                        result.Success = true;
                    }
                    catch (Exception mapEx)
                    {
                        _logger.LogError(mapEx, "Error mapping imported data at row {RowNum}", dto.RowNumber);
                        result.Success = false;
                        result.Errors.Add($"Internal error processing row: {mapEx.Message}");
                    }
                }
                else
                {
                    result.Success = false; // Ensure success is false if errors exist
                }
            }

            // 5. Save Valid Records to Database
            if (validStudentsToCreate.Any())
            {
                _logger.LogInformation("Attempting to save {ValidCount} valid student records for School ID: {SchoolId}", validStudentsToCreate.Count, schoolId);
                try
                {
                    await _unitOfWork.Repository<Student>().AddRangeAsync(validStudentsToCreate);
                    await _unitOfWork.CompleteAsync();
                    _logger.LogInformation("Successfully saved {ValidCount} student records.", validStudentsToCreate.Count);
                }
                catch (Exception dbEx)
                {
                    _logger.LogError(dbEx, "Database error saving imported students for School ID: {SchoolId}", schoolId);
                    // Mark all successfully validated rows as failed due to DB error? Or return a global error?
                    // Adding a global error message might be clearer.
                    results.Insert(0, new VmStudentImportResult { RowNumber = 0, Success = false, Errors = { $"Database error saving valid records: {dbEx.Message}" } });
                    // Optionally mark individual results as failed
                    results.Where(r => r.Success).ToList().ForEach(r => { r.Success = false; r.Errors.Add("Database save failed."); });
                }
            }
            else
            {
                _logger.LogInformation("No valid student records found to save for School ID: {SchoolId}", schoolId);
            }

            return results;
        }

        public async Task<byte[]> GenerateStudentIdCardPdfAsync(int studentId)
        {
            _logger.LogInformation("Generating ID card PDF for Student ID: {StudentId}", studentId);
            // Need full details for the card
            var studentDto = await GetStudentByIdAsync(studentId);
            if (studentDto == null)
            {
                _logger.LogError("Cannot generate ID card: Student ID {StudentId} not found.", studentId);
                throw new FileNotFoundException($"Student with ID {studentId} not found.");
            }
            return await _pdfService.GenerateStudentIdCardAsync(studentDto);
        }

        /// <inheritdoc />
        public async Task<byte[]> GenerateBulkIdCardsPdfAsync(int schoolId)
        {
            _logger.LogInformation("Generating bulk ID cards PDF for School ID: {SchoolId}", schoolId);
            // Need full details for cards - fetch all students then get details
            // This could be inefficient for large schools. Consider fetching details directly.
            var studentSummaries = await GetStudentsBySchoolAsync(schoolId); // Gets summaries first
            if (!studentSummaries.Any())
            {
                _logger.LogWarning("No students found for School ID {SchoolId} to generate bulk IDs.", schoolId);
                return Array.Empty<byte>(); // Return empty byte array for empty PDF
            }

            // Fetch full details for each student (can be slow for many students)
            // TODO: Optimize this - potentially create a repo method to get details directly
            var studentDetails = new List<VmStudentDetail>();
            foreach (var summary in studentSummaries)
            {
                var detail = await GetStudentByIdAsync(summary.StudentId);
                if (detail != null) studentDetails.Add(detail);
            }

            if (!studentDetails.Any())
            {
                _logger.LogWarning("Could not retrieve details for any students in School ID {SchoolId}.", schoolId);
                return Array.Empty<byte>();
            }

            return await _pdfService.GenerateBulkIdCardsAsync(studentDetails, PhotoContainerName);
        }
    }
}
