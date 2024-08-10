const express = require('express');
const router = express.Router();
const passport = require('passport');

// Route để bắt đầu quá trình xác thực với Google
router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email']
}));

// Callback từ Google sau khi xác thực thành công
router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    res.redirect('/');
  }
);

module.exports = router;
