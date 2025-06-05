using AutoMapper;
using StudentManagement.Application.Features.Common.ViewModels;
using StudentManagement.Application.Features.Schools.ViewModels;
using StudentManagement.Application.Features.Students;
using StudentManagement.Application.Features.Users.ViewModels;
using StudentManagement.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace StudentManagement.Application.ViewModelMap
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            // School Mappings
            CreateMap<School, VmSchool>().ReverseMap(); // ReverseMap for convenience if needed
            CreateMap<VmCreateSchool, School>();       // Map from Create DTO to Entity
            CreateMap<VmUpdateSchool, School>()
                 .ForMember(dest => dest.SchoolId, opt => opt.Ignore()) // Ignore ID on update mapping
                 .ForMember(dest => dest.CreatedAt, opt => opt.Ignore()); // Ignore CreatedAt

            // --- Add User Mappings ---
            CreateMap<User, VmUser>();
            // Map User to VmUserList
            CreateMap<User, VmUserList>();

            // Map User to VmUserDetail
            CreateMap<User, VmUserDetail>()
                 .ForMember(dest => dest.AssignedSchools, opt => opt.MapFrom(src => src.SchoolLinks.Select(sl => sl.School))); // Map schools from link table
                                                                                                                               //.ForMember(dest => dest.AssignedSchools, opt => opt.MapFrom(src => src.SchoolLinks.Select(link => link.School)))
                                                                                                                               //.ForMember(dest => dest.DefaultSchoolId, opt => opt.MapFrom(src => src.DefaultSchoolId));

            //CreateMap<VmCreateUser, User>()
            //    .ForMember(dest => dest.PasswordHash, opt => opt.Ignore())
            //    .ForMember(dest => dest.PasswordSalt, opt => opt.Ignore())
            //    .ForMember(dest => dest.UserId, opt => opt.Ignore())
            //    .ForMember(dest => dest.IsActive, opt => opt.MapFrom(src => true)) // Default to active
            //    .ForMember(dest => dest.IsPasswordChangeRequired, opt => opt.MapFrom(src => true)) // Default to TRUE on creation
            //    .ForMember(dest => dest.DefaultSchoolId, opt => opt.Ignore()) // Set separately if needed, or via UpdateUser later
            //    .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
            //    .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore());

            //use below one for createuser

            // Map VmUser to User (for updates)
            CreateMap<VmUser, User>()
                .ForMember(dest => dest.UserId, opt => opt.Ignore()) // Ignore ID on update mapping
                .ForMember(dest => dest.PasswordHash, opt => opt.Ignore()) // Ignore hash/salt during mapping
                .ForMember(dest => dest.PasswordSalt, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore());

            // Map VmUpdateUser to User (for updates)
            CreateMap<VmUpdateUser, User>()
                  .ForMember(dest => dest.UserId, opt => opt.Ignore()) // Never update ID
                  .ForMember(dest => dest.Username, opt => opt.Ignore()) // Don't update username/email here
                  .ForMember(dest => dest.Email, opt => opt.Ignore())
                  .ForMember(dest => dest.PasswordHash, opt => opt.Ignore()) // Handled by reset
                  .ForMember(dest => dest.PasswordSalt, opt => opt.Ignore()) // Handled by reset
                  .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
                  .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore()) // Handled by SaveChanges override
                  .ForMember(dest => dest.SchoolLinks, opt => opt.Ignore()) // Managed explicitly in service
                  .ForMember(dest => dest.DefaultSchool, opt => opt.Ignore()); // Ignore navigation property


            // Map Register DTO to User Entity. Password handled separately.
            CreateMap<VmRegisterUser, User>()
                 .ForMember(dest => dest.PasswordHash, opt => opt.Ignore()) // Ignore hash/salt during mapping
                 .ForMember(dest => dest.PasswordSalt, opt => opt.Ignore())
                 .ForMember(dest => dest.UserId, opt => opt.Ignore()) // Ignore during creation mapping
                 .ForMember(dest => dest.IsActive, opt => opt.MapFrom(src => true)) // Default to active on register
                 .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
                 .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore());
            // --- End User Mappings ---

            // Add Mappings for User, Student, etc.
            // Example:
            // CreateMap<Student, StudentSummaryDto>();
            // CreateMap<CreateStudentDto, Student>();
            // CreateMap<UpdateStudentDto, Student>().ForMember(dest => dest.StudentId, opt => opt.Ignore());
            // CreateMap<User, UserDto>();
            // CreateMap<RegisterUserDto, User>(); // Handle password hashing separately in service

            // --- Add Student Mappings ---
            CreateMap<Student, VmStudentSummary>()
                // Map SchoolName from the navigation property
                .ForMember(dest => dest.SchoolName, opt => opt.MapFrom(src => src.School.Name))
                // Logic for PhotoThumbnailPath might be more complex, depends on storage strategy
                .ForMember(dest => dest.PhotoThumbnailPath, opt => opt.MapFrom(src => src.PhotoPath)) // Or specific thumbnail logic
            .ForMember(dest => dest.StandardName, opt => opt.MapFrom(src => src.Standard != null ? src.Standard.Name : string.Empty)) // Map from navigation property
            .ForMember(dest => dest.DivisionName, opt => opt.MapFrom(src => src.Division != null ? src.Division.Name : string.Empty)); // Map from navigation property
            
            CreateMap<Student, VmStudentDetail>()
                // Map SchoolName from the navigation property
                .ForMember(dest => dest.SchoolName, opt => opt.MapFrom(src => src.School.Name))
                .ForMember(dest => dest.StandardName, opt => opt.MapFrom(src => src.Standard != null ? src.Standard.Name : string.Empty))
                .ForMember(dest => dest.DivisionName, opt => opt.MapFrom(src => src.Division != null ? src.Division.Name : string.Empty))
             .ForMember(dest => dest.BloodGroupName, opt => opt.MapFrom(src => src.BloodGroup != null ? src.BloodGroup.BloodGroupName : null))
            .ForMember(dest => dest.HouseName, opt => opt.MapFrom(src => src.House != null ? src.House.HouseName : null));

            CreateMap<VmCreateStudent, Student>()
                .ForMember(dest => dest.Standard, opt => opt.Ignore())
                .ForMember(dest => dest.Division, opt => opt.Ignore())
                .ForMember(dest => dest.StudentId, opt => opt.Ignore())
                .ForMember(dest => dest.PhotoPath, opt => opt.Ignore())
                .ForMember(dest => dest.PhotoName, opt => opt.Ignore()) // Photo handled separately
                .ForMember(dest => dest.IsActive, opt => opt.MapFrom(src => true))
                .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.School, opt => opt.Ignore())
                .ForMember(dest => dest.BloodGroup, opt => opt.Ignore()) // Ignore navigation property
            .ForMember(dest => dest.House, opt => opt.Ignore());    // Ignore navigation property

            CreateMap<VmUpdateStudent, Student>()
                .ForMember(dest => dest.StudentId, opt => opt.Ignore())
                .ForMember(dest => dest.SchoolId, opt => opt.Ignore())
                .ForMember(dest => dest.School, opt => opt.Ignore())
                .ForMember(dest => dest.PhotoPath, opt => opt.Ignore())
                .ForMember(dest => dest.PhotoName, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.Standard, opt => opt.Ignore())
                .ForMember(dest => dest.Division, opt => opt.Ignore())
                 .ForMember(dest => dest.BloodGroup, opt => opt.Ignore())
            .ForMember(dest => dest.House, opt => opt.Ignore());

            CreateMap<Standard, VmStandard>();
            //.ForMember(dest => dest.id, opt => opt.MapFrom(src => src.StandardId)); to map diff namesexplicitly
            CreateMap<Division, VmDivision>();
            // --- End Student Mappings ---

            CreateMap<BloodGroup, VmBloodGroup>(); 
            CreateMap<House, VmHouse>();
        }
    }
}
