const nodemailer = require("nodemailer");
require("dotenv").config();
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

const sendOrderCancelMail = async (order, customerEmail, cancelReason = "") => {
  // Xử lý ảnh sản phẩm trước khi render template
  const itemsHtml = await Promise.all(
    order.order_detail.map(async (item) => {
      return `
      <div class="item">
        <div class="item-details">
          <div class="item-name">${item.productId?.name || "Sản phẩm"}</div>
          ${item.variants
            .map(
              (variant) => `
            <div class="item-variant">
              ${variant.sku} - Số lượng: ${variant.quantity}
            </div>
          `
            )
            .join("")}
          <div class="item-price">${item.price?.toLocaleString("vi-VN")}đ</div>
        </div>
      </div>
    `;
    })
  );

  const mailOptions = {
    from: `"JUNO SHOP" <${process.env.MAIL_USER}>`,
    to: customerEmail,
    subject: `Đơn hàng #${order.code} đã được hủy - JUNO SHOP`,
    html: `
      <!DOCTYPE html>
      <html lang="vi">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Đơn hàng đã được hủy</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f8f9fa;
          }
          
          .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          
          .header {
            background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
            color: white;
            padding: 30px 20px;
            text-align: center;
          }
          
          .header h1 {
            font-size: 24px;
            margin-bottom: 10px;
            font-weight: 600;
          }
          
          .header p {
            font-size: 16px;
            opacity: 0.9;
          }
          
          .content {
            padding: 30px 20px;
          }
          
          .order-info {
            background-color: #f8f9fa;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 25px;
            border-left: 4px solid #dc3545;
          }
          
          .order-code {
            font-size: 20px;
            font-weight: bold;
            color: #dc3545;
            margin-bottom: 15px;
            text-align: center;
          }
          
          .info-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
            padding: 8px 0;
            border-bottom: 1px solid #e9ecef;
          }
          
          .info-row:last-child {
            border-bottom: none;
          }
          
          .info-label {
            font-weight: 600;
            color: #495057;
          }
          
          .info-value {
            color: #6c757d;
          }
          
          .cancel-reason {
            background-color: #fff3cd;
            border: 1px solid #ffeaa7;
            border-radius: 6px;
            padding: 15px;
            margin: 20px 0;
          }
          
          .cancel-reason h3 {
            color: #856404;
            margin-bottom: 8px;
            font-size: 16px;
          }
          
          .cancel-reason p {
            color: #856404;
            margin: 0;
          }
          
          .order-details {
            margin: 25px 0;
          }
          
          .order-details h3 {
            color: #495057;
            margin-bottom: 15px;
            font-size: 18px;
          }
          
          .item {
            display: flex;
            align-items: center;
            padding: 15px;
            border: 1px solid #e9ecef;
            border-radius: 6px;
            margin-bottom: 10px;
            background-color: #f8f9fa;
          }
          
          .item-image {
            width: 60px;
            height: 60px;
            object-fit: cover;
            border-radius: 4px;
            margin-right: 15px;
          }
          
          .item-details {
            flex: 1;
          }
          
          .item-name {
            font-weight: 600;
            color: #495057;
            margin-bottom: 5px;
          }
          
          .item-variant {
            color: #6c757d;
            font-size: 14px;
            margin-bottom: 5px;
          }
          
          .item-price {
            color: #dc3545;
            font-weight: 600;
          }
          
          .total-section {
            background-color: #f8f9fa;
            border-radius: 6px;
            padding: 20px;
            margin-top: 25px;
          }
          
          .total-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
          }
          
          .total-row.final {
            border-top: 2px solid #dee2e6;
            padding-top: 15px;
            margin-top: 15px;
            font-size: 18px;
            font-weight: bold;
            color: #dc3545;
          }
          
          .footer {
            background-color: #f8f9fa;
            padding: 20px;
            text-align: center;
            border-top: 1px solid #e9ecef;
          }
          
          .footer p {
            color: #6c757d;
            margin-bottom: 10px;
          }
          
          .contact-info {
            color: #495057;
            font-weight: 600;
          }
          
          .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #0d6efd 0%, #0b5ed7 100%);
            color: white;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            margin-top: 15px;
            transition: all 0.3s ease;
          }
          
          .cta-button:hover {
            background: linear-gradient(135deg, #0b5ed7 0%, #0a58ca 100%);
            transform: translateY(-2px);
          }
          
          @media (max-width: 600px) {
            .container {
              margin: 10px;
              border-radius: 0;
            }
            
            .header {
              padding: 20px 15px;
            }
            
            .content {
              padding: 20px 15px;
            }
            
            .info-row {
              flex-direction: column;
              gap: 5px;
            }
            
            .item {
              flex-direction: column;
              text-align: center;
            }
            
            .item-image {
              margin-right: 0;
              margin-bottom: 10px;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>❌ Đơn hàng đã được hủy</h1>
            <p>Chúng tôi rất tiếc thông báo rằng đơn hàng của bạn đã được hủy</p>
          </div>
          
          <div class="content">
            <div class="order-info">
              <div class="order-code">#${order.code}</div>
              
              <div class="info-row">
                <span class="info-label">Ngày đặt hàng:</span>
                <span class="info-value">${new Date(
                  order.createdAt
                ).toLocaleDateString("vi-VN")}</span>
              </div>
              
              <div class="info-row">
                <span class="info-label">Phương thức thanh toán:</span>
                <span class="info-value">${order.method}</span>
              </div>
              
              <div class="info-row">
                <span class="info-label">Trạng thái:</span>
                <span class="info-value" style="color: #dc3545; font-weight: 600;">Đã hủy</span>
              </div>
            </div>
            
            ${
              cancelReason
                ? `
              <div class="cancel-reason">
                <h3>📝 Lý do hủy đơn hàng:</h3>
                <p>${cancelReason}</p>
              </div>
            `
                : ""
            }
            
            <div class="order-details">
              <h3>📦 Chi tiết đơn hàng</h3>
              ${itemsHtml.join("")}
            </div>
            
            <div class="total-section">
              <div class="total-row">
                <span>Tổng tiền sản phẩm:</span>
                <span>${order.total_product_price?.toLocaleString(
                  "vi-VN"
                )}đ</span>
              </div>
              ${
                order.discount > 0
                  ? `
                <div class="total-row">
                  <span>Giảm giá:</span>
                  <span>-${order.discount?.toLocaleString("vi-VN")}đ</span>
                </div>
              `
                  : ""
              }
              <div class="total-row final">
                <span>Tổng cộng:</span>
                <span>${order.total_price?.toLocaleString("vi-VN")}đ</span>
              </div>
            </div>
          </div>
          
          <div class="footer">
            <p>Nếu bạn có bất kỳ câu hỏi nào, vui lòng liên hệ với chúng tôi:</p>
            <p class="contact-info">
              📧 Email: cskh@juno.vn<br>
              📞 Hotline: 1900 63 6988<br>
              💬 Chat: Trực tuyến 24/7
            </p>
            <p style="margin-top: 15px; font-size: 14px; color: #6c757d;">
              Cảm ơn bạn đã tin tưởng JUNO SHOP!
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Order cancellation email sent to ${customerEmail}`);
  } catch (error) {
    console.error("Error sending order cancellation email:", error);
    throw error;
  }
};

module.exports = sendOrderCancelMail;
