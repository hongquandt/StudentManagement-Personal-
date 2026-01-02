using Microsoft.EntityFrameworkCore;
using StudentManagement.Models;

namespace StudentManagement.Repositories
{
    public class StudentRepository : IStudentRepository
    {
        private readonly StudentManagementContext _context;

        public StudentRepository(StudentManagementContext context)
        {
            _context = context;
        }

        public async Task<Student?> GetStudentByUserIdAsync(int userId)
        {
            return await _context.Students
                .Include(s => s.User)
                .FirstOrDefaultAsync(s => s.UserId == userId);
        }

        public async Task<Student?> GetStudentByIdAsync(int studentId)
        {
            return await _context.Students
                .Include(s => s.User)
                .FirstOrDefaultAsync(s => s.StudentId == studentId);
        }

        public async Task<IEnumerable<Attendance>> GetAttendanceByStudentIdAsync(int studentId)
        {
            return await _context.Attendances
                .Include(a => a.Class)
                .Where(a => a.StudentId == studentId)
                .OrderByDescending(a => a.Date)
                .ToListAsync();
        }

        public async Task<IEnumerable<Score>> GetScoresByStudentIdAsync(int studentId)
        {
            return await _context.Scores
                .Include(s => s.Subject)
                .Include(s => s.Semester)
                .Where(s => s.StudentId == studentId)
                .ToListAsync();
        }

        public async Task<IEnumerable<Timetable>> GetTimetableByStudentIdAsync(int studentId)
        {
            // 1. Find the class the student belongs to
            // Assuming a student belongs to one active class at a time or we take the latest
            var studentClass = await _context.StudentClasses
                .Where(sc => sc.StudentId == studentId)
                .FirstOrDefaultAsync();

            if (studentClass == null)
            {
                return new List<Timetable>();
            }

            // 2. Get the timetable for that class
            return await _context.Timetables
                .Include(t => t.Subject)
                .Include(t => t.Teacher)
                .Where(t => t.ClassId == studentClass.ClassId)
                .ToListAsync();
        }

        public async Task<IEnumerable<Conduct>> GetConductByStudentIdAsync(int studentId)
        {
            return await _context.Conducts
                .Include(c => c.Semester)
                .Where(c => c.StudentId == studentId)
                .ToListAsync();
        }

        public async Task<IEnumerable<ClassMaterial>> GetClassMaterialsByStudentIdAsync(int studentId)
        {
            var studentClassIds = await _context.StudentClasses
                .Where(sc => sc.StudentId == studentId)
                .Select(sc => sc.ClassId)
                .ToListAsync();

            if (!studentClassIds.Any())
            {
                return new List<ClassMaterial>();
            }

            return await _context.ClassMaterials
                .Where(m => studentClassIds.Contains(m.ClassId))
                .Include(m => m.Class) // Include Class info if needed for display
                .OrderByDescending(m => m.UploadDate)
                .ToListAsync();
        }

        public async Task UpdateStudentAsync(Student student)
        {
            _context.Students.Update(student);
            await _context.SaveChangesAsync();
        }
    }
}
