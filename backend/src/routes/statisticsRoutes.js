const express = require('express');
const router = express.Router();
const statisticsController = require('../controllers/statisticsController');

router.get('/learning-stats', statisticsController.getLearningStats);
router.get('/level-distribution', statisticsController.getLevelDistribution);

module.exports = router; 