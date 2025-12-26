using StudentManagement.Models;
using StudentManagement.Repositories;

namespace StudentManagement.Services
{
    public class StudentService : IStudentService
    {
        private readonly IStudentRepository _studentRepository;
        private readonly IAuthRepository _authRepository; // Need this to update User email

        public StudentService(IStudentRepository studentRepository, IAuthRepository authRepository)
        {
            _studentRepository = studentRepository;
            _authRepository = authRepository;
        }

        public async Task<Student?> GetStudentByUserIdAsync(int userId)
        {
            return await _studentRepository.GetStudentByUserIdAsync(userId);
        }

        public async Task<IEnumerable<Attendance>> GetAttendanceAsync(int studentId)
        {
            return await _studentRepository.GetAttendanceByStudentIdAsync(studentId);
        }

        public async Task<IEnumerable<Score>> GetScoresAsync(int studentId)
        {
            return await _studentRepository.GetScoresByStudentIdAsync(studentId);
        }

        public async Task<IEnumerable<Timetable>> GetTimetableAsync(int studentId)
        {
            return await _studentRepository.GetTimetableByStudentIdAsync(studentId);
        }

        public async Task<bool> UpdateProfileAsync(int userId, StudentUpdateModel model)
        {
            var student = await _studentRepository.GetStudentByUserIdAsync(userId);
            if (student == null) return false;

            student.FullName = model.FullName;
            student.Address = model.Address;
            student.DateOfBirth = model.DateOfBirth;
            // Map Gender to M/F/O or take first char
            if (!string.IsNullOrEmpty(model.Gender))
            {
               student.Gender = model.Gender.Substring(0, 1).ToUpper(); 
            }
            else
            {
                student.Gender = null;
            }

            // User properties
            if (student.User != null)
            {
                bool userChanged = false;
                if (!string.IsNullOrEmpty(model.Email) && student.User.Email != model.Email)
                {
                    student.User.Email = model.Email;
                    userChanged = true;
                }
                if (student.User.Ethnicity != model.Ethnicity)
                {
                    student.User.Ethnicity = model.Ethnicity;
                    userChanged = true;
                }
                if (!string.IsNullOrEmpty(model.CitizenIdImage) && student.User.CitizenIdImage != model.CitizenIdImage)
                {
                    student.User.CitizenIdImage = model.CitizenIdImage;
                    userChanged = true;
                }

                if (userChanged)
                {
                    await _authRepository.UpdateUserAsync(student.User);
                }
            }

            await _studentRepository.UpdateStudentAsync(student);
            return true;
        }
    }
}
