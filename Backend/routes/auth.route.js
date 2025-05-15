// /routes/authRoutes.js
const express = require("express");
const passport = require("passport");
require("../config/passport");
const firebase = require("../firebase/firebase-admin");
const router = express.Router();
const { loginSuccess, logout } = require("../controllers/auth.controller");
const Customer = require("../models/customer.model");
const axios = require("axios");
// Route: Bắt đầu đăng nhập Google
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// Route: Google callback
router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  async (req, res) => {
    res.redirect("http://localhost:5173");
  }
);
//Route: VerifyToken
router.post("/verifyToken", async (req, res) => {
  const { idToken } = req.body;
  try {
    const decodedToken = await firebase.admin.auth().verifyIdToken(idToken);
    const uid = decodedToken.uid;
    const user = await firebase.auth.getUser(uid);
    const email = user.email;
    let customer = await Customer.getByEmail(email);
    console.log(customer);
    if (!customer) {
      axios
        .post("http:localhost:3005/api/customers/add", {
          fullname: user.displayName,
          email: user.email,
          image: user.photoURL,
          phone: user.phoneNumber,
        })
        .then((response) => {
          console.log("Response:", response.data);
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    }
    // Tuỳ bạn: lấy thêm email, name...
    return res.status(200).json({ uid });
  } catch (error) {
    console.error("Xác thực token thất bại:", error);
    return res.status(401).json({ message: "Token không hợp lệ" });
  }
});

module.exports = router;
// Route: Lấy thông tin user sau đăng nhập
router.get("/user", loginSuccess);

// Route: Logout
router.get("/logout", logout);

module.exports = router;
