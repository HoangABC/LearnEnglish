require('dotenv').config();
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { findOne, create, updateGoogleId } = require('../models/User');

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: 'http://localhost:3000/auth/google/callback'
},
async (accessToken, refreshToken, profile, done) => {
  try {
    // Tìm người dùng trong cơ sở dữ liệu bằng googleId hoặc email
    const existingUser = await findOne({ googleId: profile.id, email: profile.emails[0].value });

    if (existingUser) {
      // Người dùng đã tồn tại
      if (!existingUser.googleId) {
        // Nếu người dùng có email nhưng không có googleId, cập nhật googleId
        await updateGoogleId(existingUser.email, profile.id);
        existingUser.googleId = profile.id;
      }
      return done(null, {
        id: existingUser.Id,
        name: existingUser.Name,
        email: existingUser.Email,
        levelId: existingUser.LevelId // Thêm LevelId vào đối tượng người dùng
      });
    }

    // Người dùng chưa tồn tại, thêm vào cơ sở dữ liệu
    const newUser = {
      googleId: profile.id,
      name: profile.displayName,
      email: profile.emails[0].value,
      levelId: null // LevelId có thể là null khi tạo mới
    };

    await create(newUser);
    return done(null, {
      id: newUser.Id,
      name: newUser.name,
      email: newUser.email,
      levelId: null // LevelId có thể là null khi tạo mới
    });
  } catch (error) {
    return done(error, null);
  }
}));

passport.serializeUser((user, done) => {
  done(null, user.googleId);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await findOne({ googleId: id });
    done(null, {
      id: user.Id,
      name: user.Name,
      email: user.Email,
      levelId: user.LevelId // Thêm LevelId vào đối tượng người dùng
    });
  } catch (error) {
    done(error, null);
  }
});
