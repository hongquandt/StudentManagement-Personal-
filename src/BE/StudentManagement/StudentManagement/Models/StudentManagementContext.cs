using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;

namespace StudentManagement.Models;

public partial class StudentManagementContext : DbContext
{
    public StudentManagementContext()
    {
    }

    public StudentManagementContext(DbContextOptions<StudentManagementContext> options)
        : base(options)
    {
    }

    public virtual DbSet<AcademicYear> AcademicYears { get; set; }

    public virtual DbSet<Attendance> Attendances { get; set; }

    public virtual DbSet<Class> Classes { get; set; }

    public virtual DbSet<Conduct> Conducts { get; set; }

    public virtual DbSet<LearningAnalytic> LearningAnalytics { get; set; }

    public virtual DbSet<Parent> Parents { get; set; }

    public virtual DbSet<Role> Roles { get; set; }

    public virtual DbSet<Score> Scores { get; set; }

    public virtual DbSet<Semester> Semesters { get; set; }

    public virtual DbSet<Student> Students { get; set; }

    public virtual DbSet<StudentClass> StudentClasses { get; set; }

    public virtual DbSet<StudentParent> StudentParents { get; set; }

    public virtual DbSet<Subject> Subjects { get; set; }

    public virtual DbSet<Teacher> Teachers { get; set; }

    public virtual DbSet<TeacherCertificate> TeacherCertificates { get; set; }

    public virtual DbSet<TeachingAssignment> TeachingAssignments { get; set; }

    public virtual DbSet<Timetable> Timetables { get; set; }

    public virtual DbSet<TeacherRequest> TeacherRequests { get; set; }

    public virtual DbSet<ClassMaterial> ClassMaterials { get; set; }

    public virtual DbSet<Message> Messages { get; set; }

    public virtual DbSet<User> Users { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        if (!optionsBuilder.IsConfigured)
        {
            var configuration = new ConfigurationBuilder()
                .SetBasePath(Directory.GetCurrentDirectory())
                .AddJsonFile("appsettings.json")
                .Build();

            var connectionString = configuration.GetConnectionString("DBDefault");

            optionsBuilder.UseSqlServer(connectionString);
        }
    }


    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<AcademicYear>(entity =>
        {
            entity.HasKey(e => e.AcademicYearId).HasName("PK__academic__11CFB9748B51C4FD");

            entity.ToTable("academic_years");

            entity.Property(e => e.AcademicYearId).HasColumnName("academic_year_id");
            entity.Property(e => e.IsActive)
                .HasDefaultValue(false)
                .HasColumnName("is_active");
            entity.Property(e => e.YearName)
                .HasMaxLength(20)
                .IsUnicode(false)
                .HasColumnName("year_name");
        });

        modelBuilder.Entity<Attendance>(entity =>
        {
            entity.HasKey(e => e.AttendanceId).HasName("PK__attendan__20D6A96891448C85");

            entity.ToTable("attendance");

            entity.HasIndex(e => new { e.StudentId, e.ClassId, e.Date }, "uq_attendance").IsUnique();

            entity.Property(e => e.AttendanceId).HasColumnName("attendance_id");
            entity.Property(e => e.ClassId).HasColumnName("class_id");
            entity.Property(e => e.Date)
                .HasDefaultValueSql("(getdate())")
                .HasColumnName("date");
            entity.Property(e => e.Status)
                .HasMaxLength(20)
                .IsUnicode(false)
                .HasColumnName("status");
            entity.Property(e => e.StudentId).HasColumnName("student_id");

            entity.HasOne(d => d.Class).WithMany(p => p.Attendances)
                .HasForeignKey(d => d.ClassId)
                .HasConstraintName("fk_att_class");

            entity.HasOne(d => d.Student).WithMany(p => p.Attendances)
                .HasForeignKey(d => d.StudentId)
                .HasConstraintName("fk_att_student");
        });

        modelBuilder.Entity<Class>(entity =>
        {
            entity.HasKey(e => e.ClassId).HasName("PK__classes__FDF47986F0020D5C");

            entity.ToTable("classes");

            entity.Property(e => e.ClassId).HasColumnName("class_id");
            entity.Property(e => e.AcademicYearId).HasColumnName("academic_year_id");
            entity.Property(e => e.ClassName)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasColumnName("class_name");
            entity.Property(e => e.Grade).HasColumnName("grade");
            entity.Property(e => e.HomeroomTeacherId).HasColumnName("homeroom_teacher_id");

            entity.HasOne(d => d.AcademicYear).WithMany(p => p.Classes)
                .HasForeignKey(d => d.AcademicYearId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("fk_class_year");

            entity.HasOne(d => d.HomeroomTeacher).WithMany(p => p.Classes)
                .HasForeignKey(d => d.HomeroomTeacherId)
                .HasConstraintName("fk_class_teacher");
        });

        modelBuilder.Entity<Conduct>(entity =>
        {
            entity.HasKey(e => e.ConductId).HasName("PK__conduct__CB54623C65A1333E");

            entity.ToTable("conduct");

            entity.Property(e => e.ConductId).HasColumnName("conduct_id");
            entity.Property(e => e.Comment).HasColumnName("comment");
            entity.Property(e => e.ConductLevel)
                .HasMaxLength(50)
                .HasColumnName("conduct_level");
            entity.Property(e => e.SemesterId).HasColumnName("semester_id");
            entity.Property(e => e.StudentId).HasColumnName("student_id");

            entity.HasOne(d => d.Semester).WithMany(p => p.Conducts)
                .HasForeignKey(d => d.SemesterId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("fk_conduct_semester");

            entity.HasOne(d => d.Student).WithMany(p => p.Conducts)
                .HasForeignKey(d => d.StudentId)
                .HasConstraintName("fk_conduct_student");
        });

        modelBuilder.Entity<LearningAnalytic>(entity =>
        {
            entity.HasKey(e => e.AnalyticsId).HasName("PK__learning__D5DC3DE163C6178B");

            entity.ToTable("learning_analytics");

            entity.Property(e => e.AnalyticsId).HasColumnName("analytics_id");
            entity.Property(e => e.PredictedAverage).HasColumnName("predicted_average");
            entity.Property(e => e.Recommendation).HasColumnName("recommendation");
            entity.Property(e => e.RiskLevel)
                .HasMaxLength(50)
                .HasColumnName("risk_level");
            entity.Property(e => e.SemesterId).HasColumnName("semester_id");
            entity.Property(e => e.StudentId).HasColumnName("student_id");

            entity.HasOne(d => d.Semester).WithMany(p => p.LearningAnalytics)
                .HasForeignKey(d => d.SemesterId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("fk_la_semester");

            entity.HasOne(d => d.Student).WithMany(p => p.LearningAnalytics)
                .HasForeignKey(d => d.StudentId)
                .HasConstraintName("fk_la_student");
        });

        modelBuilder.Entity<Parent>(entity =>
        {
            entity.HasKey(e => e.ParentId).HasName("PK__parents__F2A6081912A45DE1");

            entity.ToTable("parents");

            entity.HasIndex(e => e.UserId, "UQ__parents__B9BE370EE68757A8").IsUnique();

            entity.Property(e => e.ParentId).HasColumnName("parent_id");
            entity.Property(e => e.Email)
                .HasMaxLength(100)
                .IsUnicode(false)
                .HasColumnName("email");
            entity.Property(e => e.FullName)
                .HasMaxLength(100)
                .HasColumnName("full_name");
            entity.Property(e => e.Phone)
                .HasMaxLength(20)
                .IsUnicode(false)
                .HasColumnName("phone");
            entity.Property(e => e.UserId).HasColumnName("user_id");

            entity.HasOne(d => d.User).WithOne(p => p.Parent)
                .HasForeignKey<Parent>(d => d.UserId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("fk_parent_user");
        });

        modelBuilder.Entity<Role>(entity =>
        {
            entity.HasKey(e => e.RoleId).HasName("PK__roles__760965CC8EBE294F");

            entity.ToTable("roles");

            entity.HasIndex(e => e.RoleName, "UQ__roles__783254B1D08E2ECB").IsUnique();

            entity.Property(e => e.RoleId).HasColumnName("role_id");
            entity.Property(e => e.Description).HasColumnName("description");
            entity.Property(e => e.RoleName)
                .HasMaxLength(50)
                .HasColumnName("role_name");
        });

        modelBuilder.Entity<Score>(entity =>
        {
            entity.HasKey(e => e.ScoreId).HasName("PK__scores__8CA19050487D439E");

            entity.ToTable("scores");

            entity.HasIndex(e => new { e.StudentId, e.SubjectId, e.SemesterId }, "uq_score").IsUnique();

            entity.Property(e => e.ScoreId).HasColumnName("score_id");
            entity.Property(e => e.AverageScore)
                .HasComputedColumnSql("(CONVERT([decimal](4,2),(((isnull([oral_score],(0))+isnull([quiz_score],(0)))+isnull([midterm_score],(0))*(2))+isnull([final_score],(0))*(3))/(7.0)))", true)
                .HasColumnType("decimal(4, 2)")
                .HasColumnName("average_score");
            entity.Property(e => e.FinalScore).HasColumnName("final_score");
            entity.Property(e => e.MidtermScore).HasColumnName("midterm_score");
            entity.Property(e => e.OralScore).HasColumnName("oral_score");
            entity.Property(e => e.QuizScore).HasColumnName("quiz_score");
            entity.Property(e => e.SemesterId).HasColumnName("semester_id");
            entity.Property(e => e.StudentId).HasColumnName("student_id");
            entity.Property(e => e.SubjectId).HasColumnName("subject_id");

            entity.HasOne(d => d.Semester).WithMany(p => p.Scores)
                .HasForeignKey(d => d.SemesterId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("fk_score_semester");

            entity.HasOne(d => d.Student).WithMany(p => p.Scores)
                .HasForeignKey(d => d.StudentId)
                .HasConstraintName("fk_score_student");

            entity.HasOne(d => d.Subject).WithMany(p => p.Scores)
                .HasForeignKey(d => d.SubjectId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("fk_score_subject");
        });

        modelBuilder.Entity<Semester>(entity =>
        {
            entity.HasKey(e => e.SemesterId).HasName("PK__semester__CBC81B01D5540A11");

            entity.ToTable("semesters");

            entity.Property(e => e.SemesterId).HasColumnName("semester_id");
            entity.Property(e => e.AcademicYearId).HasColumnName("academic_year_id");
            entity.Property(e => e.EndDate).HasColumnName("end_date");
            entity.Property(e => e.SemesterName)
                .HasMaxLength(20)
                .HasColumnName("semester_name");
            entity.Property(e => e.StartDate).HasColumnName("start_date");

            entity.HasOne(d => d.AcademicYear).WithMany(p => p.Semesters)
                .HasForeignKey(d => d.AcademicYearId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("fk_semester_year");
        });

        modelBuilder.Entity<Student>(entity =>
        {
            entity.HasKey(e => e.StudentId).HasName("PK__students__2A33069A464F3E65");

            entity.ToTable("students");

            entity.HasIndex(e => e.UserId, "UQ__students__B9BE370E1DD9C093").IsUnique();

            entity.Property(e => e.StudentId).HasColumnName("student_id");
            entity.Property(e => e.Address).HasColumnName("address");
            entity.Property(e => e.DateOfBirth).HasColumnName("date_of_birth");
            entity.Property(e => e.EnrollmentYear).HasColumnName("enrollment_year");
            entity.Property(e => e.FullName)
                .HasMaxLength(100)
                .HasColumnName("full_name");
            entity.Property(e => e.Gender)
                .HasMaxLength(1)
                .IsUnicode(false)
                .IsFixedLength()
                .HasColumnName("gender");
            entity.Property(e => e.Status)
                .HasMaxLength(50)
                .HasColumnName("status");
            entity.Property(e => e.UserId).HasColumnName("user_id");

            entity.HasOne(d => d.User).WithOne(p => p.Student)
                .HasForeignKey<Student>(d => d.UserId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("fk_student_user");
        });

        modelBuilder.Entity<StudentClass>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__student___3213E83FC0206ED3");

            entity.ToTable("student_classes");

            entity.HasIndex(e => new { e.StudentId, e.ClassId }, "uq_student_class").IsUnique();

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.ClassId).HasColumnName("class_id");
            entity.Property(e => e.StudentId).HasColumnName("student_id");

            entity.HasOne(d => d.Class).WithMany(p => p.StudentClasses)
                .HasForeignKey(d => d.ClassId)
                .HasConstraintName("fk_sc_class");

            entity.HasOne(d => d.Student).WithMany(p => p.StudentClasses)
                .HasForeignKey(d => d.StudentId)
                .HasConstraintName("fk_sc_student");
        });

        modelBuilder.Entity<StudentParent>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__student___3213E83F4ADDBD25");

            entity.ToTable("student_parents");

            entity.HasIndex(e => new { e.StudentId, e.ParentId }, "uq_student_parent").IsUnique();

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.ParentId).HasColumnName("parent_id");
            entity.Property(e => e.Relationship)
                .HasMaxLength(50)
                .HasColumnName("relationship");
            entity.Property(e => e.StudentId).HasColumnName("student_id");

            entity.HasOne(d => d.Parent).WithMany(p => p.StudentParents)
                .HasForeignKey(d => d.ParentId)
                .HasConstraintName("fk_sp_parent");

            entity.HasOne(d => d.Student).WithMany(p => p.StudentParents)
                .HasForeignKey(d => d.StudentId)
                .HasConstraintName("fk_sp_student");
        });

        modelBuilder.Entity<Subject>(entity =>
        {
            entity.HasKey(e => e.SubjectId).HasName("PK__subjects__5004F660976A7EFD");

            entity.ToTable("subjects");

            entity.Property(e => e.SubjectId).HasColumnName("subject_id");
            entity.Property(e => e.Credit)
                .HasDefaultValue(1)
                .HasColumnName("credit");
            entity.Property(e => e.SubjectName)
                .HasMaxLength(100)
                .HasColumnName("subject_name");
        });

        modelBuilder.Entity<Teacher>(entity =>
        {
            entity.HasKey(e => e.TeacherId).HasName("PK__teachers__03AE777E6E59EB90");

            entity.ToTable("teachers");

            entity.HasIndex(e => e.UserId, "UQ__teachers__B9BE370E8A5CC55E").IsUnique();

            entity.Property(e => e.TeacherId).HasColumnName("teacher_id");
            entity.Property(e => e.FullName)
                .HasMaxLength(100)
                .HasColumnName("full_name");
            entity.Property(e => e.Phone)
                .HasMaxLength(20)
                .IsUnicode(false)
                .HasColumnName("phone");
            entity.Property(e => e.Specialization)
                .HasMaxLength(100)
                .HasColumnName("specialization");
            entity.Property(e => e.UserId).HasColumnName("user_id");

            entity.HasOne(d => d.User).WithOne(p => p.Teacher)
                .HasForeignKey<Teacher>(d => d.UserId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("fk_teacher_user");
        });

        modelBuilder.Entity<TeacherCertificate>(entity =>
        {
            entity.HasKey(e => e.CertificateId).HasName("PK__teacher___E2256D31EC8C8012");

            entity.ToTable("teacher_certificates");

            entity.Property(e => e.CertificateId).HasColumnName("certificate_id");
            entity.Property(e => e.CertificateImage).HasColumnName("certificate_image");
            entity.Property(e => e.CertificateName)
                .HasMaxLength(150)
                .HasColumnName("certificate_name");
            entity.Property(e => e.Description).HasColumnName("description");
            entity.Property(e => e.IssueDate).HasColumnName("issue_date");
            entity.Property(e => e.IssuedBy)
                .HasMaxLength(150)
                .HasColumnName("issued_by");
            entity.Property(e => e.TeacherId).HasColumnName("teacher_id");

            entity.HasOne(d => d.Teacher).WithMany(p => p.TeacherCertificates)
                .HasForeignKey(d => d.TeacherId)
                .HasConstraintName("fk_certificate_teacher");
        });

        modelBuilder.Entity<TeachingAssignment>(entity =>
        {
            entity.HasKey(e => e.AssignmentId).HasName("PK__teaching__DA8918148A0CB895");

            entity.ToTable("teaching_assignments");

            entity.HasIndex(e => new { e.ClassId, e.SubjectId, e.SemesterId }, "uq_teaching_assignment").IsUnique();

            entity.Property(e => e.AssignmentId).HasColumnName("assignment_id");
            entity.Property(e => e.ClassId).HasColumnName("class_id");
            entity.Property(e => e.SemesterId).HasColumnName("semester_id");
            entity.Property(e => e.SubjectId).HasColumnName("subject_id");
            entity.Property(e => e.TeacherId).HasColumnName("teacher_id");

            entity.HasOne(d => d.Class).WithMany(p => p.TeachingAssignments)
                .HasForeignKey(d => d.ClassId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("fk_assign_class");

            entity.HasOne(d => d.Semester).WithMany(p => p.TeachingAssignments)
                .HasForeignKey(d => d.SemesterId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("fk_assign_semester");

            entity.HasOne(d => d.Subject).WithMany(p => p.TeachingAssignments)
                .HasForeignKey(d => d.SubjectId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("fk_assign_subject");

            entity.HasOne(d => d.Teacher).WithMany(p => p.TeachingAssignments)
                .HasForeignKey(d => d.TeacherId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("fk_assign_teacher");
        });

        modelBuilder.Entity<Timetable>(entity =>
        {
            entity.HasKey(e => e.TimetableId).HasName("PK__timetabl__26DC9588D0C83EFF");

            entity.ToTable("timetables");

            entity.HasIndex(e => new { e.ClassId, e.SemesterId, e.DayOfWeek, e.Period }, "uq_class_period").IsUnique();

            entity.HasIndex(e => new { e.TeacherId, e.SemesterId, e.DayOfWeek, e.Period }, "uq_teacher_period").IsUnique();

            entity.Property(e => e.TimetableId).HasColumnName("timetable_id");
            entity.Property(e => e.ClassId).HasColumnName("class_id");
            entity.Property(e => e.DayOfWeek)
                .HasMaxLength(20)
                .HasColumnName("day_of_week");
            entity.Property(e => e.Period).HasColumnName("period");
            entity.Property(e => e.RoomNumber)
                .HasMaxLength(20)
                .IsUnicode(false)
                .HasColumnName("room_number");
            entity.Property(e => e.SemesterId).HasColumnName("semester_id");
            entity.Property(e => e.SubjectId).HasColumnName("subject_id");
            entity.Property(e => e.TeacherId).HasColumnName("teacher_id");

            entity.HasOne(d => d.Class).WithMany(p => p.Timetables)
                .HasForeignKey(d => d.ClassId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("fk_tt_class");

            entity.HasOne(d => d.Semester).WithMany(p => p.Timetables)
                .HasForeignKey(d => d.SemesterId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("fk_tt_semester");

            entity.HasOne(d => d.Subject).WithMany(p => p.Timetables)
                .HasForeignKey(d => d.SubjectId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("fk_tt_subject");

            entity.HasOne(d => d.Teacher).WithMany(p => p.Timetables)
                .HasForeignKey(d => d.TeacherId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("fk_tt_teacher");
        });

        modelBuilder.Entity<TeacherRequest>(entity =>
        {
            entity.HasKey(e => e.RequestId).HasName("PK__teacher___E3C5DE31D1234567");

            entity.ToTable("teacher_requests");

            entity.Property(e => e.RequestId).HasColumnName("request_id");
            entity.Property(e => e.Content).HasColumnName("content");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime")
                .HasColumnName("created_at");
            entity.Property(e => e.RequestType)
                .HasMaxLength(50)
                .HasColumnName("request_type");
            entity.Property(e => e.Status)
                .HasMaxLength(50)
                .HasDefaultValue("Pending")
                .HasColumnName("status");
            entity.Property(e => e.TeacherId).HasColumnName("teacher_id");

            entity.HasOne(d => d.Teacher).WithMany(p => p.TeacherRequests)
                .HasForeignKey(d => d.TeacherId)
                .HasConstraintName("fk_request_teacher");
        });

        modelBuilder.Entity<ClassMaterial>(entity =>
        {
            entity.HasKey(e => e.MaterialId).HasName("PK__class_ma__0D003C587D8E2DF9");

            entity.ToTable("class_materials");

            entity.Property(e => e.MaterialId).HasColumnName("material_id");
            entity.Property(e => e.ClassId).HasColumnName("class_id");
            entity.Property(e => e.Title).HasMaxLength(200).HasColumnName("title");
            entity.Property(e => e.Description).HasColumnName("description");
            entity.Property(e => e.FilePath).HasColumnName("file_path");
            entity.Property(e => e.UploadDate)
                  .HasDefaultValueSql("(getdate())")
                  .HasColumnType("datetime")
                  .HasColumnName("upload_date");

            entity.HasOne(d => d.Class).WithMany(p => p.ClassMaterials)
                .HasForeignKey(d => d.ClassId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("fk_material_class");
        });

        modelBuilder.Entity<Message>(entity =>
        {
            entity.HasKey(e => e.MessageId).HasName("PK__messages__432");

            entity.ToTable("messages");

            entity.Property(e => e.MessageId).HasColumnName("message_id");
            entity.Property(e => e.SenderId).HasColumnName("sender_id");
            entity.Property(e => e.ReceiverId).HasColumnName("receiver_id");
            entity.Property(e => e.Content).HasColumnName("content");
            entity.Property(e => e.SentAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime")
                .HasColumnName("sent_at");
            entity.Property(e => e.IsRead).HasColumnName("is_read");

            entity.HasOne(d => d.Sender).WithMany(p => p.SentMessages)
                .HasForeignKey(d => d.SenderId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("fk_msg_sender");

            entity.HasOne(d => d.Receiver).WithMany(p => p.ReceivedMessages)
                .HasForeignKey(d => d.ReceiverId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("fk_msg_receiver");
        });

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.UserId).HasName("PK__users__B9BE370F7D93492F");

            entity.ToTable("users");

            entity.HasIndex(e => e.Username, "UQ__users__F3DBC572884DB34F").IsUnique();

            entity.Property(e => e.UserId).HasColumnName("user_id");
            entity.Property(e => e.AvatarUrl).HasColumnName("avatar_url");
            entity.Property(e => e.CitizenIdImage).HasColumnName("citizen_id_image");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime")
                .HasColumnName("created_at");
            entity.Property(e => e.Email)
                .HasMaxLength(100)
                .IsUnicode(false)
                .HasColumnName("email");
            entity.Property(e => e.Ethnicity)
                .HasMaxLength(50)
                .HasColumnName("ethnicity");
            entity.Property(e => e.IsActive)
                .HasDefaultValue(true)
                .HasColumnName("is_active");
            entity.Property(e => e.PasswordHash)
                .HasMaxLength(255)
                .IsUnicode(false)
                .HasColumnName("password_hash");
            entity.Property(e => e.RoleId).HasColumnName("role_id");
            entity.Property(e => e.Username)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasColumnName("username");

            entity.HasOne(d => d.Role).WithMany(p => p.Users)
                .HasForeignKey(d => d.RoleId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("fk_user_role");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
