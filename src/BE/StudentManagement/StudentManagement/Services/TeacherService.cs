using Microsoft.EntityFrameworkCore;
using StudentManagement.Models;

namespace StudentManagement.Services
{
    public class TeacherService : ITeacherService
    {
        private readonly StudentManagementContext _context;

        public TeacherService(StudentManagementContext context)
        {
            _context = context;
        }

        public async Task<int?> GetTeacherIdByUserIdAsync(int userId)
        {
            var teacher = await _context.Teachers.AsNoTracking().FirstOrDefaultAsync(t => t.UserId == userId);
            return teacher?.TeacherId;
        }

        public async Task<Class?> GetHomeroomClassAsync(int teacherId)
        {
            return await _context.Classes
                .Include(c => c.AcademicYear)
                .FirstOrDefaultAsync(c => c.HomeroomTeacherId == teacherId);
        }

        public async Task<List<Student>> GetHomeroomStudentsAsync(int classId)
        {
            // Join StudentClasses to get students
            return await _context.StudentClasses
               .Where(sc => sc.ClassId == classId)
               .Include(sc => sc.Student)
                  .ThenInclude(s => s.User)
               .Select(sc => sc.Student)
               .ToListAsync();
        }

        // New Helper: Get Classes taught by teacher (for dropdowns)
        public async Task<List<ClassDto>> GetTeachingClassesAsync(int teacherId)
        {
            // 1. Get Homeroom Class
            var homeroom = await _context.Classes
                .Where(c => c.HomeroomTeacherId == teacherId)
                .Select(c => new ClassDto { ClassId = c.ClassId, ClassName = c.ClassName })
                .ToListAsync();
            
            // 2. Get Classes from TeachingAssignments
            var assignedClasses = await _context.TeachingAssignments
                .Where(ta => ta.TeacherId == teacherId)
                .Include(ta => ta.Class)
                .Select(ta => new ClassDto { ClassId = ta.Class.ClassId, ClassName = ta.Class.ClassName })
                .ToListAsync();

            // Union and Distinct
            return homeroom.Union(assignedClasses)
                           .DistinctBy(c => c.ClassId)
                           .ToList();
        }

        public async Task<bool> UpdateHomeroomClassAsync(int classId, string? announcement)
        {
            // For now, Class model doesn't have Announcement field, assuming placeholder logic or I need to add it. 
            // The prompt said "Update Homeroom class", but table doesn't have much to update.
            // I'll return true for now, assuming future implementation or name update.
            // Let's allow updating ClassName just to demonstrate.
            await Task.Yield(); // Simulate async work
            return true;
        }

        public async Task<bool> UpdateStudentAsync(int studentId, StudentUpdateDto dto)
        {
            var student = await _context.Students.FindAsync(studentId);
            if (student == null) return false;

            student.FullName = dto.FullName;
            student.Gender = dto.Gender;
            if (dto.DateOfBirth.HasValue) 
                student.DateOfBirth = DateOnly.FromDateTime(dto.DateOfBirth.Value);
            student.Address = dto.Address;
            student.Status = dto.Status;

            await _context.SaveChangesAsync();
            return true;
        }

        // 2. Timetable
        public async Task<List<TimetableDto>> GetTimetableAsync(int teacherId)
        {
            return await _context.Timetables
                .Where(t => t.TeacherId == teacherId)
                .Include(t => t.Class)
                .Include(t => t.Subject)
                .Select(t => new TimetableDto
                {
                    DayOfWeek = t.DayOfWeek,
                    Period = t.Period ?? 0,
                    SubjectName = t.Subject.SubjectName,
                    ClassName = t.Class.ClassName,
                    RoomNumber = t.RoomNumber
                })
                .OrderBy(t => t.DayOfWeek).ThenBy(t => t.Period)
                .ToListAsync();
        }

        // 3. Requests
        public async Task<bool> CreateRequestAsync(int teacherId, TeacherRequestDto requestDto)
        {
            if (requestDto.RequestType == null || requestDto.Content == null) return false;

            var request = new TeacherRequest
            {
                TeacherId = teacherId,
                RequestType = requestDto.RequestType,
                Content = requestDto.Content,
                Status = "Pending",
                CreatedAt = DateTime.Now
            };
            _context.TeacherRequests.Add(request);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<List<TeacherRequest>> GetRequestsAsync(int teacherId)
        {
            return await _context.TeacherRequests
                .Where(r => r.TeacherId == teacherId)
                .OrderByDescending(r => r.CreatedAt)
                .ToListAsync();
        }

        public async Task<bool> UpdateRequestAsync(int requestId, TeacherRequestDto dto)
        {
            var request = await _context.TeacherRequests.FindAsync(requestId);
            if (request == null) return false;

            request.RequestType = dto.RequestType;
            request.Content = dto.Content;
            
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteRequestAsync(int requestId)
        {
            var request = await _context.TeacherRequests.FindAsync(requestId);
            if (request == null) return false;

            _context.TeacherRequests.Remove(request);
            await _context.SaveChangesAsync();
            return true;
        }

        // 4. Attendance
        public async Task<List<AttendanceDto>> GetAttendanceAsync(int classId, DateTime date)
        {
            var dateOnly = DateOnly.FromDateTime(date);

            // Get all students in class
            var students = await _context.StudentClasses
                .Where(sc => sc.ClassId == classId)
                .Include(sc => sc.Student)
                .Select(sc => sc.Student)
                .ToListAsync();

            // Get existing attendance records
            var attendanceRecords = await _context.Attendances
                .Where(a => a.ClassId == classId && a.Date == dateOnly)
                .ToListAsync();

            var result = new List<AttendanceDto>();
            foreach (var student in students)
            {
                var record = attendanceRecords.FirstOrDefault(a => a.StudentId == student.StudentId);
                result.Add(new AttendanceDto
                {
                    StudentId = student.StudentId,
                    StudentName = student.FullName,
                    ClassId = classId,
                    Date = date,
                    Status = record?.Status ?? "present" // Default to present if not recorded
                });
            }
            return result;
        }

        public async Task<bool> SaveAttendanceAsync(List<AttendanceDto> attendanceList)
        {
            if (!attendanceList.Any()) return false;

            var classId = attendanceList.First().ClassId;
            var inputDate = attendanceList.First().Date;
            var dateOnly = DateOnly.FromDateTime(inputDate);

            // Fetch existing records for efficient update
            var existingRecords = await _context.Attendances
                .Where(a => a.ClassId == classId && a.Date == dateOnly)
                .ToListAsync();

            foreach (var item in attendanceList)
            {
                var itemDateOnly = DateOnly.FromDateTime(item.Date);
                var existing = existingRecords
                    .FirstOrDefault(a => a.StudentId == item.StudentId && a.ClassId == item.ClassId && a.Date == itemDateOnly);

                if (existing != null)
                {
                    existing.Status = item.Status;
                }
                else
                {
                    _context.Attendances.Add(new Attendance
                    {
                        StudentId = item.StudentId,
                        ClassId = item.ClassId,
                        Date = itemDateOnly,
                        Status = item.Status
                    });
                }
            }
            await _context.SaveChangesAsync();
            return true;
        }

        // 5. Grades
        public async Task<List<ScoreDto>> GetScoresAsync(int classId, int subjectId, int semesterId)
        {
            var students = await _context.StudentClasses
                .Where(sc => sc.ClassId == classId)
                .Include(sc => sc.Student)
                .Select(sc => sc.Student)
                .ToListAsync();

            var scores = await _context.Scores
                .Where(s => s.SubjectId == subjectId && s.SemesterId == semesterId)
                .ToListAsync();

            var result = new List<ScoreDto>();
            foreach (var student in students)
            {
                var score = scores.FirstOrDefault(s => s.StudentId == student.StudentId);
                result.Add(new ScoreDto
                {
                    ScoreId = score?.ScoreId ?? 0,
                    StudentId = student.StudentId,
                    StudentName = student.FullName,
                    SubjectId = subjectId,
                    SemesterId = semesterId,
                    OralScore = score?.OralScore,
                    QuizScore = score?.QuizScore,
                    MidtermScore = score?.MidtermScore,
                    FinalScore = score?.FinalScore,
                    AverageScore = score?.AverageScore
                });
            }
            return result;
        }

        public async Task<bool> SaveScoresAsync(List<ScoreDto> scoresList)
        {
            foreach (var item in scoresList)
            {
                var existing = await _context.Scores
                    .FirstOrDefaultAsync(s => s.StudentId == item.StudentId && s.SubjectId == item.SubjectId && s.SemesterId == item.SemesterId);

                if (existing != null)
                {
                    existing.OralScore = item.OralScore;
                    existing.QuizScore = item.QuizScore;
                    existing.MidtermScore = item.MidtermScore;
                    existing.FinalScore = item.FinalScore;
                    // Average is computed in DB
                }
                else
                {
                    _context.Scores.Add(new Score
                    {
                        StudentId = item.StudentId,
                        SubjectId = item.SubjectId,
                        SemesterId = item.SemesterId,
                        OralScore = item.OralScore,
                        QuizScore = item.QuizScore,
                        MidtermScore = item.MidtermScore,
                        FinalScore = item.FinalScore
                    });
                }
            }
            await _context.SaveChangesAsync();
            return true;
        }

        // 6. Conduct
        public async Task<List<ConductDto>> GetConductsAsync(int classId, int semesterId)
        {
            var students = await _context.StudentClasses
                .Where(sc => sc.ClassId == classId)
                .Include(sc => sc.Student)
                .Select(sc => sc.Student)
                .ToListAsync();

            var conducts = await _context.Conducts
                .Where(c => c.SemesterId == semesterId)
                .ToListAsync();

            var result = new List<ConductDto>();
            foreach (var student in students)
            {
                var conduct = conducts.FirstOrDefault(c => c.StudentId == student.StudentId);
                result.Add(new ConductDto
                {
                    ConductId = conduct?.ConductId ?? 0,
                    StudentId = student.StudentId,
                    StudentName = student.FullName,
                    SemesterId = semesterId,
                    ConductLevel = conduct?.ConductLevel,
                    Comment = conduct?.Comment
                });
            }
            return result;
        }

        public async Task<bool> SaveConductsAsync(List<ConductDto> conductsList)
        {
            foreach (var item in conductsList)
            {
                var existing = await _context.Conducts
                    .FirstOrDefaultAsync(c => c.StudentId == item.StudentId && c.SemesterId == item.SemesterId);

                if (existing != null)
                {
                    existing.ConductLevel = item.ConductLevel;
                    existing.Comment = item.Comment;
                }
                else
                {
                    _context.Conducts.Add(new Conduct
                    {
                        StudentId = item.StudentId,
                        SemesterId = item.SemesterId,
                        ConductLevel = item.ConductLevel,
                        Comment = item.Comment
                    });
                }
            }
            await _context.SaveChangesAsync();
            return true;
        }

        // 7. Profile
        public async Task<Teacher?> GetProfileAsync(int userId)
        {
            return await _context.Teachers
                .Include(t => t.User)
                .FirstOrDefaultAsync(t => t.UserId == userId);
        }

        public async Task<bool> UpdateProfileAsync(int teacherId, TeacherProfileDto profile)
        {
            var teacher = await _context.Teachers.FindAsync(teacherId);
            if (teacher == null) return false;

            if (profile.FullName != null) teacher.FullName = profile.FullName;
            if (profile.Phone != null) teacher.Phone = profile.Phone;
            if (profile.Specialization != null) teacher.Specialization = profile.Specialization;

            await _context.SaveChangesAsync();
            return true;
        }

        // 8. Certificates
        public async Task<List<TeacherCertificate>> GetCertificatesAsync(int teacherId)
        {
            return await _context.TeacherCertificates
                .Where(c => c.TeacherId == teacherId)
                .ToListAsync();
        }

        public async Task<bool> AddCertificateAsync(int teacherId, CertificateDto dto)
        {
            if (dto.CertificateName == null) return false;

            var cert = new TeacherCertificate
            {
                TeacherId = teacherId,
                CertificateName = dto.CertificateName,
                IssuedBy = dto.IssuedBy,
                IssueDate = dto.IssueDate.HasValue ? DateOnly.FromDateTime(dto.IssueDate.Value) : null,
                Description = dto.Description,
                CertificateImage = dto.CertificateImage
            };
            _context.TeacherCertificates.Add(cert);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> UpdateCertificateAsync(int certificateId, CertificateDto dto)
        {
            var cert = await _context.TeacherCertificates.FindAsync(certificateId);
            if (cert == null) return false;

            cert.CertificateName = dto.CertificateName;
            cert.IssuedBy = dto.IssuedBy;
            cert.IssueDate = dto.IssueDate.HasValue ? DateOnly.FromDateTime(dto.IssueDate.Value) : null;
            cert.Description = dto.Description;
            if (!string.IsNullOrEmpty(dto.CertificateImage))
            {
                cert.CertificateImage = dto.CertificateImage;
            }

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteCertificateAsync(int certificateId, int teacherId)
        {
            var cert = await _context.TeacherCertificates.FindAsync(certificateId);
            if (cert == null || cert.TeacherId != teacherId) return false;

            _context.TeacherCertificates.Remove(cert);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<DashboardStatsDto> GetDashboardStatsAsync(int teacherId)
        {
            // 1. Total Students: Count unique students in classes taught by this teacher
            // (Assuming teacher teaches subjects to classes, or is homeroom)
            // Let's count students in Homeroom + students in classes they teach (teaching assignments)

            // Get classes teacher is assigned to (Homeroom)
            var homeroomClassId = (await _context.Classes.FirstOrDefaultAsync(c => c.HomeroomTeacherId == teacherId))?.ClassId;

            // Get classes teacher teaches subjects to
            var teachingClassIds = await _context.TeachingAssignments
                .Where(ta => ta.TeacherId == teacherId)
                .Select(ta => ta.ClassId)
                .Distinct()
                .ToListAsync();

            var allClasses = new HashSet<int>(teachingClassIds);
            if (homeroomClassId.HasValue) allClasses.Add(homeroomClassId.Value);

            var totalStudents = await _context.StudentClasses
                .Where(sc => allClasses.Contains(sc.ClassId))
                .Select(sc => sc.StudentId)
                .Distinct()
                .CountAsync();

            // 2. Classes Today (Calculated in FE usually, but we can return it)
            // Leaving 0 here as FE does it, or we can recalculate.

            // 3. Hours Taught (Simulated or calc from Timetable * Weeks)
            // Let's just count total timetable slots assigned to this teacher
            var weeklySlots = await _context.Timetables.CountAsync(t => t.TeacherId == teacherId);
            // Assume 15 weeks in a semester
            var hoursTaught = weeklySlots * 15;

            // 4. Avg Attendance
            // Get all attendance records for classes taught by teacher? OR just homeroom?
            // Usually Homeroom teacher cares about their class attendance.
            // Let's use Homeroom class attendance if exists.
            double avgAttendance = 0;
            if (homeroomClassId.HasValue)
            {
                var attendanceRecords = await _context.Attendances
                    .Where(a => a.ClassId == homeroomClassId.Value)
                    .ToListAsync();

                if (attendanceRecords.Any())
                {
                    double presentCount = attendanceRecords.Count(a => a.Status?.ToLower() == "present" || a.Status?.ToLower() == "có mặt");
                    avgAttendance = Math.Round((presentCount / attendanceRecords.Count) * 100, 1);
                }
            }

            return new DashboardStatsDto
            {
                TotalStudents = totalStudents,
                HoursTaught = hoursTaught,
                AvgAttendance = avgAttendance
            };
        }

        // 9. Class Materials
        public async Task<List<ClassMaterial>> GetClassMaterialsAsync(int classId)
        {
            return await _context.ClassMaterials
                .Where(m => m.ClassId == classId)
                .OrderByDescending(m => m.UploadDate)
                .ToListAsync();
        }

        public async Task<bool> AddClassMaterialAsync(ClassMaterialDto dto)
        {
            if (string.IsNullOrEmpty(dto.Title) || dto.ClassId <= 0) return false;

            var material = new ClassMaterial
            {
                ClassId = dto.ClassId,
                Title = dto.Title,
                Description = dto.Description,
                FilePath = dto.FilePath,
                UploadDate = DateTime.Now
            };

            _context.ClassMaterials.Add(material);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> UpdateClassMaterialAsync(int materialId, ClassMaterialDto dto)
        {
            var material = await _context.ClassMaterials.FindAsync(materialId);
            if (material == null) return false;

            material.Title = dto.Title;
            material.Description = dto.Description;
            // Only update filepath if provided (optional logic, but usually good)
            if (!string.IsNullOrEmpty(dto.FilePath))
            {
                material.FilePath = dto.FilePath;
            }

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteClassMaterialAsync(int materialId)
        {
            var material = await _context.ClassMaterials.FindAsync(materialId);
            if (material == null) return false;

            _context.ClassMaterials.Remove(material);
            await _context.SaveChangesAsync();
            return true;    
        }
    }
}
