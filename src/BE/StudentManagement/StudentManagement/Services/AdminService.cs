using Microsoft.EntityFrameworkCore;
using StudentManagement.Models;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace StudentManagement.Services
{
    public class AdminService : IAdminService
    {
        private readonly StudentManagementContext _context;

        public AdminService(StudentManagementContext context)
        {
            _context = context;
        }

        // School Year & Semester Management
        public async Task<IEnumerable<AcademicYear>> GetAllAcademicYearsAsync()
        {
            return await _context.AcademicYears.ToListAsync();
        }

        public async Task<AcademicYear> CreateAcademicYearAsync(AcademicYear academicYear)
        {
            _context.AcademicYears.Add(academicYear);
            await _context.SaveChangesAsync();
            return academicYear;
        }

        public async Task<AcademicYear> UpdateAcademicYearAsync(AcademicYear academicYear)
        {
            var existing = await _context.AcademicYears.FindAsync(academicYear.AcademicYearId);
            if (existing != null)
            {
                existing.YearName = academicYear.YearName;
                existing.IsActive = academicYear.IsActive;
                await _context.SaveChangesAsync();
            }
            return existing;
        }

        public async Task<bool> DeleteAcademicYearAsync(int id)
        {
            var year = await _context.AcademicYears.FindAsync(id);
            if (year == null) return false;
            _context.AcademicYears.Remove(year);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<IEnumerable<Semester>> GetAllSemestersAsync()
        {
            return await _context.Semesters.Include(s => s.AcademicYear).ToListAsync();
        }

        public async Task<Semester> CreateSemesterAsync(Semester semester)
        {
            _context.Semesters.Add(semester);
            await _context.SaveChangesAsync();
            return semester;
        }

        public async Task<Semester> UpdateSemesterAsync(Semester semester)
        {
            var existing = await _context.Semesters.FindAsync(semester.SemesterId);
            if (existing != null)
            {
                existing.SemesterName = semester.SemesterName;
                existing.StartDate = semester.StartDate;
                existing.EndDate = semester.EndDate;
                existing.AcademicYearId = semester.AcademicYearId;
                await _context.SaveChangesAsync();
            }
            return existing;
        }

        public async Task<bool> DeleteSemesterAsync(int id)
        {
            var semester = await _context.Semesters.FindAsync(id);
            if (semester == null) return false;
            _context.Semesters.Remove(semester);
            await _context.SaveChangesAsync();
            return true;
        }

        // Class Structure Management
        public async Task<IEnumerable<Class>> GetAllClassesAsync()
        {
            return await _context.Classes
                .Include(c => c.HomeroomTeacher)
                .Include(c => c.AcademicYear)
                .ToListAsync();
        }

        public async Task<Class> GetClassDetailsAsync(int id)
        {
            return await _context.Classes
                .Include(c => c.HomeroomTeacher)
                .Include(c => c.AcademicYear)
                .Include(c => c.StudentClasses)
                    .ThenInclude(sc => sc.Student)
                .FirstOrDefaultAsync(c => c.ClassId == id);
        }

        public async Task<Class> CreateClassAsync(Class newClass)
        {
            _context.Classes.Add(newClass);
            await _context.SaveChangesAsync();
            return newClass;
        }

        public async Task<bool> DeleteClassAsync(int id)
        {
            var cls = await _context.Classes.FindAsync(id);
            if (cls == null) return false;
            _context.Classes.Remove(cls);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> MergeClassesAsync(int sourceClassId, int destinationClassId)
        {
            var sourceClass = await _context.Classes.FindAsync(sourceClassId);
            var destClass = await _context.Classes.FindAsync(destinationClassId);

            if (sourceClass == null || destClass == null) return false;

            var sourceStudents = await _context.StudentClasses
                .Where(sc => sc.ClassId == sourceClassId)
                .ToListAsync();

            foreach (var sc in sourceStudents)
            {
                // Check if student is already in destination class
                bool exists = await _context.StudentClasses
                    .AnyAsync(d => d.ClassId == destinationClassId && d.StudentId == sc.StudentId);

                if (!exists)
                {
                    sc.ClassId = destinationClassId;
                    _context.StudentClasses.Update(sc); // Move student
                }
                else
                {
                    _context.StudentClasses.Remove(sc); // Remove from source if already in dest
                }
            }

            // Move Attendances? Scores? 
            // The requirement says "merge classes". Moving students is the primary action.
            // Moving other data might be complicated (e.g. Schedule conflicts).
            // For now, I'll assume only students are moved.

            await _context.SaveChangesAsync();
            
            // Delete source class if empty or requested? 
            // Usually merge implies source is gone.
            _context.Classes.Remove(sourceClass);
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<bool> AssignStudentToClassAsync(int studentId, int classId)
        {
            var student = await _context.Students.FindAsync(studentId);
            var cls = await _context.Classes.FindAsync(classId);

            if (student == null || cls == null) return false;

            // Check if student is already in ANY class for this academic year (optional rule, but good for data integrity)
            // Or just check if in THIS class
            var existingAssignment = await _context.StudentClasses
                .FirstOrDefaultAsync(sc => sc.StudentId == studentId && sc.ClassId == classId);
           
            if (existingAssignment != null) return true; // Already signed

            // Check if student is in another class for same semester/year?? 
            // Usually students are in one class per year. 
            // For now, simple assignment.
            
            var assignment = new StudentClass
            {
                StudentId = studentId,
                ClassId = classId
            };
            _context.StudentClasses.Add(assignment);
            await _context.SaveChangesAsync();
            return true;
        }

        // Teacher Assignment
        public async Task<bool> AssignHomeroomTeacherAsync(int classId, int teacherId)
        {
            var cls = await _context.Classes.FindAsync(classId);
            if (cls == null) return false;
            cls.HomeroomTeacherId = teacherId;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> AssignSubjectTeacherAsync(TeachingAssignment assignment)
        {
            // Check conflicts?
            _context.TeachingAssignments.Add(assignment);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> RemoveSubjectTeacherAsync(int assignmentId)
        {
            var assignment = await _context.TeachingAssignments.FindAsync(assignmentId);
            if (assignment == null) return false;
            _context.TeachingAssignments.Remove(assignment);
            await _context.SaveChangesAsync();
            return true;
        }

        // Course Management
        public async Task<IEnumerable<Subject>> GetAllSubjectsAsync()
        {
            return await _context.Subjects.ToListAsync();
        }

        public async Task<Subject> CreateSubjectAsync(Subject subject)
        {
            _context.Subjects.Add(subject);
            await _context.SaveChangesAsync();
            return subject;
        }

        public async Task<Subject> UpdateSubjectAsync(Subject subject)
        {
            var existing = await _context.Subjects.FindAsync(subject.SubjectId);
            if (existing != null)
            {
                existing.SubjectName = subject.SubjectName;
                existing.Credit = subject.Credit;
                await _context.SaveChangesAsync();
            }
            return existing;
        }

        public async Task<bool> DeleteSubjectAsync(int id)
        {
            var subject = await _context.Subjects.FindAsync(id);
            if (subject == null) return false;
            _context.Subjects.Remove(subject);
            await _context.SaveChangesAsync();
            return true;
        }

        // Schedule Management
        public async Task<IEnumerable<Timetable>> GetTimetablesAsync(int? classId, int? teacherId, int? semesterId)
        {
            var query = _context.Timetables
                .Include(t => t.Class)
                .Include(t => t.Teacher)
                .Include(t => t.Subject)
                .AsQueryable();

            if (classId.HasValue) query = query.Where(t => t.ClassId == classId);
            if (teacherId.HasValue) query = query.Where(t => t.TeacherId == teacherId);
            if (semesterId.HasValue) query = query.Where(t => t.SemesterId == semesterId);

            return await query.ToListAsync();
        }

        public async Task<bool> CheckScheduleConflictAsync(Timetable timetable)
        {
            // 1. Class conflict: Same class, same time
            bool classConflict = await _context.Timetables.AnyAsync(t => 
                t.ClassId == timetable.ClassId && 
                t.SemesterId == timetable.SemesterId &&
                t.DayOfWeek == timetable.DayOfWeek && 
                t.Period == timetable.Period &&
                t.TimetableId != timetable.TimetableId);

            if (classConflict) return true;

            // 2. Teacher conflict: Same teacher, same time
            bool teacherConflict = await _context.Timetables.AnyAsync(t => 
                t.TeacherId == timetable.TeacherId && 
                t.SemesterId == timetable.SemesterId &&
                t.DayOfWeek == timetable.DayOfWeek && 
                t.Period == timetable.Period &&
                 t.TimetableId != timetable.TimetableId);

            if (teacherConflict) return true;

            // 3. Room conflict: Same room, same time
             bool roomConflict = await _context.Timetables.AnyAsync(t => 
                t.RoomNumber == timetable.RoomNumber && 
                t.SemesterId == timetable.SemesterId &&
                t.DayOfWeek == timetable.DayOfWeek && 
                t.Period == timetable.Period &&
                 t.TimetableId != timetable.TimetableId);

             return roomConflict;
        }

        public async Task<Timetable> CreateTimetableEntryAsync(Timetable timetable)
        {
            if (await CheckScheduleConflictAsync(timetable))
            {
                throw new System.Exception("Schedule Conflict Detected");
            }
            _context.Timetables.Add(timetable);
            await _context.SaveChangesAsync();
            return timetable;
        }

        public async Task<bool> UpdateTimetableEntryAsync(Timetable timetable)
        {
            if (await CheckScheduleConflictAsync(timetable))
            {
                 throw new System.Exception("Schedule Conflict Detected");
            }

            var existing = await _context.Timetables.FindAsync(timetable.TimetableId);
            if (existing != null)
            {
                existing.ClassId = timetable.ClassId;
                existing.SubjectId = timetable.SubjectId;
                existing.TeacherId = timetable.TeacherId;
                existing.RoomNumber = timetable.RoomNumber;
                existing.DayOfWeek = timetable.DayOfWeek;
                existing.Period = timetable.Period;
                existing.SemesterId = timetable.SemesterId;
                await _context.SaveChangesAsync();
                return true;
            }
            return false;
        }

        public async Task<bool> DeleteTimetableEntryAsync(int id)
        {
            var t = await _context.Timetables.FindAsync(id);
            if (t == null) return false;
            _context.Timetables.Remove(t);
            await _context.SaveChangesAsync();
            return true;
        }

        // User Management
        public async Task<IEnumerable<User>> GetAllUsersAsync()
        {
            return await _context.Users
                .Include(u => u.Role)
                .Include(u => u.Student)
                .Include(u => u.Teacher)
                .Include(u => u.Parent)
                .ToListAsync();
        }

        public async Task<User> UpdateUserAsync(User user)
        {
             var existing = await _context.Users
                .Include(u => u.Role)
                .Include(u => u.Student)
                .Include(u => u.Teacher)
                .FirstOrDefaultAsync(u => u.UserId == user.UserId);

            if (existing != null)
            {
                // Update User Base Details
                if (!string.IsNullOrEmpty(user.Email)) existing.Email = user.Email;
                
                // Only update active status if it's explicitly passed/changed (often tricky with bools, but assuming API passed intent)
                existing.IsActive = user.IsActive; // Assuming FE always sends true/false state

                existing.Ethnicity = user.Ethnicity;
                existing.CitizenIdImage = user.CitizenIdImage;
                existing.AvatarUrl = user.AvatarUrl; 
                
                // Update Student Details
                if (existing.Student != null && user.Student != null)
                {
                    existing.Student.FullName = user.Student.FullName;
                    existing.Student.Gender = user.Student.Gender;
                    // Handle DateOnly updates: user.Student.DateOfBirth is likely DateOnly?
                    // If the incoming user object has default values for non-nullable types, be careful.
                    // But here DateOfBirth is nullable DateOnly?.
                    existing.Student.DateOfBirth = user.Student.DateOfBirth; 
                    
                    existing.Student.Address = user.Student.Address;
                    existing.Student.EnrollmentYear = user.Student.EnrollmentYear;
                    existing.Student.Status = user.Student.Status;
                }

                // Update Teacher Details
                if (existing.Teacher != null && user.Teacher != null)
                {
                    existing.Teacher.FullName = user.Teacher.FullName;
                    existing.Teacher.Phone = user.Teacher.Phone;
                    existing.Teacher.Specialization = user.Teacher.Specialization;
                }

                await _context.SaveChangesAsync();
            }
            return existing;
        }

        public async Task<bool> BanUserAsync(int userId)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null) return false;
            user.IsActive = false;
            await _context.SaveChangesAsync();
            return true;
        }

         public async Task<bool> UnbanUserAsync(int userId)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null) return false;
            user.IsActive = true;
            await _context.SaveChangesAsync();
            return true;
        }

        // Handle Teacher Request Change
        public async Task<IEnumerable<TeacherRequest>> GetPendingTeacherRequestsAsync()
        {
            return await _context.TeacherRequests
                .Include(r => r.Teacher)
                .Where(r => r.Status == "Pending")
                .ToListAsync();
        }

        public async Task<bool> ApproveTeacherRequestAsync(int requestId)
        {
            var req = await _context.TeacherRequests.FindAsync(requestId);
            if (req == null) return false;
            req.Status = "Approved";
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> RejectTeacherRequestAsync(int requestId)
        {
            var req = await _context.TeacherRequests.FindAsync(requestId);
            if (req == null) return false;
            req.Status = "Rejected";
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<StudentManagement.Models.DTO.AdminDashboardStats> GetDashboardStatsAsync()
        {
            return new StudentManagement.Models.DTO.AdminDashboardStats
            {
                TotalUsers = await _context.Users.CountAsync(),
                TotalClasses = await _context.Classes.CountAsync(),
                PendingRequests = await _context.TeacherRequests.CountAsync(r => r.Status == "Pending"),
                ActiveSemesters = await _context.AcademicYears.CountAsync(y => y.IsActive == true) // Or use specific semester logic
            };
        }
    }
}
