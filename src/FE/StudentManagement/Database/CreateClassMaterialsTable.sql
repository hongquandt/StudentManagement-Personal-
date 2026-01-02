USE StudentManagement;
GO

-- Create table for Class Materials
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[class_materials]') AND type in (N'U'))
BEGIN
    CREATE TABLE class_materials (
        material_id INT IDENTITY(1,1) PRIMARY KEY,
        class_id INT NOT NULL,
        title NVARCHAR(200) NOT NULL,
        description NVARCHAR(MAX),
        file_path NVARCHAR(MAX),
        upload_date DATETIME DEFAULT GETDATE(),
        CONSTRAINT fk_material_class FOREIGN KEY (class_id) REFERENCES dbo.classes(class_id) ON DELETE CASCADE
    );
END
GO
