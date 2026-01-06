using StudentManagement.Models;

using System.Collections.Generic;
using System.Threading.Tasks;

namespace StudentManagement.Services
{
    public interface IAdminService
    {
        // School Year & Semester Management
        Task<IEnumerable<AcademicYear>> GetAllAcademicYearsAsync();
        Task<AcademicYear> CreateAcademicYearAsync(AcademicYear academicYear);
        Task<AcademicYear> UpdateAcademicYearAsync(AcademicYear academicYear); // For activating/deactivating
        Task<bool> DeleteAcademicYearAsync(int id);
        
        Task<IEnumerable<Semester>> GetAllSemestersAsync();
        Task<Semester> CreateSemesterAsync(Semester semester);
        Task<Semester> UpdateSemesterAsync(Semester semester); // For activating/deactivating
        Task<bool> DeleteSemesterAsync(int id);

        // Class Structure Management
        Task<IEnumerable<Class>> GetAllClassesAsync();
        Task<Class> GetClassDetailsAsync(int id); // With students
        Task<Class> CreateClassAsync(Class newClass);
        Task<bool> DeleteClassAsync(int id);
        Task<bool> MergeClassesAsync(int sourceClassId, int destinationClassId); // Move students from source to dest, delete source
        Task<bool> AssignStudentToClassAsync(int studentId, int classId);

        // Teacher Assignment
        Task<bool> AssignHomeroomTeacherAsync(int classId, int teacherId);
        Task<bool> AssignSubjectTeacherAsync(TeachingAssignment assignment);
        Task<bool> RemoveSubjectTeacherAsync(int assignmentId);

        // Course Management (Subjects)
        Task<IEnumerable<Subject>> GetAllSubjectsAsync();
        Task<Subject> CreateSubjectAsync(Subject subject);
        Task<Subject> UpdateSubjectAsync(Subject subject);
        Task<bool> DeleteSubjectAsync(int id);

        // Schedule Management
        Task<IEnumerable<Timetable>> GetTimetablesAsync(int? classId, int? teacherId, int? semesterId);
        Task<Timetable> CreateTimetableEntryAsync(Timetable timetable);
        Task<bool> UpdateTimetableEntryAsync(Timetable timetable);
        Task<bool> DeleteTimetableEntryAsync(int id);
        Task<bool> CheckScheduleConflictAsync(Timetable timetable);

        // User Management
        Task<IEnumerable<User>> GetAllUsersAsync();
        Task<User> UpdateUserAsync(User user); // General update
        Task<bool> BanUserAsync(int userId);
        Task<bool> UnbanUserAsync(int userId);

        // Handle Teacher Request Change
        Task<IEnumerable<TeacherRequest>> GetPendingTeacherRequestsAsync();
        Task<bool> ApproveTeacherRequestAsync(int requestId);
        Task<bool> RejectTeacherRequestAsync(int requestId);

        Task<StudentManagement.Models.DTO.AdminDashboardStats> GetDashboardStatsAsync();
    }
}
