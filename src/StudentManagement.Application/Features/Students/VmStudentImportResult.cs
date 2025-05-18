using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace StudentManagement.Application.Features.Students
{
    /// <summary>
    /// Represents the outcome of importing a single row from Excel.
    /// </summary>
    public class VmStudentImportResult
    {
        public int RowNumber { get; set; }
        public bool Success { get; set; }
        public List<string> Errors { get; set; } = new List<string>();
        public VmStudentImport? ImportedData { get; set; } // Include original data for context
    }
}
