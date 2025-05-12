// /routes/authRoutes.js
const express = require("express");
const passport = require("passport");
require("../config/passport");
const router = express.Router();
const { loginSuccess, logout } = require("../controllers/auth.controller");

// Route: Bắt đầu đăng nhập Google
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// Route: Google callback
router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  (req, res) => {
    res.redirect("http://localhost:5173/dashboard");
  }
);

// Route: Lấy thông tin user sau đăng nhập
router.get("/user", loginSuccess);

// Route: Logout
router.get("/logout", logout);

module.exports = router;
