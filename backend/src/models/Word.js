
const { poolPromise, sql } = require('../config/db');

// Tìm từ theo từ khóa
const findOne = async (word) => {
  const pool = await poolPromise;
  const result = await pool.request()
    .input('word', sql.NVarChar, word)
    .query('SELECT * FROM Word WHERE word = @word');
  return result.recordset[0];
};

// Thêm từ mới vào bảng
const create = async (word) => {
  const pool = await poolPromise;
  await pool.request()
    .input('word', sql.NVarChar, word.word)
    .input('partOfSpeech', sql.NVarChar, word.partOfSpeech || '') // Thêm từ loại
    .input('level', sql.NVarChar, word.level || '') // Thêm cấp độ
    .input('definition', sql.NVarChar, word.definition)
    .input('phoneticUK', sql.NVarChar, word.phoneticUK || '') // Thêm phiên âm UK
    .input('phoneticUS', sql.NVarChar, word.phoneticUS || '') // Thêm phiên âm US
    .input('audioUK', sql.NVarChar, word.audioUK || '') // Thêm liên kết âm thanh UK
    .input('audioUS', sql.NVarChar, word.audioUS || '') // Thêm liên kết âm thanh US
    .input('example', sql.NVarChar, word.example || '')
    .input('status', sql.Int, word.status || 0)
    .query('INSERT INTO Word (word, partOfSpeech, level, definition, phoneticUK, phoneticUS, audioUK, audioUS, example, Status) VALUES (@word, @partOfSpeech, @level, @definition, @phoneticUK, @phoneticUS, @audioUK, @audioUS, @example, @status)');
};

module.exports = {
  findOne,
  create
};
