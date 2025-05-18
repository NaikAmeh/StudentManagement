using Microsoft.AspNetCore.Mvc;
using StudentManagement.Application.Features.Schools.ViewModels;
using StudentManagement.Application.Interfaces.Services;

namespace StudentManagement.API.Controllers
{

    [Route("api/[controller]")] // Route: /api/schools
    [ApiController]
    public class SchoolsController : ControllerBase
    {
        private readonly ISchoolService _schoolService;
        private readonly ILogger<SchoolsController> _logger; // Inject logger

        public SchoolsController(ISchoolService schoolService, ILogger<SchoolsController> logger)
        {
            _schoolService = schoolService ?? throw new ArgumentNullException(nameof(schoolService));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        // GET: api/schools
        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(IEnumerable<VmSchool>))]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<IEnumerable<VmSchool>>> GetSchools()
        {
            try
            {
                var schools = await _schoolService.GetAllAsync();
                return Ok(schools);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving all schools.");
                // Return generic error, details logged server-side
                return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while retrieving schools.");
            }
        }

        // GET: api/schools/5
        [HttpGet("{id:int}")] // Route constraint for integer ID
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(VmSchool))]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<VmSchool>> GetSchool(int id)
        {
            try
            {
                var school = await _schoolService.GetByIdAsync(id);
                if (school == null)
                {
                    return NotFound($"School with ID {id} not found.");
                }
                return Ok(school);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving school with ID {SchoolId}.", id);
                return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while retrieving the school.");
            }
        }

        // POST: api/schools
        [HttpPost]
        // [Authorize(Roles = "Admin")] // TODO: Add authorization later
        [ProducesResponseType(StatusCodes.Status201Created, Type = typeof(VmSchool))]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<VmSchool>> CreateSchool([FromBody] VmCreateSchool createSchoolDto)
        {
            // ModelState validation is handled automatically by [ApiController]
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var newSchool = await _schoolService.AddAsync(createSchoolDto);
                // Return 201 Created with location header and the created resource
                return CreatedAtAction(nameof(GetSchool), new { id = newSchool.SchoolId }, newSchool);
            }
            catch (Exception ex) // Catch potential exceptions from service (e.g., duplicate name check)
            {
                _logger.LogError(ex, "Error creating school with Name {SchoolName}.", createSchoolDto.Name);
                // Consider specific exceptions for more granular error responses (e.g., 409 Conflict)
                return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while creating the school.");
            }
        }

        // PUT: api/schools/5
        [HttpPut("{id:int}")]
        // [Authorize(Roles = "Admin")] // TODO: Add authorization later
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> UpdateSchool(int id, [FromBody] VmUpdateSchool updateSchoolDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var success = await _schoolService.UpdateAsync(id, updateSchoolDto);
                if (!success)
                {
                    return NotFound($"School with ID {id} not found for update.");
                }
                return NoContent(); // Standard response for successful PUT
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating school with ID {SchoolId}.", id);
                return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while updating the school.");
            }
        }

        // DELETE: api/schools/5
        [HttpDelete("{id:int}")]
        // [Authorize(Roles = "Admin")] // TODO: Add authorization later
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> DeleteSchool(int id)
        {
            try
            {
                var success = await _schoolService.DeleteAsync(id);
                if (!success)
                {
                    return NotFound($"School with ID {id} not found for deletion.");
                }
                return NoContent(); // Standard response for successful DELETE
            }
            catch (InvalidOperationException ex) // Example: Catch specific business rule violation
            {
                _logger.LogWarning(ex, "Business rule violation deleting school ID {SchoolId}.", id);
                return BadRequest(ex.Message); // Return specific error message
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting school with ID {SchoolId}.", id);
                return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while deleting the school.");
            }
        }
    }
}
