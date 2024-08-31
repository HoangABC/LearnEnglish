// router.js

const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Existing routes
router.post('/register', userController.register);
router.post('/login', userController.login);
router.post('/logout', userController.logout);
router.get('/users', userController.getAllUsers);

// Route for updating user level
router.put('/users/:id/level', userController.updateUserLevel);
router.get('/levels', userController.getAllLevels);

module.exports = router;
