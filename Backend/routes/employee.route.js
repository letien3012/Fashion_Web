const express = require("express");
const router = express.Router();
const employeeController = require("../controllers/employee.controller");

router.post("/add", employeeController.add);
router.post("/login", employeeController.login);
router.get("/:id", employeeController.getEmployeeById);
router.put("/update/:id", employeeController.updateEmployee);
router.delete("/delete/:id", employeeController.deleteEmployee);
router.get("/:id/orders", employeeController.getEmployeeOrders);
router.put("/:id/password", employeeController.updatePassword);
router.post("/forgot-password", employeeController.forgotPassword);
router.post("/reset-password", employeeController.resetPassword);

module.exports = router;
