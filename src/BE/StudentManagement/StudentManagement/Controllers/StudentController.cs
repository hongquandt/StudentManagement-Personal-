using Microsoft.AspNetCore.Mvc;
using StudentManagement.Models;
using StudentManagement.Services;

namespace StudentManagement.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class StudentController : ControllerBase
    {
        private readonly IStudentService _studentService;

        public StudentController(IStudentService studentService)
        {
            _studentService = studentService;
        }

        [HttpGet("profile/{userId}")]
        public async Task<IActionResult> GetProfile(int userId)
        {
            var student = await _studentService.GetStudentByUserIdAsync(userId);
            if (student == null) return NotFound("Student profile not found.");

            return Ok(new
            {
                student.StudentId,
                student.FullName,
                student.Address,
                student.DateOfBirth,
                Gender = student.Gender == "M" ? "Male" : (student.Gender == "F" ? "Female" : (student.Gender == "O" ? "Other" : student.Gender)),
                Email = student.User.Email,
                student.User.Username,
                student.User.AvatarUrl,
                student.User.CitizenIdImage,
                student.User.Ethnicity
            });
        }

        [HttpPut("profile/{userId}")]
        public async Task<IActionResult> UpdateProfile(int userId, [FromBody] StudentUpdateModel model)
        {
            var result = await _studentService.UpdateProfileAsync(userId, model);
            if (!result) return BadRequest("Failed to update profile.");
            return Ok("Profile updated successfully.");
        }

        [HttpGet("attendance/{studentId}")]
        public async Task<IActionResult> GetAttendance(int studentId)
        {
            var attendanceList = await _studentService.GetAttendanceAsync(studentId);
            return Ok(attendanceList.Select(a => new
            {
                a.AttendanceId,
                a.Date,
                Status = a.Status,
                ClassName = a.Class.ClassName
            }));
        }

        [HttpGet("scores/{studentId}")]
        public async Task<IActionResult> GetScores(int studentId)
        {
            var scores = await _studentService.GetScoresAsync(studentId);
            return Ok(scores.Select(s => new
            {
                s.ScoreId,
                SubjectName = s.Subject.SubjectName,
                SemesterName = s.Semester.SemesterName,
                s.MidtermScore,
                s.FinalScore,
                s.AverageScore
            }));
        }

        [HttpGet("timetable/{studentId}")]
        public async Task<IActionResult> GetTimetable(int studentId)
        {
            var timetable = await _studentService.GetTimetableAsync(studentId);
            return Ok(timetable.Select(t => new
            {
                t.TimetableId,
                t.DayOfWeek,
                t.Period,
                SubjectName = t.Subject.SubjectName,
                TeacherName = t.Teacher.FullName,
                t.RoomNumber
            }));
        }

        [HttpGet("conduct/{studentId}")]
        public async Task<IActionResult> GetConduct(int studentId)
        {
            var conduct = await _studentService.GetConductAsync(studentId);
            return Ok(conduct.Select(c => new
            {
                c.ConductId,
                c.ConductLevel,
                c.Comment,
                SemesterName = c.Semester.SemesterName
            }));
        }

        [HttpGet("materials/{studentId}")]
        public async Task<IActionResult> GetMaterials(int studentId)
        {
            var materials = await _studentService.GetMaterialsAsync(studentId);
            return Ok(materials.Select(m => new
            {
                m.MaterialId,
                m.Title,
                m.Description,
                m.FilePath,
                m.UploadDate,
                ClassName = m.Class.ClassName
            }));
        }
    }
}
