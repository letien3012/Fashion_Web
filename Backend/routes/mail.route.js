// routes/mail.route.js
const express = require("express");
const router = express.Router();
const sendVerificationCode = require("../mailer/sendVerificationCode");
const sendResetPasswordMail = require("../mailer/sendResetPasswordMail");
const sendOrderMail = require("../mailer/sendOrderMail");
const Order = require("../models/order.model");
const Customer = require("../models/customer.model");

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

// Route để gửi email xác nhận đơn hàng
router.post("/send-order-confirmation", async (req, res) => {
  const { orderCode } = req.body;
  if (!orderCode)
    return res.status(400).json({ message: "Mã đơn hàng là bắt buộc" });

  try {
    // Tìm đơn hàng theo code
    const order = await Order.findOne({ code: orderCode }).populate(
      "order_detail.productId",
      "name image"
    );

    if (!order) {
      return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
    }

    // Tìm thông tin khách hàng
    const customer = await Customer.findById(order.customerId);
    if (!customer || !customer.email) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy email khách hàng" });
    }

    // Gửi email xác nhận
    const result = await sendOrderMail(order, customer.email);

    if (result.success) {
      res.json({
        message: "Đã gửi email xác nhận đơn hàng thành công",
        orderCode: orderCode,
      });
    } else {
      res.status(500).json({
        message: "Lỗi khi gửi email xác nhận đơn hàng",
        error: result.message,
      });
    }
  } catch (err) {
    console.error("Lỗi gửi email xác nhận đơn hàng:", err);
    res.status(500).json({ message: "Lỗi khi gửi email xác nhận đơn hàng" });
  }
});

module.exports = router;
