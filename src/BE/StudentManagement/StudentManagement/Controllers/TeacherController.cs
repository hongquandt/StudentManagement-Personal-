using Microsoft.AspNetCore.Mvc;
using StudentManagement.Models;
using StudentManagement.Services;

namespace StudentManagement.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TeacherController : ControllerBase
    {
        private readonly ITeacherService _teacherService;

        public TeacherController(ITeacherService teacherService)
        {
            _teacherService = teacherService;
        }

        // Get TeacherId from UserId (helper for frontend if needed, but usually FE sends UserID or we find it)
        // Ideally, we get UserId from Token. For now, assuming UserId is passed or we resolve it.
        [HttpGet("get-teacher-id/{userId}")]
        public async Task<IActionResult> GetTeacherId(int userId)
        {
            var id = await _teacherService.GetTeacherIdByUserIdAsync(userId);
            if (id == null) return NotFound("Teacher not found for this user.");
            return Ok(id);
        }

        // 1. Homeroom
        [HttpGet("homeroom/{teacherId}")]
        public async Task<IActionResult> GetHomeroom(int teacherId)
        {
            var homeroomClass = await _teacherService.GetHomeroomClassAsync(teacherId);
            if (homeroomClass == null) return Ok(new { Message = "No homeroom class assigned." });

            var students = await _teacherService.GetHomeroomStudentsAsync(homeroomClass.ClassId);
            
            return Ok(new 
            {
                ClassInfo = homeroomClass,
                Students = students
            });
        }

        [HttpGet("classes/{teacherId}")]
        public async Task<IActionResult> GetTeachingClasses(int teacherId)
        {
            var classes = await _teacherService.GetTeachingClassesAsync(teacherId);
            return Ok(classes);
        }

        // 2. Timetable
        [HttpGet("timetable/{teacherId}")]
        public async Task<IActionResult> GetTimetable(int teacherId)
        {
            var timetable = await _teacherService.GetTimetableAsync(teacherId);
            return Ok(timetable);
        }

        // Stats
        [HttpGet("stats/{teacherId}")]
        public async Task<IActionResult> GetStats(int teacherId)
        {
            var stats = await _teacherService.GetDashboardStatsAsync(teacherId);
            return Ok(stats);
        }

        // 3. Requests
        [HttpPost("requests/{teacherId}")]
        public async Task<IActionResult> CreateRequest(int teacherId, [FromBody] TeacherRequestDto request)
        {
            var result = await _teacherService.CreateRequestAsync(teacherId, request);
            if (result) return Ok("Request submitted.");
            return BadRequest("Failed to submit request.");
        }

        [HttpGet("requests/{teacherId}")]
        public async Task<IActionResult> GetRequests(int teacherId)
        {
            var requests = await _teacherService.GetRequestsAsync(teacherId);
            return Ok(requests);
        }

        // 4. Attendance
        [HttpGet("attendance/{classId}/{date}")]
        public async Task<IActionResult> GetAttendance(int classId, DateTime date)
        {
            var list = await _teacherService.GetAttendanceAsync(classId, date);
            return Ok(list);
        }

        [HttpPost("attendance")]
        public async Task<IActionResult> SaveAttendance([FromBody] List<AttendanceDto> attendanceList)
        {
            var result = await _teacherService.SaveAttendanceAsync(attendanceList);
            return Ok(result ? "Attendance saved." : "Failed to save.");
        }

        // 5. Grades
        [HttpGet("grades/{classId}/{subjectId}/{semesterId}")]
        public async Task<IActionResult> GetGrades(int classId, int subjectId, int semesterId)
        {
            var list = await _teacherService.GetScoresAsync(classId, subjectId, semesterId);
            return Ok(list);
        }

        [HttpPost("grades")]
        public async Task<IActionResult> SaveGrades([FromBody] List<ScoreDto> scores)
        {
            var result = await _teacherService.SaveScoresAsync(scores);
            return Ok(result ? "Grades saved." : "Failed to save.");
        }

        // 6. Conduct
        [HttpGet("conduct/{classId}/{semesterId}")]
        public async Task<IActionResult> GetConduct(int classId, int semesterId)
        {
            var list = await _teacherService.GetConductsAsync(classId, semesterId);
            return Ok(list);
        }

        [HttpPost("conduct")]
        public async Task<IActionResult> SaveConduct([FromBody] List<ConductDto> conducts)
        {
             var result = await _teacherService.SaveConductsAsync(conducts);
             return Ok(result ? "Conduct saved." : "Failed to save.");
        }

        // 7. Profile
        [HttpGet("profile/{userId}")]
        public async Task<IActionResult> GetProfile(int userId)
        {
            // Note: This gets by UserId (from login), returns Teacher + User info
            var profile = await _teacherService.GetProfileAsync(userId);
            if (profile == null) return NotFound();
            return Ok(profile);
        }

        [HttpPut("profile/{teacherId}")]
        public async Task<IActionResult> UpdateProfile(int teacherId, [FromBody] TeacherProfileDto dto)
        {
            var result = await _teacherService.UpdateProfileAsync(teacherId, dto);
            return Ok(result ? "Profile updated." : "Failed.");
        }

        // 8. Certificates
        [HttpGet("certificates/{teacherId}")]
        public async Task<IActionResult> GetCertificates(int teacherId)
        {
            var list = await _teacherService.GetCertificatesAsync(teacherId);
            return Ok(list);
        }

        [HttpPost("certificates/{teacherId}")]
        public async Task<IActionResult> AddCertificate(int teacherId, [FromBody] CertificateDto dto)
        {
            var result = await _teacherService.AddCertificateAsync(teacherId, dto);
            return Ok(result ? "Certificate added." : "Failed.");
        }

        [HttpDelete("certificates/{teacherId}/{certId}")]
        public async Task<IActionResult> DeleteCertificate(int teacherId, int certId)
        {
            var result = await _teacherService.DeleteCertificateAsync(certId, teacherId);
            return Ok(result ? "Certificate deleted." : "Failed.");
        }
    }
}
