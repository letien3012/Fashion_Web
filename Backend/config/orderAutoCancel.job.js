const cron = require("node-cron");
const Order = require("../models/order.model");

// Cron job: tự động hủy đơn hàng online quá hạn thanh toán
cron.schedule("*/5 * * * *", async () => {
  const now = new Date();
  const expired = new Date(now.getTime() - 60 * 60 * 1000); // 1 giờ trước
  const onlineMethods = ["PAYOS", "PAYPAL", "VNPAY"];
  try {
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
    if (result.modifiedCount > 0) {
      console.log(
        `[AutoCancel] Đã tự động hủy ${result.modifiedCount} đơn hàng online quá hạn`
      );
    }
  } catch (err) {
    console.error("[AutoCancel] Lỗi khi tự động hủy đơn hàng:", err);
  }
});
