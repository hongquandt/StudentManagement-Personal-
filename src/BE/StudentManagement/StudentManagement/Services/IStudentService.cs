using StudentManagement.Models;

namespace StudentManagement.Services
{
    public interface IStudentService
    {
        Task<Student?> GetStudentByUserIdAsync(int userId);
        Task<IEnumerable<Attendance>> GetAttendanceAsync(int studentId);
        Task<IEnumerable<Score>> GetScoresAsync(int studentId);
        Task<IEnumerable<Timetable>> GetTimetableAsync(int studentId);
        Task<IEnumerable<Conduct>> GetConductAsync(int studentId);
        Task<IEnumerable<ClassMaterial>> GetMaterialsAsync(int studentId);
        Task<bool> UpdateProfileAsync(int userId, StudentUpdateModel model);
    }

    public class StudentUpdateModel
    {
        public string FullName { get; set; }
        public string Address { get; set; }
        public string Email { get; set; }
        public DateOnly? DateOfBirth { get; set; }
        public string Gender { get; set; }
        public string CitizenIdImage { get; set; }
        public string Ethnicity { get; set; }
    }
}
