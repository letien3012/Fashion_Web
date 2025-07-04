// /config/passport.js
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const FacebookStrategy = require("passport-facebook").Strategy;

passport.serializeUser((user, done) => {
  done(null, user);
});
passport.deserializeUser((user, done) => {
  done(null, user);
});

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL:
        process.env.GOOGLE_CALLBACK_URL ||
        `${process.env.BACKEND_URL}/api/auth/google/callback`,
    },
    (accessToken, refreshToken, profile, done) => {
      // Có thể lưu profile vào DB nếu muốn
      return done(null, profile);
    }
  )
);
// --- FACEBOOK STRATEGY ---
passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_APP_ID,
      clientSecret: process.env.FACEBOOK_APP_SECRET,
      callbackURL:
        process.env.FACEBOOK_CALLBACK_URL ||
        `${process.env.BACKEND_URL}/api/auth/facebook/callback`,
      profileFields: ["id", "displayName", "photos", "email"], // rất quan trọng để có email
    },
    (accessToken, refreshToken, profile, done) => {
      return done(null, profile);
    }
  )
);

module.exports = passport;
