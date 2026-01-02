
-- =============================================================
-- FIX DATA SCRIPT V2 (Corrected Schema)
-- =============================================================

USE StudentManagement;
GO

-- 0. EMERGENCY ROLLBACK
IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRANSACTION;
    PRINT 'Rolled back stuck transaction.';
END
GO

-- 1. CREATE teacher_requests IF NOT EXISTS
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='teacher_requests' AND xtype='U')
BEGIN
    CREATE TABLE teacher_requests (
        request_id INT IDENTITY(1,1) PRIMARY KEY,
        teacher_id INT NOT NULL,
        request_type NVARCHAR(50) NOT NULL,
        content NVARCHAR(MAX) NOT NULL,
        status NVARCHAR(50) DEFAULT 'Pending',
        created_at DATETIME DEFAULT GETDATE(),
        CONSTRAINT fk_request_teacher FOREIGN KEY (teacher_id) REFERENCES teachers(teacher_id) ON DELETE CASCADE
    );
    PRINT 'Created teacher_requests table.';
END
GO

-- 2. CLEANUP OLD DATA
DECLARE @TeacherUser NVarChar(50) = 'luong1';
DECLARE @TeacherId INT;

SELECT @TeacherId = t.teacher_id 
FROM teachers t JOIN users u ON t.user_id = u.user_id 
WHERE u.username = @TeacherUser;

IF @TeacherId IS NOT NULL
BEGIN
    PRINT 'Cleaning up data for teacher ID: ' + CAST(@TeacherId AS VARCHAR);
    
    DELETE FROM teacher_requests WHERE teacher_id = @TeacherId;
    DELETE FROM teacher_certificates WHERE teacher_id = @TeacherId;
    DELETE FROM timetables WHERE teacher_id = @TeacherId;
    DELETE FROM teaching_assignments WHERE teacher_id = @TeacherId;

    UPDATE classes SET homeroom_teacher_id = NULL WHERE homeroom_teacher_id = @TeacherId;
    
    DECLARE @ClassId INT;
    SELECT @ClassId = class_id FROM classes WHERE class_name = '12A1';
    
    IF @ClassId IS NOT NULL
    BEGIN
        DELETE FROM student_classes WHERE class_id = @ClassId;
        DELETE FROM attendances WHERE class_id = @ClassId;
        DELETE FROM teaching_assignments WHERE class_id = @ClassId;
        DELETE FROM classes WHERE class_id = @ClassId;
    END
END

-- Delete dummy students
DELETE FROM students WHERE user_id IN (SELECT user_id FROM users WHERE username LIKE 'student%_12a1');
DELETE FROM users WHERE username LIKE 'student%_12a1';

PRINT 'Cleanup Complete.';
GO

-- 3. INSERT NEW DATA
BEGIN TRANSACTION;
BEGIN TRY
    DECLARE @TeacherUser NVarChar(50) = 'luong1';
    DECLARE @TeacherId INT;
    DECLARE @UserId INT;

    SELECT @UserId = user_id FROM users WHERE username = @TeacherUser;
    
    IF @UserId IS NULL
    BEGIN
        PRINT 'User luong1 not found!';
        ROLLBACK TRANSACTION;
        RETURN;
    END

    -- Ensure role is Teacher
    UPDATE users SET role_id = 2 WHERE user_id = @UserId;

    -- Ensure entry in teachers
    SELECT @TeacherId = teacher_id FROM teachers WHERE user_id = @UserId;
    
    IF @TeacherId IS NULL
    BEGIN
        -- Insert into Teachers (Removed 'email' column which caused error)
        INSERT INTO teachers (user_id, full_name, phone, specialization)
        SELECT user_id, full_name, '0912345678', N'Hóa Học'
        FROM students WHERE user_id = @UserId;

        IF @@ROWCOUNT = 0
        BEGIN
             INSERT INTO teachers (user_id, full_name, phone, specialization)
             VALUES (@UserId, N'Lương Teacher', '0912345678', N'Hóa Học');
        END

        SET @TeacherId = SCOPE_IDENTITY();
        DELETE FROM students WHERE user_id = @UserId;
    END
    ELSE
    BEGIN
        UPDATE teachers SET specialization = N'Hóa Học', phone = '0912345678' WHERE teacher_id = @TeacherId;
    END

    -- Create Homeroom Class 12A1
    DECLARE @Class12A1Id INT;
    INSERT INTO classes (class_name, grade, homeroom_teacher_id, academic_year_id)
    VALUES ('12A1', 12, @TeacherId, 1);
    SET @Class12A1Id = SCOPE_IDENTITY();

    -- Create Subject Chemistry
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

    -- Create Dummy Students for 12A1
    INSERT INTO users (username, password_hash, role_id) VALUES 
    ('student1_12a1', '123', 3), ('student2_12a1', '123', 3), ('student3_12a1', '123', 3);
    
    INSERT INTO students (user_id, full_name, enrollment_year, status) VALUES 
    ((SELECT user_id FROM users WHERE username='student1_12a1'), N'Nguyễn Văn Trò', 2023, N'Đang học'),
    ((SELECT user_id FROM users WHERE username='student2_12a1'), N'Lê Thị Học', 2023, N'Đang học'),
    ((SELECT user_id FROM users WHERE username='student3_12a1'), N'Trần Minh Chăm', 2023, N'Đang học');

    INSERT INTO student_classes (student_id, class_id)
    SELECT student_id, @Class12A1Id FROM students WHERE user_id IN (
        SELECT user_id FROM users WHERE username IN ('student1_12a1', 'student2_12a1', 'student3_12a1')
    );

    -- Teaching Assignment
    INSERT INTO teaching_assignments (teacher_id, class_id, subject_id, semester_id)
    VALUES (@TeacherId, @Class12A1Id, @SubjectChemId, 1);

    -- Timetable
    INSERT INTO timetables (class_id, subject_id, teacher_id, semester_id, day_of_week, period, room_number)
    VALUES 
    (@Class12A1Id, @SubjectChemId, @TeacherId, 1, N'Thứ 2', 1, 'Lab 1'),
    (@Class12A1Id, @SubjectChemId, @TeacherId, 1, N'Thứ 2', 2, 'Lab 1'),
    (@Class12A1Id, @SubjectChemId, @TeacherId, 1, N'Thứ 4', 3, 'P202');

    -- Certificates
    INSERT INTO teacher_certificates (teacher_id, certificate_name, issued_by, issue_date, description)
    VALUES
    (@TeacherId, N'Sư phạm Hóa', N'ĐHSP', '2020-05-15', N'Giỏi'),
    (@TeacherId, N'IELTS 7.0', N'IDP', '2022-01-10', N'Valid for 2 years');

    -- Requests
    INSERT INTO teacher_requests (teacher_id, request_type, content, status, created_at)
    VALUES 
    (@TeacherId, N'Nghỉ phép', N'Xin nghỉ ốm ngày thứ 6', N'Pending', GETDATE());

    COMMIT TRANSACTION;
    PRINT 'Data successfully reloaded for luong1.';
END TRY
BEGIN CATCH
    PRINT 'Error occurred: ' + ERROR_MESSAGE();
    IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
END CATCH;
GO
