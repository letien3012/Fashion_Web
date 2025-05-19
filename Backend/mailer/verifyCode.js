// const { db } = require("../firebase/firebase-admin");

async function verifyCode(email, inputCode) {
  const docRef = db.collection("verifications").doc(email);
  const doc = await docRef.get();

  if (!doc.exists) {
    return { success: false, message: "Không tìm thấy mã xác thực." };
  }

  const { code, createdAt } = doc.data();

  // Kiểm tra trùng mã
  if (code !== inputCode) {
    return { success: false, message: "Mã xác thực không đúng." };
  }

  // Kiểm tra thời gian hết hạn
  const now = new Date();
  const created = createdAt.toDate ? createdAt.toDate() : new Date(createdAt);
  const diffInMinutes = (now - created) / 1000 / 60;

  if (diffInMinutes > 5) {
    return { success: false, message: "Mã xác thực đã hết hạn." };
  }

  // Hợp lệ
  await docRef.delete(); // Xoá sau khi dùng (tuỳ chọn)
  return { success: true, message: "Xác thực thành công." };
}

module.exports = verifyCode;
