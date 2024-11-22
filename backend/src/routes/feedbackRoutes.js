const express = require('express');
const router = express.Router();
const { createFeedback, getUserFeedbacks } = require('../controllers/feedbackController');

// Route để user gửi feedback
router.post('/create', createFeedback);

// Route để lấy tất cả feedback của một user
router.get('/getfeedbacks', getUserFeedbacks);

module.exports = router; 