// gameRoutes.js
const express = require('express');
const router = express.Router();
const wordController = require('../controllers/gameController');


// Route để lấy từ ngẫu nhiên cho Word Guess theo LevelId
router.get('/random-word-for-guess', wordController.getRandomWordForGuess);

router.post('/submit-answer', wordController.submitWordGuessAnswer);

module.exports = router;
