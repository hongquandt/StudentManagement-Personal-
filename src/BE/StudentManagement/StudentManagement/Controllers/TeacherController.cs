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

        [HttpPut("student/{studentId}")]
        public async Task<IActionResult> UpdateStudent(int studentId, [FromBody] StudentUpdateDto dto)
        {
            var result = await _teacherService.UpdateStudentAsync(studentId, dto);
            if (result) return Ok("Updated student.");
            return BadRequest("Failed to update.");
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

        [HttpPut("requests/{requestId}")]
        public async Task<IActionResult> UpdateRequest(int requestId, [FromBody] TeacherRequestDto request)
        {
            var result = await _teacherService.UpdateRequestAsync(requestId, request);
            if (result) return Ok("Request updated.");
            return BadRequest("Failed to update request.");
        }

        [HttpDelete("requests/{requestId}")]
        public async Task<IActionResult> DeleteRequest(int requestId)
        {
            var result = await _teacherService.DeleteRequestAsync(requestId);
            if (result) return Ok("Request deleted.");
            return BadRequest("Failed to delete request.");
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

        [HttpPut("certificates/{certId}")]
        public async Task<IActionResult> UpdateCertificate(int certId, [FromBody] CertificateDto dto)
        {
            var result = await _teacherService.UpdateCertificateAsync(certId, dto);
            return Ok(result ? "Certificate updated." : "Failed.");
        }

        [HttpDelete("certificates/{teacherId}/{certId}")]
        public async Task<IActionResult> DeleteCertificate(int teacherId, int certId)
        {
            var result = await _teacherService.DeleteCertificateAsync(certId, teacherId);
            return Ok(result ? "Certificate deleted." : "Failed.");
        }

        // 9. Class Materials
        [HttpGet("materials/{classId}")]
        public async Task<IActionResult> GetClassMaterials(int classId)
        {
            var materials = await _teacherService.GetClassMaterialsAsync(classId);
            return Ok(materials);
        }

        [HttpPost("materials")]
        public async Task<IActionResult> AddClassMaterial([FromForm] ClassMaterialUploadModel model)
        {
            if (model.ClassId <= 0 || string.IsNullOrEmpty(model.Title)) return BadRequest("Invalid data.");

            string filePath = model.Url; // Keep URL if provided

            if (model.File != null)
            {
                var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "materials");
                if (!Directory.Exists(uploadsFolder)) Directory.CreateDirectory(uploadsFolder);

                var uniqueFileName = $"{Guid.NewGuid()}_{model.File.FileName}";
                var fileSystemPath = Path.Combine(uploadsFolder, uniqueFileName);

                using (var stream = new FileStream(fileSystemPath, FileMode.Create))
                {
                    await model.File.CopyToAsync(stream);
                }
                
                // Return relative path or full URL. Usually relative path for static files.
                // Assuming standard static file serving:
                filePath = $"/uploads/materials/{uniqueFileName}";
            }

            var dto = new ClassMaterialDto
            {
                ClassId = model.ClassId,
                Title = model.Title,
                Description = model.Description,
                FilePath = filePath
            };

            var result = await _teacherService.AddClassMaterialAsync(dto);
            return Ok(result ? "Material added." : "Failed to add.");
        }

        [HttpPut("materials/{materialId}")]
        public async Task<IActionResult> UpdateClassMaterial(int materialId, [FromForm] ClassMaterialUploadModel model)
        {
            // First, simple check
            if (materialId <= 0) return BadRequest("Invalid ID");

            string filePath = model.Url; // Keep exisiting or new URL

            if (model.File != null)
            {
                var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "materials");
                if (!Directory.Exists(uploadsFolder)) Directory.CreateDirectory(uploadsFolder);

                var uniqueFileName = $"{Guid.NewGuid()}_{model.File.FileName}";
                var fileSystemPath = Path.Combine(uploadsFolder, uniqueFileName);

                using (var stream = new FileStream(fileSystemPath, FileMode.Create))
                {
                    await model.File.CopyToAsync(stream);
                }
                
                filePath = $"/uploads/materials/{uniqueFileName}";
            }

            var dto = new ClassMaterialDto
            {
                // ClassId is technically not needed for Update usually, but Service might ignore or use it. 
                // Let's pass what we have.
                ClassId = model.ClassId, 
                Title = model.Title,
                Description = model.Description,
                FilePath = filePath
            };

            var result = await _teacherService.UpdateClassMaterialAsync(materialId, dto);
            return Ok(result ? "Material updated." : "Failed to update.");
        }

        [HttpDelete("materials/{materialId}")]
        public async Task<IActionResult> DeleteClassMaterial(int materialId)
        {
            var result = await _teacherService.DeleteClassMaterialAsync(materialId);
            return Ok(result ? "Material deleted." : "Failed to delete.");
        }
    }

    public class ClassMaterialUploadModel
    {
        public int ClassId { get; set; }
        public string Title { get; set; }
        public string? Description { get; set; }
        public string? Url { get; set; } // For legacy or direct link
        public IFormFile? File { get; set; }
    }
}
