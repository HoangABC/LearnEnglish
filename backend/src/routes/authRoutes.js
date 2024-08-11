const express = require('express');
const passport = require('passport');
const fetch = require('node-fetch');
const router = express.Router();
const { findOne, create } = require('../models/User');

// Route để bắt đầu quá trình xác thực với Google (GET)
router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email']
}));

// Route để xử lý callback từ Google (GET)
router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    res.redirect('/');
  }
);

// Route để xử lý login với token (POST)
router.post('/google/login', async (req, res) => {
  const { token } = req.body;
  console.log('Received token:', token);

  try {
    // Gửi yêu cầu xác thực mã token với Google
    const response = await fetch(`https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=${token}`);
    const userInfo = await response.json();
    console.log('User info from Google:', userInfo);

    if (userInfo.error) {
      console.error('Google token error:', userInfo.error);
      return res.status(400).json({ success: false, message: 'Token không hợp lệ' });
    }

    // Tìm người dùng trong cơ sở dữ liệu
    let user = await findOne({ googleId: userInfo.sub });

    if (!user) {
      // Nếu người dùng chưa tồn tại, thêm vào cơ sở dữ liệu
      user = {
        googleId: userInfo.sub,
        name: userInfo.name,
        email: userInfo.email
      };
      await create(user);
    }

    // Đăng nhập thành công, trả về thông tin người dùng
    res.json({ success: true, message: 'User logged in successfully!', user });
  } catch (error) {
    console.error('Lỗi xác thực:', error);
    res.status(500).json({ success: false, message: 'Lỗi xác thực' });
  }
});

module.exports = router;
