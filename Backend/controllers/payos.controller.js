const crypto = require("crypto");
const moment = require("moment");
const axios = require("axios");
const PayOS = require("@payos/node");
const Order = require("../models/order.model"); // Nếu đã có model, nếu chưa có thì tạo tạm bên dưới

// Cấu hình PayOS
const PAYOS_CLIENT_ID = process.env.PAYOS_CLIENT_ID || "your_client_id";
const PAYOS_API_KEY = process.env.PAYOS_API_KEY || "your_api_key";
const PAYOS_CHECKSUM_KEY =
  process.env.PAYOS_CHECKSUM_KEY || "your_checksum_key";
const PAYOS_API_URL =
  process.env.PAYOS_API_URL || "https://api-merchant.payos.vn";
const PAYOS_RETURN_URL =
  process.env.PAYOS_RETURN_URL || "http://localhost:5173/payos-return";
const PAYOS_CANCEL_URL =
  process.env.PAYOS_CANCEL_URL || "http://localhost:5173/payos-cancel";

const payos = new PayOS(
  process.env.PAYOS_CLIENT_ID,
  process.env.PAYOS_API_KEY,
  process.env.PAYOS_CHECKSUM_KEY
);

exports.createPayment = async (req, res) => {
  try {
    const { orderCode, total_price, customerInfo, items } = req.body;
    if (!orderCode) return res.status(400).json({ message: "Thiếu orderCode" });
    const amount = Math.round(Number(total_price));
    const description = "Thanh toan don hang"; // <= 25 ký tự

    const paymentItems =
      Array.isArray(items) && items.length > 0
        ? items.map((item) => ({
            name: item.productId?.name || "Sản phẩm",
            quantity: item.quantity || 1,
            price: item.price || 0,
          }))
        : [{ name: "Áo thun", quantity: 1, price: 499000 }];

    const paymentRequest = {
      orderCode: Number(orderCode),
      amount,
      description,
      returnUrl: process.env.PAYOS_RETURN_URL,
      cancelUrl: process.env.PAYOS_CANCEL_URL,
      buyerName: customerInfo.name || "Khách hàng",
      items: paymentItems,
    };
    console.log(
      "PayOS paymentRequest:",
      JSON.stringify(paymentRequest, null, 2)
    );

    const response = await payos.createPaymentLink(paymentRequest);
    // Trả về cả paymentUrl và thông tin paymentId, orderCode cho FE
    return res.json({
      paymentUrl: response.checkoutUrl,
      paymentId: response.paymentId,
      orderCode,
    });
  } catch (error) {
    console.error("PayOS SDK error:", error);
    res.status(500).json({
      message: "Lỗi tạo link thanh toán PayOS",
      error: error.message,
      details: error.response?.data || null,
    });
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    const { paymentId } = req.body;
    console.log("Verify paymentId:", paymentId);

    if (!paymentId) {
      return res.status(400).json({
        success: false,
        message: "Thiếu paymentId",
      });
    }

    // Gọi API PayOS để xác thực thanh toán
    const response = await axios.get(
      `${PAYOS_API_URL}/v2/payment-requests/${paymentId}`,
      {
        headers: {
          "x-client-id": PAYOS_CLIENT_ID,
          "x-api-key": PAYOS_API_KEY,
        },
      }
    );

    if (response.data && response.data.data) {
      const paymentInfo = response.data.data;

      // KHÔNG xác thực signature ở đây nữa
      if (paymentInfo.status === "PAID") {
        return res.json({
          success: true,
          message: "Xác thực thanh toán thành công",
          data: paymentInfo,
        });
      } else {
        return res.status(400).json({
          success: false,
          message: "Thanh toán chưa thành công",
          data: paymentInfo,
        });
      }
    } else {
      return res.status(400).json({
        success: false,
        message: "Không tìm thấy thông tin thanh toán",
      });
    }
  } catch (error) {
    console.error("PayOS verify error:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi xác thực thanh toán PayOS",
      error: error.message,
    });
  }
};

exports.payosReturn = async (req, res) => {
  try {
    const { orderCode, paymentId, status, amount, signature } = req.query;

    if (!orderCode || !paymentId || !status || !amount || !signature) {
      return res.status(400).json({
        success: false,
        message: "Thiếu thông tin callback",
      });
    }

    // Xác thực chữ ký callback
    const dataStr = `${orderCode}|${paymentId}|${status}|${amount}`;
    const expectedSignature = crypto
      .createHmac("sha256", PAYOS_CHECKSUM_KEY)
      .update(dataStr)
      .digest("hex");

    if (signature === expectedSignature) {
      if (status === "PAID") {
        // Thanh toán thành công
        return res.json({
          success: true,
          message: "Thanh toán thành công",
          data: {
            orderCode,
            paymentId,
            status,
            amount,
          },
        });
      } else {
        // Thanh toán thất bại hoặc bị hủy
        return res.json({
          success: false,
          message: "Thanh toán không thành công",
          data: {
            orderCode,
            paymentId,
            status,
            amount,
          },
        });
      }
    } else {
      return res.status(400).json({
        success: false,
        message: "Chữ ký callback không hợp lệ",
      });
    }
  } catch (error) {
    console.error("PayOS return error:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi xử lý callback PayOS",
      error: error.message,
    });
  }
};

// Nếu chưa có model Order, tạo tạm bên dưới:
// const mongoose = require('mongoose');
// const orderSchema = new mongoose.Schema({
//   orderCode: Number,
//   amount: Number,
//   description: String,
//   customerInfo: Object,
//   items: Array,
//   status: String,
//   paymentUrl: String,
//   method: String
// }, { timestamps: true });
// module.exports = mongoose.model('Order', orderSchema);
