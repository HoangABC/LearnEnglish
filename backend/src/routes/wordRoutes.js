// wordRoutes.js
const express = require('express');
const router = express.Router();
const wordController = require('../controllers/wordController');

// Route để thêm từ mới
router.post('/add-word', wordController.addWord);

// Route để lấy từ với trạng thái 1
router.get('/words/status1', wordController.getWordsByStatus1);

// Route để lấy từ với trạng thái 0
router.get('/words/status0', wordController.getWordsByStatus0);

// Route để cập nhật trạng thái của từ
router.put('/update-word-status', wordController.updateWordStatus);

// Route để tìm kiếm từ
router.get('/search', wordController.searchWord);

// Route để lấy từ vựng ngẫu nhiên theo mức độ
router.get('/random-words', wordController.getRandomWordByLevel);

// Route để thêm hoặc xóa từ khỏi danh sách yêu thích
router.post('/toggle-favorite-word', wordController.toggleFavoriteWord);

// Route để lấy danh sách từ yêu thích của người dùng
router.get('/favorite-words', wordController.getFavoriteWords);

// Route để lấy từ ngẫu nhiên cho Word Guess theo LevelId
router.get('/random-word-for-guess', wordController.getRandomWordForGuess);

router.post('/submit-answer', wordController.submitWordGuessAnswer);

module.exports = router;
