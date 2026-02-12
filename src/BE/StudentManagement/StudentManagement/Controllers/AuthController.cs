using Microsoft.AspNetCore.Mvc;
using StudentManagement.Services;
using Microsoft.Extensions.Caching.Memory;

namespace StudentManagement.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;
        private readonly IMemoryCache _cache;

        private readonly IGeminiService _geminiService;

        public AuthController(IAuthService authService, IMemoryCache cache, IGeminiService geminiService)
        {
            _authService = authService;
            _cache = cache;
            _geminiService = geminiService;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            if (request == null || string.IsNullOrEmpty(request.Username) || string.IsNullOrEmpty(request.Password))
            {
                return BadRequest("Invalid request.");
            }

            // Verify Captcha
            if (string.IsNullOrEmpty(request.CaptchaKey) || string.IsNullOrEmpty(request.CaptchaCode))
            {
                return BadRequest("Mã Captcha là bắt buộc.");
            }

            if (!_cache.TryGetValue(request.CaptchaKey, out string? storedCode))
            {
                return BadRequest("Captcha đã hết hạn hoặc không hợp lệ.");
            }

            if (!string.Equals(storedCode, request.CaptchaCode, StringComparison.OrdinalIgnoreCase))
            {
                return BadRequest("Mã Captcha không chính xác.");
            }

            // Remove captcha after use to prevent replay
            _cache.Remove(request.CaptchaKey);

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
                FullName = user.Student?.FullName ?? user.Teacher?.FullName ?? user.Parent?.FullName ?? "Admin",
                StudentId = user.Student?.StudentId
            });
        }

        [HttpPost("login-with-face")]
        public async Task<IActionResult> LoginWithFace([FromBody] LoginWithFaceRequest request)
        {
            if (request == null || string.IsNullOrEmpty(request.Username) || string.IsNullOrEmpty(request.Password) || string.IsNullOrEmpty(request.FaceImage))
            {
                return BadRequest("Invalid request.");
            }

            // 1. Verify Credentials First
            var user = await _authService.LoginAsync(request.Username, request.Password);
            if (user == null)
            {
                return Unauthorized("Invalid username or password.");
            }

            // 2. Check if user has an Avatar (Reference Image)
            if (string.IsNullOrEmpty(user.AvatarUrl))
            {
                 return BadRequest("User does not have a profile picture to verify against. Please update your profile with a clear face photo first.");
            }

            // 3. Verify Face with AI
            bool isFaceValid = await _geminiService.VerifyFaceAsync(user.AvatarUrl, request.FaceImage);
            
            if (!isFaceValid)
            {
                return Unauthorized("Face verification failed. Please try again or use standard login.");
            }

            // 4. Return Token/User Info
            return Ok(new
            {
                user.UserId,
                user.Username,
                user.Email,
                Role = user.Role.RoleName,
                FullName = user.Student?.FullName ?? user.Teacher?.FullName ?? user.Parent?.FullName ?? "Admin",
                StudentId = user.Student?.StudentId
            });
        }

        [HttpGet("captcha")]
        public IActionResult GetCaptcha()
        {
            string code = GenerateRandomCode(5);
            string key = Guid.NewGuid().ToString();

            // Store in cache for 5 minutes
            _cache.Set(key, code, TimeSpan.FromMinutes(5));

            string svg = GenerateSvg(code);

            return Ok(new { Key = key, Svg = svg });
        }

        private string GenerateRandomCode(int length)
        {
            const string chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Removed confusing chars like I, 1, O, 0
            var random = new Random();
            return new string(Enumerable.Repeat(chars, length)
                .Select(s => s[random.Next(s.Length)]).ToArray());
        }

        private string GenerateSvg(string captchaCode)
        {
            var random = new Random();
            string width = "120";
            string height = "40";

            // Svg Builder
            var sb = new System.Text.StringBuilder();
            sb.Append($"<svg width='{width}' height='{height}' xmlns='http://www.w3.org/2000/svg' style='background-color:#f0f0f0; border-radius:4px; user-select:none;'>");

            // Random lines
            for (int i = 0; i < 7; i++)
            {
                 string color = String.Format("#{0:X6}", random.Next(0x1000000));
                 sb.Append($"<line x1='{random.Next(0, 120)}' y1='{random.Next(0, 40)}' x2='{random.Next(0, 120)}' y2='{random.Next(0, 40)}' stroke='{color}' stroke-width='1' opacity='0.5' />");
            }
            
            // Random dots
            for(int i=0; i < 30; i++) {
                 string color = String.Format("#{0:X6}", random.Next(0x1000000));
                 sb.Append($"<circle cx='{random.Next(0, 120)}' cy='{random.Next(0, 40)}' r='1' fill='{color}' opacity='0.5' />");
            }

            // Text with slight randomization in position/rotation is hard in pure SVG without JS, but we can do basic positioning
            // To keep it simple, just centered text for now, maybe split characters to jitter them
             int x = 10;
             foreach(char c in captchaCode) 
             {
                int y = 25 + random.Next(-5, 5);
                string color = "#000"; // Dark color for text
                sb.Append($"<text x='{x}' y='{y}' font-family='Arial' font-size='22' font-weight='bold' fill='{color}'>{c}</text>");
                x += 20;
             }

            sb.Append("</svg>");
            return sb.ToString();
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
                user.AvatarUrl,
                StudentId = user.Student?.StudentId
            });
        }

        [HttpPost("change-password")]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest request)
        {
            var result = await _authService.ChangePasswordAsync(request.UserId, request.OldPassword, request.NewPassword);
            if (!result) return BadRequest("Change password failed. Please check your old password.");
            return Ok("Password changed successfully.");
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
        public string CaptchaKey { get; set; }
        public string CaptchaCode { get; set; }
    }

    public class LoginWithFaceRequest
    {
        public string Username { get; set; }
        public string Password { get; set; }
        public string FaceImage { get; set; }
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

    public class ChangePasswordRequest
    {
        public int UserId { get; set; }
        public string OldPassword { get; set; }
        public string NewPassword { get; set; }
    }
}
