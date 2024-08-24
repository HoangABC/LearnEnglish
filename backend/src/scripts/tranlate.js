const fs = require('fs');
const { poolPromise, sql } = require('../config/db');

// Ánh xạ từ loại giữa tiếng Việt và tiếng Anh
const partOfSpeechMapping = {
    'tính từ': 'adjective',
    'danh từ': 'noun',
    'đại từ': 'pronoun',
    'điều từ': 'determiner',
    'phó từ': 'adverb',
    'liên từ': 'conjunction',
    'giới từ': 'preposition',
    'ngoại động từ': 'verb',
    'mạo từ': 'indefinite article',
    'thán từ': 'exclamation',
};

// Đọc và phân tích file TXT
function parseTxtFile(filePath) {
    const data = fs.readFileSync(filePath, 'utf8');
    const words = {};

    const entries = data.split('@');
    for (const entry of entries.slice(1)) {
        const lines = entry.trim().split('\n');
        
        if (lines.length < 2) {
            continue; // Bỏ qua các mục không đủ số dòng cần thiết
        }

        const wordLine = lines[0].trim();
        const word = wordLine.split(' ')[0].trim(); // Lấy từ đầu tiên trong dòng

        let currentPartOfSpeech = [];
        let definition = '';
        const definitionsMap = {};

        for (const line of lines.slice(1)) {
            if (line.startsWith('*')) {
                // Lưu định nghĩa của loại từ hiện tại
                if (currentPartOfSpeech.length > 0) {
                    currentPartOfSpeech.forEach(pos => {
                        if (!definitionsMap[pos]) {
                            definitionsMap[pos] = '';
                        }
                        definitionsMap[pos] += definition.trim() + ' ';
                    });
                }
                // Cập nhật loại từ mới
                currentPartOfSpeech = line.slice(1).trim().split(',').map(pos => partOfSpeechMapping[pos.trim()] || 'unknown');
                definition = '';
            } else if (line.startsWith('-') || line.startsWith('=')) {
                // Thêm định nghĩa
                definition += line.slice(1).trim() + ' ';
            } else if (line.startsWith('!')) {
                // Xử lý thán từ
                const exclamation = line.slice(1).trim();
                currentPartOfSpeech.forEach(pos => {
                    if (!definitionsMap[pos]) {
                        definitionsMap[pos] = '';
                    }
                    definitionsMap[pos] += exclamation.trim() + ' ';
                });
            }
        }

        // Lưu định nghĩa cho loại từ cuối cùng
        if (currentPartOfSpeech.length > 0) {
            currentPartOfSpeech.forEach(pos => {
                if (!definitionsMap[pos]) {
                    definitionsMap[pos] = '';
                }
                definitionsMap[pos] += definition.trim() + ' ';
            });
        }

        for (const [pos, def] of Object.entries(definitionsMap)) {
            const key = `${word}|${pos}`;
            words[key] = def.trim();
        }
    }

    return words;
}

// Tìm tất cả các bản ghi với từ và loại từ phù hợp trong cơ sở dữ liệu
const findAll = async (word, partOfSpeech) => {
    const pool = await poolPromise;
    const result = await pool.request()
        .input('word', sql.NVarChar, word)
        .input('partOfSpeech', sql.NVarChar, partOfSpeech)
        .query('SELECT * FROM Word WHERE Word = @word AND CHARINDEX(@partOfSpeech, PartOfSpeech) > 0');
    return result.recordset;
};

// Cập nhật định nghĩa tiếng Việt cho tất cả các bản ghi phù hợp
const updateDefinitionVI = async (word, partOfSpeech, definitionVI) => {
    const pool = await poolPromise;
    await pool.request()
        .input('word', sql.NVarChar, word)
        .input('partOfSpeech', sql.NVarChar, partOfSpeech)
        .input('definitionVI', sql.NVarChar, definitionVI)
        .query('UPDATE Word SET DefinitionVI = @definitionVI WHERE Word = @word AND CHARINDEX(@partOfSpeech, PartOfSpeech) > 0');
};

// Đồng bộ dữ liệu từ file với cơ sở dữ liệu
const syncWordsWithDatabase = async (wordsDefinitions) => {
    for (const [key, definition] of Object.entries(wordsDefinitions)) {
        const [word, partOfSpeech] = key.split('|'); 

        // Tìm tất cả các bản ghi với từ và loại từ phù hợp trong cơ sở dữ liệu
        const existingWords = await findAll(word, partOfSpeech);
        
        if (existingWords.length > 0) {
            // Cập nhật định nghĩa tiếng Việt cho tất cả các bản ghi phù hợp
            await updateDefinitionVI(word, partOfSpeech, definition);
        } else {
            console.log(`Word ${word} with part of speech ${partOfSpeech} not found in the database.`);
        }
    }
};

module.exports = {
    parseTxtFile,
    findAll,
    updateDefinitionVI,
    syncWordsWithDatabase
};
