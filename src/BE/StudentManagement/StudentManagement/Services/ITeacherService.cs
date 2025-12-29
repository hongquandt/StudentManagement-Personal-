using StudentManagement.Models;

namespace StudentManagement.Services
{
    public interface ITeacherService
    {
        // 1. Homeroom
        Task<Class?> GetHomeroomClassAsync(int teacherId);
        Task<List<Student>> GetHomeroomStudentsAsync(int classId);
        Task<List<ClassDto>> GetTeachingClassesAsync(int teacherId); // Updated to DTO
        Task<bool> UpdateHomeroomClassAsync(int classId, string? announcement); // Simplified update

        // 2. Timetable
        Task<List<TimetableDto>> GetTimetableAsync(int teacherId);

        // 3. Requests
        Task<bool> CreateRequestAsync(int teacherId, TeacherRequestDto request);
        Task<List<TeacherRequest>> GetRequestsAsync(int teacherId);

        // 4. Attendance
        Task<List<AttendanceDto>> GetAttendanceAsync(int classId, DateTime date);
        Task<bool> SaveAttendanceAsync(List<AttendanceDto> attendanceList);

        // 5. Grades
        Task<List<ScoreDto>> GetScoresAsync(int classId, int subjectId, int semesterId);
        Task<bool> SaveScoresAsync(List<ScoreDto> scores);

        // 6. Conduct
        Task<List<ConductDto>> GetConductsAsync(int classId, int semesterId);
        Task<bool> SaveConductsAsync(List<ConductDto> conducts);

        // 7. Profile
        Task<Teacher?> GetProfileAsync(int userId);
        Task<bool> UpdateProfileAsync(int teacherId, TeacherProfileDto profile);

        // 8. Certificates
        Task<List<TeacherCertificate>> GetCertificatesAsync(int teacherId);
        Task<bool> AddCertificateAsync(int teacherId, CertificateDto certificate);
        Task<bool> DeleteCertificateAsync(int certificateId, int teacherId);
        
        // Stats
        Task<DashboardStatsDto> GetDashboardStatsAsync(int teacherId);

        // Helper
        Task<int?> GetTeacherIdByUserIdAsync(int userId);
    }

    public class DashboardStatsDto
    {
        public int TotalStudents { get; set; }
        public int HoursTaught { get; set; }
        public double AvgAttendance { get; set; }
    }

    // DTOs
    public class TimetableDto
    {
        public string DayOfWeek { get; set; }
        public int Period { get; set; }
        public string SubjectName { get; set; }
        public string ClassName { get; set; }
        public string RoomNumber { get; set; }
    }

    public class TeacherRequestDto
    {
        public string RequestType { get; set; }
        public string Content { get; set; }
    }

    public class AttendanceDto
    {
        public int StudentId { get; set; }
        public string StudentName { get; set; }
        public int ClassId { get; set; }
        public DateTime Date { get; set; }
        public string Status { get; set; } // present, absent, late
    }

    public class ScoreDto
    {
        public int ScoreId { get; set; }
        public int StudentId { get; set; }
        public string StudentName { get; set; }
        public int SubjectId { get; set; }
        public int SemesterId { get; set; }
        public double? OralScore { get; set; }
        public double? QuizScore { get; set; }
        public double? MidtermScore { get; set; }
        public double? FinalScore { get; set; }
        public decimal? AverageScore { get; set; }
    }

    public class ConductDto
    {
        public int ConductId { get; set; }
        public int StudentId { get; set; }
        public string StudentName { get; set; }
        public int SemesterId { get; set; }
        public string? ConductLevel { get; set; }
        public string? Comment { get; set; }
    }

    public class TeacherProfileDto
    {
        public string FullName { get; set; }
        public string Phone { get; set; }
        public string Specialization { get; set; }
    }

    public class CertificateDto
    {
        public string CertificateName { get; set; }
        public string IssuedBy { get; set; }
        public DateTime? IssueDate { get; set; }
        public string Description { get; set; }
        public string CertificateImage { get; set; }
    }

    public class ClassDto
    {
        public int ClassId { get; set; }
        public string ClassName { get; set; }
    }
}
