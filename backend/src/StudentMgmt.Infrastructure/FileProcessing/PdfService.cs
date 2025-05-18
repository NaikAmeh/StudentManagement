using Microsoft.Extensions.Logging;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using StudentManagement.Application.Features.Students;
using StudentManagement.Application.Interfaces.Infrastructure;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace StudentMgmt.Infrastructure.FileProcessing
{
    public class PdfService : IPdfService
    {
        private readonly ILogger<PdfService> _logger;
        private readonly IFileStorageService _fileStorageService; // To load images if needed

        public PdfService(ILogger<PdfService> logger, IFileStorageService fileStorageService)
        {
            _logger = logger;
            _fileStorageService = fileStorageService;

            // --- QuestPDF License Configuration (IMPORTANT!) ---
            // If using the Community version (free for non-commercial/small companies),
            // set the license type. Do this ONCE during application startup.
            // Put this in your Program.cs ideally, but here for illustration if needed.
            // QuestPDF.Settings.License = LicenseType.Community;
            // If you have a commercial license, use:
            // QuestPDF.Settings.License = LicenseType.Professional;
            // QuestPDF.Settings.LicenseKey = "YOUR_LICENSE_KEY";
            // --- End License Configuration ---
        }

        /// <inheritdoc />
        public Task<byte[]> GenerateStudentIdCardAsync(VmStudentDetail studentData)
        {
            _logger.LogInformation("Generating single ID card PDF for Student ID: {StudentId}", studentData.StudentId);
            try
            {
                var document = new StudentIdCardDocument(studentData, _fileStorageService, _logger);
                // GeneratePdf() returns byte[] directly
                byte[] pdfBytes = document.GeneratePdf();
                _logger.LogInformation("Single ID card PDF generated successfully for Student ID: {StudentId}", studentData.StudentId);
                return Task.FromResult(pdfBytes);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating single ID card PDF for Student ID: {StudentId}", studentData.StudentId);
                throw;
            }
        }

        /// <inheritdoc />
        public Task<byte[]> GenerateBulkIdCardsAsync(IEnumerable<VmStudentDetail> studentsData)
        {
            _logger.LogInformation("Generating bulk ID card PDF for {StudentCount} students.", studentsData.Count());
            if (!studentsData.Any())
            {
                _logger.LogWarning("No student data provided for bulk ID card generation.");
                // Return empty PDF or throw? Empty PDF is likely better.
            }

            try
            {
                var document = new BulkIdCardsDocument(studentsData, _fileStorageService, _logger);
                byte[] pdfBytes = document.GeneratePdf();
                _logger.LogInformation("Bulk ID card PDF generated successfully.");
                return Task.FromResult(pdfBytes);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating bulk ID card PDF.");
                throw;
            }
        }
    }

    // --- QuestPDF Document Implementation for Single Card ---
    public class StudentIdCardDocument : IDocument
    {
        private readonly VmStudentDetail _student;
        private readonly IFileStorageService _fileStorage;
        private readonly ILogger _logger;

        public StudentIdCardDocument(VmStudentDetail student, IFileStorageService fileStorage, ILogger logger)
        {
            _student = student;
            _fileStorage = fileStorage; // Needed if loading images from storage
            _logger = logger;
        }

        public DocumentMetadata GetMetadata() => DocumentMetadata.Default;
        public DocumentSettings GetSettings() => DocumentSettings.Default;

        public void Compose(IDocumentContainer container)
        {
            container.Page(page =>
            {
                // Configure page size, margins, etc. (e.g., standard ID card size CR80: 3.375 x 2.125 inches)
                // QuestPDF uses points (1 inch = 72 points)
                // float width = 3.375f * 72;
                // float height = 2.125f * 72;
                // page.Size(width, height, Unit.Point); // Example size
                page.Size(PageSizes.A7); // Use a standard small size for now
                page.Margin(10, Unit.Point); // Small margin

                page.Content().Column(col =>
                {
                    col.Spacing(5); // Spacing between items

                    // --- Card Header (Example) ---
                    col.Item().AlignCenter().Text(_student.SchoolName).Bold();

                    // --- Photo and Details Row ---
                    col.Item().Row(row =>
                    {
                        row.Spacing(10);

                        // Photo Column (Load image data)
                        row.RelativeItem(1).MaxWidth(100).MaxHeight(120).AlignCenter().Border(1).Padding(2) // Add border/padding
                            .Image(GetStudentPhotoData(_student.PhotoPath)) // Load photo
                            .FitArea(); // Scale image to fit

                        // Details Column
                        row.RelativeItem(2).Column(detailsCol =>
                        {
                            detailsCol.Spacing(2);
                            detailsCol.Item().Text($"{_student.FullName}").Bold().FontSize(12);
                            detailsCol.Item().Text($"ID: {_student.StudentIdentifier ?? "N/A"}");
                            detailsCol.Item().Text($"DOB: {_student.DateOfBirth:yyyy-MM-dd}"); // Format date
                            // Add more fields as needed
                        });
                    });

                    // --- Footer / Barcode (Example) ---
                    col.Item().Element(GenerateBarcodePlaceholder); // Placeholder for barcode
                    col.Item().AlignCenter().Text("Student ID Card").FontSize(8);

                });
            });
        }

        // Helper to load photo data (replace with actual logic)
        private byte[] GetStudentPhotoData(string? photoPath)
        {
            if (string.IsNullOrWhiteSpace(photoPath))
            {
                _logger.LogWarning("Photo path is missing for Student ID: {StudentId}. Using placeholder.", _student.StudentId);
                return GetPlaceholderImage(); // Return placeholder image bytes
            }

            // --- TODO: Implement actual image loading ---
            // This depends heavily on where/how photos are stored.
            // If LocalFileStorageService is used and path is relative like "students/guid.jpg":
            // var fullPath = Path.Combine(_fileStorage.GetBasePath(), photoPath.Replace('/', Path.DirectorySeparatorChar)); // Need GetBasePath() on storage service
            // if (File.Exists(fullPath)) { return File.ReadAllBytes(fullPath); }

            // If using cloud storage, need methods on IFileStorageService to get file stream/bytes
            // For now, return placeholder:
            _logger.LogWarning("Photo loading from storage not fully implemented. Using placeholder for path: {PhotoPath}", photoPath);
            return GetPlaceholderImage();
        }

        private byte[] GetPlaceholderImage()
        {
            // Return bytes for a default placeholder image (e.g., a simple colored square or default avatar)
            // This requires creating a simple image byte array. For now, returning empty.
            return Array.Empty<byte>();
        }

        // Placeholder for barcode generation (use a library like ZXing.Net or BarcodeLib)
        private void GenerateBarcodePlaceholder(IContainer container)
        {
            container.Height(30).AlignCenter().Text($"[Barcode for {_student.StudentId}]").FontSize(8);
        }
    }

    // --- QuestPDF Document Implementation for Bulk Cards ---
    public class BulkIdCardsDocument : IDocument
    {
        private readonly IEnumerable<VmStudentDetail> _students;
        private readonly IFileStorageService _fileStorage;
        private readonly ILogger _logger;

        public BulkIdCardsDocument(IEnumerable<VmStudentDetail> students, IFileStorageService fileStorage, ILogger logger)
        {
            _students = students;
            _fileStorage = fileStorage;
            _logger = logger;
        }

        public DocumentMetadata GetMetadata() => DocumentMetadata.Default;
        public DocumentSettings GetSettings() => DocumentSettings.Default;

        public void Compose(IDocumentContainer container)
        {
            foreach (var student in _students)
            {
                // Create a new page for each student card (simple approach)
                // Alternatively, design layout for multiple cards per page
                container.Page(page =>
                {
                    page.Size(PageSizes.A7); // Consistent size
                    page.Margin(10, Unit.Point);

                    // Use a partial view or helper method to compose the actual card content
                    // to avoid duplicating layout code from StudentIdCardDocument.
                    // For now, duplicating basic structure:
                    page.Content().Column(col =>
                    {
                        col.Spacing(5);
                        col.Item().AlignCenter().Text(student.SchoolName).Bold();
                        col.Item().Row(row =>
                        {
                            row.Spacing(10);
                            row.RelativeItem(1).MaxWidth(100).MaxHeight(120).AlignCenter().Border(1).Padding(2)
                                .Image(GetStudentPhotoData(student.PhotoPath)) // Use helper
                                .FitArea();
                            row.RelativeItem(2).Column(detailsCol =>
                            {
                                detailsCol.Spacing(2);
                                detailsCol.Item().Text($"{student.FullName}").Bold().FontSize(12);
                                detailsCol.Item().Text($"ID: {student.StudentIdentifier ?? "N/A"}");
                                detailsCol.Item().Text($"DOB: {student.DateOfBirth:yyyy-MM-dd}");
                            });
                        });
                        col.Item().Height(30).Element(container => GenerateBarcodePlaceholder(container, student.StudentId)); // Pass ID
                        col.Item().AlignCenter().Text("Student ID Card").FontSize(8);
                    });
                });
            }
        }

        // Share or duplicate helper methods from single card document
        private byte[] GetStudentPhotoData(string? photoPath) { /* ... Same logic as above ... */ return Array.Empty<byte>(); }
        private byte[] GetPlaceholderImage() { return Array.Empty<byte>(); }
        private void GenerateBarcodePlaceholder(IContainer container, int studentId) { container.AlignCenter().Text($"[Barcode for {studentId}]").FontSize(8); }
    }
}
