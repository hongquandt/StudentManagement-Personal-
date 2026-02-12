USE StudentManagement;
GO

-- Create table for Chat Messages
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[messages]') AND type in (N'U'))
BEGIN
    CREATE TABLE messages (
        message_id INT IDENTITY(1,1) PRIMARY KEY,
        sender_id INT NOT NULL,
        receiver_id INT NOT NULL,
        content NVARCHAR(MAX) NOT NULL,
        sent_at DATETIME DEFAULT GETDATE(),
        is_read BIT DEFAULT 0,
        
        CONSTRAINT fk_msg_sender FOREIGN KEY (sender_id) REFERENCES users(user_id),
        CONSTRAINT fk_msg_receiver FOREIGN KEY (receiver_id) REFERENCES users(user_id)
    );
END
GO
