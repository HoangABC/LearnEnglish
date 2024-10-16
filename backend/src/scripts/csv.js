const fs = require('fs');  
const readline = require('readline');
const { poolPromise, sql } = require('../config/db');

// Đối tượng ánh xạ từ levelWord đến levelWordId
const levelWordMapping = {
  'A1': 1,
  'A2': 2,
  'B1': 3,
  'B2': 4,
  'B2+': 5,
  'C1': 6,
  'D': 7
};

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
      levelWord, // Giữ lại levelWord
      definition,
      phoneticUK,
      phoneticUS,
      audioUK,
      audioUS,
      example,
      dictionaryURL,
      exampleVi,
      definitionVi
    ] = line.split('|').map(field => field.trim()); // Đảm bảo rằng các trường không có khoảng trắng thừa

    // Lấy từ chính và URL truy vấn
    const actualWord = urlQuery.split('=')[1] || word;

    // Lấy levelWordId từ ánh xạ
    const levelWordId = levelWordMapping[levelWord] || null; // Nếu không tìm thấy, gán null

    try {
      await pool.request()
        .input('queryURL', sql.NVarChar, urlQuery || '') // Lưu URL truy vấn vào cột mới
        .input('word', sql.NVarChar, actualWord)
        .input('partOfSpeech', sql.NVarChar, partOfSpeech || '')
        .input('levelWordId', sql.Int, levelWordId) // Sử dụng ID từ ánh xạ
        .input('definition', sql.NVarChar, definition || '')
        .input('definitionVi', sql.NVarChar, definitionVi || '')
        .input('phoneticUK', sql.NVarChar, phoneticUK || '')
        .input('phoneticUS', sql.NVarChar, phoneticUS || '')
        .input('audioUK', sql.NVarChar, audioUK || '')
        .input('audioUS', sql.NVarChar, audioUS || '')
        .input('example', sql.NVarChar, example || '')
        .input('exampleVi', sql.NVarChar, exampleVi || '')
        .input('status', sql.Int, 1) // Mặc định trạng thái là 1
        .query(`
          INSERT INTO Word (QueryURL, Word, PartOfSpeech, LevelWordId, Definition, DefinitionVI, PhoneticUK, PhoneticUS, AudioUK, AudioUS, Example, ExampleVI, Status)
          VALUES (@queryURL, @word, @partOfSpeech, @levelWordId, @definition, @definitionVi, @phoneticUK, @phoneticUS, @audioUK, @audioUS, @example, @exampleVi, @status)
        `);
    } catch (err) {
      console.error('Error inserting data:', err);
    }
  }

  console.log('Data import complete');
};

// Export hàm để sử dụng ở nơi khác
module.exports = importCSVtoDatabase;
