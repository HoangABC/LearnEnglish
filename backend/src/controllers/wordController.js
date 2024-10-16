const Word = require('../models/Word');
const axios = require('axios');
const { poolPromise, sql } = require('../config/db');
const { getIo } = require('../Module/socket');

// Xác minh nghĩa của từ từ API từ điển
const verifyWordMeaning = async (word) => {
  if (typeof word !== 'string' || word.trim().length < 1) {
    throw new Error('Invalid input: word must be at least 1 character long');
  }

  try {
    const response = await axios.get(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
    const data = response.data;

    if (!data || data.length === 0) {
      throw new Error('No definitions found for this word');
    }

    return data;
  } catch (error) {
    console.error('Error:', error.message);
    throw new Error('Failed to verify word meaning');
  }
};

// Thêm từ vào cơ sở dữ liệu
const addWord = async (req, res) => {
  try {
    const { word } = req.body;

    // Kiểm tra đầu vào
    if (typeof word !== 'string' || !word.trim()) {
      return res.status(400).json({ message: 'Invalid input: word must be a non-empty string.' });
    }

    // Lấy nghĩa của từ từ API
    const meanings = await verifyWordMeaning(word);

    // Kiểm tra dữ liệu trả về
    if (!meanings || meanings.length === 0) {
      return res.status(404).json({ message: 'Word not found in dictionary.' });
    }

    // Lấy các thông tin cần thiết
    const partOfSpeech = meanings[0]?.meanings
      .map(meaning => meaning.partOfSpeech)
      .filter(Boolean)
      .join(', ');

    const dictionaryDefinition = meanings[0]?.meanings
      .flatMap(meaning => meaning.definitions.map(def => def.definition))
      .join('; ');

    const phoneticUK = meanings[0]?.phonetics
      .filter(p => p.text && p.audio && p.audio.includes('uk'))
      .map(p => p.text)
      .join(', ') || 'N/A';

    const phoneticUS = meanings[0]?.phonetics
      .filter(p => p.text && p.audio && p.audio.includes('us'))
      .map(p => p.text)
      .join(', ') || 'N/A';

    const example = meanings[0]?.meanings
      .flatMap(meaning => meaning.definitions.map(def => def.example))
      .filter(Boolean)
      .join('; ') || 'No example available';

    const audioUK = meanings[0]?.phonetics
      .filter(p => p.audio && p.audio.includes('uk'))
      .map(p => p.audio)
      .join(', ') || 'N/A';

    const audioUS = meanings[0]?.phonetics
      .filter(p => p.audio && p.audio.includes('us'))
      .map(p => p.audio)
      .join(', ') || 'N/A';

    if (!dictionaryDefinition) {
      return res.status(400).json({ message: 'No definition found in dictionary.' });
    }

    await Word.create({ 
      word: word, 
      partOfSpeech: partOfSpeech, 
      level: '', 
      definition: dictionaryDefinition, 
      phoneticUK: phoneticUK, 
      phoneticUS: phoneticUS, 
      audioUK: audioUK, 
      audioUS: audioUS, 
      example: example, 
      status: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    const io = getIo();
    io.emit('newWordAdded', { 
      word, 
      definition: dictionaryDefinition, 
      phoneticUK, 
      phoneticUS, 
      audioUK, 
      audioUS, 
      example 
    });

    res.status(201).json({ message: 'Word added successfully!' });
  } catch (err) {
    console.error('Add word error:', err.message);
    res.status(500).json({ error: err.message });
  }
};


// Lấy danh sách từ với trạng thái 1
const getWordsByStatus1 = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .query('SELECT * FROM Word WHERE Status = 1');
    res.status(200).json(result.recordset);
  } catch (err) {
    console.error('Error fetching words with status 1:', err.message);
    res.status(500).json({ error: err.message });
  }
};

// Lấy danh sách từ với trạng thái 0
const getWordsByStatus0 = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .query('SELECT * FROM Word WHERE Status = 0');
    res.status(200).json(result.recordset);
  } catch (err) {
    console.error('Error fetching words with status 0:', err.message);
    res.status(500).json({ error: err.message });
  }
};

// Cập nhật trạng thái từ
const updateWordStatus = async (req, res) => {
  try {
    const { id, newStatus } = req.body;

    if (typeof id !== 'number' || typeof newStatus !== 'number') {
      return res.status(400).json({ message: 'Invalid input: id and newStatus must be numbers.' });
    }

    const pool = await poolPromise;

    // Kiểm tra tồn tại của từ
    const existingWord = await pool.request()
      .input('id', sql.Int, id)
      .query('SELECT * FROM Word WHERE Id = @id');

    if (existingWord.recordset.length === 0) {
      return res.status(404).json({ message: 'Word not found.' });
    }

    await pool.request()
      .input('id', sql.Int, id)
      .input('newStatus', sql.Int, newStatus)
      .query('UPDATE Word SET Status = @newStatus, UpdatedAt = GETDATE() WHERE Id = @id');

    res.status(200).json({ message: 'Word status updated successfully!' });
  } catch (err) {
    console.error('Error updating word status:', err.message);
    res.status(500).json({ error: err.message });
  }
};

const searchWord = async (req, res) => {
  try {
    const { keyword = '' } = req.query;
    
    // Kết nối cơ sở dữ liệu
    const pool = await poolPromise;
    
    // Truy vấn lấy 10 kết quả đầu tiên bắt đầu bằng từ khóa
    const result = await pool.request()
      .input('keyword', sql.NVarChar, `${keyword}%`) // Ký tự % chỉ đặt ở cuối
      .query(`
        SELECT TOP 10 * 
        FROM Word 
        WHERE Word LIKE @keyword
        ORDER BY Word
      `);

    // Kiểm tra kết quả
    if (result.recordset.length === 0) {
      return res.status(404).json({ message: 'No words found matching the keyword.' });
    }

    // Trả về danh sách các từ tìm được
    return res.status(200).json(result.recordset);
  } catch (err) {
    console.error('Error searching word:', err.message);
    res.status(500).json({ error: err.message });
  }
};

const getRandomWordByLevel = async (req, res) => {
  try {
    const { levelId } = req.query; // Nhận levelId từ query parameters
    console.log('Received levelId:', levelId); // Kiểm tra đầu vào

    if (!levelId) {
      console.log('LevelId is missing'); // Ghi log khi thiếu levelId
      return res.status(400).json({ message: 'LevelId is required' });
    }

    const pool = await poolPromise;

    // Lấy tất cả các LevelWordId từ bảng LevelMapping với LevelId cụ thể
    const levelMappingResult = await pool.request()
      .input('levelId', sql.Int, levelId)
      .query('SELECT LevelWordId FROM LevelMapping WHERE LevelId = @levelId AND Status = 1');

    console.log('Level mapping result:', levelMappingResult.recordset); // Kiểm tra kết quả lấy từ bảng LevelMapping

    const levelWordIds = levelMappingResult.recordset.map(row => row.LevelWordId);

    if (levelWordIds.length === 0) {
      console.log('No words found for this level'); // Ghi log khi không tìm thấy từ nào
      return res.status(404).json({ message: 'No words found for this level.' });
    }

    // Tạo truy vấn để lấy 10 từ ngẫu nhiên từ bảng Word với các LevelWordId đã tìm được
    const randomWordsQuery = `
      SELECT TOP 10 * 
      FROM Word 
      WHERE LevelWordId IN (${levelWordIds.map(id => `'${id}'`).join(',')}) AND Status = 1
      ORDER BY NEWID() -- Sắp xếp ngẫu nhiên
    `;

    console.log('Executing random words query:', randomWordsQuery); // Kiểm tra câu truy vấn

    const randomWordsResult = await pool.request().query(randomWordsQuery);

    console.log('Random words found:', randomWordsResult.recordset); // Kiểm tra từ ngẫu nhiên tìm được

    if (randomWordsResult.recordset.length === 0) {
      console.log('No words found for the given LevelId'); // Ghi log khi không tìm thấy từ nào
      return res.status(404).json({ message: 'No words found for the given LevelId.' });
    }

    res.status(200).json(randomWordsResult.recordset); // Trả về mảng các từ ngẫu nhiên
  } catch (err) {
    console.error('Error fetching random word by level:', err.message);
    res.status(500).json({ error: err.message });
  }
};


// Cập nhật từ yêu thích
const toggleFavoriteWord = async (req, res) => {
  try {
    const { userId, wordId } = req.body;

    if (!userId || !wordId) {
      return res.status(400).json({ message: 'UserId and WordId are required.' });
    }

    const pool = await poolPromise;

    // Kiểm tra xem từ đã có trong danh sách yêu thích của người dùng chưa
    const checkFavoriteQuery = `
      SELECT * FROM FavoriteWords 
      WHERE UserId = @userId AND WordId = @wordId
    `;
    const checkFavoriteResult = await pool.request()
      .input('userId', sql.Int, userId)
      .input('wordId', sql.Int, wordId)
      .query(checkFavoriteQuery);

    if (checkFavoriteResult.recordset.length > 0) {
      // Nếu đã có, kiểm tra trạng thái hiện tại
      const currentStatus = checkFavoriteResult.recordset[0].Status;
      
      // Cập nhật trạng thái
      const newStatus = currentStatus === 1 ? 0 : 1;
      await pool.request()
        .input('userId', sql.Int, userId)
        .input('wordId', sql.Int, wordId)
        .input('newStatus', sql.Int, newStatus)
        .query(`
          UPDATE FavoriteWords
          SET Status = @newStatus
          WHERE UserId = @userId AND WordId = @wordId
        `);
        
      const message = newStatus === 1 ? 'Word added to favorites.' : 'Word removed from favorites.';
      return res.status(200).json({ message });
    } else {
      // Nếu chưa có, thì thêm vào danh sách yêu thích với trạng thái 1 (yêu thích)
      await pool.request()
        .input('userId', sql.Int, userId)
        .input('wordId', sql.Int, wordId)
        .query(`
          INSERT INTO FavoriteWords (UserId, WordId, Status, CreatedAt)
          VALUES (@userId, @wordId, 1, GETDATE())
        `);
      return res.status(201).json({ message: 'Word added to favorites.' });
    }
  } catch (err) {
    console.error('Error toggling favorite word:', err.message);
    res.status(500).json({ error: err.message });
  }
};

const getFavoriteWords = async (req, res) => {
  try {
    const { userId } = req.query;

    // Kiểm tra đầu vào
    if (!userId) {
      return res.status(400).json({ message: 'UserId is required.' });
    }

    const pool = await poolPromise;

    // Truy vấn lấy các từ yêu thích của người dùng, bao gồm DefinitionVI và ExampleVI
    const result = await pool.request()
      .input('userId', sql.Int, userId)
      .query(`
        SELECT w.Id, w.Word, w.PartOfSpeech, w.LevelWordId, w.Definition, w.PhoneticUK, w.PhoneticUS, w.AudioUK, w.AudioUS, w.Example, w.DefinitionVI, w.ExampleVI
        FROM Word w
        INNER JOIN FavoriteWords fw ON w.Id = fw.WordId
        WHERE fw.UserId = @userId AND fw.Status = 1
      `);

    // Kiểm tra kết quả
    if (result.recordset.length === 0) {
      return res.status(404).json({ message: 'No favorite words found for this user.' });
    }

    // Trả về danh sách các từ yêu thích
    res.status(200).json(result.recordset);
  } catch (err) {
    console.error('Error fetching favorite words:', err.message);
    res.status(500).json({ error: err.message });
  }
};

// Lấy từ ngẫu nhiên để đoán
const getRandomWordForGuess = async (req, res) => {
  try {
    const pool = await poolPromise;

    // Tạo truy vấn để lấy 1 từ ngẫu nhiên từ bảng Word với trạng thái là 1 (có thể sử dụng)
    const randomWordQuery = `
      SELECT TOP 1 Id, Word -- Lấy thêm Id
      FROM Word 
      WHERE Status = 1 
      ORDER BY NEWID() -- Sắp xếp ngẫu nhiên
    `;

    console.log('Executing random word query for guessing:', randomWordQuery); // Kiểm tra câu truy vấn

    const randomWordResult = await pool.request().query(randomWordQuery);

    console.log('Random word found for guessing:', randomWordResult.recordset); // Kiểm tra từ ngẫu nhiên tìm được

    if (randomWordResult.recordset.length === 0) {
      console.log('No words found for guessing'); // Ghi log khi không tìm thấy từ nào
      return res.status(404).json({ message: 'No words found for guessing.' });
    }

    // Lấy từ gốc và Id
    const wordRecord = randomWordResult.recordset[0];
    const word = wordRecord.Word;
    const id = wordRecord.Id; // Lấy Id

    // Loại bỏ tất cả số và các từ chứa số
    const cleanedWord = word.replace(/\b\w*\d\w*\b/g, ''); // Loại bỏ các từ có chứa số
    const finalCleanedWord = cleanedWord.replace(/\s+/g, ' ').trim(); // Loại bỏ khoảng trắng thừa

    // Chuyển đổi từ thành chữ in hoa
    const upperCaseWord = word.toUpperCase();
    const upperCaseCleanedWord = finalCleanedWord.toUpperCase();

    // Trả về Id, từ ngẫu nhiên và từ đã được làm sạch
    res.status(200).json({ id: id, original: upperCaseWord, cleaned: upperCaseCleanedWord });
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
      .query(`
        SELECT COUNT(*) AS AnswerCount 
        FROM WordGuessAnswer 
        WHERE UserId = @userId AND WordId = @wordId AND Status = 1
      `);

    const answerCount = countResult.recordset[0].AnswerCount;

    // Kiểm tra số lần thử tối đa
    if (answerCount >= 6) {
      return res.status(403).json({ message: 'Game over. You have reached the maximum number of attempts (6).' });
    }

    // Kiểm tra từ đúng
    const wordResult = await pool.request()
      .input('wordId', sql.Int, wordId)
      .query(`SELECT Word FROM Word WHERE Id = @wordId AND Status = 1`);

    if (wordResult.recordset.length === 0) {
      return res.status(404).json({ message: 'Word not found.' });
    }

    const correctAnswer = wordResult.recordset[0].Word; // Từ đúng
    const isCorrect = correctAnswer.toUpperCase() === answer.toUpperCase(); // So sánh đáp án (chữ in hoa)

    // Lưu đáp án vào bảng WordGuessAnswer
    await pool.request()
      .input('userId', sql.Int, userId)
      .input('wordId', sql.Int, wordId)
      .input('answer', sql.NVarChar(sql.MAX), answer)
      .input('isCorrect', sql.Bit, isCorrect ? 1 : 0)
      .query(`
        INSERT INTO WordGuessAnswer (UserId, WordId, Answer, IsCorrect, CreatedAt, UpdatedAt, Status) 
        VALUES (@userId, @wordId, @answer, @isCorrect, GETDATE(), GETDATE(), 1)
      `);

    // Kiểm tra nếu là lần thứ 6 và sai
    if (answerCount === 5 && !isCorrect) {
      return res.status(403).json({ message: 'Game over. You have made 6 attempts and did not guess the word.' });
    }

    res.status(200).json({ message: 'Answer submitted successfully.', isCorrect });
  } catch (err) {
    console.error('Error submitting answer:', err.message);
    res.status(500).json({ error: err.message });
  }
};


module.exports = {
  addWord,
  getWordsByStatus1,
  getWordsByStatus0,
  updateWordStatus,
  searchWord,
  getRandomWordByLevel,
  toggleFavoriteWord, 
  getFavoriteWords,
  getRandomWordForGuess,
  submitWordGuessAnswer,
};
