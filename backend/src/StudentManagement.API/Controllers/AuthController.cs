using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using StudentManagement.Application.Features.Users.ViewModels;
using StudentManagement.Application.Interfaces.Services;
using StudentManagement.Application.Interfaces;
using StudentManagement.Domain.Entities;
using System.Linq.Expressions;
using StudentManagement.Application.Interfaces.Identity;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using StudentManagement.Application.Features.Schools.ViewModels;

namespace StudentManagement.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        // Inject IUserService for RegisterUserAsync
        private readonly IUserService _userService;
        // Inject IUnitOfWork directly for Login lookup
        private readonly IUnitOfWork _unitOfWork;
        private readonly IPasswordHasher _passwordHasher;
        private readonly ITokenService _tokenService;
        private readonly ILogger<AuthController> _logger;
        // Inject IMapper directly for mapping User entity in Login response
        private readonly IMapper _mapper;

        public AuthController(
            IUserService userService, // Keep for Register
            IUnitOfWork unitOfWork, // Inject UoW
            IPasswordHasher passwordHasher,
            ITokenService tokenService,
            ILogger<AuthController> logger,
            IMapper mapper) // Inject Mapper
        {
            _userService = userService; // For Register
            _unitOfWork = unitOfWork; // For Login lookup
            _passwordHasher = passwordHasher;
            _tokenService = tokenService;
            _logger = logger;
            _mapper = mapper; // For Login response mapping
        }

        // POST: api/auth/register
        [HttpPost("register")]
        // TODO: [Authorize(Roles = "Admin")]
        [ProducesResponseType(StatusCodes.Status201Created, Type = typeof(VmUser))]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<VmUser>> Register([FromBody] VmRegisterUser registerDto)
        {
            // Registration logic still nicely encapsulated in the service
            if (!ModelState.IsValid) return BadRequest(ModelState);
            var (newUser, errorMessage) = await _userService.RegisterUserAsync(registerDto);
            if (newUser == null)
            {
                // Handle errors...
                return BadRequest(new { message = errorMessage });
            }
            // Return DTO from service...
            return StatusCode(StatusCodes.Status201Created, newUser);
        }


        // POST: api/auth/login
        [HttpPost("login")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(VmLoginResponse))]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<ActionResult<VmLoginResponse>> Login( VmLoginRequest loginDto)  //[FromBody]
        {

            //// --- User lookup logic moved to controller ---
            //// Define the predicate using the input DTO
            //Expression<Func<User, bool>> predicate = u =>
            //    u.Username == loginDto.UsernameOrEmail || u.Email == loginDto.UsernameOrEmail;

            //// Use generic repository via UnitOfWork with the predicate
            //var user = await _unitOfWork.Repository<User>().FirstOrDefaultAsync(predicate);
            //// --- End User lookup logic ---


            //if (user == null || !user.IsActive)
            //{
            //    _logger.LogWarning("Login failed for {UsernameOrEmail}: User not found or inactive.", loginDto.UsernameOrEmail);
            //    // Return Unauthorized for security
            //    return Unauthorized(new VmLoginResponse { Success = false, Message = "Invalid username/email or password." });
            //}


            //// Verify password (PasswordHasher is still injected)
            ////bool isPasswordValid = _passwordHasher.VerifyPassword(loginDto.Password, user.PasswordHash, user.PasswordSalt);
            //bool isPasswordValid = _userService.ValidatePassword(loginDto.Password, user.PasswordSalt, user.PasswordHash);

            //if (!isPasswordValid)
            //{
            //    _logger.LogWarning("Login failed for {Username}: Invalid password.", user.Username);
            //    return Unauthorized(new VmLoginResponse { Success = false, Message = "Invalid username/email or password." });
            //}

            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            VmLoginResponse loginResponse = _userService.Login(loginDto);

            if(loginResponse.Success == false)
            {
                return Unauthorized(loginResponse);
            }

            //// Generate JWT token (TokenService is still injected)
            //var token = _tokenService.GenerateToken(user);

            //_logger.LogInformation("User logged in successfully: {Username}", user.Username);

            //// Map the User ENTITY to UserDto for the response (Mapper is injected)
            //var userDto = _mapper.Map<VmUser>(user);

            return Ok(loginResponse);
        }

        // --- Keep GET /api/users/me/schools ---
        // This likely stays in AuthController or UsersController, accessible by StandardUser
        // It needs to get the current user's ID from claims and fetch assigned schools.
        [HttpGet("me/schools")]
        [Authorize] // Any authenticated user can get their own schools
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(List<VmSchool>))]
        public async Task<ActionResult<List<VmSchool>>> GetMySchools()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
                return Unauthorized("User ID claim missing or invalid.");

            // Need a way to get schools for user ID - either via service or UoW
            // Let's assume a helper method or direct UoW access for simplicity here
            var schools = await _unitOfWork.Repository<UserSchoolLink>() // Requires IUnitOfWork injection
                .FindAsync(
                    predicate: ul => ul.UserId == userId,
                    includes: new List<Expression<Func<UserSchoolLink, object>>> { ul => ul.School }
                );
            var schoolDtos = _mapper.Map<List<VmSchool>>(schools.Select(s => s.School)); // Requires IMapper injection
            return Ok(schoolDtos);
        }

        [HttpPost("force-password-change")]
        [Authorize] // Must be logged in (even with temp password/flag set)
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)] // Validation errors or not required
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> ForcePasswordChange([FromBody] VmForcePasswordChange forceChangeDto)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
                return Unauthorized("Invalid user token.");

            _logger.LogInformation("Executing {ActionName} for User ID: {UserId}", nameof(ForcePasswordChange), userId);
            if (!ModelState.IsValid) return BadRequest(ModelState);

            // Call service method (passing user ID from claim)
            var (success, errorMessage) = await _userService.ForcePasswordChangeAsync(userId, forceChangeDto); // Inject IUserService here

            if (!success)
            {
                return BadRequest(new { message = errorMessage });
            }
            return NoContent(); // Success
        }
    }
}
