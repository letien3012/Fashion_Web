const cron = require("node-cron");
const Order = require("../models/order.model");
const Customer = require("../models/customer.model");
const sendOrderCancelMail = require("../mailer/sendOrderCancelMail");

// Cron job: tự động hủy đơn hàng online quá hạn thanh toán
cron.schedule("*/5 * * * *", async () => {
  const now = new Date();
  const expired = new Date(now.getTime() - 60 * 60 * 1000); // 1 giờ trước
  const onlineMethods = ["PAYOS", "PAYPAL", "VNPAY"];
  try {
    // Tìm các đơn hàng cần hủy
    const ordersToCancel = await Order.find({
      status: "pending",
      method: { $in: onlineMethods },
      createdAt: { $lt: expired },
    }).populate("customerId", "email fullname");

    if (ordersToCancel.length > 0) {
      // Hủy các đơn hàng
      const result = await Order.updateMany(
        {
          status: "pending",
          method: { $in: onlineMethods },
          createdAt: { $lt: expired },
        },
        {
          $set: {
            status: "cancelled",
            updatedAt: now,
            "actionDetail.note": "Tự động hủy do quá hạn thanh toán online",
            "actionDetail.createdAt": now,
            "actionDetail.updatedAt": now,
          },
        }
      );

      console.log(
        `[AutoCancel] Đã tự động hủy ${result.modifiedCount} đơn hàng online quá hạn`
      );

      // Gửi email thông báo hủy đơn hàng
      for (const order of ordersToCancel) {
        try {
          if (order.customerId && order.customerId.email) {
            // Populate product information for email
            const populatedOrder = await Order.findById(order._id).populate(
              "order_detail.productId",
              "name image"
            );

            await sendOrderCancelMail(
              populatedOrder,
              order.customerId.email,
              "Tự động hủy do quá hạn thanh toán online (quá 1 giờ)"
            );
            console.log(
              `[AutoCancel] Email hủy đơn hàng đã gửi đến ${order.customerId.email}`
            );
          }
        } catch (emailError) {
          console.error(
            `[AutoCancel] Lỗi gửi email cho đơn hàng ${order.code}:`,
            emailError
          );
          // Không dừng quá trình nếu gửi email thất bại
        }
      }
    }
  } catch (err) {
    console.error("[AutoCancel] Lỗi khi tự động hủy đơn hàng:", err);
  }
});
