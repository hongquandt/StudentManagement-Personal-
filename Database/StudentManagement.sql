CREATE DATABASE StudentManagement;
GO
USE StudentManagement;
GO

-- =========================
-- 1. ROLES
-- =========================
CREATE TABLE roles (
    role_id INT IDENTITY(1,1) PRIMARY KEY,
    role_name NVARCHAR(50) UNIQUE NOT NULL, -- Sửa thành NVARCHAR
    description NVARCHAR(MAX)
);

-- =========================
-- 2. USERS
-- =========================
CREATE TABLE users (
    user_id INT IDENTITY(1,1) PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(100),
    role_id INT NOT NULL,
    avatar_url NVARCHAR(MAX),
    citizen_id_image NVARCHAR(MAX), -- Có thể NULL nếu mới tạo user
    ethnicity NVARCHAR(50),         -- Có thể NULL
    is_active BIT DEFAULT 1,
    created_at DATETIME DEFAULT GETDATE(),
    CONSTRAINT fk_user_role FOREIGN KEY (role_id) REFERENCES roles(role_id)
);

-- =========================
-- 3. ACADEMIC YEARS & SEMESTERS
-- =========================
CREATE TABLE academic_years (
    academic_year_id INT IDENTITY(1,1) PRIMARY KEY,
    year_name VARCHAR(20) NOT NULL, -- Ví dụ: 2024-2025
    is_active BIT DEFAULT 0
);

CREATE TABLE semesters (
    semester_id INT IDENTITY(1,1) PRIMARY KEY,
    semester_name NVARCHAR(20) NOT NULL, -- Học kỳ I, Học kỳ II
    academic_year_id INT NOT NULL,
    start_date DATE, -- Nên thêm ngày bắt đầu
    end_date DATE,   -- Nên thêm ngày kết thúc
    CONSTRAINT fk_semester_year FOREIGN KEY (academic_year_id) REFERENCES academic_years(academic_year_id)
);

-- =========================
-- 4. STUDENTS
-- =========================
CREATE TABLE students (
    student_id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT UNIQUE NOT NULL,
    full_name NVARCHAR(100) NOT NULL,
    gender CHAR(1) CHECK (gender IN ('M', 'F', 'O')), -- Thêm check giới tính
    date_of_birth DATE,
    address NVARCHAR(MAX),
    enrollment_year INT,
    status NVARCHAR(50), -- Đang học, Bảo lưu, Đã tốt nghiệp
    CONSTRAINT fk_student_user FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- =========================
-- 5. TEACHERS
-- =========================
CREATE TABLE teachers (
    teacher_id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT UNIQUE NOT NULL,
    full_name NVARCHAR(100) NOT NULL,
    specialization NVARCHAR(100),
    phone VARCHAR(20),
    CONSTRAINT fk_teacher_user FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- =========================
-- 6. TEACHER CERTIFICATES
-- =========================
CREATE TABLE teacher_certificates (
    certificate_id INT IDENTITY(1,1) PRIMARY KEY,
    teacher_id INT NOT NULL,
    certificate_name NVARCHAR(150) NOT NULL,
    issued_by NVARCHAR(150),
    issue_date DATE,
    certificate_image NVARCHAR(MAX),
    description NVARCHAR(MAX),
    CONSTRAINT fk_certificate_teacher FOREIGN KEY (teacher_id) REFERENCES teachers(teacher_id) ON DELETE CASCADE
);

-- =========================
-- 7. CLASSES
-- =========================
CREATE TABLE classes (
    class_id INT IDENTITY(1,1) PRIMARY KEY,
    class_name VARCHAR(50) NOT NULL,
    grade INT NOT NULL, -- Khối 10, 11, 12
    homeroom_teacher_id INT, -- Giáo viên chủ nhiệm
    academic_year_id INT NOT NULL,
    CONSTRAINT fk_class_teacher FOREIGN KEY (homeroom_teacher_id) REFERENCES teachers(teacher_id),
    CONSTRAINT fk_class_year FOREIGN KEY (academic_year_id) REFERENCES academic_years(academic_year_id)
);

-- =========================
-- 8. SUBJECTS
-- =========================
CREATE TABLE subjects (
    subject_id INT IDENTITY(1,1) PRIMARY KEY,
    subject_name NVARCHAR(100) NOT NULL,
    credit INT DEFAULT 1
);

-- =========================
-- [MỚI] 8.1. TEACHING ASSIGNMENTS (Phân công giảng dạy)
-- Logic: Giáo viên A dạy môn Toán cho lớp 7A1 vào học kỳ 1
-- =========================
CREATE TABLE teaching_assignments (
    assignment_id INT IDENTITY(1,1) PRIMARY KEY,
    teacher_id INT NOT NULL,
    class_id INT NOT NULL,
    subject_id INT NOT NULL,
    semester_id INT NOT NULL,
    
    CONSTRAINT fk_assign_teacher FOREIGN KEY (teacher_id) REFERENCES teachers(teacher_id),
    CONSTRAINT fk_assign_class FOREIGN KEY (class_id) REFERENCES classes(class_id),
    CONSTRAINT fk_assign_subject FOREIGN KEY (subject_id) REFERENCES subjects(subject_id),
    CONSTRAINT fk_assign_semester FOREIGN KEY (semester_id) REFERENCES semesters(semester_id),
    
    -- Một lớp, một môn, trong 1 học kỳ chỉ có 1 giáo viên dạy chính
    CONSTRAINT uq_teaching_assignment UNIQUE (class_id, subject_id, semester_id) 
);

-- =========================
-- [MỚI] 8.2. TIMETABLES (Thời khóa biểu)
-- Logic: Lớp 7A1 học môn Toán vào Thứ 2, Tiết 1, Phòng 101
-- =========================
CREATE TABLE timetables (
    timetable_id INT IDENTITY(1,1) PRIMARY KEY,
    class_id INT NOT NULL,
    subject_id INT NOT NULL,
    teacher_id INT NOT NULL, -- Có thể lấy từ bảng assignments, nhưng lưu đây để truy vấn nhanh
    semester_id INT NOT NULL,
    day_of_week NVARCHAR(20) CHECK (day_of_week IN (N'Thứ 2', N'Thứ 3', N'Thứ 4', N'Thứ 5', N'Thứ 6', N'Thứ 7', N'Chủ Nhật')),
    period INT CHECK (period BETWEEN 1 AND 12), -- Tiết học 1-12
    room_number VARCHAR(20),
    
    CONSTRAINT fk_tt_class FOREIGN KEY (class_id) REFERENCES classes(class_id),
    CONSTRAINT fk_tt_subject FOREIGN KEY (subject_id) REFERENCES subjects(subject_id),
    CONSTRAINT fk_tt_teacher FOREIGN KEY (teacher_id) REFERENCES teachers(teacher_id),
    CONSTRAINT fk_tt_semester FOREIGN KEY (semester_id) REFERENCES semesters(semester_id),

    -- Ràng buộc: Một lớp không thể học 2 môn cùng 1 tiết
    CONSTRAINT uq_class_period UNIQUE (class_id, semester_id, day_of_week, period),
    -- Ràng buộc: Một giáo viên không thể dạy 2 lớp cùng 1 tiết
    CONSTRAINT uq_teacher_period UNIQUE (teacher_id, semester_id, day_of_week, period)
);

-- =========================
-- 9. STUDENT - CLASSES
-- =========================
CREATE TABLE student_classes (
    id INT IDENTITY(1,1) PRIMARY KEY,
    student_id INT NOT NULL,
    class_id INT NOT NULL,
    CONSTRAINT fk_sc_student FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
    CONSTRAINT fk_sc_class FOREIGN KEY (class_id) REFERENCES classes(class_id) ON DELETE CASCADE,
    CONSTRAINT uq_student_class UNIQUE (student_id, class_id)
);

-- =========================
-- 10. SCORES (Đã thêm Check Constraint)
-- =========================
CREATE TABLE scores (
    score_id INT IDENTITY(1,1) PRIMARY KEY,
    student_id INT NOT NULL,
    subject_id INT NOT NULL,
    semester_id INT NOT NULL,
    -- Thêm ràng buộc điểm phải từ 0 đến 10
    oral_score FLOAT CHECK (oral_score BETWEEN 0 AND 10),
    quiz_score FLOAT CHECK (quiz_score BETWEEN 0 AND 10),
    midterm_score FLOAT CHECK (midterm_score BETWEEN 0 AND 10),
    final_score FLOAT CHECK (final_score BETWEEN 0 AND 10),
    
    -- Cột tính toán tự động (Ví dụ: Miệng*1 + 15p*1 + Giữa kỳ*2 + Cuối kỳ*3) / 7
    -- Nếu muốn sửa tay thì bỏ dòng AS (...) đi và để FLOAT như cũ
    average_score AS CAST(
        (ISNULL(oral_score,0) + ISNULL(quiz_score,0) + ISNULL(midterm_score,0)*2 + ISNULL(final_score,0)*3) / 7.0 
        AS DECIMAL(4,2)
    ) PERSISTED,

    CONSTRAINT fk_score_student FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
    CONSTRAINT fk_score_subject FOREIGN KEY (subject_id) REFERENCES subjects(subject_id),
    CONSTRAINT fk_score_semester FOREIGN KEY (semester_id) REFERENCES semesters(semester_id),
    CONSTRAINT uq_score UNIQUE (student_id, subject_id, semester_id)
);

-- =========================
-- 11. ATTENDANCE
-- =========================
CREATE TABLE attendance (
    attendance_id INT IDENTITY(1,1) PRIMARY KEY,
    student_id INT NOT NULL,
    class_id INT NOT NULL,
    date DATE NOT NULL DEFAULT GETDATE(),
    status VARCHAR(20) CHECK (status IN ('present','absent','late')),
    CONSTRAINT fk_att_student FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
    CONSTRAINT fk_att_class FOREIGN KEY (class_id) REFERENCES classes(class_id) ON DELETE CASCADE,
    -- Một học sinh chỉ điểm danh 1 lần/ngày/lớp
    CONSTRAINT uq_attendance UNIQUE (student_id, class_id, date) 
);

-- =========================
-- 12. CONDUCT
-- =========================
CREATE TABLE conduct (
    conduct_id INT IDENTITY(1,1) PRIMARY KEY,
    student_id INT NOT NULL,
    semester_id INT NOT NULL,
    conduct_level NVARCHAR(50) CHECK (conduct_level IN (N'Tốt', N'Khá', N'Trung bình', N'Yếu')),
    comment NVARCHAR(MAX),
    CONSTRAINT fk_conduct_student FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
    CONSTRAINT fk_conduct_semester FOREIGN KEY (semester_id) REFERENCES semesters(semester_id)
);

-- =========================
-- 13. PARENTS
-- =========================
CREATE TABLE parents (
    parent_id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT UNIQUE NOT NULL,
    full_name NVARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(100),
    CONSTRAINT fk_parent_user FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- =========================
-- 14. STUDENT - PARENTS
-- =========================
CREATE TABLE student_parents (
    id INT IDENTITY(1,1) PRIMARY KEY,
    student_id INT NOT NULL,
    parent_id INT NOT NULL,
    relationship NVARCHAR(50), -- Bố, Mẹ, Ông, Bà
    CONSTRAINT fk_sp_student FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
    CONSTRAINT fk_sp_parent FOREIGN KEY (parent_id) REFERENCES parents(parent_id) ON DELETE CASCADE,
    CONSTRAINT uq_student_parent UNIQUE (student_id, parent_id)
);

-- =========================
-- 15. LEARNING ANALYTICS (AI)
-- =========================
CREATE TABLE learning_analytics (
    analytics_id INT IDENTITY(1,1) PRIMARY KEY,
    student_id INT NOT NULL,
    semester_id INT NOT NULL,
    risk_level NVARCHAR(50),
    predicted_average FLOAT,
    recommendation NVARCHAR(MAX),
    CONSTRAINT fk_la_student FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
    CONSTRAINT fk_la_semester FOREIGN KEY (semester_id) REFERENCES semesters(semester_id)
);
GO

-- =========================
-- INSERT MẪU (Đã cập nhật logic mới)
-- =========================

-- 1. Roles
INSERT INTO roles (role_name, description) VALUES
('admin', N'Quản trị hệ thống'), ('teacher', N'Giáo viên'), ('student', N'Học sinh'), ('parent', N'Phụ huynh');

-- 2. Users (Bỏ citizen_id_image và ethnicity khỏi NOT NULL trong thiết kế nếu muốn insert nhanh)
INSERT INTO users (username, password_hash, email, role_id, citizen_id_image, ethnicity) VALUES
('admin01', 'hash123', 'admin@school.edu', 1, NULL, N'Kinh'),
('teacher_lan', 'hash123', 'lan@school.edu', 2, NULL, N'Kinh'),
('teacher_hung', 'hash123', 'hung@school.edu', 2, NULL, N'Kinh'), -- Thêm GV bộ môn
('student_an', 'hash123', 'an@school.edu', 3, NULL, N'Kinh');

-- 3. Academic Year
INSERT INTO academic_years (year_name, is_active) VALUES ('2024-2025', 1);
INSERT INTO semesters (semester_name, academic_year_id) VALUES (N'Học kỳ I', 1);

-- 4. Teachers
INSERT INTO teachers (user_id, full_name, specialization, phone) VALUES 
(2, N'Nguyễn Thị Lan', N'Toán', '098111'), -- ID 1
(3, N'Lê Văn Hùng', N'Văn', '098222');   -- ID 2

-- 5. Classes
INSERT INTO classes (class_name, grade, homeroom_teacher_id, academic_year_id) VALUES ('10A1', 10, 1, 1);

-- 6. Students
INSERT INTO students (user_id, full_name, enrollment_year, status) VALUES (4, N'Trần Văn An', 2024, N'Đang học');

-- 7. Subjects
INSERT INTO subjects (subject_name) VALUES (N'Toán'), (N'Ngữ Văn');

-- 8. [QUAN TRỌNG] Phân công giảng dạy (Cô Lan dạy Toán, Thầy Hùng dạy Văn lớp 10A1)
INSERT INTO teaching_assignments (teacher_id, class_id, subject_id, semester_id) VALUES
(1, 1, 1, 1), -- Cô Lan dạy Toán 10A1
(2, 1, 2, 1); -- Thầy Hùng dạy Văn 10A1

-- 9. [QUAN TRỌNG] Thời khóa biểu (10A1 học Toán tiết 1 Thứ 2)
INSERT INTO timetables (class_id, subject_id, teacher_id, semester_id, day_of_week, period, room_number) VALUES
(1, 1, 1, 1, N'Thứ 2', 1, 'P101');

-- 10. Điểm (Tự động tính Average)
INSERT INTO scores (student_id, subject_id, semester_id, oral_score, quiz_score, midterm_score, final_score) 
VALUES (1, 1, 1, 8, 9, 8, 9); 
-- Kết quả Average sẽ tự động là ~8.71 (theo công thức mẫu)