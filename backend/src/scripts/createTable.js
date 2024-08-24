const { poolPromise } = require('../config/db');

const createTablesIfNotExists = async () => {
  const pool = await poolPromise;
  const createTablesQuery = `
    -- Tạo bảng Word_New nếu chưa tồn tại
    IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Word' AND xtype='U')
    BEGIN
      CREATE TABLE [Word] (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        QueryURL NVARCHAR(MAX),
        Word NVARCHAR(MAX) NOT NULL, -- Từ (chắc chắn có giá trị)
        PartOfSpeech NVARCHAR(MAX), -- Từ loại (ví dụ: noun, verb, adjective)
        Level NVARCHAR(10), -- Cấp độ (ví dụ: A1, B2, C1)
        Definition NVARCHAR(MAX), -- Định nghĩa (chắc chắn có giá trị)
        DefinitionVI NVARCHAR(MAX), -- Định nghĩa tiếng Việt
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
        GoogleId NVARCHAR(MAX), -- ID Google
        Name NVARCHAR(MAX) NOT NULL,
        Username VARCHAR(50), -- Tên đăng nhập (điều chỉnh kích thước nếu cần)
        Email VARCHAR(255) UNIQUE NOT NULL, -- Địa chỉ email (kích thước phù hợp)
        Password NVARCHAR(255), -- Mật khẩu (có thể cần thêm mã hóa)
        ConfirmationToken NVARCHAR(255) NULL, -- Token xác nhận, có thể không có giá trị
        CreatedAt DATETIME DEFAULT GETDATE(), -- Thời gian tạo (mặc định là thời gian hiện tại)
        UpdatedAt DATETIME DEFAULT GETDATE(), -- Thời gian cập nhật (mặc định là thời gian hiện tại)
        Status TINYINT DEFAULT 1 -- Trạng thái (mặc định là 1)
      );
    END
  `;

  try {
    await pool.request().query(createTablesQuery);
    console.log('Tables "Word" and "User" created or updated successfully.');
  } catch (err) {
    console.error('Error creating or updating tables:', err);
  }
};

module.exports = createTablesIfNotExists;
