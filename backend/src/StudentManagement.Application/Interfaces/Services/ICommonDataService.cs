using StudentManagement.Application.Features.Common.ViewModels;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace StudentManagement.Application.Interfaces.Services
{
    public interface ICommonDataService
    {
        Task<IReadOnlyList<VmStandard>> GetAllStandardsAsync(int? schoolId = null); // Optional school filter
        Task<IReadOnlyList<VmDivision>> GetAllDivisionsAsync(int? schoolId = null); // Optional school filter
        Task<IReadOnlyList<VmBloodGroup>> GetAllBloodGroupsAsync();
        Task<IReadOnlyList<VmHouse>> GetAllHousesAsync(int? schoolId = null);
        Task<IReadOnlyList<VmStudentStatus>> GetAllStudentStatusesAsync(); // New method for student statuses
    }
}
