using StudentManagement.Application.Features.Students;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace StudentManagement.Application.Interfaces.Services
{
    public interface IDapperService
    {
        Task<int> BulkInsertUpdateStudentsAsync(IEnumerable<VmStudentBulkInsert> students);
    }
}
