const express = require("express");
const router = express.Router();
const customerController = require("../controllers/customer.controller");

router.post("/add", customerController.add);
router.post("/login", customerController.login);
router.get("/:id", customerController.getCustomerById);
router.put("/update/:id", customerController.updateCustomer);
router.delete("/delete/:id", customerController.deleteCustomer);
router.get("/:id/orders", customerController.getCustomerOrders);
router.put("/:id/password", customerController.updatePassword);
router.post("/forgot-password", customerController.forgotPassword);
router.post("/reset-password", customerController.resetPassword);
router.get("/", customerController.getAllCustomers);

module.exports = router;
