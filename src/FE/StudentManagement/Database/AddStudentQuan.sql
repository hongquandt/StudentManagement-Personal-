
USE StudentManagement;
GO

BEGIN TRANSACTION;
BEGIN TRY

    -- 1. Identify Class 12A1
    DECLARE @ClassId INT;
    SELECT @ClassId = class_id FROM classes WHERE class_name = '12A1';
    
    IF @ClassId IS NULL
    BEGIN
        PRINT 'Class 12A1 not found!';
        ROLLBACK TRANSACTION;
        RETURN;
    END

    -- 2. Create User 'quancotu' if not exists
    DECLARE @UserId INT;
    IF NOT EXISTS (SELECT 1 FROM users WHERE username = 'quancotu')
    BEGIN
        INSERT INTO users (username, password_hash, role_id, email) 
        VALUES ('quancotu', '123', 3, 'quan@school.com');
        
        SET @UserId = SCOPE_IDENTITY();
        PRINT 'Created user quancotu';
    END
    ELSE
    BEGIN
        SELECT @UserId = user_id FROM users WHERE username = 'quancotu';
    END

    -- 3. Create Student record if not exists
    DECLARE @StudentId INT;
    IF NOT EXISTS (SELECT 1 FROM students WHERE user_id = @UserId)
    BEGIN
        INSERT INTO students (user_id, full_name, enrollment_year, status)
        VALUES (@UserId, N'Quan Co Tu', 2023, N'Đang học');
        
        SET @StudentId = SCOPE_IDENTITY();
        PRINT 'Created student record';
    END
    ELSE
    BEGIN
        SELECT @StudentId = student_id FROM students WHERE user_id = @UserId;
    END

    -- 4. Assign to Class 12A1
    IF NOT EXISTS (SELECT 1 FROM student_classes WHERE student_id = @StudentId AND class_id = @ClassId)
    BEGIN
        INSERT INTO student_classes (student_id, class_id)
        VALUES (@StudentId, @ClassId);
        PRINT 'Assigned quancotu to class 12A1';
    END
    ELSE
    BEGIN
        PRINT 'Student is already in class 12A1';
    END

    COMMIT TRANSACTION;
END TRY
BEGIN CATCH
    PRINT 'Error: ' + ERROR_MESSAGE();
    ROLLBACK TRANSACTION;
END CATCH;
GO
