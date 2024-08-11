// src/routes/authRoutes.js
const express = require('express');
const passport = require('passport');
const router = express.Router();

// Route để bắt đầu quá trình xác thực với Google (GET)
router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email']
}));

// Route để xử lý callback từ Google (GET)
router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    // Chuyển hướng người dùng đến trang chính
    res.redirect('/');
  }
);

// Route để xử lý login với token (POST)
router.post('/google/login', async (req, res) => {
  const { token } = req.body;

  try {
    const response = await fetch(`https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=${token}`);
    const userInfo = await response.json();

    if (userInfo.error) {
      console.error('Google token error:', userInfo.error);
      return res.status(400).json({ success: false, message: 'Token không hợp lệ' });
    }

    // Xử lý thông tin người dùng, ví dụ: lưu vào cơ sở dữ liệu và tạo session
    res.json({ success: true, user: userInfo });
  } catch (error) {
    console.error('Lỗi xác thực:', error);
    res.status(500).json({ success: false, message: 'Lỗi xác thực' });
  }
});

module.exports = router;
