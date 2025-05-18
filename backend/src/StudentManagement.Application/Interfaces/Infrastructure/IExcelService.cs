using StudentManagement.Application.Features.Students;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace StudentManagement.Application.Interfaces.Infrastructure
{
    public interface IExcelService
    {
        /// <summary>
        /// Generates an Excel file content from a list of student data.
        /// </summary>
        /// <typeparam name="T">The type of the data objects (e.g., StudentSummaryDto).</typeparam>
        /// <param name="data">The list of data to export.</param>
        /// <param name="sheetName">The name for the Excel worksheet.</param>
        /// <returns>A byte array representing the Excel file content.</returns>
        Task<byte[]> GenerateExcelExportAsync<T>(IEnumerable<T> data, string sheetName = "Sheet1") where T : class;

        /// <summary>
        /// Reads student data from an Excel stream.
        /// </summary>
        /// <param name="stream">The stream containing the Excel file.</param>
        /// <param name="sheetName">The name of the sheet to read from (optional, reads first if null).</param>
        /// <returns>A list of DTOs representing the rows read.</returns>
        Task<List<VmStudentImport>> ReadStudentsFromStreamAsync(Stream stream, string? sheetName = null);
    }
}
