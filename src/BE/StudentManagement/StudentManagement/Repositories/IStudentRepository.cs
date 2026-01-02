using StudentManagement.Models;

namespace StudentManagement.Repositories
{
    public interface IStudentRepository
    {
        Task<Student?> GetStudentByUserIdAsync(int userId);
        Task<Student?> GetStudentByIdAsync(int studentId);
        Task<IEnumerable<Attendance>> GetAttendanceByStudentIdAsync(int studentId);
        Task<IEnumerable<Score>> GetScoresByStudentIdAsync(int studentId);
        Task<IEnumerable<Timetable>> GetTimetableByStudentIdAsync(int studentId);
        Task UpdateStudentAsync(Student student);
    }
}
