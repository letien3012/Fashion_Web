const express = require("express");
const router = express.Router();
const orderController = require("../controllers/order.controller");

// Public routes
router.post("/create", orderController.create);
router.get("/:id", orderController.getById);

// Protected routes (require authentication)
router.put("/update/:id", orderController.update);
router.put("/:id/status", orderController.updateStatus);
router.post("/:id/process-payment", orderController.processPayment);
router.delete("/delete/:id", orderController.delete);

module.exports = router;
