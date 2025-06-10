const nodemailer = require("nodemailer");
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");

const ResetPasswordSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  token: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: 300 }, // 5 minutes
});
const ResetPassword = mongoose.model("ResetPassword", ResetPasswordSchema);
require("dotenv").config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

function generateToken(length = 32) {
  return Math.random().toString(36).substring(2, length + 2);
}

function generateResetEmailTemplate({ resetLink = "", name = "User" }) {
  const templatePath = path.join(__dirname, "reset_password_template", "index.html");
  let template = fs.readFileSync(templatePath, "utf8");
  
  // Replace placeholders in the template
  template = template.replace(/{{name}}/g, name);
  template = template.replace(/{{resetLink}}/g, resetLink);
  
  return template;
}

async function sendResetPasswordMail(email, name = "User") {
  const token = generateToken();
  const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
  
  await ResetPassword.findOneAndUpdate(
    { email },
    { token, createdAt: new Date() },
    { upsert: true }
  );

  const mailOptions = {
    from: `"Đặt lại mật khẩu" <${process.env.MAIL_USER}>`,
    to: email,
    subject: "🔐 Yêu cầu đặt lại mật khẩu",
    html: generateResetEmailTemplate({ resetLink, name }),
  };

  await transporter.sendMail(mailOptions);
}

module.exports = sendResetPasswordMail; 