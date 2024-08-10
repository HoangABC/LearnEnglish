const fs = require('fs');
const readline = require('readline');
const { poolPromise, sql } = require('../config/db');

const importCSVtoDatabase = async (csvFilePath) => {
  const pool = await poolPromise;

  // Tạo một interface để đọc dữ liệu từ file CSV
  const fileStream = fs.createReadStream(csvFilePath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  // Đọc từng dòng của file
  for await (const line of rl) {
    // Tách dữ liệu bằng ký tự '|'
    const [
      urlQuery,
      word,
      partOfSpeech,
      level,
      definition,
      phoneticUK,
      phoneticUS,
      audioUK,
      audioUS,
      example,
      dictionaryURL
    ] = line.split('|').map(field => field.trim()); // Đảm bảo rằng các trường không có khoảng trắng thừa

    // Lấy từ chính và URL truy vấn
    const actualWord = urlQuery.split('=')[1] || word;

    try {
      await pool.request()
        .input('queryURL', sql.NVarChar, urlQuery || '') // Lưu URL truy vấn vào cột mới
        .input('word', sql.NVarChar, actualWord)
        .input('partOfSpeech', sql.NVarChar, partOfSpeech || '')
        .input('level', sql.NVarChar, level || '')
        .input('definition', sql.NVarChar, definition || '')
        .input('phoneticUK', sql.NVarChar, phoneticUK || '')
        .input('phoneticUS', sql.NVarChar, phoneticUS || '')
        .input('audioUK', sql.NVarChar, audioUK || '')
        .input('audioUS', sql.NVarChar, audioUS || '')
        .input('example', sql.NVarChar, example || '')
        .input('status', sql.Int, 1) // Mặc định trạng thái là 0
        .query(`
          INSERT INTO Word (QueryURL, word, partOfSpeech, level, definition, phoneticUK, phoneticUS, audioUK, audioUS, example,  Status)
          VALUES (@queryURL, @word, @partOfSpeech, @level, @definition, @phoneticUK, @phoneticUS, @audioUK, @audioUS, @example, @status)
        `);
    } catch (err) {
      console.error('Error inserting data:', err);
    }
  }

  console.log('Data import complete');
};

// Export hàm để sử dụng ở nơi khác
module.exports = importCSVtoDatabase;
