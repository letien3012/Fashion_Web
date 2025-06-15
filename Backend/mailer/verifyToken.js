const mongoose = require("mongoose");

async function verifyToken(token) {
    const ResetPassword = mongoose.model("ResetPassword");
  // Tìm token trong database
  const record = await ResetPassword.findOne({ token });
  if (!record) {
    return { valid: false, message: "Token không hợp lệ." };
  }

  const { email, createdAt } = record;

  // Kiểm tra thời gian hết hạn
  const now = new Date();
  const diffInMinutes = (now - createdAt) / 1000 / 60;

  if (diffInMinutes > 5) {
    // Xóa token hết hạn
    await ResetPassword.deleteOne({ token });
    return { valid: false, message: "Token đã hết hạn." };
  }

  return { 
    valid: true, 
    email: email,
    token: token,
    message: "Xác thực token thành công." 
  };
}

module.exports = verifyToken;
