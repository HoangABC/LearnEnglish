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

module.exports = router;
