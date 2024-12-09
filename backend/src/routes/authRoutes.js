const express = require('express');
const passport = require('passport');
const fetch = require('node-fetch');
const router = express.Router();
const { findOne, create, updateGoogleId } = require('../models/User');


router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email']
}));


router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    res.redirect('/');
  }
);

router.post('/google/login', async (req, res) => {
  const { token } = req.body;
  console.log('Received token:', token);

  try {

    const response = await fetch(`https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=${token}`);
    const userInfo = await response.json();
    console.log('User info from Google:', userInfo);

    if (userInfo.error) {
      console.error('Google token error:', userInfo.error);
      return res.status(400).json({ success: false, message: 'Token không hợp lệ' });
    }

    if (!userInfo.name || !userInfo.email) {
      console.error('Missing name or email in the Google response');
      return res.status(400).json({ success: false, message: 'Google response không đầy đủ thông tin người dùng' });
    }

    let user = await findOne({ googleId: userInfo.sub, email: userInfo.email });
    console.log('user o day:', user);

    if (user) {
 
      if (!user.googleId) {
        await updateGoogleId(user.email, userInfo.sub, userInfo.picture || null);
        user.googleId = userInfo.sub;
        user.image = userInfo.picture || null; 
      }
    } else {

      const newUserId = await create({
        googleId: userInfo.sub,
        name: userInfo.name,
        email: userInfo.email,
        image: userInfo.picture || null,
      });

      user = await findOne({ googleId: userInfo.sub, email: userInfo.email });
      user.Id = newUserId;  
    }


    res.json({
      success: true,
      message: 'User logged in successfully!',
      user: {
        Id: user.Id,
        googleId: user.googleId,
        name: user.Name,
        email: user.Email,
        LevelId: user.LevelId || null,  
        image: user.Image || null, 
      },
    });
  } catch (error) {
    console.error('Lỗi xác thực:', error);
    res.status(500).json({ success: false, message: 'Lỗi xác thực' });
  }
});


module.exports = router;
