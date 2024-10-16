// testRoutes.js
const express = require('express');
const router = express.Router();
const testController = require('../controllers/testController');

// Route để lấy câu hỏi
router.get('/quiz', testController.getQuizQuestions);

// Route để nộp câu trả lời
router.post('/submit', testController.submitQuizAnswers);

module.exports = router;
