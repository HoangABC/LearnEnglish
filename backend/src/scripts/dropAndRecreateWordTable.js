const { poolPromise } = require('../config/db');

const dropAndRecreateWordTable = async (pool) => {
    try {
      const request = pool.request();  // Khởi tạo request từ đối tượng pool
  
      // Bỏ ràng buộc khóa ngoại giữa FavoriteWords và Word
      await request.query(`
        IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_FavoriteWords_Word')
        BEGIN
          ALTER TABLE [FavoriteWords] DROP CONSTRAINT FK_FavoriteWords_Word;
        END
      `);
  
      // Xóa bảng Word nếu tồn tại
      await request.query(`
        IF OBJECT_ID('dbo.Word', 'U') IS NOT NULL
        BEGIN
          DROP TABLE dbo.Word;
        END
      `);
  
      // Tạo lại bảng Word
      await request.query(`
        CREATE TABLE [Word] (
          Id INT IDENTITY(1,1) PRIMARY KEY,
          QueryURL NVARCHAR(MAX),
          Word NVARCHAR(MAX) NOT NULL,
          PartOfSpeech NVARCHAR(MAX),
          LevelWordId INT NULL,
          Definition NVARCHAR(MAX),
          DefinitionVI NVARCHAR(MAX),
          PhoneticUK NVARCHAR(MAX),
          PhoneticUS NVARCHAR(MAX),
          AudioUK NVARCHAR(MAX),
          AudioUS NVARCHAR(MAX),
          Example NVARCHAR(MAX),
          ExampleVI NVARCHAR(MAX),
          CreatedAt DATETIME DEFAULT GETDATE(),
          UpdatedAt DATETIME DEFAULT GETDATE(),
          Status INT DEFAULT 0
        );
      `);
  
      // Thêm lại ràng buộc khóa ngoại giữa FavoriteWords và Word
      await request.query(`
        ALTER TABLE [FavoriteWords] ADD CONSTRAINT FK_FavoriteWords_Word FOREIGN KEY (WordId) REFERENCES [Word](Id);
      `);
  
      console.log('Word table dropped and recreated successfully.');
    } catch (err) {
      console.error('Error dropping and recreating Word table:', err);
    }
  };
  

module.exports = dropAndRecreateWordTable;
