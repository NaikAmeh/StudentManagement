using AutoMapper;
using Microsoft.Extensions.Logging;
using StudentManagement.Application.Features.Schools.ViewModels;
using StudentManagement.Application.Interfaces;
using StudentManagement.Application.Interfaces.Services;
using StudentManagement.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace StudentManagement.Application.Services
{
    public class SchoolService : ISchoolService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly ILogger<SchoolService> _logger;

        public SchoolService(
            IUnitOfWork unitOfWork,
            IMapper mapper,
            ILogger<SchoolService> logger)
        {
            _unitOfWork = unitOfWork ?? throw new ArgumentNullException(nameof(unitOfWork));
            _mapper = mapper ?? throw new ArgumentNullException(nameof(mapper));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        /// <inheritdoc />
        public async Task<VmSchool?> GetByIdAsync(int id)
        {
            _logger.LogDebug("Attempting to retrieve school with ID: {SchoolId}", id);
            // Use generic repository via UoW
            var school = await _unitOfWork.Repository<School>().GetByIdAsync(id);
            if (school == null)
            {
                _logger.LogWarning("School not found for ID: {SchoolId}", id);
                return null;
            }
            _logger.LogDebug("School retrieved successfully for ID: {SchoolId}", id);
            // Map to DTO
            return _mapper.Map<VmSchool>(school);
        }

        /// <inheritdoc />
        public async Task<IReadOnlyList<VmSchool>> GetAllAsync()
        {
            _logger.LogInformation("Retrieving all schools.");
            // Use generic repository via UoW
            var schools = await _unitOfWork.Repository<School>().GetAllAsync();
            _logger.LogInformation("Retrieved {SchoolCount} schools.", schools.Count);
            // Map to DTOs
            return _mapper.Map<IReadOnlyList<VmSchool>>(schools);
        }

        /// <inheritdoc />
        public async Task<VmSchool> AddAsync(VmCreateSchool createDto)
        {
            _logger.LogInformation("Attempting to add school with Name: {SchoolName}", createDto.Name);
            // Add validation here if needed (e.g., check for duplicate name) before mapping/saving
            // var existing = await _unitOfWork.Repository<School>().FirstOrDefaultAsync(s => s.Name == createDto.Name);
            // if (existing != null) { ... handle duplicate ... }

            var schoolEntity = _mapper.Map<School>(createDto);
            try
            {
                // Use generic repository via UoW
                await _unitOfWork.Repository<School>().AddAsync(schoolEntity);
                await _unitOfWork.CompleteAsync(); // Save changes via UoW

                _logger.LogInformation("School added successfully with ID: {SchoolId}, Name: {SchoolName}", schoolEntity.SchoolId, schoolEntity.Name);
                return _mapper.Map<VmSchool>(schoolEntity); // Map back to DTO for return
            }
            catch (Exception ex)
            {
                // Log detailed error including potential DB constraints
                _logger.LogError(ex, "Error adding school with Name: {SchoolName}", createDto.Name);
                // Re-throw or wrap in a custom application exception if needed
                throw;
            }
        }

        /// <inheritdoc />
        public async Task<bool> UpdateAsync(int id, VmUpdateSchool updateDto)
        {
            _logger.LogInformation("Attempting to update school with ID: {SchoolId}", id);
            // Use generic repository via UoW
            var schoolEntity = await _unitOfWork.Repository<School>().GetByIdAsync(id);
            if (schoolEntity == null)
            {
                _logger.LogWarning("Update failed: School not found for ID: {SchoolId}", id);
                return false; // Not found
            }

            // Map updated fields from DTO onto the existing tracked entity
            _mapper.Map(updateDto, schoolEntity);

            // EF Core tracks changes, explicit Update call marks the entire entity as modified
            _unitOfWork.Repository<School>().Update(schoolEntity);

            try
            {
                var result = await _unitOfWork.CompleteAsync(); // Save changes via UoW
                if (result > 0)
                {
                    _logger.LogInformation("School updated successfully: ID {SchoolId}", id);
                    return true;
                }
                else
                {
                    // This can happen if the data submitted was identical to the existing data
                    _logger.LogWarning("Update operation completed for School ID {SchoolId}, but no database rows were affected (data might be unchanged).", id);
                    return false; // Or return true if no change is still considered a success
                }
            }
            //catch (DbUpdateConcurrencyException ex) // Handle potential concurrency issues
            //{
            //    _logger.LogError(ex, "Concurrency error updating school with ID: {SchoolId}. The record may have been modified or deleted by another user.", id);
            //    // Re-throw or handle concurrency conflict appropriately
            //    throw;
            //}
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating school with ID: {SchoolId}", id);
                throw; // Re-throw or wrap
            }
        }

        /// <inheritdoc />
        public async Task<bool> DeleteAsync(int id)
        {
            _logger.LogInformation("Attempting to delete school with ID: {SchoolId}", id);
            // Use generic repository via UoW
            var schoolEntity = await _unitOfWork.Repository<School>().GetByIdAsync(id);
            if (schoolEntity == null)
            {
                _logger.LogWarning("Delete failed: School not found for ID: {SchoolId}", id);
                return false;
            }

            try
            {
                // --- Business Rule Check: Prevent deletion if students exist ---
                // Use generic repository with a predicate for the check
                var hasStudents = await _unitOfWork.Repository<Student>().AnyAsync(s => s.SchoolId == id);
                if (hasStudents)
                {
                    string errorMessage = $"Cannot delete school ID {id} as it has associated students.";
                    _logger.LogWarning("Delete failed: {ErrorMessage}", errorMessage);
                    // Throw specific exception to be caught by controller/middleware
                    throw new InvalidOperationException(errorMessage);
                }
                // --- End Business Rule Check ---

                // Use generic repository via UoW
                _unitOfWork.Repository<School>().Delete(schoolEntity);
                var result = await _unitOfWork.CompleteAsync(); // Save changes via UoW

                if (result > 0)
                {
                    _logger.LogInformation("School deleted successfully: ID {SchoolId}", id);
                    return true;
                }
                else
                {
                    // This case is less likely for delete unless there's a concurrency issue
                    _logger.LogWarning("Delete operation completed for School ID {SchoolId}, but no database rows were affected.", id);
                    return false;
                }
            }
            catch (InvalidOperationException) // Catch specific business rule violation
            {
                throw; // Re-throw for controller to handle (e.g., return 400 Bad Request)
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting school with ID: {SchoolId}", id);
                throw; // Re-throw or wrap
            }
        }

        /// <inheritdoc />
        public async Task<int> CountAsync()
        {
            _logger.LogDebug("Counting schools.");
            // Use generic repository via UoW
            return await _unitOfWork.Repository<School>().CountAsync();
        }

        /// <inheritdoc />
        public async Task AssignUserToSchoolAsync(int userId, int schoolId)
        {
            _logger.LogInformation("Attempting to assign User {UserId} to School {SchoolId}", userId, schoolId);
            // Use generic repository for the JOIN ENTITY (UserSchoolLink)
            var linkExists = await _unitOfWork.Repository<UserSchoolLink>()
                                     .AnyAsync(ul => ul.UserId == userId && ul.SchoolId == schoolId);

            if (!linkExists)
            {
                // Check if user and school exist before creating link
                var userExists = await _unitOfWork.Repository<User>().AnyAsync(u => u.UserId == userId);
                var schoolExists = await _unitOfWork.Repository<School>().AnyAsync(s => s.SchoolId == schoolId);

                if (!userExists || !schoolExists)
                {
                    string errorMessage = $"AssignUserToSchool failed: User {userId} or School {schoolId} not found.";
                    _logger.LogWarning(errorMessage);
                    // Throw exception for controller to handle (e.g., return 400/404)
                    throw new ArgumentException(errorMessage);
                }

                var newLink = new UserSchoolLink { UserId = userId, SchoolId = schoolId };
                try
                {
                    await _unitOfWork.Repository<UserSchoolLink>().AddAsync(newLink);
                    await _unitOfWork.CompleteAsync(); // Save via UoW
                    _logger.LogInformation("Successfully assigned User {UserId} to School {SchoolId}.", userId, schoolId);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error assigning User {UserId} to School {SchoolId}.", userId, schoolId);
                    throw; // Re-throw or wrap
                }
            }
            else
            {
                _logger.LogInformation("User {UserId} is already assigned to School {SchoolId}. No action taken.", userId, schoolId);
            }
        }

        /// <inheritdoc />
        public async Task RemoveUserFromSchoolAsync(int userId, int schoolId)
        {
            _logger.LogInformation("Attempting to remove User {UserId} from School {SchoolId}", userId, schoolId);
            // Use generic repository for the JOIN ENTITY
            var link = await _unitOfWork.Repository<UserSchoolLink>()
                                    .FirstOrDefaultAsync(ul => ul.UserId == userId && ul.SchoolId == schoolId);
            if (link != null)
            {
                try
                {
                    _unitOfWork.Repository<UserSchoolLink>().Delete(link);
                    await _unitOfWork.CompleteAsync(); // Save via UoW
                    _logger.LogInformation("Successfully removed User {UserId} from School {SchoolId}.", userId, schoolId);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error removing User {UserId} from School {SchoolId}.", userId, schoolId);
                    throw; // Re-throw or wrap
                }
            }
            else
            {
                _logger.LogInformation("Link between User {UserId} and School {SchoolId} not found for removal. No action taken.", userId, schoolId);
            }
        }

        /// <inheritdoc />
        public async Task<bool> IsUserAssignedToSchoolAsync(int userId, int schoolId)
        {
            _logger.LogDebug("Checking if User {UserId} is assigned to School {SchoolId}", userId, schoolId);
            // Use generic repository for the JOIN ENTITY
            return await _unitOfWork.Repository<UserSchoolLink>()
                                 .AnyAsync(ul => ul.UserId == userId && ul.SchoolId == schoolId);
        }
    }
}
