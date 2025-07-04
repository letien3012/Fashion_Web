const crypto = require("crypto");
const moment = require("moment");
const qs = require("qs");

// Cấu hình VNPAY
const vnp_TmnCode = process.env.VNP_TMNCODE || "VNPAYCODE";
const vnp_HashSecret = process.env.VNP_HASHSECRET || "VNPAYSECRET";
const vnp_Url =
  process.env.VNP_URL || "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";
const vnp_ReturnUrl = process.env.VNP_RETURNURL;

exports.createPayment = async (req, res) => {
  try {
    console.log("VNPAY ", JSON.stringify(req.body, null, 2));
    if (req.body.items && Array.isArray(req.body.items)) {
      req.body.items.forEach((item, idx) => {
        console.log(`Item ${idx + 1}:`, item);
        if (item.variants) {
          console.log(`  Variants:`, JSON.stringify(item.variants, null, 2));
        }
      });
    }
    const { total_price, customerInfo } = req.body;
    const bankCode = req.body.bankCode || "";
    const date = moment();
    const timestamp = date.format("YYYYMMDDHHmmss");
    const customerId =
      customerInfo && customerInfo.customerId
        ? customerInfo.customerId
        : "guest";
    const orderId = `${customerId}_${timestamp}`;
    const amount = Math.round(Number(total_price));
    // Lấy IP client (IPv4)
    let ipAddr =
      req.headers["x-forwarded-for"] ||
      req.connection?.remoteAddress ||
      req.socket?.remoteAddress ||
      (req.connection && req.connection.socket
        ? req.connection.socket.remoteAddress
        : null);
    if (ipAddr && ipAddr.includes("::ffff:")) {
      ipAddr = ipAddr.replace("::ffff:", "");
    }
    if (!ipAddr) ipAddr = process.env.DEFAULT_CLIENT_IP || "127.0.0.1";

    // Build params
    let vnp_Params = {};
    vnp_Params["vnp_Version"] = "2.1.0";
    vnp_Params["vnp_Command"] = "pay";
    vnp_Params["vnp_TmnCode"] = vnp_TmnCode;
    vnp_Params["vnp_Locale"] = "vn";
    vnp_Params["vnp_CurrCode"] = "VND";
    vnp_Params["vnp_TxnRef"] = orderId;
    vnp_Params["vnp_OrderInfo"] = "Thanh toan cho ma GD:" + orderId;
    vnp_Params["vnp_OrderType"] = "other";
    vnp_Params["vnp_Amount"] = amount * 100;
    vnp_Params["vnp_ReturnUrl"] = vnp_ReturnUrl;
    vnp_Params["vnp_IpAddr"] = ipAddr;
    vnp_Params["vnp_CreateDate"] = date.format("YYYYMMDDHHmmss");
    if (bankCode) {
      vnp_Params["vnp_BankCode"] = bankCode;
    }
    // 1. Build query để ký (KHÔNG có vnp_SecureHash)
    const queryWithoutHash = buildVnpayQuery(vnp_Params);
    const hmac = crypto.createHmac("sha512", vnp_HashSecret);
    const signed = hmac
      .update(Buffer.from(queryWithoutHash, "utf-8"))
      .digest("hex");
    // 2. Thêm hash vào params
    vnp_Params["vnp_SecureHash"] = signed;
    // 3. Build query cuối cùng để tạo URL (có cả hash)
    const finalQuery = buildVnpayQuery(vnp_Params);
    const paymentUrl = `${vnp_Url}?${finalQuery}`;
    console.log("signData:", queryWithoutHash);
    console.log("signed:", signed);
    console.log("paymentUrl:", paymentUrl);
    return res.json({ paymentUrl });
  } catch (error) {
    console.error("VNPAY payment error:", error);
    res.status(500).json({ message: "Lỗi tạo link thanh toán VNPAY" });
  }
};

// Hàm sort object theo key
function sortObject(obj) {
  const sorted = {};
  const keys = Object.keys(obj).sort();
  for (let key of keys) {
    sorted[key] = obj[key];
  }
  return sorted;
}

// Hàm build query giống PHP (urlencode từng key/value, sort key, không có & cuối)
function buildVnpayQuery(params) {
  const filtered = {};
  Object.keys(params).forEach((key) => {
    if (
      params[key] !== null &&
      params[key] !== undefined &&
      params[key] !== ""
    ) {
      filtered[key] = params[key];
    }
  });
  const sortedKeys = Object.keys(filtered).sort();
  return sortedKeys
    .map(
      (key) => encodeURIComponent(key) + "=" + encodeURIComponent(filtered[key])
    )
    .join("&");
}

// Xử lý callback từ VNPAY (sau khi thanh toán thành công)
exports.vnpayReturn = async (req, res) => {
  // Xác thực checksum, cập nhật trạng thái đơn hàng, redirect về frontend
  try {
    const vnp_Params = { ...req.query };
    const secureHash = vnp_Params["vnp_SecureHash"];
    delete vnp_Params["vnp_SecureHash"];
    delete vnp_Params["vnp_SecureHashType"];
    const signData = buildVnpayQuery(vnp_Params);
    const hmac = crypto.createHmac("sha512", vnp_HashSecret);
    const signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");
    if (secureHash === signed) {
      // Hợp lệ
      return res.json({
        success: true,
        message: "Xác thực thành công",
        data: vnp_Params,
      });
    } else {
      // Sai chữ ký
      return res.status(400).json({ success: false, message: "Sai chữ ký" });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Lỗi xác thực callback VNPAY" });
  }
};
