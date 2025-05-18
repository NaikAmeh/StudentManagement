using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StudentManagement.Application.Common.Models;
using StudentManagement.Application.Features.Users.ViewModels;
using StudentManagement.Application.Interfaces.Services;
using StudentManagement.Domain.Entities;
using StudentMgmt.Infrastructure.Utililty;
using System.Linq.Expressions;

namespace StudentManagement.API.Controllers
{
    [Authorize] // Require authentication for all actions in this controller by default
    [Route("api/[controller]")] // Route: /api/users
    [ApiController]
    public class UsersController : ControllerBase
    {
        private readonly IUserService _userService; // Inject the specific service
        private readonly ILogger<UsersController> _logger;

        public UsersController(
            IUserService userService, // Inject the service
            ILogger<UsersController> logger)
        {
            _userService = userService ?? throw new ArgumentNullException(nameof(userService));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        /// <summary>
        /// Gets a list of all users. Requires Admin role.
        /// </summary>
        /// <returns>A list of UserDto objects.</returns>
        // GET: api/users
        [HttpGet]
        [Authorize(Roles = "Admin")] // Only Admins can get the full list of users
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(IEnumerable<VmUser>))]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<IEnumerable<VmUser>>> GetUsers()
        {
            _logger.LogInformation("Executing {ActionName}", nameof(GetUsers));
            try
            {
                // Call the service method which handles fetch + map
                var userDtos = await _userService.GetAllUsersAsync();
                return Ok(userDtos);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error executing {ActionName}", nameof(GetUsers));
                // Return a generic error message for security
                return StatusCode(StatusCodes.Status500InternalServerError, "An internal server error occurred while retrieving users.");
            }
        }

        /// <summary>
        /// Gets a specific user by their ID. Requires Admin role.
        /// </summary>
        /// <param name="id">The integer ID of the user.</param>
        /// <returns>The UserDto for the specified user.</returns>
        // GET: api/users/5
        [HttpGet("{id:int}")] // Route constraint for integer ID
        [Authorize(Roles = "Admin")] // Only Admins can get any user by ID (adjust if users can get themselves)
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(VmUser))]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<VmUser>> GetUser(int id)
        {
            _logger.LogInformation("Executing {ActionName} for User ID: {UserId}", nameof(GetUser), id);
            try
            {
                // Call the service method which handles fetch + map
                var userDto = await _userService.GetUserByIdAsync(id);

                if (userDto == null)
                {
                    _logger.LogWarning("{ActionName} requested for User ID {UserId}, but resource was not found.", nameof(GetUser), id);
                    // Return 404 Not Found if the service returns null
                    return NotFound($"User with ID {id} not found.");
                }
                return Ok(userDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error executing {ActionName} for User ID: {UserId}", nameof(GetUser), id);
                // Return a generic error message
                return StatusCode(StatusCodes.Status500InternalServerError, "An internal server error occurred while retrieving the user.");
            }
        }

        // --- Placeholder for future actions ---

        // Example: Get current user's profile (using claims from token)
        // [HttpGet("me")]
        // [Authorize] // Any authenticated user
        // public async Task<ActionResult<UserDto>> GetMe()
        // {
        //     // var userId = User.FindFirstValue(ClaimTypes.NameIdentifier); // Get ID from token
        //     // if (string.IsNullOrEmpty(userId)) return Unauthorized();
        //     // return await GetUser(int.Parse(userId));
        // }

        // Example: Update user (requires specific DTO and service method)
        // [HttpPut("{id:int}")]
        // [Authorize(Roles = "Admin")] // Or maybe user can update themselves?
        // public async Task<IActionResult> UpdateUser(int id, [FromBody] UpdateUserDto updateUserDto)
        // {
        //     // Call a corresponding _userService.UpdateUserAsync(id, updateUserDto); method
        // }

        // Example: Deactivate user (requires service method)
        // [HttpDelete("{id:int}")]
        // [Authorize(Roles = "Admin")]
        // public async Task<IActionResult> DeactivateUser(int id)
        // {
        //      // Call a corresponding _userService.DeactivateUserAsync(id); method
        // }

        [HttpPost] // Add User
        [ProducesResponseType(StatusCodes.Status201Created, Type = typeof(VmUser))]
        // ... other responses
        public async Task<ActionResult<VmUser>> AddUser([FromBody] VmCreateUser createUserDto)
        {
            var (userDto, errorMessage) = await _userService.AddUserAsync(createUserDto);
            if (userDto == null) return BadRequest(new { message = errorMessage });
            // Return 201, maybe point to GetUserDetails?
            return CreatedAtAction(nameof(GetUserDetails), new { id = userDto.UserId }, userDto);
        }

        [HttpPost("admin-reset-password")] // Admin Reset Password
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        // ... other responses
        public async Task<IActionResult> AdminResetPassword([FromBody] VmAdminResetPassword resetDto)
        {
            var (success, errorMessage) = await _userService.AdminResetPasswordAsync(resetDto);
            if (!success) return BadRequest(new { message = errorMessage }); // Or NotFound
            return NoContent();
        }

        /// <summary>
        /// Gets a paginated, filtered, and sorted list of users. (Admin only)
        /// </summary>
        // GET: api/users/paginated?PageNumber=1&PageSize=10&Username=test&SortOrder=email_desc
        [HttpGet("paginated")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(VmPaginatedUserList))]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<ActionResult<VmPaginatedUserList>> GetUsersPaginated([FromQuery] UserQueryParameters queryParameters)
        {
            _logger.LogInformation("Executing {ActionName}", nameof(GetUsersPaginated));
            // TODO: Add try/catch
            var result = await _userService.GetUsersPaginatedAsync(queryParameters);
            return Ok(result);
        }

        /// <summary>
        /// Gets detailed information for a specific user, including schools. (Admin only)
        /// </summary>
        // GET: api/users/5/details
        [HttpGet("{id:int}/details")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(VmUserDetail))]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<VmUserDetail>> GetUserDetails(int id)
        {
            //_logger.LogInformation("Executing {ActionName} for User ID: {UserId}", nameof(GetUserDetails), id);
            //// TODO: Add try/catch
            //var userDto = await _userService.GetUserDetailByIdAsync(id);
            //if (userDto == null) return NotFound($"User with ID {id} not found.");
            //return Ok(userDto);

            _logger.LogInformation("Executing {ActionName} for User ID: {UserId}", nameof(GetUserDetails), id);
            var userDto = await _userService.GetUserDetailByIdAsync(id);
            if (userDto == null)
            {
                _logger.LogWarning("User details not found for User ID: {UserId}", id);
                return NotFound($"User with ID {id} not found.");
            }
            return Ok(userDto);
        }

        /// <summary>
        /// Updates a user's role, status, default school, and school assignments. (Admin only)
        /// </summary>
        // PUT: api/users/5
        [HttpPut("{id:int}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)] // Validation errors
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)] // User not found
        public async Task<IActionResult> UpdateUser(int id, [FromBody] VmUpdateUser updateUserDto)
        {
            //_logger.LogInformation("Executing {ActionName} for User ID: {UserId}", nameof(UpdateUser), id);
            //if (!ModelState.IsValid) return BadRequest(ModelState); // Basic DTO validation

            //// TODO: Add try/catch
            //var (success, errorMessage) = await _userService.UpdateUserAsync(id, updateUserDto);

            //if (!success)
            //{
            //    // Determine if it was not found or another validation error
            //    if (errorMessage.Contains("not found")) return NotFound(new { message = errorMessage });
            //    else return BadRequest(new { message = errorMessage });
            //}
            //return NoContent(); // Success

            _logger.LogInformation("Executing {ActionName} for User ID: {UserId}", nameof(UpdateUser), id);
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var (success, errorMessage) = await _userService.UpdateUserAsync(id, updateUserDto);

            if (!success)
            {
                // Log the specific error message from the service
                _logger.LogWarning("UpdateUser failed for User ID {UserId}: {ErrorMessage}", id, errorMessage);
                if (errorMessage.Contains("not found")) return NotFound(new { message = errorMessage });
                // Other errors are likely bad requests (validation failed in service)
                return BadRequest(new { message = errorMessage });
            }
            return NoContent(); // Success
        }

    }
}
