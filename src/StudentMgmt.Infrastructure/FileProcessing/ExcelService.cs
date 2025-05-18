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

                    // Assuming header row is the first row
                    var headerRow = worksheet.Row(1);
                    // Simple header mapping (adjust column names as needed)
                    var columnMap = new Dictionary<string, int>();
                    foreach (var cell in headerRow.CellsUsed())
                    {
                        // Trim and make case-insensitive for robust matching
                        columnMap[cell.GetValue<string>().Trim().ToLowerInvariant()] = cell.Address.ColumnNumber;
                    }

                    // Very basic check for essential columns (adjust as needed)
                    if (!columnMap.ContainsKey("fullname"))
                    {
                        throw new ArgumentException("Excel sheet must contain at least 'FullName' columns.");
                    }

                    // Start reading from the row after the header
                    var firstDataRow = 2;
                    var lastRowUsed = worksheet.LastRowUsed()?.RowNumber() ?? 0;

                    for (int rowNum = firstDataRow; rowNum <= lastRowUsed; rowNum++)
                    {
                        var row = worksheet.Row(rowNum);
                        // Basic check if row seems empty
                        if (row.IsEmpty()) continue;

                        var dto = new VmStudentImport { RowNumber = rowNum };

                        // Read data based on mapped column indices (handle potential missing columns gracefully)
                        dto.FullName = TryReadCell(row, columnMap, "fullname");
                        dto.DateOfBirth = TryReadCell(row, columnMap, "dateofbirth");
                        dto.StudentIdentifier = TryReadCell(row, columnMap, "studentidentifier");

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
    }
}
