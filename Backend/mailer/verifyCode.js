const mongoose = require("mongoose");
async function verifyCode(email, inputCode) {
  const Verification = mongoose.model("Verification");

  // Tìm OTP theo email
  const record = await Verification.findOne({ email });
  if (!record) {
    return { success: false, message: "Không tìm thấy mã xác thực." };
  }

  const { code, createdAt } = record;

  // Kiểm tra mã đúng không
  if (code !== inputCode) {
    return { success: false, message: "Mã xác thực không đúng." };
  }

  // Kiểm tra thời gian hết hạn
  const now = new Date();
  const diffInMinutes = (now - createdAt) / 1000 / 60;

  if (diffInMinutes > 5) {
    return { success: false, message: "Mã xác thực đã hết hạn." };
  }

  // Xoá bản ghi sau khi dùng (nên làm)
  await Verification.deleteOne({ email });

  return { success: true, message: "Xác thực thành công." };
}

module.exports = verifyCode;
