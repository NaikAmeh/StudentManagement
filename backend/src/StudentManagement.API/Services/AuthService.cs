using AutoMapper;
using Microsoft.AspNetCore.Identity.Data;
using StudentManagement.API.Controllers;
using StudentManagement.Application.Features.Users.ViewModels;
using StudentManagement.Application.Interfaces.Identity;
using StudentManagement.Application.Interfaces;
using StudentManagement.Domain.Entities;
using System.Linq.Expressions;
using StudentManagement.Application.Interfaces.Uitility;
using StudentManagement.Application.Services;

namespace StudentManagement.API.Services
{
    public class AuthService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IPasswordHasher _passwordHasher;
        //private readonly ITokenService _tokenService;
        private readonly ILogger<AuthService> _logger;
        // Inject IMapper directly for mapping User entity in Login response
        private readonly IMapper _mapper;
        private readonly IPasswordGenerator _passwordGenerator;

        public AuthService(
          IUnitOfWork unitOfWork,
          IMapper mapper,
          IPasswordHasher passwordHasher,
          ILogger<AuthService> logger,
          IPasswordGenerator passwordGenerator)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _passwordHasher = passwordHasher;
            _logger = logger;
            _passwordGenerator = passwordGenerator;
        }

        //public async Task<VmLoginResponse> LoginAsync(VmLoginRequest loginDetails)
        //{
        //    VmLoginResponse loginResponse = new VmLoginResponse();

        //    // --- User lookup logic moved to controller ---
        //    // Define the predicate using the input DTO
        //    Expression<Func<User, bool>> predicate = u =>
        //        u.Username == loginDetails.UsernameOrEmail || u.Email == loginDetails.UsernameOrEmail;

        //    // Use generic repository via UnitOfWork with the predicate
        //    var user = await _unitOfWork.Repository<User>().FirstOrDefaultAsync(predicate);
        //    // --- End User lookup logic ---


        //    if (user == null || !user.IsActive)
        //    {
        //        _logger.LogWarning("Login failed for {UsernameOrEmail}: User not found or inactive.", loginDetails.UsernameOrEmail);
        //        // Return Unauthorized for security
        //        return new VmLoginResponse { Success = false, Message = "Invalid username/email or password." };
        //    }


        //    // Verify password (PasswordHasher is still injected)
        //    bool isPasswordValid = _passwordHasher.VerifyPassword(loginDetails.Password, user.PasswordHash, user.PasswordSalt);

        //    if (!isPasswordValid)
        //    {
        //        _logger.LogWarning("Login failed for {Username}: Invalid password.", user.Username);
        //        return new VmLoginResponse { Success = false, Message = "Invalid username/email or password." });
        //    }

        //    // Generate JWT token (TokenService is still injected)
        //    var token = _tokenService.GenerateToken(user);

        //    _logger.LogInformation("User logged in successfully: {Username}", user.Username);

        //    // Map the User ENTITY to UserDto for the response (Mapper is injected)
        //    var userDto = _mapper.Map<VmUser>(user);
        //}
    }
}
