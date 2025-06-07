using ClosedXML.Excel;
using Microsoft.Extensions.Logging;
using StudentManagement.Application.Features.Students;
using StudentManagement.Application.Interfaces.Infrastructure;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace StudentMgmt.Infrastructure.FileProcessing
{
    public class ExcelService : IExcelService
    {
        private readonly ILogger<ExcelService> _logger;

        public ExcelService(ILogger<ExcelService> logger)
        {
            _logger = logger;
        }

        /// <inheritdoc />
        public Task<byte[]> GenerateExcelExportAsync<T>(IEnumerable<T> data, string sheetName = "Sheet1") where T : class
        {
            _logger.LogInformation("Generating Excel export for {DataType} data.", typeof(T).Name);
            try
            {
                using (var workbook = new XLWorkbook())
                {
                    // ClosedXML can insert data directly from IEnumerable<T>
                    var worksheet = workbook.Worksheets.Add(sheetName);
                    worksheet.Cell(1, 1).InsertTable(data); // Assumes T properties match desired columns

                    // Optional: Adjust column widths
                    worksheet.Columns().AdjustToContents();

                    using (var stream = new MemoryStream())
                    {
                        workbook.SaveAs(stream);
                        _logger.LogInformation("Excel export generated successfully.");
                        return Task.FromResult(stream.ToArray());
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating Excel export for {DataType}", typeof(T).Name);
                throw; // Re-throw to allow service layer/controller to handle
            }
        }


        /// <inheritdoc />
        //public Task<List<VmStudentImport>> ReadStudentsFromStreamAsync(Stream stream, string? sheetName = null)
        //{
        //    _logger.LogInformation("Reading students from Excel stream.");
        //    var students = new List<VmStudentImport>();
        //    try
        //    {
        //        using (var workbook = new XLWorkbook(stream))
        //        {
        //            IXLWorksheet? worksheet;
        //            if (!string.IsNullOrWhiteSpace(sheetName))
        //            {
        //                if (!workbook.Worksheets.TryGetWorksheet(sheetName, out worksheet))
        //                {
        //                    throw new ArgumentException($"Worksheet '{sheetName}' not found.");
        //                }
        //            }
        //            else
        //            {
        //                worksheet = workbook.Worksheets.FirstOrDefault(); // Use the first sheet
        //                if (worksheet == null)
        //                {
        //                    throw new ArgumentException("Excel file contains no worksheets.");
        //                }
        //            }

        //            _logger.LogInformation("Reading from worksheet: {WorksheetName}", worksheet.Name);

        //            // Assuming header row is the first row
        //            var headerRow = worksheet.Row(1);
        //            // Simple header mapping (adjust column names as needed)
        //            var columnMap = new Dictionary<string, int>();
        //            foreach (var cell in headerRow.CellsUsed())
        //            {
        //                // Trim and make case-insensitive for robust matching
        //                columnMap[cell.GetValue<string>().Trim().ToLowerInvariant()] = cell.Address.ColumnNumber;
        //            }

        //            // Very basic check for essential columns (adjust as needed)
        //            if (!columnMap.ContainsKey("name"))
        //            {
        //                throw new ArgumentException("Excel sheet must contain at least 'FullName' columns.");
        //            }

        //            // Start reading from the row after the header
        //            var firstDataRow = 2;
        //            var lastRowUsed = worksheet.LastRowUsed()?.RowNumber() ?? 0;

        //            for (int rowNum = firstDataRow; rowNum <= lastRowUsed; rowNum++)
        //            {
        //                var row = worksheet.Row(rowNum);
        //                // Basic check if row seems empty
        //                if (row.IsEmpty()) continue;

        //                var dto = new VmStudentImport { RowNumber = rowNum };

        //                // Read data based on mapped column indices (handle potential missing columns gracefully)
        //                dto.FullName = TryReadCell(row, columnMap, "fullname");
        //                dto.DateOfBirth = TryReadCell(row, columnMap, "dateofbirth");
        //                dto.StudentIdentifier = TryReadCell(row, columnMap, "studentidentifier");

        //                // Add only if essential data is present (e.g., first/last name)
        //                if (!string.IsNullOrWhiteSpace(dto.FullName))
        //                {
        //                    students.Add(dto);
        //                }
        //                else
        //                {
        //                    _logger.LogDebug("Skipping empty or invalid row {RowNum}", rowNum);
        //                }
        //            }
        //            _logger.LogInformation("Read {StudentCount} potential student records from Excel.", students.Count);
        //        }
        //    }
        //    catch (Exception ex)
        //    {
        //        _logger.LogError(ex, "Error reading students from Excel stream.");
        //        throw; // Re-throw
        //    }
        //    return Task.FromResult(students);
        //}

        public Task<List<VmStudentImport>> ReadStudentsFromStreamAsync(Stream stream, string? sheetName = null)
        {
            _logger.LogInformation("Reading students from Excel stream.");
            var students = new List<VmStudentImport>();
            try
            {
                using (var workbook = new XLWorkbook(stream))
                {
                    IXLWorksheet? worksheet;
                    if (!string.IsNullOrWhiteSpace(sheetName))
                    {
                        if (!workbook.Worksheets.TryGetWorksheet(sheetName, out worksheet))
                        {
                            throw new ArgumentException($"Worksheet '{sheetName}' not found.");
                        }
                    }
                    else
                    {
                        worksheet = workbook.Worksheets.FirstOrDefault(); // Use the first sheet
                        if (worksheet == null)
                        {
                            throw new ArgumentException("Excel file contains no worksheets.");
                        }
                    }

                    _logger.LogInformation("Reading from worksheet: {WorksheetName}", worksheet.Name);

                    // Check if there are any rows besides the header row
                    var lastRowUsed = worksheet.LastRowUsed()?.RowNumber() ?? 0;
                    if (lastRowUsed <= 1)
                    {
                        _logger.LogWarning("Excel file contains only a header row or is empty.");
                        return Task.FromResult(students); // Return empty list
                    }

                    // Start reading from the row after the header
                    var firstDataRow = 2;

                    for (int rowNum = firstDataRow; rowNum <= lastRowUsed; rowNum++)
                    {
                        var row = worksheet.Row(rowNum);
                        // Basic check if row seems empty
                        if (row.IsEmpty()) continue;

                        var dto = new VmStudentImport { RowNumber = rowNum };

                        // Read data directly using column indices (1-based in ClosedXML)
                        // Adjust column indices based on your expected Excel format
                        dto.FullName = GetCellValueSafely(row.Cell(1));           // Column A
                        dto.DateOfBirth = GetCellValueSafely(row.Cell(2));        // Column B
                        dto.Gender = GetCellValueSafely(row.Cell(3));             // Column C
                        dto.Email = GetCellValueSafely(row.Cell(4));              // Column D
                        dto.PhoneNo = GetCellValueSafely(row.Cell(5));            // Column E
                        dto.Address = GetCellValueSafely(row.Cell(6));            // Column F
                        dto.EnrollmentDate = GetCellValueSafely(row.Cell(7));     // Column G
                        dto.StandardName = GetCellValueSafely(row.Cell(8));       // Column H
                        dto.DivisionName = GetCellValueSafely(row.Cell(9));       // Column I
                        dto.RollNo = GetCellValueSafely(row.Cell(10));            // Column J
                        dto.StudentIdentifier = GetCellValueSafely(row.Cell(11)); // Column K
                        dto.BloodGroup = GetCellValueSafely(row.Cell(12)); // Column K
                        dto.House = GetCellValueSafely(row.Cell(12)); // Column K
                        //map standardId and divisionId from names
                        //      
                            

                        // Add only if essential data is present (e.g., first/last name)
                        if (!string.IsNullOrWhiteSpace(dto.FullName))
                        {
                            students.Add(dto);
                        }
                        else
                        {
                            _logger.LogDebug("Skipping empty or invalid row {RowNum}", rowNum);
                        }
                    }
                    _logger.LogInformation("Read {StudentCount} potential student records from Excel.", students.Count);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error reading students from Excel stream.");
                throw; // Re-throw
            }
            return Task.FromResult(students);
        }

        // Helper to read cell value safely
        private string? TryReadCell(IXLRow row, Dictionary<string, int> columnMap, string columnName)
        {
            if (columnMap.TryGetValue(columnName.ToLowerInvariant(), out int colIndex))
            {
                // Use GetValue<string>() for flexibility, parsing happens later during validation
                return row.Cell(colIndex)?.GetValue<string>()?.Trim();
            }
            return null;
        }

        // Helper to safely get cell value as string
        private string? GetCellValueSafely(IXLCell cell)
        {
            if (cell == null || cell.IsEmpty())
                return null;

            return cell.GetValue<string>()?.Trim();
        }

        // Helper to map standard and division names to their respective IDs
        //private async Task MapStandardAndDivisionIdsAsync(VmStudentImport dto)
        //{
        //    try
        //    {
        //        // Map Standard ID from name if provided
        //        if (!string.IsNullOrWhiteSpace(dto.StandardName))
        //        {
        //            var standard = await _standardRepository.GetByNameAsync(dto.StandardName.Trim());
        //            if (standard != null)
        //            {
        //                dto.StandardId = standard.Id;
        //                _logger.LogDebug("Mapped standard name '{StandardName}' to ID {StandardId} for row {RowNumber}",
        //                    dto.StandardName, dto.StandardId, dto.RowNumber);
        //            }
        //            else
        //            {
        //                _logger.LogWarning("Standard with name '{StandardName}' not found for row {RowNumber}",
        //                    dto.StandardName, dto.RowNumber);
        //            }
        //        }

        //        // Map Division ID from name if provided
        //        if (!string.IsNullOrWhiteSpace(dto.DivisionName))
        //        {
        //            // If standard was found, look for division within that standard
        //            if (dto.StandardId.HasValue)
        //            {
        //                var division = await _divisionRepository.GetByNameAndStandardIdAsync(
        //                    dto.DivisionName.Trim(), dto.StandardId.Value);

        //                if (division != null)
        //                {
        //                    dto.DivisionId = division.Id;
        //                    _logger.LogDebug("Mapped division name '{DivisionName}' to ID {DivisionId} for row {RowNumber}",
        //                        dto.DivisionName, dto.DivisionId, dto.RowNumber);
        //                }
        //                else
        //                {
        //                    _logger.LogWarning("Division with name '{DivisionName}' in standard {StandardId} not found for row {RowNumber}",
        //                        dto.DivisionName, dto.StandardId, dto.RowNumber);
        //                }
        //            }
        //            // If standard wasn't found or not provided, try to find division by name only
        //            else
        //            {
        //                var division = await _divisionRepository.GetByNameAsync(dto.DivisionName.Trim());
        //                if (division != null)
        //                {
        //                    dto.DivisionId = division.Id;
        //                    _logger.LogDebug("Mapped division name '{DivisionName}' to ID {DivisionId} for row {RowNumber}",
        //                        dto.DivisionName, dto.DivisionId, dto.RowNumber);
        //                }
        //                else
        //                {
        //                    _logger.LogWarning("Division with name '{DivisionName}' not found for row {RowNumber}",
        //                        dto.DivisionName, dto.RowNumber);
        //                }
        //            }
        //        }
        //    }
        //    catch (Exception ex)
        //    {
        //        _logger.LogError(ex, "Error mapping standard/division IDs for row {RowNumber}", dto.RowNumber);
        //        // Don't throw - we want to continue processing other rows
        //        // The validation layer will catch missing IDs if they're required
        //    }
        //}
    }
}
