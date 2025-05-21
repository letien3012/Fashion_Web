const nodemailer = require("nodemailer");
const mongoose = require("mongoose");

const VerificationSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  code: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: 300 },
});
const Verification = mongoose.model("Verification", VerificationSchema);
require("dotenv").config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

function generateCode(length = 6) {
  return Math.random()
    .toString()
    .slice(2, 2 + length);
}

function generateEmailTemplate({ code = "123456", name = "User" }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="ie=edge" />
  <title>OTP Verification</title>
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600&display=swap" rel="stylesheet" />
</head>
<body style="margin: 0; font-family: 'Poppins', sans-serif; background: #ffffff; font-size: 14px;">
  <div style="max-width: 680px; margin: 0 auto; padding: 45px 30px 60px; background: #f4f7ff;
    background-image: url(https://archisketch-resources.s3.ap-northeast-2.amazonaws.com/vrstyler/1661497957196_595865/email-template-background-banner);
    background-repeat: no-repeat; background-size: 800px 452px; background-position: top center;
    font-size: 14px; color: #434343;">
    <header>
      <table style="width: 100%;">
        <tbody>
          <tr style="height: 0;">
            <td>
              <img alt="Archisketch" src="https://archisketch-resources.s3.ap-northeast-2.amazonaws.com/vrstyler/1663574980688_114990/archisketch-logo" height="30px" />
            </td>
            <td style="text-align: right;">
              <span style="font-size: 16px; line-height: 30px; color: #ffffff;">${new Date().toLocaleDateString()}</span>
            </td>
          </tr>
        </tbody>
      </table>
    </header>

    <main>
      <div style="margin: 0; margin-top: 70px; padding: 92px 30px 115px; background: #ffffff; border-radius: 30px; text-align: center;">
        <div style="width: 100%; max-width: 489px; margin: 0 auto;">
          <h1 style="margin: 0; font-size: 24px; font-weight: 500; color: #1f1f1f;">Mã OTP của bạn</h1>
          <p style="margin: 0; margin-top: 17px; font-size: 16px; font-weight: 500;">Xin chào ${name},</p>
          <p style="margin: 0; margin-top: 17px; font-weight: 500; letter-spacing: 0.56px;">
            Cảm ơn bạn đã lựa chọn 3TL Company. Sử dụng mã OTP dưới đây để xác thực tài khoản của bạn.
            Mã xác thực OTP có hiệu lực trong <span style="font-weight: 600; color: #1f1f1f;">5 phút</span>.
            Vui lòng không chia sẻ mã OTP này với bất kỳ ai.
          </p>
          <p style="margin: 0; margin-top: 60px; font-size: 32px; font-weight: 600; letter-spacing: 20px; color: #ba3d4f;">
            ${code}
          </p>
        </div>
      </div>

      <p style="max-width: 400px; margin: 0 auto; margin-top: 90px; text-align: center; font-weight: 500; color: #8c8c8c;">
        Cần trợ giúp? Liên hệ
        <a href="mailto:thoitrang00123123@gmail.com" style="color: #499fb6; text-decoration: none;">thoitrang00123123@gmail.com</a>
        hoặc truy cập
        <a href="#" style="color: #499fb6; text-decoration: none;">Trung tâm trợ giúp</a>
      </p>
    </main>

    <footer style="width: 100%; max-width: 490px; margin: 20px auto 0; text-align: center; border-top: 1px solid #e6ebf1;">
      <p style="margin: 0; margin-top: 40px; font-size: 16px; font-weight: 600; color: #434343;">3TL Company</p>
      <p style="margin: 0; margin-top: 8px; color: #434343;">Quận Ninh Kiều, Cần Thơ, Việt Nam</p>
      <div style="margin-top: 16px;">
        <a href="#"><img width="36px" alt="Facebook" src="https://archisketch-resources.s3.ap-northeast-2.amazonaws.com/vrstyler/1661502815169_682499/email-template-icon-facebook" /></a>
        <a href="#" style="margin-left: 8px;"><img width="36px" alt="Instagram" src="https://archisketch-resources.s3.ap-northeast-2.amazonaws.com/vrstyler/1661504218208_684135/email-template-icon-instagram" /></a>
        <a href="#" style="margin-left: 8px;"><img width="36px" alt="Twitter" src="https://archisketch-resources.s3.ap-northeast-2.amazonaws.com/vrstyler/1661503043040_372004/email-template-icon-twitter" /></a>
        <a href="#" style="margin-left: 8px;"><img width="36px" alt="Youtube" src="https://archisketch-resources.s3.ap-northeast-2.amazonaws.com/vrstyler/1661503195931_210869/email-template-icon-youtube" /></a>
      </div>
      <p style="margin-top: 16px; color: #434343;">Copyright © 2025 Company. All rights reserved.</p>
    </footer>
  </div>
</body>
</html>`;
}

async function sendVerificationCode(email, name = "User") {
  const code = generateCode();
  await Verification.findOneAndUpdate(
    { email },
    { code, createdAt: new Date() },
    { upsert: true }
  );

  const mailOptions = {
    from: `"Xác thực đăng ký" <${process.env.MAIL_USER}>`,
    to: email,
    subject: "🔐 Mã xác thực của bạn",
    html: generateEmailTemplate({ code, name }),
  };

  await transporter.sendMail(mailOptions);
}

module.exports = sendVerificationCode;
