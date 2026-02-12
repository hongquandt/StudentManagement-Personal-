using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StudentManagement.Models;
using StudentManagement.Services;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace StudentManagement.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    // [Authorize(Roles = "Admin")] // Keeping commented out for testing, user can uncomment
    public class AdminController : ControllerBase
    {
        private readonly IAdminService _adminService;

        public AdminController(IAdminService adminService)
        {
            _adminService = adminService;
        }

        // --- School Year & Semester ---
        [HttpGet("academic-years")]
        public async Task<ActionResult<IEnumerable<AcademicYear>>> GetAcademicYears()
        {
            return Ok(await _adminService.GetAllAcademicYearsAsync());
        }

        [HttpPost("academic-years")]
        public async Task<ActionResult<AcademicYear>> CreateAcademicYear(AcademicYear year)
        {
            var created = await _adminService.CreateAcademicYearAsync(year);
            return CreatedAtAction(nameof(GetAcademicYears), new { id = created.AcademicYearId }, created);
        }

        [HttpPut("academic-years/{id}")]
        public async Task<IActionResult> UpdateAcademicYear(int id, AcademicYear year)
        {
            if (id != year.AcademicYearId) return BadRequest();
            await _adminService.UpdateAcademicYearAsync(year);
            return NoContent();
        }

        [HttpDelete("academic-years/{id}")]
        public async Task<IActionResult> DeleteAcademicYear(int id)
        {
            var result = await _adminService.DeleteAcademicYearAsync(id);
            if (!result) return NotFound();
            return NoContent();
        }

        // ... Semesters ...
        [HttpGet("semesters")]
        public async Task<ActionResult<IEnumerable<Semester>>> GetSemesters()
        {
            return Ok(await _adminService.GetAllSemestersAsync());
        }

        [HttpPost("semesters")]
        public async Task<ActionResult<Semester>> CreateSemester(StudentManagement.Models.DTO.CreateSemesterDto dto)
        {
            var semester = new Semester
            {
                SemesterName = dto.SemesterName,
                AcademicYearId = dto.AcademicYearId,
                StartDate = dto.StartDate,
                EndDate = dto.EndDate
            };
             var created = await _adminService.CreateSemesterAsync(semester);
            return CreatedAtAction(nameof(GetSemesters), new { id = created.SemesterId }, created);
        }

        [HttpPut("semesters/{id}")]
        public async Task<IActionResult> UpdateSemester(int id, StudentManagement.Models.DTO.CreateSemesterDto dto)
        {
            if (id != dto.SemesterId) return BadRequest();
            var semester = new Semester
            {
                SemesterId = dto.SemesterId,
                SemesterName = dto.SemesterName,
                AcademicYearId = dto.AcademicYearId,
                StartDate = dto.StartDate,
                EndDate = dto.EndDate
            };
            await _adminService.UpdateSemesterAsync(semester);
            return NoContent();
        }
        
        // --- Class Management ---
        [HttpGet("classes")]
        public async Task<ActionResult<IEnumerable<Class>>> GetClasses()
        {
            return Ok(await _adminService.GetAllClassesAsync());
        }

        [HttpPost("classes")]
        public async Task<ActionResult<Class>> CreateClass(StudentManagement.Models.DTO.CreateClassDto dto)
        {
            var newClass = new Class
            {
                ClassName = dto.ClassName,
                Grade = dto.Grade,
                AcademicYearId = dto.AcademicYearId,
                HomeroomTeacherId = dto.HomeroomTeacherId
            };
            var created = await _adminService.CreateClassAsync(newClass);
            return CreatedAtAction(nameof(GetClasses), new { id = created.ClassId }, created);
        }

        [HttpDelete("classes/{id}")]
        public async Task<IActionResult> DeleteClass(int id)
        {
            var result = await _adminService.DeleteClassAsync(id);
            if (!result) return NotFound();
            return NoContent();
        }

        [HttpPost("classes/merge")]
        public async Task<IActionResult> MergeClasses([FromQuery] int sourceId, [FromQuery] int destId)
        {
            var result = await _adminService.MergeClassesAsync(sourceId, destId);
            if (!result) return BadRequest("Merge failed.");
            return Ok("Classes merged successfully.");
        }

        [HttpPost("classes/{id}/assign-homeroom")]
        public async Task<IActionResult> AssignHomeroom(int id, [FromBody] int teacherId)
        {
            var result = await _adminService.AssignHomeroomTeacherAsync(id, teacherId);
            if (!result) return BadRequest();
            return Ok();
        }

        [HttpPost("classes/{id}/assign-student")]
        public async Task<IActionResult> AssignStudent(int id, [FromBody] int studentId)
        {
            var result = await _adminService.AssignStudentToClassAsync(studentId, id);
            if (!result) return BadRequest("Failed to assign student.");
            return Ok();
        }

        [HttpGet("teachers-simple")]
        public async Task<ActionResult<IEnumerable<object>>> GetTeachersSimple()
        {
            // Fetch users with teacher role or just teachers
            // Using a simple projection to avoid cycles
            var users = await _adminService.GetAllUsersAsync();
            var teachers = users
                .Where(u => u.Teacher != null)
                .Select(u => new 
                {
                    TeacherId = u.Teacher!.TeacherId,
                    FullName = u.Teacher.FullName
                })
                .ToList();
            return Ok(teachers);
        }

        [HttpGet("classes/{id}")]
        public async Task<ActionResult<StudentManagement.Models.DTO.ClassDetailDto>> GetClassDetails(int id)
        {
            var cls = await _adminService.GetClassDetailsAsync(id);
            if (cls == null) return NotFound();

            var dto = new StudentManagement.Models.DTO.ClassDetailDto
            {
                ClassId = cls.ClassId,
                ClassName = cls.ClassName,
                Grade = cls.Grade,
                HomeroomTeacherName = cls.HomeroomTeacher?.FullName,
                AcademicYear = cls.AcademicYear?.YearName,
                Students = cls.StudentClasses.Select(sc => new StudentManagement.Models.DTO.ClassStudentDto
                {
                    StudentId = sc.Student.StudentId,
                    FullName = sc.Student.FullName,
                    Gender = sc.Student.Gender,
                    DateOfBirth = sc.Student.DateOfBirth
                }).ToList()
            };
            return Ok(dto);
        }

        // --- Teacher Assignment (Subject) ---
        [HttpPost("assignments")]
        public async Task<IActionResult> AssignSubjectTeacher(TeachingAssignment assignment)
        {
             await _adminService.AssignSubjectTeacherAsync(assignment);
             return Ok();
        }

        [HttpDelete("assignments/{id}")]
        public async Task<IActionResult> RemoveSubjectTeacher(int id)
        {
             var result = await _adminService.RemoveSubjectTeacherAsync(id);
             if (!result) return NotFound();
             return NoContent();
        }

        // --- Course Management ---
        [HttpGet("subjects")]
        public async Task<ActionResult<IEnumerable<Subject>>> GetSubjects()
        {
            return Ok(await _adminService.GetAllSubjectsAsync());
        }

        [HttpPost("subjects")]
        public async Task<ActionResult<Subject>> CreateSubject(StudentManagement.Models.DTO.CreateSubjectDto dto)
        {
            var subject = new Subject
            {
                SubjectName = dto.SubjectName,
                Credit = dto.Credit
            };
            var created = await _adminService.CreateSubjectAsync(subject);
            return CreatedAtAction(nameof(GetSubjects), new { id = created.SubjectId }, created);
        }

        [HttpPut("subjects/{id}")]
        public async Task<IActionResult> UpdateSubject(int id, StudentManagement.Models.DTO.CreateSubjectDto dto)
        {
             if (id != dto.SubjectId) return BadRequest();
             var subject = new Subject
             {
                 SubjectId = dto.SubjectId,
                 SubjectName = dto.SubjectName,
                 Credit = dto.Credit
             };
             await _adminService.UpdateSubjectAsync(subject);
             return NoContent();
        }
        
        [HttpDelete("subjects/{id}")]
        public async Task<IActionResult> DeleteSubject(int id)
        {
            var result = await _adminService.DeleteSubjectAsync(id);
             if (!result) return NotFound();
             return NoContent();
        }

        // --- Schedule Management ---
        [HttpGet("timetables")]
        public async Task<ActionResult<IEnumerable<Timetable>>> GetTimetables([FromQuery] int? classId, [FromQuery] int? teacherId, [FromQuery] int? semesterId)
        {
            return Ok(await _adminService.GetTimetablesAsync(classId, teacherId, semesterId));
        }

        [HttpPost("timetables")]
        public async Task<IActionResult> CreateTimetableEntry(Timetable timetable)
        {
            try 
            {
                var created = await _adminService.CreateTimetableEntryAsync(timetable);
                return CreatedAtAction(nameof(GetTimetables), new { id = created.TimetableId }, created);
            }
            catch (System.Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
        
        [HttpPut("timetables/{id}")]
        public async Task<IActionResult> UpdateTimetableEntry(int id, Timetable timetable)
        {
             if (id != timetable.TimetableId) return BadRequest();
             try
             {
                 var result = await _adminService.UpdateTimetableEntryAsync(timetable);
                 if (!result) return NotFound();
                 return NoContent();
             }
             catch (System.Exception ex)
             {
                 return BadRequest(ex.Message);
             }
        }

        [HttpDelete("timetables/{id}")]
        public async Task<IActionResult> DeleteTimetableEntry(int id)
        {
             var result = await _adminService.DeleteTimetableEntryAsync(id);
             if (!result) return NotFound();
             return NoContent();
        }

        // --- User Management ---
        [HttpGet("users")]
        public async Task<ActionResult<IEnumerable<User>>> GetUsers()
        {
             return Ok(await _adminService.GetAllUsersAsync());
        }

        [HttpPost("users/{id}/ban")]
        public async Task<IActionResult> BanUser(int id)
        {
             var result = await _adminService.BanUserAsync(id);
             if (!result) return NotFound();
             return Ok();
        }

        [HttpPut("users")]
        public async Task<IActionResult> UpdateUser([FromBody] StudentManagement.Models.DTO.UpdateUserDto dto)
        {
             // Map DTO to User entity manually for Service call
             var user = new User
             {
                 UserId = dto.UserId,
                 Email = dto.Email,
                 IsActive = dto.IsActive,
                 Ethnicity = dto.Ethnicity,
                 CitizenIdImage = dto.CitizenIdImage,
                 AvatarUrl = dto.AvatarUrl
             };

             if (dto.Student != null)
             {
                 user.Student = new Student
                 {
                     FullName = dto.Student.FullName ?? "", // Service handles if it's there
                     Gender = dto.Student.Gender,
                     DateOfBirth = dto.Student.DateOfBirth,
                     Address = dto.Student.Address,
                     EnrollmentYear = dto.Student.EnrollmentYear,
                     Status = dto.Student.Status
                 };
             }

             if (dto.Teacher != null)
             {
                 user.Teacher = new Teacher
                 {
                     FullName = dto.Teacher.FullName ?? "",
                     Specialization = dto.Teacher.Specialization,
                     Phone = dto.Teacher.Phone
                 };
             }

             await _adminService.UpdateUserAsync(user);
             return Ok();
        }

        [HttpPost("users/{id}/unban")]
        public async Task<IActionResult> UnbanUser(int id)
        {
             var result = await _adminService.UnbanUserAsync(id);
             if (!result) return NotFound();
             return Ok();
        }

        // --- Teacher Requests ---
        [HttpGet("teacher-requests")]
        public async Task<ActionResult<IEnumerable<TeacherRequest>>> GetPendingRequests()
        {
             return Ok(await _adminService.GetPendingTeacherRequestsAsync());
        }

        [HttpPost("teacher-requests/{id}/approve")]
        public async Task<IActionResult> ApproveRequest(int id)
        {
             var result = await _adminService.ApproveTeacherRequestAsync(id);
             if (!result) return NotFound();
             return Ok();
        }

        [HttpPost("teacher-requests/{id}/reject")]
        public async Task<IActionResult> RejectRequest(int id)
        {
             var result = await _adminService.RejectTeacherRequestAsync(id);
             if (!result) return NotFound();
             return Ok();
        }

        [HttpGet("dashboard-stats")]
        public async Task<ActionResult<StudentManagement.Models.DTO.AdminDashboardStats>> GetDashboardStats()
        {
            return Ok(await _adminService.GetDashboardStatsAsync());
        }
    }
}
