const express = require('express');
const passport = require('passport');
const fetch = require('node-fetch');
const router = express.Router();
const { findOne, create, updateGoogleId } = require('../models/User');

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

    // Kiểm tra lỗi trong thông tin trả về từ Google
    if (userInfo.error) {
      console.error('Google token error:', userInfo.error);
      return res.status(400).json({ success: false, message: 'Token không hợp lệ' });
    }

    // Kiểm tra xem có các thông tin cần thiết từ Google không
    if (!userInfo.name || !userInfo.email) {
      console.error('Missing name or email in the Google response');
      return res.status(400).json({ success: false, message: 'Google response không đầy đủ thông tin người dùng' });
    }

    // Tìm người dùng trong cơ sở dữ liệu bằng googleId hoặc email
    let user = await findOne({ googleId: userInfo.sub, email: userInfo.email });
    console.log('user o day:', user);

    if (user) {
      // Nếu người dùng tồn tại và không có googleId, cập nhật googleId
      if (!user.googleId) {
        await updateGoogleId(user.email, userInfo.sub, userInfo.picture || null);
        user.googleId = userInfo.sub;
        user.image = userInfo.picture || null;  // Cập nhật ảnh nếu có
      }
    } else {
      // Nếu người dùng chưa tồn tại, thêm vào cơ sở dữ liệu và lấy Id
      const newUserId = await create({
        googleId: userInfo.sub,
        name: userInfo.name,
        email: userInfo.email,
        image: userInfo.picture || null,
      });
      // Lấy lại thông tin người dùng sau khi tạo
      user = await findOne({ googleId: userInfo.sub, email: userInfo.email });
      user.Id = newUserId;  // Cập nhật Id cho người dùng mới
    }

    // Đăng nhập thành công, trả về thông tin người dùng (bao gồm name, email, googleId, image và Id)
    res.json({
      success: true,
      message: 'User logged in successfully!',
      user: {
        Id: user.Id,
        googleId: user.googleId,
        name: user.Name,
        email: user.Email,
        LevelId: user.LevelId || null,  // Nếu có LevelId, trả về, nếu không trả về null
        image: user.image || null,  // Trả về ảnh đại diện nếu có
      },
    });
  } catch (error) {
    console.error('Lỗi xác thực:', error);
    res.status(500).json({ success: false, message: 'Lỗi xác thực' });
  }
});


module.exports = router;
