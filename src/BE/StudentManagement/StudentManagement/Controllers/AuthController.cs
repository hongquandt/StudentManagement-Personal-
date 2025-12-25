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
}
