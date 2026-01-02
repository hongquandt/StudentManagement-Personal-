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
-- =========================
-- INSERT NEW TEACHER
-- =========================
INSERT INTO users (username, password_hash, email, role_id, citizen_id_image, ethnicity) 
VALUES ('teacher1', '123', 'teacher1@school.edu', (SELECT role_id FROM roles WHERE role_name = 'teacher'), NULL, N'Kinh');

DECLARE @TeacherUserId INT = (SELECT user_id FROM users WHERE username = 'teacher1');

INSERT INTO teachers (user_id, full_name, specialization, phone) 
VALUES (@TeacherUserId, N'Nguyễn Văn A', N'Vật Lý', '0909090909');


-- Add Subject Physics
INSERT INTO subjects (subject_name) VALUES (N'Vật Lý');
DECLARE @SubjectPhysicsId INT = (SELECT subject_id FROM subjects WHERE subject_name = N'Vật Lý');

-- Add Class 11A1 with teacher1 as homeroom
-- Assuming we just inserted teacher1, we get their teacher_id
DECLARE @NewTeacherId INT = (SELECT teacher_id FROM teachers WHERE user_id = (SELECT user_id FROM users WHERE username = 'teacher1'));

INSERT INTO classes (class_name, grade, homeroom_teacher_id, academic_year_id) 
VALUES ('11A1', 11, @NewTeacherId, 1);
DECLARE @Class11A1Id INT = (SELECT class_id FROM classes WHERE class_name = '11A1');

-- Assign teacher1 to teach Physics to 11A1
INSERT INTO teaching_assignments (teacher_id, class_id, subject_id, semester_id) 
VALUES (@NewTeacherId, @Class11A1Id, @SubjectPhysicsId, 1);


-- =========================
-- CHANGE ROLE FROM STUDENT TO TEACHER
-- User: luong1
-- =========================
BEGIN TRANSACTION;

BEGIN TRY
    -- 1. Get User ID
    DECLARE @TargetUserId INT = (SELECT user_id FROM users WHERE username = 'luong1');

    IF @TargetUserId IS NULL
    BEGIN
        PRINT 'User not found';
        ROLLBACK TRANSACTION;
        RETURN;
    END

    -- 2. Update Role in Users table
    UPDATE users 
    SET role_id = 2 -- Teacher
    WHERE user_id = @TargetUserId;

    -- 3. Remove from Students table if exists
    -- We need to save student info to migrate to teacher if needed, or just delete.
    -- Assuming a simple conversion where we carry over the name.
    DECLARE @FullName NVARCHAR(100);
    SELECT @FullName = full_name FROM students WHERE user_id = @TargetUserId;
    
    IF @FullName IS NOT NULL
    BEGIN
        DELETE FROM students WHERE user_id = @TargetUserId;

        -- 4. Add to Teachers table
        -- Using default values for specialization and phone as placeholders
        INSERT INTO teachers (user_id, full_name, specialization, phone)
        VALUES (@TargetUserId, @FullName, N'Chưa cập nhật', N'');
        
        PRINT 'Successfully converted student to teacher.';
    END
    ELSE
    BEGIN
        -- If not found in students table but is a user, try to get name from somewhere else or use placeholder?
        -- For now, assume if they were role 3 they should be in students table. 
        -- If they are not in students table, we just insert into teachers table.
         INSERT INTO teachers (user_id, full_name, specialization, phone)
         VALUES (@TargetUserId, N'User Luong1', N'Chưa cập nhật', N'');
         
         PRINT 'User role updated and added to teachers table.';
    END

    COMMIT TRANSACTION;
END TRY
BEGIN CATCH
    PRINT 'Error occurred: ' + ERROR_MESSAGE();
    ROLLBACK TRANSACTION;
END CATCH;


-- =========================
-- [NEW] 16. CHANGE REQUESTS (Yêu cầu đổi giờ/bù giờ)
-- =========================
CREATE TABLE teacher_requests (
    request_id INT IDENTITY(1,1) PRIMARY KEY,
    teacher_id INT NOT NULL,
    request_type NVARCHAR(50) NOT NULL, -- 'ChangeTimetable', 'MakeupClass', 'Leave'
    content NVARCHAR(MAX) NOT NULL,
    status NVARCHAR(50) DEFAULT 'Pending', -- 'Pending', 'Approved', 'Rejected'
    created_at DATETIME DEFAULT GETDATE(),
    
    CONSTRAINT fk_request_teacher FOREIGN KEY (teacher_id) REFERENCES teachers(teacher_id) ON DELETE CASCADE
);


-- =========================
-- INSERT SAMPLE DATA FOR USER 'luong1'
-- =========================
BEGIN TRANSACTION;

BEGIN TRY
    -- 1. Get Teacher ID for 'luong1'
    DECLARE @LuongTeacherId INT;
    SELECT @LuongTeacherId = teacher_id FROM teachers t
    JOIN users u ON t.user_id = u.user_id
    WHERE u.username = 'luong1';

    IF @LuongTeacherId IS NULL
    BEGIN
        PRINT 'Teacher luong1 not found. Please ensure role conversion script ran successfully.';
        ROLLBACK TRANSACTION;
        RETURN;
    END

    -- Update specialization
    UPDATE teachers SET specialization = N'Hóa Học', phone = '0912345678' WHERE teacher_id = @LuongTeacherId;

    -- 2. Create a Homeroom Class (12A1) if not exists
    DECLARE @Class12A1Id INT;
    IF NOT EXISTS (SELECT 1 FROM classes WHERE class_name = '12A1')
    BEGIN
        INSERT INTO classes (class_name, grade, homeroom_teacher_id, academic_year_id)
        VALUES ('12A1', 12, @LuongTeacherId, 1);
        SET @Class12A1Id = SCOPE_IDENTITY();
    END
    ELSE
    BEGIN
        SELECT @Class12A1Id = class_id FROM classes WHERE class_name = '12A1';
        UPDATE classes SET homeroom_teacher_id = @LuongTeacherId WHERE class_id = @Class12A1Id;
    END

    -- 3. Add Dummy Students to 12A1 (for Attendance/Grades)
    -- Create dummy users first
    INSERT INTO users (username, password_hash, role_id) VALUES 
    ('student1_12a1', '123', 3), ('student2_12a1', '123', 3), ('student3_12a1', '123', 3);
    
    INSERT INTO students (user_id, full_name, enrollment_year, status) VALUES 
    ((SELECT user_id FROM users WHERE username='student1_12a1'), N'Nguyễn Văn Trò', 2023, N'Đang học'),
    ((SELECT user_id FROM users WHERE username='student2_12a1'), N'Lê Thị Học', 2023, N'Đang học'),
    ((SELECT user_id FROM users WHERE username='student3_12a1'), N'Trần Minh Chăm', 2023, N'Đang học');

    -- Assign students to class
    INSERT INTO student_classes (student_id, class_id)
    SELECT student_id, @Class12A1Id FROM students WHERE user_id IN (
        SELECT user_id FROM users WHERE username IN ('student1_12a1', 'student2_12a1', 'student3_12a1')
    );

    -- 4. Add Subject 'Hóa Học'
    DECLARE @SubjectChemId INT;
    IF NOT EXISTS (SELECT 1 FROM subjects WHERE subject_name = N'Hóa Học')
    BEGIN
        INSERT INTO subjects (subject_name) VALUES (N'Hóa Học');
        SET @SubjectChemId = SCOPE_IDENTITY();
    END
    ELSE
    BEGIN
        SELECT @SubjectChemId = subject_id FROM subjects WHERE subject_name = N'Hóa Học';
    END

    -- 5. Teaching Assignment (Teach Chemistry to 12A1)
    INSERT INTO teaching_assignments (teacher_id, class_id, subject_id, semester_id)
    VALUES (@LuongTeacherId, @Class12A1Id, @SubjectChemId, 1);

    -- 6. Timetable
    -- Monday Period 1 & 2
    INSERT INTO timetables (class_id, subject_id, teacher_id, semester_id, day_of_week, period, room_number)
    VALUES 
    (@Class12A1Id, @SubjectChemId, @LuongTeacherId, 1, N'Thứ 2', 1, 'Lab 1'),
    (@Class12A1Id, @SubjectChemId, @LuongTeacherId, 1, N'Thứ 2', 2, 'Lab 1'),
    (@Class12A1Id, @SubjectChemId, @LuongTeacherId, 1, N'Thứ 4', 3, 'P202');

    -- 7. Certificates
    INSERT INTO teacher_certificates (teacher_id, certificate_name, issued_by, issue_date, description)
    VALUES
    (@LuongTeacherId, N'Chứng chỉ Sư phạm Hóa', N'Đại học Sư phạm', '2020-05-15', N'Xếp loại Giỏi'),
    (@LuongTeacherId, N'IELTS 7.0', N'IDP', '2022-01-10', N'Valid for 2 years');

    -- 8. Requests
    INSERT INTO teacher_requests (teacher_id, request_type, content, status)
    VALUES 
    (@LuongTeacherId, N'Nghỉ phép', N'Xin nghỉ ốm ngày thứ 6', N'Pending');

    PRINT 'Sample data for teacher luong1 inserted successfully.';
    COMMIT TRANSACTION;
END TRY
BEGIN CATCH
    PRINT 'Error: ' + ERROR_MESSAGE();
    ROLLBACK TRANSACTION;
END CATCH;

