const express = require('express');
const router = express.Router();
const { login, logout, getAllFeedbacks, getFeedbackById, getFeedbacksByUserId, respondToFeedback } = require('../controllers/adminController'); 

// Route để đăng nhập
router.post('/login', login);

// Route để đăng xuất
router.post('/logout', logout);

router.get('/feedbacks', getAllFeedbacks);
router.get('/feedbacks/:id', getFeedbackById);
router.get('/feedbacks/user/:userId', getFeedbacksByUserId);

router.post('/feedbacks/respond', respondToFeedback);

module.exports = router;
