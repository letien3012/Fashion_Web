const express = require("express");
const router = express.Router();
const employeeController = require("../controllers/employee.controller");
const authMiddleware = require("../middleware/auth.middleware");

// Public routes
router.post("/login", employeeController.login);
router.post("/forgot-password", employeeController.forgotPassword);
router.post("/reset-password", employeeController.resetPassword);

// Protected routes
router.get("/", authMiddleware, employeeController.getAllEmployees);
router.post("/add", authMiddleware, employeeController.add);
router.get("/:id", authMiddleware, employeeController.getEmployeeById);
router.put("/update/:id", authMiddleware, employeeController.updateEmployee);
router.delete("/delete/:id", authMiddleware, employeeController.deleteEmployee);
router.get("/:id/orders", authMiddleware, employeeController.getEmployeeOrders);
router.put("/:id/password", authMiddleware, employeeController.updatePassword);

module.exports = router;
