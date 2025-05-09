const express = require("express");
const router = express.Router();
const orderController = require("../controllers/order.controller");
const authMiddleware = require("../middleware/auth.middleware");

// Public routes
router.post("/create", orderController.create);
router.get("/:id", orderController.getById);

// Protected routes (require authentication)
router.put("/update/:id", authMiddleware, orderController.update);
router.put("/:id/status", authMiddleware, orderController.updateStatus);
router.post("/:id/process-payment", authMiddleware, orderController.processPayment);
router.delete("/delete/:id", authMiddleware, orderController.delete);

module.exports = router; 