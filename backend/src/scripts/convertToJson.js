const fs = require('fs');
const path = require('path');

// Đọc file txt từ đường dẫn chính xác
const words = fs.readFileSync(path.join(__dirname, '../data/sgb-words.txt'), 'utf8')
  .split('\n')
  .filter(word => word.trim()) // loại bỏ dòng trống
  .map(word => word.trim().toLowerCase()); // chuẩn hóa từ

// Ghi ra file JSON với đường dẫn chính xác
fs.writeFileSync(
  path.join(__dirname, '../data//wordList.json'),
  JSON.stringify(words, null, 2)
); 

console.log('Conversion completed successfully!'); 