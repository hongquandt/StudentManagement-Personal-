using System;

namespace StudentManagement.Models.DTO
{
    // User Update DTO
    public class UpdateUserDto
    {
        public int UserId { get; set; }
        public string? Email { get; set; }
        public bool? IsActive { get; set; }
        public string? Ethnicity { get; set; }
        public string? CitizenIdImage { get; set; }
        public string? AvatarUrl { get; set; }

        public UpdateStudentDto? Student { get; set; }
        public UpdateTeacherDto? Teacher { get; set; }
    }

    public class UpdateStudentDto
    {
        public string? FullName { get; set; }
        public string? Gender { get; set; }
        public DateOnly? DateOfBirth { get; set; }
        public string? Address { get; set; }
        public int? EnrollmentYear { get; set; }
        public string? Status { get; set; }
    }

    public class UpdateTeacherDto
    {
        public string? FullName { get; set; }
        public string? Specialization { get; set; }
        public string? Phone { get; set; }
    }

    // Semester Create/Update DTO
    public class CreateSemesterDto
    {
        public int SemesterId { get; set; } // Optional for Create, used for Update (or separate them)
        public string SemesterName { get; set; } = null!;
        public int AcademicYearId { get; set; }
        public DateOnly? StartDate { get; set; }
        public DateOnly? EndDate { get; set; }
    }

    // Class Create DTO
    public class CreateClassDto
    {
        public string ClassName { get; set; } = null!;
        public int Grade { get; set; }
        public int AcademicYearId { get; set; }
        public int? HomeroomTeacherId { get; set; } // Optional
    }

    public class CreateSubjectDto
    {
        public int SubjectId { get; set; }
        public string SubjectName { get; set; } = null!;
        public int? Credit { get; set; }
    }

    public class ClassDetailDto
    {
        public int ClassId { get; set; }
        public string ClassName { get; set; } = null!;
        public int Grade { get; set; }
        public string? HomeroomTeacherName { get; set; }
        public string? AcademicYear { get; set; }
        public List<ClassStudentDto> Students { get; set; } = new();
    }

    public class ClassStudentDto
    {
        public int StudentId { get; set; }
        public string FullName { get; set; } = null!;
        public string? Gender { get; set; }
        public DateOnly? DateOfBirth { get; set; }
    }
}
