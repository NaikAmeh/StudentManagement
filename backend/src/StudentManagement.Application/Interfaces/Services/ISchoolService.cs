using StudentManagement.Application.Features.Schools.ViewModels;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace StudentManagement.Application.Interfaces.Services
{
    public interface ISchoolService
    {
        /// <summary>
        /// Gets a specific school by its ID.
        /// </summary>
        /// <param name="id">The ID of the school.</param>
        /// <returns>A SchoolDto if found; otherwise, null.</returns>
        Task<VmSchool?> GetByIdAsync(int id);

        /// <summary>
        /// Gets a list of all schools.
        /// </summary>
        /// <returns>A read-only list of SchoolDto.</returns>
        Task<IReadOnlyList<VmSchool>> GetAllAsync();

        /// <summary>
        /// Creates a new school.
        /// </summary>
        /// <param name="createDto">The data transfer object containing information for the new school.</param>
        /// <returns>The created SchoolDto.</returns>
        Task<VmSchool> AddAsync(VmCreateSchool createDto);

        /// <summary>
        /// Updates an existing school.
        /// </summary>
        /// <param name="id">The ID of the school to update.</param>
        /// <param name="updateDto">The data transfer object containing the updated information.</param>
        /// <returns>True if the update was successful; otherwise, false (e.g., if the school was not found).</returns>
        Task<bool> UpdateAsync(int id, VmUpdateSchool updateDto);

        /// <summary>
        /// Deletes a school by its ID.
        /// </summary>
        /// <param name="id">The ID of the school to delete.</param>
        /// <returns>True if the deletion was successful; otherwise, false (e.g., if the school was not found).</returns>
        /// <exception cref="InvalidOperationException">Thrown if business rules prevent deletion (e.g., school has students).</exception>
        Task<bool> DeleteAsync(int id);

        /// <summary>
        /// Gets the total count of schools.
        /// </summary>
        /// <returns>The number of schools.</returns>
        Task<int> CountAsync();

        /// <summary>
        /// Assigns a user to a specific school.
        /// </summary>
        /// <param name="userId">The ID of the user.</param>
        /// <param name="schoolId">The ID of the school.</param>
        /// <returns>A task representing the asynchronous operation.</returns>
        /// <exception cref="ArgumentException">Thrown if the User or School is not found.</exception>
        Task AssignUserToSchoolAsync(int userId, int schoolId);

        /// <summary>
        /// Removes a user's assignment from a specific school.
        /// </summary>
        /// <param name="userId">The ID of the user.</param>
        /// <param name="schoolId">The ID of the school.</param>
        /// <returns>A task representing the asynchronous operation.</returns>
        Task RemoveUserFromSchoolAsync(int userId, int schoolId);

        /// <summary>
        /// Checks if a specific user is assigned to a specific school.
        /// </summary>
        /// <param name="userId">The ID of the user.</param>
        /// <param name="schoolId">The ID of the school.</param>
        /// <returns>True if the user is assigned to the school; otherwise, false.</returns>
        Task<bool> IsUserAssignedToSchoolAsync(int userId, int schoolId);
    }
}
