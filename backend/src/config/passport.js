const express = require('express');
const passport = require('passport');
const session = require('express-session');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

const app = express();

passport.use(new GoogleStrategy({
  clientID: '342637437251-nb4i03dmvpl0cvnqqco8bsdprj4to0r0.apps.googleusercontent.com', // Thay thế bằng Google Client ID của bạn
  clientSecret: 'GOOGLE_CLIENT_SECRET', // Thay thế bằng Google Client Secret của bạn
  callbackURL: 'http://localhost:3000/auth/google/callback'
},
function(accessToken, refreshToken, profile, done) {
  // Xử lý thông tin người dùng tại đây
  return done(null, profile);
}));

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((obj, done) => {
  done(null, obj);
});