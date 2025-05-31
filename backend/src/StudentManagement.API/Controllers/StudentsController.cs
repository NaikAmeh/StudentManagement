using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StudentManagement.Application.Features.Students;
using StudentManagement.Application.Interfaces.Services;
using StudentManagement.Domain.Entities;

namespace StudentManagement.API.Controllers
{
    [Authorize] // Require authentication for all student actions
    [Route("api/students")] // Base route (consider if school scoping is needed here or in actions)
    [ApiController]
    public class StudentsController : ControllerBase
    {
        private readonly IStudentService _studentService;
        private readonly ILogger<StudentsController> _logger;
        // Inject ISchoolService if needed for auth checks based on school access
        private readonly ISchoolService _schoolService;

        public StudentsController(
            IStudentService studentService,
            ILogger<StudentsController> logger,
            ISchoolService schoolService) // Inject school service for access checks
        {
            _studentService = studentService ?? throw new ArgumentNullException(nameof(studentService));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _schoolService = schoolService ?? throw new ArgumentNullException(nameof(schoolService));
        }

        // --- TODO: Implement Authorization Checks ---
        // Helper method to check if the current user can access data for a specific school
        private async Task<bool> CanUserAccessSchool(int schoolId)
        {
            // This logic depends on how user access is managed (e.g., claims, UserSchoolLinks)
            // Example using UserSchoolLinks (requires getting current user ID):
            var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
            {
                _logger.LogWarning("Cannot verify school access: User ID claim not found or invalid.");
                return false; // Cannot verify access
            }

            // Admins can access all schools
            //if (User.IsInRole("Admin")) return true;

            // Check if the user is linked to the school
            return await _schoolService.IsUserAssignedToSchoolAsync(userId, schoolId);
        }
        // --- End Authorization Check Placeholder ---


        /// <summary>
        /// Gets a list of student summaries for a specific school.
        /// </summary>
        /// <param name="schoolId">The ID of the school.</param>
        /// <returns>A list of StudentSummaryDto.</returns>
        // GET: api/schools/{schoolId}/students (More RESTful route)
        [HttpGet("/api/schools/{schoolId:int}/students")] // Route scoped by school
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(IEnumerable<VmStudentSummary>))]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)] // If user cannot access school
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<IEnumerable<VmStudentSummary>>> GetStudentsBySchool(int schoolId)
        {
            _logger.LogInformation("Executing {ActionName} for School ID: {SchoolId}", nameof(GetStudentsBySchool), schoolId);

            // --- Authorization Check ---
            //if (!await CanUserAccessSchool(schoolId))
            //{
            //    _logger.LogWarning("Forbidden access attempt: User tried to access students for School ID {SchoolId}", schoolId);
            //    return Forbid(); // Return 403 Forbidden
            //}
            // --- End Authorization Check ---

            try
            {
                var students = await _studentService.GetStudentsBySchoolAsync(schoolId);
                return Ok(students);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error executing {ActionName} for School ID: {SchoolId}", nameof(GetStudentsBySchool), schoolId);
                return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while retrieving students.");
            }
        }

        /// <summary>
        /// Gets detailed information for a specific student.
        /// </summary>
        /// <param name="id">The ID of the student.</param>
        /// <returns>A StudentDetailDto.</returns>
        // GET: api/students/5
        [HttpGet("{id:int}")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(VmStudentDetail))]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<VmStudentDetail>> GetStudent(int id)
        {
            _logger.LogInformation("Executing {ActionName} for Student ID: {StudentId}", nameof(GetStudent), id);
            try
            {
                var studentDto = await _studentService.GetStudentByIdAsync(id);
                if (studentDto == null)
                {
                    _logger.LogWarning("{ActionName} requested for Student ID {StudentId}, but resource was not found.", nameof(GetStudent), id);
                    return NotFound($"Student with ID {id} not found.");
                }

                // --- Authorization Check ---
                // Check if user can access the school this student belongs to
                if (!await CanUserAccessSchool(studentDto.SchoolId))
                {
                    _logger.LogWarning("Forbidden access attempt: User tried to access student {StudentId} belonging to School ID {SchoolId}", id, studentDto.SchoolId);
                    return Forbid(); // Return 403 Forbidden
                }
                // --- End Authorization Check ---

                return Ok(studentDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error executing {ActionName} for Student ID: {StudentId}", nameof(GetStudent), id);
                return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while retrieving the student.");
            }
        }

        /// <summary>
        /// Creates a new student.
        /// </summary>
        /// <param name="createStudentDto">The student creation data.</param>
        /// <returns>The created StudentDetailDto.</returns>
        // POST: api/students (Or POST api/schools/{schoolId}/students)
        // Using non-scoped route here means SchoolId MUST be in the DTO.
        [HttpPost]
        [ProducesResponseType(StatusCodes.Status201Created, Type = typeof(VmStudentDetail))]
        [ProducesResponseType(StatusCodes.Status400BadRequest)] // For validation errors
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)] // If user cannot create student in the specified school
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<VmStudentDetail>> CreateStudent(VmCreateStudent createStudentDto)//FromBody is required?
        {
            _logger.LogInformation("Executing {ActionName} for School ID: {SchoolId}", nameof(CreateStudent), createStudentDto.SchoolId);
            if (!ModelState.IsValid) return BadRequest(ModelState);

            // --- Authorization Check ---
            if (!await CanUserAccessSchool(createStudentDto.SchoolId))
            {
                _logger.LogWarning("Forbidden creation attempt: User tried to create student for School ID {SchoolId}", createStudentDto.SchoolId);
                return Forbid(); // Return 403 Forbidden
            }
            // --- End Authorization Check ---

            try
            {
                var createdStudent = await _studentService.AddStudentAsync(createStudentDto);
                // Return 201 Created with location header and the created resource
                return CreatedAtAction(nameof(GetStudent), new { id = createdStudent.StudentId }, createdStudent);
            }
            catch (ArgumentException ex) // Catch validation errors from service (e.g., duplicate ID, school not found)
            {
                _logger.LogWarning("Validation error during {ActionName}: {ErrorMessage}", nameof(CreateStudent), ex.Message);
                // Return 400 Bad Request with the specific error message
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error executing {ActionName} for School ID: {SchoolId}", nameof(CreateStudent), createStudentDto.SchoolId);
                return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while creating the student.");
            }
        }

        /// <summary>
        /// Updates an existing student.
        /// </summary>
        /// <param name="id">The ID of the student to update.</param>
        /// <param name="updateStudentDto">The student update data.</param>
        /// <returns>No content if successful.</returns>
        // PUT: api/students/5
        [HttpPut("{id:int}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)] // For validation errors
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> UpdateStudent(int id, [FromBody] VmUpdateStudent updateStudentDto)
        {
            _logger.LogInformation("Executing {ActionName} for Student ID: {StudentId}", nameof(UpdateStudent), id);
            if (!ModelState.IsValid) return BadRequest(ModelState);

            // --- Authorization Check (Requires fetching student first to get SchoolId) ---
            var existingStudent = await _studentService.GetStudentByIdAsync(id); // Use service to get DTO
            if (existingStudent == null)
            {
                return NotFound($"Student with ID {id} not found.");
            }
            if (!await CanUserAccessSchool(existingStudent.SchoolId))
            {
                _logger.LogWarning("Forbidden update attempt: User tried to update student {StudentId} belonging to School ID {SchoolId}", id, existingStudent.SchoolId);
                return Forbid();
            }
            // --- End Authorization Check ---

            try
            {
                var success = true; //await _studentService.UpdateStudentAsync(id, updateStudentDto);
                // Service already returned false if not found during its own check, but double-check here
                if (!success)
                {
                    // This case might indicate a concurrency issue if the first check passed but update failed
                    _logger.LogWarning("{ActionName} failed for Student ID {StudentId} after authorization check. Possible concurrency issue or data unchanged.", nameof(UpdateStudent), id);
                    return NotFound($"Student with ID {id} not found or update failed.");
                }
                return NoContent(); // Standard response for successful PUT
            }
            catch (ArgumentException ex) // Catch validation errors from service (e.g., duplicate ID)
            {
                _logger.LogWarning("Validation error during {ActionName} for Student ID {StudentId}: {ErrorMessage}", nameof(UpdateStudent), id, ex.Message);
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error executing {ActionName} for Student ID: {StudentId}", nameof(UpdateStudent), id);
                return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while updating the student.");
            }
        }

        /// <summary>
        /// Deletes a specific student.
        /// </summary>
        /// <param name="id">The ID of the student to delete.</param>
        /// <returns>No content if successful.</returns>
        // DELETE: api/students/5
        [HttpDelete("{id:int}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> DeleteStudent(int id)
        {
            _logger.LogInformation("Executing {ActionName} for Student ID: {StudentId}", nameof(DeleteStudent), id);

            // --- Authorization Check (Requires fetching student first to get SchoolId) ---
            var existingStudent = await _studentService.GetStudentByIdAsync(id); // Use service to get DTO
            if (existingStudent == null)
            {
                return NotFound($"Student with ID {id} not found."); // Already handled if service returns false below, but good practice
            }
            if (!await CanUserAccessSchool(existingStudent.SchoolId))
            {
                _logger.LogWarning("Forbidden delete attempt: User tried to delete student {StudentId} belonging to School ID {SchoolId}", id, existingStudent.SchoolId);
                return Forbid();
            }
            // --- End Authorization Check ---

            try
            {
                var success = await _studentService.DeleteStudentAsync(id);
                if (!success)
                {
                    _logger.LogWarning("{ActionName} failed for Student ID {StudentId}. Resource possibly already deleted.", nameof(DeleteStudent), id);
                    return NotFound($"Student with ID {id} not found for deletion.");
                }
                return NoContent(); // Standard response for successful DELETE
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error executing {ActionName} for Student ID: {StudentId}", nameof(DeleteStudent), id);
                return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while deleting the student.");
            }
        }

        [HttpPost("{id:int}/photo")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(object))] // Return path
        [ProducesResponseType(StatusCodes.Status400BadRequest)] // Bad file, validation error
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)] // Student not found
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> UploadStudentPhoto(int id, IFormFile file) // Use IFormFile to receive upload
        {
            _logger.LogInformation("Executing {ActionName} for Student ID: {StudentId}", nameof(UploadStudentPhoto), id);

            if (file == null || file.Length == 0)
            {
                return BadRequest(new { message = "No file uploaded or file is empty." });
            }

            // --- Authorization Check (Requires fetching student first to get SchoolId) ---
            var existingStudent = await _studentService.GetStudentByIdAsync(id); // Use service to get DTO
            if (existingStudent == null)
            {
                return NotFound($"Student with ID {id} not found.");
            }
            if (!await CanUserAccessSchool(existingStudent.SchoolId))
            {
                _logger.LogWarning("Forbidden photo upload attempt: User tried to upload photo for student {StudentId} belonging to School ID {SchoolId}", id, existingStudent.SchoolId);
                return Forbid();
            }
            // --- End Authorization Check ---

            try
            {
                // Get stream from the uploaded file
                using (var stream = file.OpenReadStream())
                {
                    string? savedPath = await _studentService.UpdateStudentPhotoAsync(id, stream, file.ContentType, file.FileName);

                    if (savedPath == null)
                    {
                        // Service layer should have logged the error
                        return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while saving the photo.");
                    }

                    // Return the relative path (or URL depending on storage service)
                    // The client can use this path to display the image.
                    // If using wwwroot, this might be "/uploads/student-photos/guid.jpg"
                    return Ok(new { photoPath = savedPath });
                }
            }
            catch (FileNotFoundException ex) // Student not found by service
            {
                _logger.LogWarning("Photo upload failed: {ErrorMessage}", ex.Message);
                return NotFound(new { message = ex.Message });
            }
            catch (ArgumentException ex) // Invalid file type, size, etc. from service
            {
                _logger.LogWarning("Invalid photo upload request for Student ID {StudentId}: {ErrorMessage}", id, ex.Message);
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error executing {ActionName} for Student ID: {StudentId}", nameof(UploadStudentPhoto), id);
                return StatusCode(StatusCodes.Status500InternalServerError, "An unexpected error occurred while uploading the photo.");
            }
        }

        /// <summary>
        /// Exports student data for a specific school to an Excel file.
        /// </summary>
        /// <param name="schoolId">The ID of the school.</param>
        /// <returns>An Excel file containing student data.</returns>
        // GET: api/schools/{schoolId}/students/export
        [HttpGet("/api/schools/{schoolId:int}/students/export")]
        [ProducesResponseType(typeof(FileContentResult), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> ExportStudents(int schoolId)
        {
            _logger.LogInformation("Executing {ActionName} for School ID: {SchoolId}", nameof(ExportStudents), schoolId);
            if (!await CanUserAccessSchool(schoolId)) return Forbid();

            try
            {
                byte[] fileContents = await _studentService.ExportStudentsToExcelAsync(schoolId);
                string fileName = $"students_school_{schoolId}_{DateTime.UtcNow:yyyyMMddHHmmss}.xlsx";
                return File(fileContents, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", fileName);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error executing {ActionName} for School ID: {SchoolId}", nameof(ExportStudents), schoolId);
                return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while exporting student data.");
            }
        }

        /// <summary>
        /// Imports students from an Excel file for a specific school.
        /// </summary>
        /// <param name="schoolId">The ID of the school to import students into.</param>
        /// <param name="file">The Excel file containing student data (multipart/form-data).</param>
        /// <returns>A list of results indicating success or failure for each row.</returns>
        // POST: api/schools/{schoolId}/students/import

        //Implement
        [HttpPost("/api/schools/{schoolId:int}/students/import")]
        [Consumes("multipart/form-data")] // Specify expected content type
        [ProducesResponseType(typeof(List<VmStudentImportResult>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)] // Bad file or validation errors
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<List<VmStudentImportResult>>> ImportStudents(int schoolId, IFormFile file)
        {
            _logger.LogInformation("Executing {ActionName} for School ID: {SchoolId}", nameof(ImportStudents), schoolId);
            if (!await CanUserAccessSchool(schoolId)) return Forbid();

            if (file == null || file.Length == 0)
            {
                return BadRequest(new { message = "No file uploaded or file is empty." });
            }

            // Basic check for Excel file extension (improve with MIME type check if needed)
            var allowedExtensions = new[] { ".xlsx" };
            var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
            if (!allowedExtensions.Contains(extension))
            {
                return BadRequest(new { message = "Invalid file type. Please upload an Excel file (.xlsx)." });
            }

            try
            {
                using (var stream = file.OpenReadStream())
                {
                    var results = await _studentService.ImportStudentsFromExcelAsync(schoolId, stream);
                    // Check if there was a global error (e.g., file read error, school not found)
                    if (results.Any(r => r.RowNumber == 0 && !r.Success))
                    {
                        return BadRequest(results); // Return 400 if there was a fundamental issue
                    }
                    return Ok(results); // Return 200 OK with detailed row results
                }
            }
            catch (ArgumentException ex) // Catch specific exceptions like school not found
            {
                _logger.LogWarning("Import validation error for School ID {SchoolId}: {ErrorMessage}", schoolId, ex.Message);
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error executing {ActionName} for School ID: {SchoolId}", nameof(ImportStudents), schoolId);
                return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while importing students.");
            }
        }

        /// <summary>
        /// Downloads a PDF ID card for a specific student.
        /// </summary>
        /// <param name="id">The ID of the student.</param>
        /// <returns>A PDF file containing the student's ID card.</returns>
        // GET: api/students/{id}/idcard
        [HttpGet("{id:int}/idcard")]
        [ProducesResponseType(typeof(FileContentResult), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> DownloadIdCard(int id)
        {
            _logger.LogInformation("Executing {ActionName} for Student ID: {StudentId}", nameof(DownloadIdCard), id);

            // --- Authorization Check (Requires fetching student first to get SchoolId) ---
            var existingStudent = await _studentService.GetStudentByIdAsync(id); // Fetch details needed for auth & PDF
            if (existingStudent == null)
            {
                return NotFound($"Student with ID {id} not found.");
            }
            if (!await CanUserAccessSchool(existingStudent.SchoolId))
            {
                return Forbid();
            }
            // --- End Authorization Check ---

            try
            {
                byte[] pdfBytes = await _studentService.GenerateStudentIdCardPdfAsync(id);
                string fileName = $"idcard_student_{id}_{existingStudent.FullName}.pdf";
                return File(pdfBytes, "application/pdf", fileName);
            }
            catch (FileNotFoundException ex) // Catch if service throws this specifically
            {
                _logger.LogWarning("ID Card generation failed for Student ID {StudentId}: {ErrorMessage}", id, ex.Message);
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error executing {ActionName} for Student ID: {StudentId}", nameof(DownloadIdCard), id);
                return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while generating the ID card.");
            }
        }

        /// <summary>
        /// Downloads a single PDF file containing ID cards for all students in a specific school.
        /// </summary>
        /// <param name="schoolId">The ID of the school.</param>
        /// <returns>A PDF file containing multiple ID cards.</returns>
        // GET: api/schools/{schoolId}/students/idcards/bulk
        [HttpGet("/api/schools/{schoolId:int}/students/idcards/bulk")]
        [ProducesResponseType(typeof(FileContentResult), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> DownloadBulkIdCards(int schoolId)
        {
            _logger.LogInformation("Executing {ActionName} for School ID: {SchoolId}", nameof(DownloadBulkIdCards), schoolId);
            if (!await CanUserAccessSchool(schoolId)) return Forbid();

            try
            {
                byte[] pdfBytes = await _studentService.GenerateBulkIdCardsPdfAsync(schoolId);
                // Handle case where no students were found and an empty PDF might be generated
                if (pdfBytes.Length == 0)
                {
                    _logger.LogInformation("No students found for School ID {SchoolId}, returning empty response for bulk PDF.", schoolId);
                    // Return 204 No Content or 404? 204 might be okay.
                    return NoContent();
                }

                string fileName = $"idcards_bulk_school_{schoolId}_{DateTime.UtcNow:yyyyMMddHHmmss}.pdf";
                return File(pdfBytes, "application/pdf", fileName);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error executing {ActionName} for School ID: {SchoolId}", nameof(DownloadBulkIdCards), schoolId);
                return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while generating the bulk ID cards.");
            }
        }
    }
}
