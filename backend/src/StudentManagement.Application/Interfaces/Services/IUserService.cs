using StudentManagement.Application.Common.Models;
using StudentManagement.Application.Features.Users.ViewModels;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace StudentManagement.Application.Interfaces.Services
{
    public interface IUserService
    {
        Task<VmUser?> GetUserByIdAsync(int id);
        Task<VmUser?> GetUserByUsernameAsync(string username);
        Task<VmUser?> GetUserByEmailAsync(string email);
        Task<IEnumerable<VmUser>> GetAllUsersAsync(); // Add filtering/pagination later

        // Result pattern might be better here to return detailed success/failure info
        Task<(VmUser? User, string ErrorMessage)> RegisterUserAsync(VmRegisterUser registerDto);

        Task<VmPaginatedUserList> GetUsersPaginatedAsync(UserQueryParameters queryParameters);
        Task<VmUserDetail?> GetUserDetailByIdAsync(int id);
        Task<(VmUser? User, string ErrorMessage)> AddUserAsync(VmCreateUser createUserDto); // Modified from Register
        Task<(bool Success, string ErrorMessage)> UpdateUserAsync(int userId, VmUpdateUser updateUserDto);
        Task<(bool Success, string ErrorMessage)> AdminResetPasswordAsync(VmAdminResetPassword resetPasswordDto);
        Task<(bool Success, string ErrorMessage)> ForcePasswordChangeAsync(int userId, VmForcePasswordChange forceChangeDto); // Needs userId from claims
        bool ValidatePassword(string password, string PasswordSalt, string passwordHash);
        VmLoginResponse Login(VmLoginRequest loginDetails);
    }
}
