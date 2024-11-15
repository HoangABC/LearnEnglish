const { poolPromise } = require('../config/db');

const createTablesAndUpdateData = async () => {
  const pool = await poolPromise;

  try {
    const request = pool.request();

    // Tạo bảng Level nếu chưa tồn tại
    await request.query(`
      IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Level')
      BEGIN
        CREATE TABLE [Level] (
          Id INT IDENTITY(1,1) PRIMARY KEY,
          LevelName NVARCHAR(50) NOT NULL,
          CreatedAt DATETIME DEFAULT GETDATE(),
          UpdatedAt DATETIME DEFAULT GETDATE(),
          Status INT DEFAULT 1
        );
      END
    `);

    // Tạo bảng LevelWord nếu chưa tồn tại
    await request.query(`
      IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'LevelWord')
      BEGIN
        CREATE TABLE [LevelWord] (
          Id INT IDENTITY(1,1) PRIMARY KEY,
          LevelWord NVARCHAR(10) NOT NULL,
          CreatedAt DATETIME DEFAULT GETDATE(),
          UpdatedAt DATETIME DEFAULT GETDATE(),
          Status INT DEFAULT 1
        );
      END
    `);

    // Tạo bảng User nếu chưa tồn tại
    await request.query(`
      IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'User')
      BEGIN
        CREATE TABLE [User] (
          Id INT IDENTITY(1,1) PRIMARY KEY,
          LevelId INT NULL,
          GoogleId NVARCHAR(MAX),
          Name NVARCHAR(MAX) NOT NULL,
          Username VARCHAR(50),
          Email VARCHAR(255) UNIQUE NOT NULL,
          Password NVARCHAR(255),
          ConfirmationToken NVARCHAR(255) NULL,
          CreatedAt DATETIME DEFAULT GETDATE(),
          UpdatedAt DATETIME DEFAULT GETDATE(),
          Status TINYINT DEFAULT 1,
          CONSTRAINT FK_User_Level FOREIGN KEY (LevelId) REFERENCES [Level](Id)
        );
      END
    `);

    // Tạo bảng Word nếu chưa tồn tại
    await request.query(`
      IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Word')
      BEGIN
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
          Status INT DEFAULT 0,
          CONSTRAINT FK_Word_LevelWord FOREIGN KEY (LevelWordId) REFERENCES [LevelWord](Id)
        );
      END
    `);

    // Tạo bảng LevelMapping nếu chưa tồn tại
    await request.query(`
      IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'LevelMapping')
      BEGIN
        CREATE TABLE [LevelMapping] (
          Id INT IDENTITY(1,1) PRIMARY KEY,
          LevelId INT NOT NULL,
          LevelWordId INT NOT NULL,
          CreatedAt DATETIME DEFAULT GETDATE(),
          UpdatedAt DATETIME DEFAULT GETDATE(),
          Status INT DEFAULT 1,
          CONSTRAINT FK_LevelMapping_Level FOREIGN KEY (LevelId) REFERENCES [Level](Id),
          CONSTRAINT FK_LevelMapping_LevelWord FOREIGN KEY (LevelWordId) REFERENCES [LevelWord](Id)
        );
      END
    `);

    // Tạo bảng FavoriteWords nếu chưa tồn tại
    await request.query(`
      IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'FavoriteWords')
      BEGIN
        CREATE TABLE [FavoriteWords] (
          Id INT IDENTITY(1,1) PRIMARY KEY,
          UserId INT NOT NULL,
          WordId INT NOT NULL,
          CreatedAt DATETIME DEFAULT GETDATE(),
          UpdatedAt DATETIME DEFAULT GETDATE(),
          Status INT DEFAULT 1,
          CONSTRAINT FK_FavoriteWords_User FOREIGN KEY (UserId) REFERENCES [User](Id),
          CONSTRAINT FK_FavoriteWords_Word FOREIGN KEY (WordId) REFERENCES [Word](Id)
        );
      END
    `);

    // Tạo bảng QuestionType để quản lý loại câu hỏi
    await request.query(`
      IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'QuestionType')
      BEGIN
        CREATE TABLE [QuestionType] (
          Id INT IDENTITY(1,1) PRIMARY KEY,
          TypeName NVARCHAR(50) NOT NULL, -- ví dụ: Nhiều lựa chọn, Đúng/Sai
          CreatedAt DATETIME DEFAULT GETDATE(),
          UpdatedAt DATETIME DEFAULT GETDATE(),
          Status INT DEFAULT 1
        );
      END
    `);

    // Thêm dữ liệu vào bảng QuestionType nếu chưa có
    const questionTypes = [
      { TypeName: 'Đúng/Sai' },
    ];

    for (const type of questionTypes) {
      await request.query(`
        IF NOT EXISTS (SELECT * FROM [QuestionType] WHERE TypeName = '${type.TypeName}')
        BEGIN
          INSERT INTO [QuestionType] (TypeName) VALUES ('${type.TypeName}');
        END
      `);
    }

    // Tạo bảng Question với cột TypeId liên kết với bảng QuestionType
    await request.query(`
      IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Question')
      BEGIN
         CREATE TABLE [Question] (
          Id INT IDENTITY(1,1) PRIMARY KEY,
          QuestionText NVARCHAR(MAX) NOT NULL,
          LevelWordId INT NOT NULL, -- Liên kết với bảng LevelWord
          TypeId INT NOT NULL, -- Liên kết với bảng QuestionType
          CreatedAt DATETIME DEFAULT GETDATE(),
          UpdatedAt DATETIME DEFAULT GETDATE(),
          Status INT DEFAULT 1,
          CONSTRAINT FK_Question_LevelWord FOREIGN KEY (LevelWordId) REFERENCES [LevelWord](Id),
          CONSTRAINT FK_Question_QuestionType FOREIGN KEY (TypeId) REFERENCES [QuestionType](Id)
        );
      END
    `);

    // Tạo bảng Answer với cột liên kết đến bảng Question
    await request.query(`
      IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Answer')
      BEGIN
        CREATE TABLE [Answer] (
          Id INT IDENTITY(1,1) PRIMARY KEY,
          QuestionId INT NOT NULL,
          AnswerText NVARCHAR(MAX) NOT NULL,
          IsCorrect BIT DEFAULT 0,
          CreatedAt DATETIME DEFAULT GETDATE(),
          UpdatedAt DATETIME DEFAULT GETDATE(),
          Status INT DEFAULT 1,
          CONSTRAINT FK_Answer_Question FOREIGN KEY (QuestionId) REFERENCES [Question](Id)
        );
      END
    `);

    // Tạo bảng UserTestStats để lưu thông tin thống kê về các bài kiểm tra của người dùng
    await request.query(`
      IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'UserTestStats')
      BEGIN
        CREATE TABLE [UserTestStats] (
          Id INT IDENTITY(1,1) PRIMARY KEY,
          UserId INT NOT NULL,
          TotalTests INT DEFAULT 0, -- Tổng số lần làm bài
          TotalQuestions INT DEFAULT 0, -- Tổng số câu hỏi đã làm
          CorrectAnswers INT DEFAULT 0, -- Số câu trả lời đúng
          AverageScore FLOAT DEFAULT 0, -- Điểm trung bình
          CreatedAt DATETIME DEFAULT GETDATE(),
          UpdatedAt DATETIME DEFAULT GETDATE(),
          Status INT DEFAULT 1,
          CONSTRAINT FK_UserTestStats_User FOREIGN KEY (UserId) REFERENCES [User](Id)
        );
      END
    `);

    // Tạo bảng UserAnswer
    await request.query(`
      IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'UserAnswer')
      BEGIN
        CREATE TABLE [UserAnswer] (
          Id INT IDENTITY(1,1) PRIMARY KEY,
          UserTestId INT NOT NULL,
          QuestionId INT NOT NULL,
          AnswerId INT NOT NULL,
          CreatedAt DATETIME DEFAULT GETDATE(),
          UpdatedAt DATETIME DEFAULT GETDATE(),
          Status INT DEFAULT 1,
          CONSTRAINT FK_UserAnswer_UserTest FOREIGN KEY (UserTestId) REFERENCES [UserTestStats](Id),
          CONSTRAINT FK_UserAnswer_Question FOREIGN KEY (QuestionId) REFERENCES [Question](Id),
          CONSTRAINT FK_UserAnswer_Answer FOREIGN KEY (AnswerId) REFERENCES [Answer](Id)
        );
      END
    `);
    // Tạo bảng WordGuessAnswer để lưu đáp án của người dùng cho trò chơi WordGuess
    await request.query(`
      IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'WordGuessAnswer')
      BEGIN
        CREATE TABLE [WordGuessAnswer] (
          Id INT IDENTITY(1,1) PRIMARY KEY,
          UserId INT NOT NULL, -- Liên kết đến User
          WordId INT NOT NULL, -- Liên kết đến Word
          Answer NVARCHAR(MAX) NULL, -- Đáp án người dùng đã nhập
          IsCorrect BIT DEFAULT 0, -- Trạng thái đáp án (Đúng/Sai)
          CreatedAt DATETIME DEFAULT GETDATE(),
          UpdatedAt DATETIME DEFAULT GETDATE(),
          Status INT DEFAULT 1,
          CONSTRAINT FK_WordGuessAnswer_User FOREIGN KEY (UserId) REFERENCES [User](Id),
          CONSTRAINT FK_WordGuessAnswer_Word FOREIGN KEY (WordId) REFERENCES [Word](Id)
        );
      END
    `);

    await request.query(`
      IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'ListeningPractice')
      BEGIN
        CREATE TABLE [ListeningPractice] (
          Id INT IDENTITY(1,1) PRIMARY KEY,
          UserId INT NOT NULL, -- Liên kết đến bảng User
          WordId INT NOT NULL, -- Liên kết đến bảng Word
          Audio NVARCHAR(MAX) NULL, 
          Answer NVARCHAR(MAX) NULL, -- Đáp án người dùng đã nhập
          IsCorrect BIT DEFAULT 0, -- Trạng thái đáp án (Đúng/Sai)
          CreatedAt DATETIME DEFAULT GETDATE(),
          UpdatedAt DATETIME DEFAULT GETDATE(),
          Status INT DEFAULT 1,
          CONSTRAINT FK_ListeningPractice_User FOREIGN KEY (UserId) REFERENCES [User](Id),
          CONSTRAINT FK_ListeningPractice_Word FOREIGN KEY (WordId) REFERENCES [Word](Id)
        );
      END
    `);

    console.log('Tables and data created or updated successfully.');
  } catch (err) {
    console.error('Error creating or updating tables:', err);
  }
};

module.exports = createTablesAndUpdateData;
