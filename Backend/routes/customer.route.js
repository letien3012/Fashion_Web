const express = require("express");
const router = express.Router();
const customerController = require("../controllers/customer.controller");
const auth = require("../middleware/auth");

// Public routes
router.post("/register", customerController.register);
router.post("/login", customerController.login);
router.post("/request-password-reset", customerController.requestPasswordReset);
router.post("/reset-password", customerController.resetPassword);

// Protected routes
router.get("/profile", auth, customerController.getProfile);
router.put("/profile", auth, customerController.updateProfile);
router.delete("/profile", auth, customerController.deleteAccount);
router.put("/change-password", auth, customerController.changePassword);
router.get("/orders", auth, customerController.getCustomerOrders);

// Admin routes
router.get("/", auth, customerController.getAllCustomers);

module.exports = router;
