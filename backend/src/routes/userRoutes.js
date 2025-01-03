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
router.put('/users/updateUser', userController.updateUserName);
// Route for changing password
router.put('/users/changePassword', userController.changePassword);

router.put('/update-user-status', userController.updateUserStatus);

router.get('/users/status1', userController.getUsersByStatus1);
router.get('/users/status0', userController.getUsersByStatus0);

router.get('/verify/:token', userController.confirmEmail);

router.post('/request-password-reset', userController.requestPasswordReset);
router.post('/verify-reset-token', userController.verifyResetToken);
router.post('/reset-password', userController.resetPassword);

module.exports = router;
