const express = require("express");
const router = express.Router();
const orderController = require("../controllers/order.controller");

// Lấy danh sách tất cả đơn hàng (cho admin)
router.get("/", orderController.getAllOrders);

// Lấy thông tin đơn hàng theo ID
router.get("/:id", orderController.getOrderById);

// Tạo đơn hàng mới
router.post("/", orderController.createOrder);

// Cập nhật trạng thái đơn hàng
router.put("/:id/status", orderController.updateOrderStatus);

// Hủy đơn hàng
router.put("/:id/cancel", orderController.cancelOrder);

// Lấy chi tiết sản phẩm trong đơn hàng
router.get("/:id/items", orderController.getOrderItems);

// Thêm sản phẩm vào đơn hàng
router.post("/:id/items", orderController.addOrderItem);

// Cập nhật số lượng sản phẩm trong đơn hàng
router.put("/:id/items/:itemId", orderController.updateOrderItem);

// Xóa sản phẩm khỏi đơn hàng
router.delete("/:id/items/:itemId", orderController.removeOrderItem);

// Lấy lịch sử trạng thái đơn hàng
router.get("/:id/history", orderController.getOrderHistory);

// Thanh toán đơn hàng
router.post("/:id/payment", orderController.processPayment);

// Xác nhận đã nhận hàng
router.put("/:id/confirm-delivery", orderController.confirmDelivery);

module.exports = router;
