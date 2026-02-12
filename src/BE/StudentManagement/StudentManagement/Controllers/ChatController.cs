using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StudentManagement.Models;

namespace StudentManagement.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ChatController : ControllerBase
    {
        private readonly StudentManagementContext _context;

        public ChatController(StudentManagementContext context)
        {
            _context = context;
        }

        [HttpGet("contacts/{userId}")]
        public async Task<IActionResult> GetContacts(int userId)
        {
            // Get users who have exchanged messages with this user OR all teachers/students
            // For simplicity, let's return all users except self, or better:
            // If Student: Return Teachers they study with + Homeroom
            // If Teacher: Return Students they teach
            // For now: Return everyone with role 'Teacher' or 'Student' except self
            // Optimization: Just return list of users involved in recent chats + logic to find new people.
            
            // returning all active users for simplicity
             var users = await _context.Users
                .Where(u => u.UserId != userId && u.IsActive == true && (u.RoleId == 2 || u.RoleId == 3)) // Teachers & Students
                .Select(u => new 
                {
                    u.UserId,
                    u.Username,
                    FullName = u.Role.RoleName == "teacher" ? u.Teacher.FullName : u.Student.FullName,
                    u.AvatarUrl,
                    Role = u.Role.RoleName
                })
                .ToListAsync();

            return Ok(users);
        }

        [HttpGet("history/{userId1}/{userId2}")]
        public async Task<IActionResult> GetChatHistory(int userId1, int userId2)
        {
            var messages = await _context.Messages
                .Where(m => (m.SenderId == userId1 && m.ReceiverId == userId2) || 
                            (m.SenderId == userId2 && m.ReceiverId == userId1))
                .OrderBy(m => m.SentAt)
                .Select(m => new 
                {
                    m.MessageId,
                    m.SenderId,
                    m.ReceiverId,
                    m.Content,
                    m.SentAt,
                    m.IsRead
                })
                .ToListAsync();

            return Ok(messages);
        }
    }
}
