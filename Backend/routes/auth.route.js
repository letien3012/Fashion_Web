// /routes/authRoutes.js
const express = require("express");
const passport = require("passport");
require("../config/passport");
const router = express.Router();
const { loginSuccess, logout } = require("../controllers/auth.controller");
const jwt = require("jsonwebtoken");

// Route: Bắt đầu đăng nhập Google
router.get(
  "/google",
  passport.authenticate("google", { 
    scope: ["profile", "email"],
    prompt: "select_account"
  })
);

// Callback route sau khi xác thực Google
router.get(
  "/google/callback",
  passport.authenticate("google", { 
    failureRedirect: "http://localhost:5173/login",
    failureMessage: true
  }),
  (req, res) => {
    // Tạo JWT token
    const token = jwt.sign(
      { 
        id: req.user.id,
        email: req.user.emails[0].value,
        name: req.user.displayName
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: "24h" }
    );

    // Redirect về frontend với token
    res.redirect(`http://localhost:5173/auth/callback?token=${token}`);
  }
);

// Route: Lấy thông tin user sau đăng nhập
router.get("/login/success", loginSuccess);

// Route: Logout
router.get("/logout", logout);

module.exports = router;
