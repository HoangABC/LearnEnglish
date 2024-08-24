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
    
    // Truy vấn lấy 10 kết quả đầu tiên
    const result = await pool.request()
      .input('keyword', sql.NVarChar, `%${keyword}%`)
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




module.exports = {
  addWord,
  getWordsByStatus1,
  getWordsByStatus0,
  updateWordStatus,
  searchWord
};
