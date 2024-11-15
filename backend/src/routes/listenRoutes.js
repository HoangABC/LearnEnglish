const express = require('express');
const router = express.Router();
const listenController = require('../controllers/listenController'); 

// Route để lấy bài luyện nghe
router.get('/getListeningPractice', listenController.getListeningPractice);

// Route để nộp câu trả lời bài luyện nghe
router.post('/submitListeningPractice', listenController.submitListeningPractice);

module.exports = router;
