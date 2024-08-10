const { poolPromise } = require('../config/db');

const createTablesIfNotExists = async () => {
  const pool = await poolPromise;
  const createTablesQuery = `
    -- Tạo bảng Word nếu chưa tồn tại
    IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Word' AND xtype='U')
    BEGIN
      CREATE TABLE [Word] (
          Id INT IDENTITY(1,1) PRIMARY KEY,
          QueryURL NVARCHAR(MAX),
          Word NVARCHAR(MAX) NOT NULL, -- Từ (chắc chắn có giá trị)
          PartOfSpeech NVARCHAR(MAX), -- Từ loại (ví dụ: noun, verb, adjective)
          Level NVARCHAR(10), -- Cấp độ (ví dụ: A1, B2, C1)
          Definition NVARCHAR(MAX), -- Định nghĩa (chắc chắn có giá trị)
          PhoneticUK NVARCHAR(MAX), -- Phiên âm UK
          PhoneticUS NVARCHAR(MAX), -- Phiên âm US
          AudioUK NVARCHAR(MAX), -- Liên kết âm thanh phát âm UK
          AudioUS NVARCHAR(MAX), -- Liên kết âm thanh phát âm US
          Example NVARCHAR(MAX), -- Ví dụ sử dụng từ
          CreatedAt DATETIME DEFAULT GETDATE(), -- Thời gian tạo (mặc định là thời gian hiện tại)
          UpdatedAt DATETIME DEFAULT GETDATE(), -- Thời gian cập nhật (mặc định là thời gian hiện tại)
          Status INT DEFAULT 0 -- Trạng thái (mặc định là 0)
      );
    END

    -- Tạo bảng User nếu chưa tồn tại
    IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='User' AND xtype='U')
    BEGIN
      CREATE TABLE [User] (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        GoogleId NVARCHAR(255), -- ID Google
        Name NVARCHAR(255) NOT NULL,
        Email NVARCHAR(255) UNIQUE NOT NULL,
        Password NVARCHAR(255),
        CreatedAt DATETIME DEFAULT GETDATE(),
        UpdatedAt DATETIME DEFAULT GETDATE(),
        Status TINYINT DEFAULT 1
      );
    END
  `;

  try {
    await pool.request().query(createTablesQuery);
    console.log('Tables "Word" and "User" created or already exist.');
  } catch (err) {
    console.error('Error creating tables:', err);
  }
};

module.exports = createTablesIfNotExists;
