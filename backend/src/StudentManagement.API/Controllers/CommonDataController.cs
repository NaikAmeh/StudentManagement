using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StudentManagement.Application.Interfaces.Services;

namespace StudentManagement.API.Controllers
{
    [Authorize] // All authenticated users can fetch common data
    [Route("api/[controller]")]
    [ApiController]
    public class CommonDataController : ControllerBase
    {
        private readonly ICommonDataService _commonDataService;

        public CommonDataController(ICommonDataService commonDataService)
        {
            _commonDataService = commonDataService;
        }

        [HttpGet("standards")]
        public async Task<IActionResult> GetStandards([FromQuery] int? schoolId)
        {
            var standards = await _commonDataService.GetAllStandardsAsync(schoolId);
            return Ok(standards);
        }

        [HttpGet("divisions")]
        public async Task<IActionResult> GetDivisions([FromQuery] int? schoolId)
        {
            var divisions = await _commonDataService.GetAllDivisionsAsync(schoolId);
            return Ok(divisions);
        }

        [HttpGet("bloodgroups")]
        public async Task<IActionResult> GetBloodGroups()
        {
            var bloodGroups = await _commonDataService.GetAllBloodGroupsAsync();
            return Ok(bloodGroups);
        }

        [HttpGet("houses")]
        public async Task<IActionResult> GetHouses([FromQuery] int? schoolId)
        {
            var houses = await _commonDataService.GetAllHousesAsync(schoolId);
            return Ok(houses);
        }
    }
}
