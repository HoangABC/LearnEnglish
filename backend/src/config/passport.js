require('dotenv').config();
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { findOne, create } = require('../models/User');

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: 'http://localhost:3000/auth/google/callback'
},
async (accessToken, refreshToken, profile, done) => {
  try {
    // Tìm người dùng trong cơ sở dữ liệu
    const existingUser = await findOne({ googleId: profile.id });

    if (existingUser) {
      // Người dùng đã tồn tại, trả về người dùng đó
      return done(null, existingUser);
    }

    // Người dùng chưa tồn tại, thêm vào cơ sở dữ liệu
    const newUser = {
      googleId: profile.id,
      name: profile.displayName,
      email: profile.emails[0].value,
      // password: null // Optional
    };

    await create(newUser);
    return done(null, newUser);
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
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});
