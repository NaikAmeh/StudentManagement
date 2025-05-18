using AutoMapper;
using StudentManagement.Application.Interfaces.Identity;
using StudentManagement.Application.Interfaces.Services;
using StudentManagement.Application.Interfaces;
using StudentManagement.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using StudentManagement.Application.Features.Users.ViewModels;
using System.Linq.Expressions;
using Microsoft.Extensions.Logging;
using StudentManagement.Application.Interfaces.Uitility;
using StudentManagement.Application.Common.Models;
using Microsoft.EntityFrameworkCore;
using StudentManagement.Application.Interfaces.Factories;
using static StudentManagement.Domain.StudentEnum;

namespace StudentManagement.Application.Services
{
    public class UserService : IUserService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly IPasswordHasher _passwordHasher;
        private readonly ILogger<UserService> _logger;
        private readonly IPasswordGenerator _passwordGenerator;
        private readonly IGenericObjectFactory _objectFactory;
        private readonly ITokenService _tokenService;

        public UserService(
            IUnitOfWork unitOfWork,
            IMapper mapper,
            IPasswordHasher passwordHasher,
            ILogger<UserService> logger,
            IPasswordGenerator passwordGenerator,
            IGenericObjectFactory objectFactory,
            ITokenService tokenService)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _passwordHasher = passwordHasher;
            _logger = logger;
            _passwordGenerator = passwordGenerator;
            _objectFactory = objectFactory;
            _tokenService = tokenService;
        }

        // RegisterUserAsync remains the same
        public async Task<(VmUser? User, string ErrorMessage)> RegisterUserAsync(VmRegisterUser registerDto)
        {
            // ... (implementation using predicates as before) ...
            Expression<Func<User, bool>> usernamePredicate = u => u.Username == registerDto.Username;
            var existingUserByUsername = await _unitOfWork.Repository<User>().FirstOrDefaultAsync(usernamePredicate);
            if (existingUserByUsername != null) { return (null, $"Username '{registerDto.Username}' is already taken."); }

            Expression<Func<User, bool>> emailPredicate = u => u.Email == registerDto.Email;
            var existingUserByEmail = await _unitOfWork.Repository<User>().FirstOrDefaultAsync(emailPredicate);
            if (existingUserByEmail != null) { return (null, $"Email '{registerDto.Email}' is already registered."); }

            var userEntity = _mapper.Map<User>(registerDto);
            //var (hash, salt) = _passwordHasher.HashPassword(registerDto.Password);
            string passwordSalt = _passwordHasher.GenerateSalt();
            string passwordHash = _passwordHasher.GenerateSaltedHash(registerDto.Password, passwordSalt);
            //bool isvladi = _passwordHasher.VerifyPassword(registerDto.Password, hash, salt);
            //userEntity.PasswordHash = passwordHash;
            //userEntity.PasswordSalt = passwordSalt;
            //userEntity.IsActive = true;

            await _unitOfWork.ExecuteInTransactionAsync(async () =>
            {
                User user = _objectFactory.GetFactory<IUserFactory>().CreateUser(registerDto.Username, registerDto.Email, passwordHash, passwordSalt, registerDto.Role, true, false);

                await _unitOfWork.Repository<User>().AddAsync(user);
                await _unitOfWork.CompleteAsync();

                //throw new Exception("Simulated error for testing transaction rollback."); // Simulate an error to test rollback
            });




            try
            {
                //await _unitOfWork.CompleteAsync();
                _logger.LogInformation("User registered successfully: {Username}", userEntity.Username);
                return (_mapper.Map<VmUser>(userEntity), string.Empty);
            }
            catch (Exception ex) { _logger.LogError(ex, "Error registering user {Username}", registerDto.Username); return (null, "An internal error occurred during registration."); }

        }

        public bool ValidatePassword(string password, string PasswordSalt, string passwordHash)
        {
            string generatedPasswordhash = _passwordHasher.GenerateSaltedHash(password, PasswordSalt);
            return generatedPasswordhash == passwordHash;
        }

        public async Task<VmUser?> GetUserByIdAsync(int id)
        {
            var user = await _unitOfWork.Repository<User>().GetByIdAsync(id);
            return _mapper.Map<VmUser>(user);
        }

        public async Task<IEnumerable<VmUser>> GetAllUsersAsync()
        {
            var users = await _unitOfWork.Repository<User>().GetAllAsync();
            return _mapper.Map<IEnumerable<VmUser>>(users);
        }

        // --- Re-implement GetUserByEmailAsync ---
        public async Task<VmUser?> GetUserByEmailAsync(string email)
        {
            // Define predicate
            Expression<Func<User, bool>> predicate = u => u.Email == email;
            // Fetch entity using generic repo + predicate
            var user = await _unitOfWork.Repository<User>().FirstOrDefaultAsync(predicate);
            // Map to DTO within the service
            return _mapper.Map<VmUser>(user);
        }
        public async Task<VmUser?> GetUserByUsernameAsync(string username)
        {
            // Define predicate
            Expression<Func<User, bool>> predicate = u => u.Username == username;
            // Fetch entity using generic repo + predicate
            var user = await _unitOfWork.Repository<User>().FirstOrDefaultAsync(predicate);
            // Map to DTO within the service
            return _mapper.Map<VmUser>(user);
        }

        public async Task<(VmUser? User, string ErrorMessage)> AddUserAsync(VmCreateUser createUserDto)
        {
            _logger.LogInformation("Attempting to add user: {Username}, Email: {Email}, Role: {Role}",
                createUserDto.Username, createUserDto.Email, createUserDto.Role);

            // Validation
            if (await _unitOfWork.Repository<User>().AnyAsync(u => u.Username == createUserDto.Username))
                return (null, $"Username '{createUserDto.Username}' is already taken.");
            if (await _unitOfWork.Repository<User>().AnyAsync(u => u.Email == createUserDto.Email))
                return (null, $"Email '{createUserDto.Email}' is already registered.");
            // TODO: Validate Role is acceptable

            var userEntity = _mapper.Map<User>(createUserDto);
            //userEntity.IsActive = true; // Default to active
            //userEntity.IsPasswordChangeRequired = true; // Force change on first login

            // Generate a temporary secure password - DO NOT RETURN OR LOG THIS
            string tempPassword = _passwordGenerator.GenerateRandomPassword();
            //var (hash, salt) = _passwordHasher.HashPassword(tempPassword);
            //userEntity.PasswordHash = hash;
            //userEntity.PasswordSalt = salt;
            string passwordSalt = _passwordHasher.GenerateSalt();
            string passwordHash = _passwordHasher.GenerateSaltedHash(tempPassword, passwordSalt);


            User user = _objectFactory.GetFactory<IUserFactory>().CreateUser(createUserDto.Username, createUserDto.Email, passwordHash, passwordSalt, createUserDto.Role, true, true);
            //User user = Locator.GetFactory<UserFactory>().cre
            // Clear temp password immediately
            tempPassword = string.Empty;

            try
            {
                await _unitOfWork.Repository<User>().AddAsync(userEntity);
                await _unitOfWork.CompleteAsync();
                _logger.LogInformation("User added successfully: {Username} (ID: {UserId}). Password reset required.", userEntity.Username, userEntity.UserId);
                // How does user get initial password? Out of scope here. Assume admin tells them or separate email flow.
                return (_mapper.Map<VmUser>(userEntity), string.Empty);
            }
            catch (Exception ex) { /* ... Log and return error ... */ }
            return (null, "Failed"); // Fallback
        }

        // --- Get Paginated Users ---
        public async Task<VmPaginatedUserList> GetUsersPaginatedAsync(UserQueryParameters queryParameters)
        {
            // ... (Implementation using GetQueryable, Where, OrderBy, Skip, Take as shown previously) ...
            _logger.LogInformation("Retrieving paginated users with parameters: {@QueryParameters}", queryParameters);
            var query = _unitOfWork.Repository<User>().GetQueryable();

            // --- Filtering ---
            if (!string.IsNullOrWhiteSpace(queryParameters.Username))
                query = query.Where(u => u.Username.ToLower().Contains(queryParameters.Username.ToLower()));
            if (!string.IsNullOrWhiteSpace(queryParameters.Email))
                query = query.Where(u => u.Email.ToLower().Contains(queryParameters.Email.ToLower()));
            if (queryParameters.Role != null)
                query = query.Where(u => u.Role == queryParameters.Role);
            if (queryParameters.IsActive.HasValue)
                query = query.Where(u => u.IsActive == queryParameters.IsActive.Value);

            // --- Sorting ---
            if (string.IsNullOrWhiteSpace(queryParameters.SortOrder))
            {
                query = query.OrderBy(u => u.Username); // Default sort
            }
            else
            {
                var sortParts = queryParameters.SortOrder.ToLowerInvariant().Split('_');
                var sortField = sortParts[0];
                var isDescending = sortParts.Length > 1 && sortParts[1] == "desc";

                // Using switch expression for cleaner sorting logic
                query = (sortField, isDescending) switch
                {
                    ("email", false) => query.OrderBy(u => u.Email),
                    ("email", true) => query.OrderByDescending(u => u.Email),
                    ("role", false) => query.OrderBy(u => u.Role),
                    ("role", true) => query.OrderByDescending(u => u.Role),
                    ("createdat", false) => query.OrderBy(u => u.CreatedAt),
                    ("createdat", true) => query.OrderByDescending(u => u.CreatedAt),
                    ("isactive", false) => query.OrderBy(u => u.IsActive), // Sort by bool
                    ("isactive", true) => query.OrderByDescending(u => u.IsActive),
                    // Default to username if field is unknown or "username"
                    _ => isDescending ? query.OrderByDescending(u => u.Username) : query.OrderBy(u => u.Username)
                };
            }

            // --- Pagination ---
            var totalCount = await query.CountAsync(); // Get total count *after* filtering
            var totalPages = (int)Math.Ceiling(totalCount / (double)queryParameters.PageSize);

            if (queryParameters.PageNumber > totalPages && totalPages > 0) // Adjust page number if out of bounds
            {
                queryParameters.PageNumber = totalPages;
            }
            else if (queryParameters.PageNumber < 1)
            {
                queryParameters.PageNumber = 1;
            }


            var users = await query
                .Skip((queryParameters.PageNumber - 1) * queryParameters.PageSize)
                .Take(queryParameters.PageSize)
                .ToListAsync(); // Execute query to get the current page's data

            var userDtos = _mapper.Map<List<VmUserList>>(users);

            _logger.LogInformation("Retrieved {UserCount} users for page {CurrentPage}/{TotalPages}. Total users: {TotalCount}",
                userDtos.Count, queryParameters.PageNumber, totalPages, totalCount);

            // --- Correctly Populate and Return PaginatedUserListDto ---
            return new VmPaginatedUserList
            {
                Users = userDtos,
                CurrentPage = queryParameters.PageNumber,
                PageSize = queryParameters.PageSize,
                TotalCount = totalCount,
                TotalPages = totalPages
            };
        }

        // --- Get User Details ---
        public async Task<VmUserDetail?> GetUserDetailByIdAsync(int id)
        {
            //// ... (Implementation including SchoolLinks.Select(sl=>sl.School) and DefaultSchool as shown previously) ...
            //var user = await _unitOfWork.Repository<User>().FindAsync( /* include links/schools */ );
            //if (!user.Any()) return null;
            //return _mapper.Map<VmUserDetail>(user.First());

            _logger.LogDebug("Attempting to retrieve user details with ID: {UserId}", id);
            var user = await _unitOfWork.Repository<User>()
                .GetQueryable() // Start with IQueryable
                .Include(u => u.SchoolLinks)
                    .ThenInclude(sl => sl.School) // Include School data for each link
                .Include(u => u.DefaultSchool)   // Include the DefaultSchool navigation property
                .AsNoTracking() // Read-only operation
                .FirstOrDefaultAsync(u => u.UserId == id);

            if (user == null)
            {
                _logger.LogWarning("User details not found for ID: {UserId}", id);
                return null;
            }
            _logger.LogDebug("User details retrieved successfully for ID: {UserId}", id);
            return _mapper.Map<VmUserDetail>(user);
        }

        // --- Update User (Role, Status, Schools, Default School) ---
        //public async Task<(bool Success, string ErrorMessage)> UpdateUserAsync(int userId, VmUpdateUser updateUserDto)
        //{
        //    // ... (Implementation: fetch user with links, validate default school, update properties, manage SchoolLinks add/remove, save) ...
        //    _logger.LogInformation("Attempting to update user {UserId}", userId);
        //    var user = await _unitOfWork.Repository<User>().FirstOrDefaultAsync(u => u.UserId == userId, includes: new List<Expression<Func<User, object>>> { u => u.SchoolLinks });
        //    if (user == null) return (false, "User not found.");

        //    // Validation: Default school must be assigned
        //    if (updateUserDto.DefaultSchoolId.HasValue && !updateUserDto.AssignedSchoolIds.Contains(updateUserDto.DefaultSchoolId.Value))
        //    {
        //        return (false, "Default school must be one of the assigned schools.");
        //    }
        //    // Optional: Check if default school ID exists
        //    // ...

        //    _mapper.Map(updateUserDto, user); // Maps Role, IsActive, DefaultSchoolId

        //    // Update School Links logic (compare current, desired; add/remove UserSchoolLink entities) ...
        //    var currentSchoolIds = user.SchoolLinks.Select(sl => sl.SchoolId).ToHashSet();
        //    var desiredSchoolIds = updateUserDto.AssignedSchoolIds.ToHashSet();
        //    var schoolsToAdd = desiredSchoolIds.Except(currentSchoolIds).ToList();
        //    var linksToRemove = user.SchoolLinks.Where(sl => !desiredSchoolIds.Contains(sl.SchoolId)).ToList();
        //    if (linksToRemove.Any()) _unitOfWork.Repository<UserSchoolLink>().DeleteRange(linksToRemove);
        //    if (schoolsToAdd.Any()) { foreach (var schoolIdToAdd in schoolsToAdd) await _unitOfWork.Repository<UserSchoolLink>().AddAsync(new UserSchoolLink { UserId = userId, SchoolId = schoolIdToAdd }); }
        //    // ...

        //    _unitOfWork.Repository<User>().Update(user); // Mark user as updated
        //    try { await _unitOfWork.CompleteAsync(); return (true, string.Empty); }
        //    catch (Exception ex) { /* Log and return error */ return (false, "DB Error"); }
        //}

        public async Task<(bool Success, string ErrorMessage)> UpdateUserAsync(int userId, VmUpdateUser updateUserDto)
        {
            _logger.LogInformation("Attempting to update user {UserId} with core info and school assignments.", userId);
            var user = await _unitOfWork.Repository<User>()
                                   .GetQueryable()
                                   .Include(u => u.SchoolLinks) // Include current school links for comparison
                                   .FirstOrDefaultAsync(u => u.UserId == userId);

            if (user == null)
            {
                _logger.LogWarning("Update failed: User {UserId} not found.", userId);
                return (false, "User not found.");
            }

            // --- Validation: DefaultSchoolId must be in the new AssignedSchoolIds list ---
            if (updateUserDto.DefaultSchoolId.HasValue &&
                !updateUserDto.AssignedSchoolIds.Contains(updateUserDto.DefaultSchoolId.Value))
            {
                string msg = "Default school must be one of the schools the user will be assigned to.";
                _logger.LogWarning("Update validation failed for User {UserId}: {ErrorMessage}", userId, msg);
                return (false, msg);
            }
            // Optional: Further validate if all AssignedSchoolIds and DefaultSchoolId actually exist in the Schools table.
            // FK constraints will catch this, but explicit checks provide better error messages.
            if (updateUserDto.DefaultSchoolId.HasValue)
            {
                if (!await _unitOfWork.Repository<School>().AnyAsync(s => s.SchoolId == updateUserDto.DefaultSchoolId.Value))
                    return (false, $"Specified default school ID {updateUserDto.DefaultSchoolId.Value} does not exist.");
            }
            foreach (var schoolId in updateUserDto.AssignedSchoolIds)
            {
                if (!await _unitOfWork.Repository<School>().AnyAsync(s => s.SchoolId == schoolId))
                    return (false, $"Specified assigned school ID {schoolId} does not exist.");
            }
            // --- End Validation ---

            // Map Role, IsActive, DefaultSchoolId from DTO to User entity
            //user.Role = updateUserDto.Role;
            //user.IsActive = updateUserDto.IsActive;
            //user.DefaultSchoolId = updateUserDto.DefaultSchoolId;

            // --- Synchronize School Links ---
            var currentSchoolIds = user.SchoolLinks.Select(sl => sl.SchoolId).ToHashSet();
            var desiredSchoolIds = updateUserDto.AssignedSchoolIds.ToHashSet();

            // Links to remove: current links not in desired list
            var linksToRemove = user.SchoolLinks.Where(sl => !desiredSchoolIds.Contains(sl.SchoolId)).ToList();
            if (linksToRemove.Any())
            {
                _logger.LogInformation("Removing {Count} school links for user {UserId}: {SchoolIds}",
                    linksToRemove.Count, userId, string.Join(",", linksToRemove.Select(l => l.SchoolId)));
                _unitOfWork.Repository<UserSchoolLink>().DeleteRange(linksToRemove);
            }

            // Links to add: desired IDs not in current list
            var schoolIdsToAdd = desiredSchoolIds.Where(id => !currentSchoolIds.Contains(id)).ToList();
            if (schoolIdsToAdd.Any())
            {
                _logger.LogInformation("Adding {Count} school links for user {UserId}: {SchoolIds}",
                    schoolIdsToAdd.Count, userId, string.Join(",", schoolIdsToAdd));
                foreach (var schoolIdToAdd in schoolIdsToAdd)
                {
                    await _unitOfWork.Repository<UserSchoolLink>().AddAsync(new UserSchoolLink { UserId = userId, SchoolId = schoolIdToAdd });
                }
            }
            // --- End Synchronize School Links ---

            _unitOfWork.Repository<User>().Update(user); // Mark user entity as modified

            try
            {
                await _unitOfWork.CompleteAsync();
                _logger.LogInformation("User {UserId} updated successfully (core info and school assignments).", userId);
                return (true, string.Empty);
            }
            catch (DbUpdateException dbEx)
            {
                _logger.LogError(dbEx, "Database error updating user {UserId}", userId);
                return (false, "A database error occurred while updating the user.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating user {UserId}", userId);
                return (false, "An internal error occurred.");
            }
        }


        // --- Admin Reset Password ---
        public async Task<(bool Success, string ErrorMessage)> AdminResetPasswordAsync(VmAdminResetPassword resetPasswordDto)
        {
            _logger.LogInformation("Attempting admin password reset for user {UserId}", resetPasswordDto.UserId);
            var user = await _unitOfWork.Repository<User>().GetByIdAsync(resetPasswordDto.UserId);
            if (user == null) return (false, "User not found.");

            string tempPassword = _passwordGenerator.GenerateRandomPassword();
            //var (hash, salt) = _passwordHasher.HashPassword(tempPassword);
            //user.PasswordHash = hash;
            //user.PasswordSalt = salt;
            //user.IsPasswordChangeRequired = true; // Force change
            string passwordSalt = _passwordHasher.GenerateSalt();
            string passwordHash = _passwordHasher.GenerateSaltedHash(tempPassword, passwordSalt);


            // User user = _objectFactory.GetFactory<IUserFactory>().CreateUser(createUserDto.Username, createUserDto.Email, passwordHash, passwordSalt, createUserDto.Role, true, true);


            tempPassword = string.Empty; // Don't keep temp pw

            _unitOfWork.Repository<User>().Update(user);
            try { await _unitOfWork.CompleteAsync(); _logger.LogInformation("Admin password reset successful for user {UserId}.", resetPasswordDto.UserId); return (true, string.Empty); }
            catch (Exception ex) { /* Log and return error */ return (false, "DB Error"); }
        }

        // --- User Force Password Change ---
        public async Task<(bool Success, string ErrorMessage)> ForcePasswordChangeAsync(int userId, VmForcePasswordChange forceChangeDto)
        {
            _logger.LogInformation("Attempting forced password change for user {UserId}", userId);
            var user = await _unitOfWork.Repository<User>().GetByIdAsync(userId);

            // Should only be called if user is logged in and flag is set
            if (user == null) return (false, "User not found.");
            if (!user.IsPasswordChangeRequired) return (false, "Password change not required for this user.");

            // Validate new password complexity if needed
            // ...

            var (hash, salt) = _passwordHasher.HashPassword(forceChangeDto.NewPassword);
            //user.PasswordHash = hash;
            //user.PasswordSalt = salt;
            //user.IsPasswordChangeRequired = false; // Clear the flag

            _unitOfWork.Repository<User>().Update(user);
            try { await _unitOfWork.CompleteAsync(); _logger.LogInformation("Forced password change successful for user {UserId}.", userId); return (true, string.Empty); }
            catch (Exception ex) { /* Log and return error */ return (false, "DB Error"); }
        }

        public VmLoginResponse Login(VmLoginRequest loginDetails)
        {
            //VmLoginResponse loginResponse = ;
            // --- User lookup logic moved to controller ---
            // Define the predicate using the input DTO
            Expression<Func<User, bool>> predicate = u =>
                u.Username == loginDetails.UsernameOrEmail || u.Email == loginDetails.UsernameOrEmail;

            // Use generic repository via UnitOfWork with the predicate
            var user = _unitOfWork.Repository<User>().GetQueryable().FirstOrDefault(predicate);
            // --- End User lookup logic ---


            if (user == null || !user.IsActive)
            {
                _logger.LogWarning("Login failed for {UsernameOrEmail}: User not found or inactive.", loginDetails.UsernameOrEmail);
                // Return Unauthorized for security
                return new VmLoginResponse { Success = false, Message = "Invalid username/email or password." };
            }


            // Verify password (PasswordHasher is still injected)
            //bool isPasswordValid = _passwordHasher.VerifyPassword(loginDto.Password, user.PasswordHash, user.PasswordSalt);
            bool isPasswordValid = ValidatePassword(loginDetails.Password, user.PasswordSalt, user.PasswordHash);

            if (!isPasswordValid)
            {
                _logger.LogWarning("Login failed for {Username}: Invalid password.", user.Username);
                return new VmLoginResponse { Success = false, Message = "Invalid username/email or password." };
            }

            // Generate JWT token (TokenService is still injected)
            var token = _tokenService.GenerateToken(user);

            _logger.LogInformation("User logged in successfully: {Username}", user.Username);

            // Map the User ENTITY to UserDto for the response (Mapper is injected)
            VmUser vmUser = _mapper.Map<VmUser>(user);

            return new VmLoginResponse()
            {
                User = vmUser,
                Success = true,
                Message = "Login successful",
                Token = token
            };
        }
    }
}