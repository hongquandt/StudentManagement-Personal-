using Microsoft.AspNetCore.Mvc;
using StudentManagement.Services;

namespace StudentManagement.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            if (request == null || string.IsNullOrEmpty(request.Username) || string.IsNullOrEmpty(request.Password))
            {
                return BadRequest("Invalid request.");
            }

            var user = await _authService.LoginAsync(request.Username, request.Password);

            if (user == null)
            {
                return Unauthorized("Invalid username or password.");
            }

            // Return user info (excluding password)
            return Ok(new
            {
                user.UserId,
                user.Username,
                user.Email,
                Role = user.Role.RoleName,
                FullName = user.Student?.FullName ?? user.Teacher?.FullName ?? user.Parent?.FullName ?? "Admin"
            });
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
            if (request == null) return BadRequest("Invalid request.");

            try
            {
                await _authService.RegisterAsync(request);
                return Ok("Registration successful.");
            }
            catch (Exception ex)
            {
                if (ex.Message == "Username already exists.")
                {
                    return BadRequest(ex.Message);
                }
                return StatusCode(500, "Internal server error: " + ex.Message);
            }
        }

        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequest request)
        {
            await _authService.ForgotPasswordAsync(request.Email);
            return Ok("If email exists, a reset link has been sent.");
        }

        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest request)
        {
            var result = await _authService.ResetPasswordAsync(request.Email, request.Token, request.NewPassword);
            if (!result) return BadRequest("Invalid or expired token.");
            return Ok("Password reset successfully.");
        }
        [HttpPost("external-login")]
        public async Task<IActionResult> ExternalLogin([FromBody] ExternalLoginRequest request)
        {
            if (request == null || string.IsNullOrEmpty(request.Email))
                return BadRequest("Invalid request.");

            var user = await _authService.ExternalLoginAsync(request.Email, request.Name, request.AvatarUrl);

            // Fetch role name if Role object is null (newly created user)
            string roleName = user.Role?.RoleName;
            if (string.IsNullOrEmpty(roleName))
            {
                // Fallback map based on RoleId
                roleName = user.RoleId switch
                {
                    1 => "Admin",
                    2 => "Teacher",
                    3 => "Student",
                    4 => "parent",
                    _ => "Student"
                };
            }

            return Ok(new
            {
                user.UserId,
                user.Username,
                user.Email,
                Role = roleName,
                FullName = user.Student?.FullName ?? user.Teacher?.FullName ?? user.Parent?.FullName ?? request.Name,
                user.AvatarUrl
            });
        }

        [HttpPost("update-avatar")]
        public async Task<IActionResult> UpdateAvatar([FromBody] UpdateAvatarRequest request)
        {
            var result = await _authService.UpdateAvatarAsync(request.Username, request.AvatarUrl);
            if (!result) return NotFound("User not found.");
            return Ok(new { Message = "Avatar updated successfully.", AvatarUrl = request.AvatarUrl });
        }
    }

    public class LoginRequest
    {
        public string Username { get; set; }
        public string Password { get; set; }
    }

    public class RegisterRequest
    {
        public string FullName { get; set; }
        public string Username { get; set; }
        public string Email { get; set; }
        public string Password { get; set; }
    }

    public class ForgotPasswordRequest
    {
        public string Email { get; set; }
    }

    public class ResetPasswordRequest
    {
        public string Email { get; set; }
        public string Token { get; set; }
        public string NewPassword { get; set; }
    }

    public class ExternalLoginRequest
    {
        public string Email { get; set; }
        public string Name { get; set; }
        public string? AvatarUrl { get; set; }
        public string Provider { get; set; }
    }

    public class UpdateAvatarRequest
    {
        public string Username { get; set; }
        public string AvatarUrl { get; set; }
    }
}
