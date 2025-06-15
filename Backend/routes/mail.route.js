// routes/mail.route.js
const express = require("express");
const router = express.Router();
const sendVerificationCode = require("../mailer/sendVerificationCode");
const sendResetPasswordMail = require("../mailer/sendResetPasswordMail");

router.post("/send-code", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "Email là bắt buộc" });

  try {
    await sendVerificationCode(email);
    res.json({ message: "Đã gửi mã xác thực đến email" });
  } catch (err) {
    console.error("Lỗi gửi mail:", err);
    res.status(500).json({ message: "Lỗi khi gửi mã xác thực" });
  }
});

router.post("/send-reset-password", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "Email là bắt buộc" });

  try {
    await sendResetPasswordMail(email);
    res.json({ message: "Đã gửi mã đặt lại mật khẩu đến email" });
  } catch (err) {
    console.error("Lỗi gửi mail reset password:", err);
    res.status(500).json({ message: "Lỗi khi gửi mã đặt lại mật khẩu" });
  }
});

module.exports = router;
