const express = require("express");
const router = express.Router();
const employeeController = require("../controllers/employee.controller");

// Public routes
router.post("/login", employeeController.login);
router.post("/forgot-password", employeeController.forgotPassword);
router.post("/reset-password", employeeController.resetPassword);

// Protected routes
router.post("/add", employeeController.add);
router.put("/update/:id", employeeController.updateEmployee);
router.delete("/delete/:id", employeeController.deleteEmployee);
router.get("/get/:id", employeeController.getEmployeeById);
router.get("/", employeeController.getAllEmployees);
router.get("/:id/orders", employeeController.getEmployeeOrders);
router.put("/:id/password", employeeController.updatePassword);

module.exports = router;
