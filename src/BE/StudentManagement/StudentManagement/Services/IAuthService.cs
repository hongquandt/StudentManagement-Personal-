using StudentManagement.Controllers;
using StudentManagement.Models;

namespace StudentManagement.Services
{
    public interface IAuthService
    {
        Task<User?> LoginAsync(string username, string password);
        Task<bool> RegisterAsync(RegisterRequest request);
        Task ForgotPasswordAsync(string email);
        Task<bool> ResetPasswordAsync(string email, string token, string newPassword);
    }
}
