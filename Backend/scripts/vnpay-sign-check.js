// Script kiểm tra SHA512 cho VNPAY
const crypto = require("crypto");

// Thay giá trị dưới đây bằng dữ liệu thực tế của bạn
const signData =
  "vnp_Amount=49900000&vnp_Command=pay&vnp_CreateDate=20250625212424&vnp_CurrCode=VND&vnp_IpAddr=127.0.0.1&vnp_Locale=vn&vnp_OrderInfo=Thanh toan cho ma GD:685bacc710b2f59ac1dc3b85_20250625212424&vnp_OrderType=other&vnp_ReturnUrl=http://localhost:5173/vnpay-return&vnp_TmnCode=1G8ET3QX&vnp_TxnRef=685bacc710b2f59ac1dc3b85_20250625212424&vnp_Version=2.1.0";
const secret = "4JKP4GZYVCT1ALTF7ZM3TT0ASEI6JDNS"; // Thay bằng Hash Secret thực tế

const hmac = crypto.createHmac("sha512", secret);
const signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");
console.log("Chữ ký SHA512:", signed);
