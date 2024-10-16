const Word = require('../models/Word');
const axios = require('axios');
const { poolPromise, sql } = require('../config/db');
const { getIo } = require('../Module/socket');

const getRandomWordForGuess = async (req, res) => {
  try {
      const pool = await poolPromise;

      // Lấy userId từ yêu cầu
      const { userId } = req.query; // Giả sử userId được gửi trong query của yêu cầu
      console.log('UserId received:', userId);

      // Kiểm tra xem userId có tồn tại không
      if (!userId) {
          return res.status(400).json({ message: 'UserId is required.' });
      }

      // Tạo truy vấn để lấy 1 từ ngẫu nhiên từ bảng Word với trạng thái là 1 (có thể sử dụng), có độ dài 5 ký tự và không chứa số
      const randomWordQuery = `
          SELECT TOP 1 Id, Word
          FROM Word
          WHERE Status = 1
            AND LEN(Word) = 5   -- Chỉ lấy từ có 5 ký tự
            AND Word NOT LIKE '%[0-9]%' -- Không lấy từ có chứa ký tự số
          ORDER BY NEWID() -- Sắp xếp ngẫu nhiên
      `;

      console.log('Executing random word query for guessing:', randomWordQuery);

      const randomWordResult = await pool.request().query(randomWordQuery);

      console.log('Random word found for guessing:', randomWordResult.recordset);

      if (randomWordResult.recordset.length === 0) {
          console.log('No words found for guessing');
          return res.status(404).json({ message: 'No words found for guessing.' });
      }

      // Lấy từ gốc và Id
      const wordRecord = randomWordResult.recordset[0];
      const word = wordRecord.Word;
      const wordId = wordRecord.Id; // Lấy Id và gán vào wordId

      // Chuyển đổi từ thành chữ in hoa
      const upperCaseWord = word.toUpperCase();

      // Kiểm tra nếu có bản ghi trong bảng WordGuessAnswer, nếu có thì không cần tăng giá trị Count
      const existingRecord = await pool.request()
          .input('userId', sql.Int, userId)
          .input('wordId', sql.Int, wordId) // Sử dụng wordId ở đây
          .query(`
              SELECT 1 
              FROM WordGuessAnswer 
              WHERE UserId = @userId AND WordId = @wordId
          `);

      // Nếu không có bản ghi thì chèn mới với Answer là NULL
      if (existingRecord.recordset.length === 0) {
          await pool.request()
              .input('userId', sql.Int, userId)
              .input('wordId', sql.Int, wordId) // Sử dụng wordId ở đây
              .query(`
                  INSERT INTO WordGuessAnswer (UserId, WordId, Answer, CreatedAt, UpdatedAt)
                  VALUES (@userId, @wordId, NULL, GETDATE(), GETDATE())
              `);
      }

      // Trả về Id, từ ngẫu nhiên và từ đã được làm sạch
      res.status(200).json({ wordId: wordId, original: upperCaseWord, cleaned: upperCaseWord }); // Thay đổi từ id thành wordId
  } catch (err) {
      console.error('Error fetching random word for guessing:', err.message);
      res.status(500).json({ error: err.message });
  }
};

  
const submitWordGuessAnswer = async (req, res) => {
    try {
        const { userId, wordId, answer } = req.body; // Nhận thông tin từ body

        // Ghi lại thông tin nhận được
        console.log('Received data:', { userId, wordId, answer });

        // Kiểm tra thông tin đầu vào
        if (!userId || !wordId || !answer) {
            return res.status(400).json({ message: 'UserId, WordId, and Answer are required.' });
        }

        const pool = await poolPromise;

        // Kiểm tra số lần đã nhập đáp án cho từ này
        const countResult = await pool.request()
            .input('userId', sql.Int, userId)
            .input('wordId', sql.Int, wordId)
            .query(
                `SELECT COUNT(*) AS Answer 
                FROM WordGuessAnswer 
                WHERE UserId = @userId AND WordId = @wordId AND Status = 1`
            );

        const answerCount = countResult.recordset[0].Answer;

        // Kiểm tra số lần thử tối đa
        if (answerCount >= 6) {
            return res.status(403).json({ message: 'Game over. You have reached the maximum number of attempts (6).' });
        }

        // Kiểm tra từ đúng và lấy từ
        const wordResult = await pool.request()
            .input('wordId', sql.Int, wordId)
            .query(`SELECT Word FROM Word WHERE Id = @wordId AND Status = 1`);

        if (wordResult.recordset.length === 0) {
            return res.status(404).json({ message: 'Word not found.' });
        }

        const correctAnswer = wordResult.recordset[0].Word; // Lấy từ đúng từ cơ sở dữ liệu
        const isCorrect = correctAnswer.toUpperCase() === answer.toUpperCase(); // So sánh đáp án (chữ in hoa)

        // Thực hiện thêm một truy vấn để lấy từ từ bảng Word (nếu cần thiết)
        // Ví dụ: bạn có thể cần kiểm tra từng ký tự trong từ và đáp án
        const additionalWordResult = await pool.request()
            .input('wordId', sql.Int, wordId)
            .query(`SELECT Word FROM Word WHERE Id = @wordId AND Status = 1`);

        if (additionalWordResult.recordset.length > 0) {
            const additionalWord = additionalWordResult.recordset[0].Word;
            
            // So sánh từng ký tự giữa additionalWord và answer
            const characterMatch = additionalWord.split('').map((char, index) => {
                return { char, match: char.toUpperCase() === answer[index]?.toUpperCase() };
            });

            console.log('Character match results:', characterMatch);
        }

        // Kiểm tra xem đã có bản ghi cho userId và wordId hay chưa
        const existingRecord = await pool.request()
            .input('userId', sql.Int, userId)
            .input('wordId', sql.Int, wordId)
            .query(
                `SELECT Id FROM WordGuessAnswer 
                WHERE UserId = @userId AND WordId = @wordId`
            );

        if (existingRecord.recordset.length > 0) {
            // Nếu bản ghi đã tồn tại, cập nhật Answer và IsCorrect
            await pool.request()
                .input('userId', sql.Int, userId)
                .input('wordId', sql.Int, wordId)
                .input('answer', sql.NVarChar(sql.MAX), answer)
                .input('isCorrect', sql.Bit, isCorrect ? 1 : 0)
                .query(
                    `UPDATE WordGuessAnswer 
                    SET Answer = @answer, IsCorrect = @isCorrect, UpdatedAt = GETDATE() 
                    WHERE UserId = @userId AND WordId = @wordId`
                );
        } else {
            // Nếu không có bản ghi thì chèn mới
            await pool.request()
                .input('userId', sql.Int, userId)
                .input('wordId', sql.Int, wordId)
                .input('answer', sql.NVarChar(sql.MAX), answer)
                .input('isCorrect', sql.Bit, isCorrect ? 1 : 0)
                .query(
                    `INSERT INTO WordGuessAnswer (UserId, WordId, Answer, IsCorrect, CreatedAt, UpdatedAt, Status) 
                    VALUES (@userId, @wordId, @answer, @isCorrect, GETDATE(), GETDATE(), 1)`
                );
        }

        // Kiểm tra nếu là lần thứ 6 và sai
        if (answerCount === 5 && !isCorrect) {
            return res.status(403).json({ message: 'Game over. You have made 6 attempts and did not guess the word.' });
        }

        // Trả về thông báo, isCorrect và từ đúng
        return res.status(200).json({ 
            message: isCorrect ? 'Correct answer! Well done!' : 'Answer submitted successfully.', 
            isCorrect,
            word: correctAnswer // Trả về từ đúng
        });
    } catch (err) {
        console.error('Error submitting answer:', err.message);
        res.status(500).json({ error: err.message });
    }
};

  
module.exports = {
  getRandomWordForGuess,
  submitWordGuessAnswer,
};
