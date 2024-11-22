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
    const { 
      word,
      partOfSpeech,
      levelWordId,
      definition,
      definitionVI,
      phoneticUK,
      phoneticUS,
      audioUK,
      audioUS,
      example,
      exampleVI,
      queryURL
    } = req.body;

    // Validate required fields
    if (!word || !partOfSpeech || !levelWordId || !definition) {
      return res.status(400).json({ 
        message: 'Missing required fields: word, partOfSpeech, levelWordId, and definition are required.' 
      });
    }

    const pool = await poolPromise;

    // Check if levelWordId exists
    const levelWordCheck = await pool.request()
      .input('levelWordId', sql.Int, levelWordId)
      .query('SELECT Id FROM LevelWord WHERE Id = @levelWordId AND Status = 1');

    if (levelWordCheck.recordset.length === 0) {
      return res.status(404).json({ 
        message: 'Invalid levelWordId: Level word not found.' 
      });
    }

    // Try to verify word meaning but don't block if it fails
    try {
      await verifyWordMeaning(word);
    } catch (verifyError) {
      console.warn(`Word verification warning for "${word}":`, verifyError.message);
      // Continue with word creation despite verification failure
    }

    // Insert new word using SQL Server
    const result = await pool.request()
      .input('word', sql.NVarChar, word)
      .input('partOfSpeech', sql.NVarChar, partOfSpeech)
      .input('levelWordId', sql.Int, levelWordId)
      .input('definition', sql.NVarChar, definition)
      .input('definitionVI', sql.NVarChar, definitionVI || null)
      .input('phoneticUK', sql.NVarChar, phoneticUK || null)
      .input('phoneticUS', sql.NVarChar, phoneticUS || null)
      .input('audioUK', sql.NVarChar, audioUK || null)
      .input('audioUS', sql.NVarChar, audioUS || null)
      .input('example', sql.NVarChar, example || null)
      .input('exampleVI', sql.NVarChar, exampleVI || null)
      .input('queryURL', sql.NVarChar, queryURL || null)
      .query(`
        INSERT INTO Word (
          Word, 
          PartOfSpeech, 
          LevelWordId, 
          Definition, 
          DefinitionVI, 
          PhoneticUK, 
          PhoneticUS, 
          AudioUK, 
          AudioUS, 
          Example, 
          ExampleVI, 
          QueryURL,
          Status,
          CreatedAt,
          UpdatedAt
        )
        VALUES (
          @word,
          @partOfSpeech,
          @levelWordId,
          @definition,
          @definitionVI,
          @phoneticUK,
          @phoneticUS,
          @audioUK,
          @audioUS,
          @example,
          @exampleVI,
          @queryURL,
          1,
          GETDATE(),
          GETDATE()
        );
        
        SELECT SCOPE_IDENTITY() AS Id;
      `);

    const newWordId = result.recordset[0].Id;

    // Emit socket event for real-time updates
    const io = getIo();
    io.emit('newWordAdded', {
      id: newWordId,
      word,
      partOfSpeech,
      definition,
      phoneticUK,
      phoneticUS,
      audioUK,
      audioUS,
      example
    });

    res.status(201).json({ 
      message: 'Word added successfully!',
      word: {
        id: newWordId,
        word,
        partOfSpeech,
        levelWordId,
        definition,
        definitionVI,
        phoneticUK,
        phoneticUS,
        audioUK,
        audioUS,
        example,
        exampleVI
      }
    });
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
    
    // Truy vấn lấy 10 kết quả đầu tiên bắt đầu bằng từ khóa và có Status = 1
    const result = await pool.request()
      .input('keyword', sql.NVarChar, `${keyword}%`)
      .query(`
        SELECT TOP 10 * 
        FROM Word 
        WHERE Word LIKE @keyword AND Status = 1
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


    const randomWordsResult = await pool.request().query(randomWordsQuery);

    console.log('Random words found:', randomWordsResult.recordset); 

    if (randomWordsResult.recordset.length === 0) {
      console.log('No words found for the given LevelId');
      return res.status(404).json({ message: 'No words found for the given LevelId.' });
    }

    res.status(200).json(randomWordsResult.recordset); 
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

    const checkFavoriteQuery = `
      SELECT * FROM FavoriteWords 
      WHERE UserId = @userId AND WordId = @wordId
    `;
    const checkFavoriteResult = await pool.request()
      .input('userId', sql.Int, userId)
      .input('wordId', sql.Int, wordId)
      .query(checkFavoriteQuery);

    if (checkFavoriteResult.recordset.length > 0) {

      const currentStatus = checkFavoriteResult.recordset[0].Status;
      

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

    const result = await pool.request()
      .input('userId', sql.Int, userId)
      .query(`
        SELECT w.Id, w.Word, w.PartOfSpeech, w.LevelWordId, w.Definition, 
               w.PhoneticUK, w.PhoneticUS, w.AudioUK, w.AudioUS, w.Example, 
               w.DefinitionVI, w.ExampleVI, fw.UserId
        FROM Word w
        INNER JOIN FavoriteWords fw ON w.Id = fw.WordId
        WHERE fw.UserId = @userId AND fw.Status = 1
      `);

    // Kiểm tra kết quả
    if (result.recordset.length === 0) {
      return res.status(404).json({ message: 'No favorite words found for this user.' });
    }

    // Trả về danh sách các từ yêu thích với userId
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

const getWordById = async (req, res) => {
  try {
    const { id } = req.query; // Lấy id từ query

    if (!id) {
      return res.status(400).json({ message: 'Word ID is required.' });
    }

    const pool = await poolPromise;

    // Lấy từ theo ID
    const wordByIdResult = await pool.request()
      .input('id', sql.Int, id)
      .query('SELECT * FROM Word WHERE Id = @id');

    if (wordByIdResult.recordset.length === 0) {
      return res.status(404).json({ message: 'Word not found.' });
    }

    const word = wordByIdResult.recordset[0].Word;

    // Tìm tất cả các từ trùng khớp với từ theo ID, loại bỏ các cột không cần thiết
    const duplicateWordsResult = await pool.request()
      .input('word', sql.NVarChar, word)
      .query('SELECT Id, Word, PartOfSpeech, Definition, DefinitionVI, Example, ExampleVI, CreatedAt, UpdatedAt, Status FROM Word WHERE Word = @word');

    // Kết hợp cả từ theo ID và các từ trùng khớp
    const combinedResults = [wordByIdResult.recordset[0], ...duplicateWordsResult.recordset];

    // Loại bỏ các từ bị trùng lặp
    const uniqueResults = combinedResults.filter(
      (item, index, self) => index === self.findIndex((w) => w.Id === item.Id)
    );

    res.status(200).json(uniqueResults);
  } catch (err) {
    console.error('Error fetching word by ID:', err.message);
    res.status(500).json({ error: err.message });
  }
};

const getMostFavoritedWordsToday = async (req, res) => {
  try {
    const { levelId } = req.query;

    if (!levelId) {
      return res.status(400).json({ message: 'LevelId is required' });
    }

    const pool = await poolPromise;

    // Get all LevelWordIds from LevelMapping for the specific LevelId
    const levelMappingResult = await pool.request()
      .input('levelId', sql.Int, levelId)
      .query(`
        SELECT LevelWordId 
        FROM LevelMapping 
        WHERE LevelId = @levelId AND Status = 1
      `);

    const levelWordIds = levelMappingResult.recordset.map(row => row.LevelWordId);

    if (levelWordIds.length === 0) {
      return res.status(404).json({ message: 'No LevelWordIds found for this level.' });
    }

    // Get all WordIds from Word where LevelWordId matches the ones retrieved
    const levelWordsResult = await pool.request()
      .input('levelWordIds', sql.Int, levelWordIds)
      .query(`
        SELECT Id 
        FROM Word 
        WHERE LevelWordId IN (${levelWordIds.join(',')}) AND Status = 1 
          AND Word NOT LIKE '%[0-9]%'  
      `);

    const wordIds = levelWordsResult.recordset.map(row => row.Id);

    if (wordIds.length === 0) {
      return res.status(404).json({ message: 'No words found for this level.' });
    }

    // Query for today's most favorited words
    const mostFavoritedWordsQuery = `
      SELECT w.Id, w.Word, COUNT(DISTINCT fw.UserId) AS FavoriteCount, 
             w.Definition, w.PhoneticUK, w.PhoneticUS, w.AudioUK, w.AudioUS,
             fw.Status AS FavoriteStatus, fw.CreatedAt, fw.UserId
      FROM Word w
      INNER JOIN FavoriteWords fw ON w.Id = fw.WordId
      WHERE fw.WordId IN (${wordIds.join(',')}) 
        AND fw.Status = 1
        AND CAST(fw.CreatedAt AS DATE) = CAST(GETDATE() AS DATE)  
        AND w.Word NOT LIKE '%[0-9]%'  
      GROUP BY w.Id, w.Word, w.Definition, w.PhoneticUK, w.PhoneticUS, w.AudioUK, w.AudioUS, fw.Status, fw.CreatedAt, fw.UserId
      ORDER BY FavoriteCount DESC, fw.CreatedAt DESC
    `;
    const mostFavoritedWordsResult = await pool.request().query(mostFavoritedWordsQuery);

    if (mostFavoritedWordsResult.recordset.length === 0) {
      // If no favorited words for today, fetch 10 random words
      const randomWordsQuery = `
        SELECT TOP 10 w.Id, w.Word, ISNULL(COUNT(fw.WordId), 0) AS FavoriteCount,
               w.Definition, w.PhoneticUK, w.PhoneticUS, w.AudioUK, w.AudioUS
        FROM Word w
        LEFT JOIN FavoriteWords fw ON w.Id = fw.WordId AND fw.Status = 1
        WHERE w.Status = 1
          AND w.Word NOT LIKE '%[0-9]%'  
          AND w.LevelWordId IN (${levelWordIds.join(',')})  -- Filter by LevelWordId
        GROUP BY w.Id, w.Word, w.Definition, w.PhoneticUK, w.PhoneticUS, w.AudioUK, w.AudioUS
        ORDER BY NEWID();  
      `;
      const randomWordsResult = await pool.request().query(randomWordsQuery);
      return res.status(200).json(randomWordsResult.recordset);
    }

    // Process most favorited words
    const favoritedWords = mostFavoritedWordsResult.recordset;

    // Grouping by word and collecting all userIds for each word
    const wordsWithUserIds = favoritedWords.reduce((acc, word) => {
      const existingWord = acc.find(w => w.Id === word.Id);
      if (existingWord) {
        existingWord.userIds.push(word.UserId);
        existingWord.FavoriteCount += 1;
      } else {
        acc.push({
          Id: word.Id,
          Word: word.Word,
          FavoriteCount: 1,
          Definition: word.Definition,
          PhoneticUK: word.PhoneticUK,
          PhoneticUS: word.PhoneticUS,
          AudioUK: word.AudioUK,
          AudioUS: word.AudioUS,
          userIds: [word.UserId] // Initialize with first userId
        });
      }
      return acc;
    }, []);

    // Calculate how many more words are needed to make 10
    const remainingCount = 10 - wordsWithUserIds.length;

    let finalWords = wordsWithUserIds;

    if (remainingCount > 0) {
      // Fetch random words to fill the remaining slots
      const randomWordsQuery = `
        SELECT TOP ${remainingCount} w.Id, w.Word, ISNULL(COUNT(fw.WordId), 0) AS FavoriteCount,
               w.Definition, w.PhoneticUK, w.PhoneticUS, w.AudioUK, w.AudioUS
        FROM Word w
        LEFT JOIN FavoriteWords fw ON w.Id = fw.WordId AND fw.Status = 1
        WHERE w.Status = 1
          AND w.Word NOT LIKE '%[0-9]%'  
          AND w.LevelWordId IN (${levelWordIds.join(',')})  -- Filter by LevelWordId
        GROUP BY w.Id, w.Word, w.Definition, w.PhoneticUK, w.PhoneticUS, w.AudioUK, w.AudioUS
        ORDER BY NEWID();  
      `;
      const randomWordsResult = await pool.request().query(randomWordsQuery);
      finalWords = finalWords.concat(randomWordsResult.recordset);
    }

    // Return the final list of words
    res.status(200).json(finalWords);
  } catch (err) {
    console.error('Error fetching most favorited words today:', err.message);
    res.status(500).json({ error: err.message });
  }
};

const editWord = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      word,
      partOfSpeech,
      levelWordId,
      definition,
      definitionVI,
      phoneticUK,
      phoneticUS,
      audioUK,
      audioUS,
      example,
      exampleVI,
      queryURL
    } = req.body;

    // Validate required fields
    if (!word || !partOfSpeech || !levelWordId || !definition) {
      return res.status(400).json({
        message: 'Missing required fields: word, partOfSpeech, levelWordId, and definition are required.'
      });
    }

    const pool = await poolPromise;

    // Check if word exists
    const existingWord = await pool.request()
      .input('id', sql.Int, id)
      .query('SELECT * FROM Word WHERE Id = @id');

    if (existingWord.recordset.length === 0) {
      return res.status(404).json({ message: 'Word not found.' });
    }

    // Check if levelWordId exists
    const levelWordCheck = await pool.request()
      .input('levelWordId', sql.Int, levelWordId)
      .query('SELECT Id FROM LevelWord WHERE Id = @levelWordId AND Status = 1');

    if (levelWordCheck.recordset.length === 0) {
      return res.status(404).json({
        message: 'Invalid levelWordId: Level word not found.'
      });
    }

    // Update word
    const result = await pool.request()
      .input('id', sql.Int, id)
      .input('word', sql.NVarChar, word)
      .input('partOfSpeech', sql.NVarChar, partOfSpeech)
      .input('levelWordId', sql.Int, levelWordId)
      .input('definition', sql.NVarChar, definition)
      .input('definitionVI', sql.NVarChar, definitionVI || null)
      .input('phoneticUK', sql.NVarChar, phoneticUK || null)
      .input('phoneticUS', sql.NVarChar, phoneticUS || null)
      .input('audioUK', sql.NVarChar, audioUK || null)
      .input('audioUS', sql.NVarChar, audioUS || null)
      .input('example', sql.NVarChar, example || null)
      .input('exampleVI', sql.NVarChar, exampleVI || null)
      .input('queryURL', sql.NVarChar, queryURL || null)
      .query(`
        UPDATE Word 
        SET Word = @word,
            PartOfSpeech = @partOfSpeech,
            LevelWordId = @levelWordId,
            Definition = @definition,
            DefinitionVI = @definitionVI,
            PhoneticUK = @phoneticUK,
            PhoneticUS = @phoneticUS,
            AudioUK = @audioUK,
            AudioUS = @audioUS,
            Example = @example,
            ExampleVI = @exampleVI,
            QueryURL = @queryURL,
            UpdatedAt = GETDATE()
        WHERE Id = @id;

        SELECT * FROM Word WHERE Id = @id;
      `);

    // Emit socket event for real-time updates
    const io = getIo();
    io.emit('wordUpdated', result.recordset[0]);

    res.status(200).json({
      message: 'Word updated successfully!',
      word: result.recordset[0]
    });
  } catch (err) {
    console.error('Edit word error:', err.message);
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
  getWordById,
  getMostFavoritedWordsToday,
  editWord,
};
