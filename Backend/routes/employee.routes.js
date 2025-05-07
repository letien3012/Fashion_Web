const express = require("express");
const router = express.Router();
const employeeController = require("../controllers/employee.controller");

// Đăng ký tài khoản nhân viên mới
router.post("/register", employeeController.register);

// Đăng nhập
router.post("/login", employeeController.login);

// Lấy thông tin nhân viên theo ID
router.get("/:id", employeeController.getEmployeeById);

// Cập nhật thông tin nhân viên
router.put("/:id", employeeController.updateEmployee);

// Xóa tài khoản nhân viên
router.delete("/:id", employeeController.deleteEmployee);

// Lấy danh sách đơn hàng đã xử lý
router.get("/:id/orders", employeeController.getEmployeeOrders);

// Cập nhật mật khẩu
router.put("/:id/password", employeeController.updatePassword);

// Quên mật khẩu
router.post("/forgot-password", employeeController.forgotPassword);

// Đặt lại mật khẩu
router.post("/reset-password", employeeController.resetPassword);

module.exports = router;
