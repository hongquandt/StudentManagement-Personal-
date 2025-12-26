using StudentManagement.Controllers;
using StudentManagement.Models;
using StudentManagement.Repositories;
using System.Net;
using System.Security.Cryptography;
using System.Text;

namespace StudentManagement.Services
{
    public class AuthService : IAuthService
    {
        private readonly IAuthRepository _repository;
        private readonly IEmailService _emailService;

        public AuthService(IAuthRepository repository, IEmailService emailService)
        {
            _repository = repository;
            _emailService = emailService;
        }

        public async Task<User?> LoginAsync(string username, string password)
        {
            var user = await _repository.GetUserByUsernameAsync(username);
            if (user == null) return null;

            string hashedPassword = ComputeSha256Hash(password);
            if (user.PasswordHash != hashedPassword) return null;

            if (user.IsActive == false) return null;

            return user;
        }

        public async Task<bool> RegisterAsync(RegisterRequest request)
        {
            if (await _repository.UserExistsAsync(request.Username))
            {
                throw new Exception("Username already exists.");
            }

            // Using a simple logic here, assuming typical transaction handling is done via EF Core or simple sequence.
            // Since we're separating logic, we might not have direct transaction control across multiple repository calls 
            // unless we introduce UnitOfWork or use transaction scope. For now, we'll keep it simple as Repository saves changes individually.
            // In a strict C-S-R, AuthService would orchestrate this.
            
            try 
            {
                var newUser = new User
                {
                    Username = request.Username,
                    PasswordHash = ComputeSha256Hash(request.Password),
                    Email = request.Email,
                    RoleId = 3, // Default to Student
                    IsActive = true,
                    CreatedAt = DateTime.Now
                };

                var createdUser = await _repository.CreateUserAsync(newUser);

                var newStudent = new Student
                {
                    UserId = createdUser.UserId,
                    FullName = request.FullName,
                    Status = "Đang học",
                    EnrollmentYear = DateTime.Now.Year
                };

                await _repository.CreateStudentAsync(newStudent);
                return true;
            }
            catch
            {
                // ideally rollback user creation if student creation fails, but keeping it simple for now
                // or user UnitOfWork pattern.
                throw;
            }
        }

        public async Task ForgotPasswordAsync(string email)
        {
            var user = await _repository.GetUserByEmailAsync(email);
            if (user == null) return; // Do not reveal if email exists

            // Generate Token
            var expiry = DateTime.UtcNow.AddMinutes(15).Ticks;
            var signature = ComputeHmacSha256(user.UserId + ":" + expiry, user.PasswordHash);
            var token = Convert.ToBase64String(Encoding.UTF8.GetBytes($"{user.UserId}:{expiry}:{signature}"));

            // Send Email
            var resetLink = $"http://localhost:5173/reset-password?token={WebUtility.UrlEncode(token)}&email={WebUtility.UrlEncode(email)}";
            var body = $"<p>Click <a href='{resetLink}'>here</a> to reset your password.</p>";

            await _emailService.SendEmailAsync(email, "Reset Password", body);
        }

        public async Task<bool> ResetPasswordAsync(string email, string tokenStr, string newPassword)
        {
            try
            {
                var user = await _repository.GetUserByEmailAsync(email);
                if (user == null) return false;

                var decodedBytes = Convert.FromBase64String(tokenStr);
                var decoded = Encoding.UTF8.GetString(decodedBytes);
                var parts = decoded.Split(':');

                if (parts.Length != 3) return false;

                var userId = int.Parse(parts[0]);
                var expiry = long.Parse(parts[1]);
                var signature = parts[2];

                if (userId != user.UserId) return false;
                if (DateTime.UtcNow.Ticks > expiry) return false;

                var expectedSignature = ComputeHmacSha256(userId + ":" + expiry, user.PasswordHash);
                if (signature != expectedSignature) return false;

                // Reset Password
                user.PasswordHash = ComputeSha256Hash(newPassword);
                await _repository.UpdateUserAsync(user);

                return true;
            }
            catch
            {
                return false;
            }
        }

        public async Task<bool> UpdateAvatarAsync(string username, string avatarUrl)
        {
            var user = await _repository.GetUserByUsernameAsync(username);
            if (user == null) return false;

            user.AvatarUrl = avatarUrl;
            await _repository.UpdateUserAsync(user);
            return true;
        }

        public async Task<User> ExternalLoginAsync(string email, string name, string? avatarUrl)
        {
            var user = await _repository.GetUserByEmailAsync(email);
            if (user != null) return user;

            // Register new user from external provider
            var randomPassword = Guid.NewGuid().ToString();
            var hashedPassword = ComputeSha256Hash(randomPassword);

            var newUser = new User
            {
                Username = email, // initial attempt
                PasswordHash = hashedPassword,
                Email = email,
                AvatarUrl = avatarUrl,
                RoleId = 3,
                IsActive = true,
                CreatedAt = DateTime.Now
            };

            if (await _repository.UserExistsAsync(newUser.Username))
            {
                newUser.Username = $"{email}_{Guid.NewGuid().ToString().Substring(0, 4)}";
            }

            var createdUser = await _repository.CreateUserAsync(newUser);

            var newStudent = new Student
            {
                UserId = createdUser.UserId,
                FullName = name,
                Status = "Active", // "Đang học" or "Active"
                EnrollmentYear = DateTime.Now.Year
            };

            await _repository.CreateStudentAsync(newStudent);
            createdUser.Student = newStudent; // Populate for return
            return createdUser;
        }

        private static string ComputeHmacSha256(string data, string key)
        {
            using (var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(key)))
            {
                var hash = hmac.ComputeHash(Encoding.UTF8.GetBytes(data));
                return Convert.ToBase64String(hash);
            }
        }

        private static string ComputeSha256Hash(string rawData)
        {
            using (SHA256 sha256Hash = SHA256.Create())
            {
                byte[] bytes = sha256Hash.ComputeHash(Encoding.UTF8.GetBytes(rawData));
                StringBuilder builder = new StringBuilder();
                for (int i = 0; i < bytes.Length; i++)
                {
                    builder.Append(bytes[i].ToString("x2"));
                }
                return builder.ToString();
            }
        }
    }
}
