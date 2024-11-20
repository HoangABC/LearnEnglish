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
    
    const existingUser = await findOne({ googleId: profile.id, email: profile.emails[0].value });

    if (existingUser) {
    
      if (!existingUser.googleId) {
       
        await updateGoogleId(existingUser.email, profile.id, profile.photos[0].value);
        existingUser.googleId = profile.id;
        existingUser.image = profile.photos[0].value; 
      }

      return done(null, {
        id: existingUser.Id,
        name: existingUser.Name,
        email: existingUser.Email,
        levelId: existingUser.LevelId || null, 
        image: existingUser.Image || null 
      });
    }

    
    const newUser = {
      googleId: profile.id,
      name: profile.displayName,
      email: profile.emails[0].value,
      levelId: null, 
      image: profile.photos[0].value 
    };


    await create(newUser);

    
    return done(null, {
      id: newUser.Id,
      name: newUser.name,
      email: newUser.email,
      levelId: newUser.levelId, 
      image: newUser.image 
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
      levelId: user.LevelId || null 
    });
  } catch (error) {
    done(error, null);
  }
});
