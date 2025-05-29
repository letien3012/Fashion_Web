const express = require("express");
const router = express.Router();
const orderController = require("../controllers/order.controller");
const auth = require("../middleware/auth");

// Lấy tất cả đơn hàng (cho admin)
router.get("/", orderController.getAllOrders);

// Lấy tất cả đơn hàng của khách hàng đang đăng nhập
router.get("/customer", auth, orderController.getOrdersByCustomer);

// Public routes
router.get("/:id", orderController.getById);
router.post("/", orderController.create);
router.put("/:id", orderController.update);
router.put("/:id/status", orderController.updateStatus);
router.post("/:id/process-payment", orderController.processPayment);
router.delete("/:id", orderController.delete);

module.exports = router;
