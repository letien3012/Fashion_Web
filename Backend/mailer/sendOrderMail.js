const nodemailer = require("nodemailer");
const mongoose = require("mongoose");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

function generateOrderEmailTemplate({
  orderCode,
  customerName,
  orderItems,
  totalPrice,
  discount,
  address,
  phone,
  orderDate,
  paymentMethod,
  note,
}) {
  const formatPrice = (price) => price.toLocaleString("vi-VN");

  const itemsHtml = orderItems
    .map(
      (item) => `
    <tr style="border-bottom: 1px solid #e2e8f0;">
      <td style="padding: 12px; text-align: left;">
        <div style="font-weight: 600; color: #2c3e50;">${item.productName}</div>
        <div style="font-size: 14px; color: #64748b;">Phân loại: ${
          item.sku
        }</div>
      </td>
      <td style="padding: 12px; text-align: center;">${item.quantity}</td>
      <td style="padding: 12px; text-align: right;">₫${formatPrice(
        item.price
      )}</td>
      <td style="padding: 12px; text-align: right;">₫${formatPrice(
        item.price * item.quantity
      )}</td>
    </tr>
  `
    )
    .join("");

  const paymentMethodText = {
    COD: "Thanh toán khi nhận hàng (COD)",
    VNPAY: "Thanh toán qua VNPAY",
    PAYPAL: "Thanh toán qua PayPal",
    PAYOS: "Thanh toán qua PayOS",
  };

  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Xác nhận đơn hàng</title>
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
</head>
<body style="margin: 0; font-family: 'Poppins', sans-serif; background: #f4f7ff; font-size: 14px; line-height: 1.6;">
  <div style="max-width: 680px; margin: 0 auto; padding: 45px 30px 60px; background: #f4f7ff; font-size: 14px; color: #434343;">
    <header>
      <table style="width: 100%;">
        <tbody>
          <tr style="height: 0;">
            <td>
              <img alt="JUNO SHOP" src="https://junoshop.com/logo.png" height="30px" />
            </td>
            <td style="text-align: right;">
              <span style="font-size: 16px; line-height: 30px; color: #ffffff;">${new Date().toLocaleDateString(
                "vi-VN"
              )}</span>
            </td>
          </tr>
        </tbody>
      </table>
    </header>

    <main>
      <div style="margin: 0; margin-top: 70px; padding: 92px 30px 115px; background: #ffffff; border-radius: 30px; text-align: center;">
        <div style="width: 100%; max-width: 489px; margin: 0 auto;">
          <h1 style="margin: 0; font-size: 24px; font-weight: 500; color: #1f1f1f;">Đơn hàng của bạn đã được xác nhận!</h1>
          <p style="margin: 0; margin-top: 17px; font-size: 16px; font-weight: 500;">Xin chào ${customerName},</p>
          <p style="margin: 0; margin-top: 17px; font-weight: 500; letter-spacing: 0.56px;">
            Cảm ơn bạn đã đặt hàng tại JUNO SHOP. Đơn hàng của bạn đã được xác nhận và đang được xử lý.
          </p>
        </div>
      </div>

      <!-- Order Details -->
      <div style="margin: 20px 0; background: #ffffff; border-radius: 15px; padding: 30px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
        <h2 style="margin: 0 0 20px 0; color: #2c3e50; font-size: 20px; font-weight: 600;">Chi tiết đơn hàng</h2>
        
        <!-- Order Info -->
        <div style="background: #f8fafc; padding: 20px; border-radius: 10px; margin-bottom: 25px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; padding-bottom: 10px; border-bottom: 1px solid #e2e8f0;">
            <span style="font-weight: 500; color: #4b5563; font-size: 15px;">Mã đơn hàng: </span>
            <span style="font-weight: 700; color: #3b82f6; font-size: 18px; background: #eff6ff; padding: 8px 12px; border-radius: 8px; border: 2px solid #dbeafe;">${orderCode}</span>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; padding-bottom: 10px; border-bottom: 1px solid #e2e8f0;">
            <span style="font-weight: 500; color: #4b5563; font-size: 15px;">Ngày đặt: </span>
            <span style="color: #6b7280; font-weight: 500; font-size: 15px;">${orderDate}</span>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0;">
            <span style="font-weight: 500; color: #4b5563; font-size: 15px;">Phương thức thanh toán: </span>
            <span style="color: #6b7280; font-weight: 500; font-size: 15px;">${
              paymentMethodText[paymentMethod] || paymentMethod
            }</span>
          </div>
        </div>

        <!-- Customer Info -->
        <div style="background: #f8fafc; padding: 20px; border-radius: 10px; margin-bottom: 25px;">
          <h3 style="margin: 0 0 15px 0; color: #2c3e50; font-size: 16px; font-weight: 600;">Thông tin giao hàng</h3>
          <div style="margin-bottom: 12px; display: flex; align-items: center;">
            <span style="font-weight: 500; color: #4b5563; min-width: 100px; font-size: 15px;">Họ tên:</span>
            <span style="color: #2c3e50; font-weight: 500; font-size: 15px;">${customerName}</span>
          </div>
          <div style="margin-bottom: 12px; display: flex; align-items: center;">
            <span style="font-weight: 500; color: #4b5563; min-width: 100px; font-size: 15px;">Số điện thoại:</span>
            <span style="color: #2c3e50; font-weight: 500; font-size: 15px;">${phone}</span>
          </div>
          <div style="margin-bottom: 12px; display: flex; align-items: flex-start;">
            <span style="font-weight: 500; color: #4b5563; min-width: 100px; font-size: 15px;">Địa chỉ:</span>
            <span style="color: #2c3e50; font-weight: 500; font-size: 15px; line-height: 1.5;">${address}</span>
          </div>
          ${
            note
              ? `
          <div style="margin-bottom: 0; display: flex; align-items: flex-start;">
            <span style="font-weight: 500; color: #4b5563; min-width: 100px; font-size: 15px;">Ghi chú:</span>
            <span style="color: #2c3e50; font-weight: 500; font-size: 15px; line-height: 1.5;">${note}</span>
          </div>
          `
              : ""
          }
        </div>

        <!-- Order Items -->
        <div style="margin-bottom: 25px;">
          <h3 style="margin: 0 0 15px 0; color: #2c3e50; font-size: 16px; font-weight: 600;">Sản phẩm đã đặt</h3>
          <table style="width: 100%; border-collapse: collapse; background: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);">
            <thead>
              <tr style="background: #f8fafc;">
                <th style="padding: 15px 12px; text-align: left; font-weight: 600; color: #4b5563; border-bottom: 2px solid #e2e8f0; font-size: 14px;">Sản phẩm</th>
                <th style="padding: 15px 12px; text-align: center; font-weight: 600; color: #4b5563; border-bottom: 2px solid #e2e8f0; font-size: 14px;">SL</th>
                <th style="padding: 15px 12px; text-align: right; font-weight: 600; color: #4b5563; border-bottom: 2px solid #e2e8f0; font-size: 14px;">Đơn giá</th>
                <th style="padding: 15px 12px; text-align: right; font-weight: 600; color: #4b5563; border-bottom: 2px solid #e2e8f0; font-size: 14px;">Thành tiền</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>
        </div>

        <!-- Order Summary -->
        <div style="background: #f8fafc; padding: 20px; border-radius: 10px;">
          <h3 style="margin: 0 0 15px 0; color: #2c3e50; font-size: 16px; font-weight: 600;">Tổng cộng </h3>
          <div style="display: flex; justify-content: space-between; margin-bottom: 12px; align-items: center;">
            <span style="color: #6b7280; font-size: 15px;">Tổng tiền hàng: </span>
            <span style="font-weight: 500; font-size: 15px;">₫${formatPrice(
              totalPrice + discount
            )}</span>
          </div>
          ${
            discount > 0
              ? `
          <div style="display: flex; justify-content: space-between; margin-bottom: 12px; align-items: center;">
            <span style="color: #6b7280; font-size: 15px;">Giảm giá: </span>
            <span style="color: #10b981; font-weight: 500; font-size: 15px;">-₫${formatPrice(
              discount
            )}</span>
          </div>
          `
              : ""
          }
          <div style="display: flex; justify-content: space-between; padding-top: 15px; border-top: 2px solid #e2e8f0; font-size: 18px; font-weight: 700; color: #2c3e50; align-items: center;">
            <span>Tổng thanh toán: </span>
            <span style="color: #ef4444; background: #fef2f2; padding: 8px 12px; border-radius: 8px;">₫${formatPrice(
              totalPrice
            )}</span>
          </div>
        </div>
      </div>

      <!-- Next Steps -->
      <div style="background: #ffffff; border-radius: 15px; padding: 30px; margin: 20px 0; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
        <h3 style="margin: 0 0 20px 0; color: #2c3e50; font-size: 18px; font-weight: 600;">Bước tiếp theo</h3>
        <div style="display: flex; align-items: center; margin-bottom: 15px;">
          <div style="width: 30px; height: 30px; background: #3b82f6; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 15px; flex-shrink: 0;">
            <span style="color: white; font-weight: 600; font-size: 14px;">1</span>
          </div>
          <span style="color: #4b5563; font-size: 15px;">Đơn hàng của bạn sẽ được xử lý trong vòng 24 giờ</span>
        </div>
        <div style="display: flex; align-items: center; margin-bottom: 15px;">
          <div style="width: 30px; height: 30px; background: #3b82f6; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 15px; flex-shrink: 0;">
            <span style="color: white; font-weight: 600; font-size: 14px;">2</span>
          </div>
          <span style="color: #4b5563; font-size: 15px;">Bạn sẽ nhận được email cập nhật khi đơn hàng được giao</span>
        </div>
        <div style="display: flex; align-items: center;">
          <div style="width: 30px; height: 30px; background: #3b82f6; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 15px; flex-shrink: 0;">
            <span style="color: white; font-weight: 600; font-size: 14px;">3</span>
          </div>
          <span style="color: #4b5563; font-size: 15px;">Nếu có thắc mắc, vui lòng liên hệ với chúng tôi</span>
        </div>
      </div>

      <p style="max-width: 400px; margin: 0 auto; margin-top: 90px; text-align: center; font-weight: 500; color: #8c8c8c; font-size: 15px;">
        Cần trợ giúp? Liên hệ
        <a href="mailto:support@junoshop.com" style="color: #499fb6; text-decoration: none;">support@junoshop.com</a>
        hoặc truy cập
        <a href="https://junoshop.com/help" style="color: #499fb6; text-decoration: none;">Trung tâm trợ giúp</a>
      </p>
    </main>

    <footer style="width: 100%; max-width: 490px; margin: 20px auto 0; text-align: center; border-top: 1px solid #e6ebf1;">
      <p style="margin: 0; margin-top: 40px; font-size: 16px; font-weight: 600; color: #434343;">JUNO SHOP</p>
      <p style="margin: 0; margin-top: 8px; color: #434343;">Quận Ninh Kiều, Cần Thơ, Việt Nam</p>
      <div style="margin-top: 16px;">
        <a href="#"><img width="36px" alt="Facebook" src="https://archisketch-resources.s3.ap-northeast-2.amazonaws.com/vrstyler/1661502815169_682499/email-template-icon-facebook" /></a>
        <a href="#" style="margin-left: 8px;"><img width="36px" alt="Instagram" src="https://archisketch-resources.s3.ap-northeast-2.amazonaws.com/vrstyler/1661504218208_684135/email-template-icon-instagram" /></a>
        <a href="#" style="margin-left: 8px;"><img width="36px" alt="Twitter" src="https://archisketch-resources.s3.ap-northeast-2.amazonaws.com/vrstyler/1661503043040_372004/email-template-icon-twitter" /></a>
        <a href="#" style="margin-left: 8px;"><img width="36px" alt="Youtube" src="https://archisketch-resources.s3.ap-northeast-2.amazonaws.com/vrstyler/1661503195931_210869/email-template-icon-youtube" /></a>
      </div>
      <p style="margin-top: 16px; color: #434343;">Copyright © 2025 JUNO SHOP. All rights reserved.</p>
    </footer>
  </div>
</body>
</html>`;
}

async function sendOrderMail(orderData, customerEmail) {
  try {
    const {
      code: orderCode,
      fullname: customerName,
      order_detail: orderItems,
      total_price: totalPrice,
      discount,
      address,
      phone,
      createdAt: orderDate,
      method: paymentMethod,
      note,
    } = orderData;

    // Format order items for email
    const formattedItems = orderItems.map((item) => ({
      productName: item.productId?.name || "Sản phẩm",
      sku: item.variants?.[0]?.sku || "N/A",
      quantity: item.quantity,
      price: item.price,
    }));

    const mailOptions = {
      from: `"JUNO SHOP" <${process.env.MAIL_USER}>`,
      to: customerEmail,
      subject: `🎉 Đơn hàng ${orderCode} đã được xác nhận!`,
      html: generateOrderEmailTemplate({
        orderCode,
        customerName,
        orderItems: formattedItems,
        totalPrice,
        discount,
        address,
        phone,
        orderDate: new Date(orderDate).toLocaleDateString("vi-VN"),
        paymentMethod,
        note,
      }),
    };

    await transporter.sendMail(mailOptions);
    console.log(
      `Order confirmation email sent to ${customerEmail} for order ${orderCode}`
    );

    return { success: true, message: "Email xác nhận đơn hàng đã được gửi" };
  } catch (error) {
    console.error("Error sending order confirmation email:", error);
    return { success: false, message: "Không thể gửi email xác nhận đơn hàng" };
  }
}

module.exports = sendOrderMail;
