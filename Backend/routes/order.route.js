const express = require("express");
const router = express.Router();
const orderController = require("../controllers/order.controller");
const auth = require("../middleware/auth");

// Lấy tất cả đơn hàng (cho admin)
router.get("/", orderController.getAllOrders);
router.get("/total", orderController.getTotalOrders);
router.get("/revenue", orderController.getTotalRevenue);
router.get("/sales", orderController.getSalesData);
// Thêm route mới cho API getTopProducts
router.get("/top-products", orderController.getTopProducts);

// Lấy tất cả đơn hàng của khách hàng đang đăng nhập
router.get("/customer", auth, orderController.getOrdersByCustomer);
// Thêm route mới (GET /order-status) để gọi API getOrderStatus từ order.controller (nếu chưa có route này)
router.get("/order-status", orderController.getOrderStatus);
// Public routes
router.get("/:id", orderController.getById);
router.post("/", orderController.create);
router.put("/:id", orderController.update);
router.put("/:id/status", orderController.updateStatus);
router.post("/:id/process-payment", orderController.processPayment);
router.put("/:id/cancel", orderController.cancelOrder);
router.delete("/:id", orderController.delete);

// Return request routes
router.post("/:id/return", auth, orderController.requestReturn);
router.put("/:id/return", orderController.processReturnRequest);

router.put("/:id/online-detail", orderController.updateOnlineDetail);

router.put("/:orderCode/status-by-code", orderController.updateStatusByCode);

// Route cho admin tạo đơn hàng
router.post("/admin", orderController.createByAdmin);

module.exports = router;
