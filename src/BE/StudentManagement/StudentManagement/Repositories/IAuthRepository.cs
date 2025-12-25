using StudentManagement.Models;

namespace StudentManagement.Repositories
{
    public interface IAuthRepository
    {
        Task<User?> GetUserByUsernameAsync(string username);
        Task<User?> GetUserByEmailAsync(string email);
        Task<bool> UserExistsAsync(string username);
        Task<bool> EmailExistsAsync(string email);
        Task<User> CreateUserAsync(User user);
        Task UpdateUserAsync(User user);
        Task CreateStudentAsync(Student student);
    }
}
