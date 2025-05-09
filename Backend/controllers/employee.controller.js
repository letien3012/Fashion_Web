const Employee = require("../models/employee.model");
const { admin } = require("../firebase/firebase-admin");

// Đăng ký tài khoản nhân viên mới
exports.add = async (req, res) => {
  try {
    const employee = new Employee(req.body);
    const id = await employee.save();
    res.status(201).json({
      message: "Employee added successfully",
      id,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Đăng nhập
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Xác thực với Firebase Authentication
    const userCredential = await admin.auth().getUserByEmail(email);

    // Lấy thông tin bổ sung từ Firestore
    const employee = await Employee.getById(userCredential.uid);

    // Tạo custom token
    const token = await admin.auth().createCustomToken(userCredential.uid);

    res.status(200).json({
      message: "Login successful",
      token,
      employee: {
        id: employee.id,
        email: employee.email,
        fullname: employee.fullname,
        role: employee.role,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(401).json({ message: "Invalid credentials" });
  }
};

// Lấy thông tin nhân viên theo ID
exports.getEmployeeById = async (req, res) => {
  try {
    const employee = await Employee.getById(req.params.id);
    res.status(200).json(employee);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

// Cập nhật thông tin nhân viên
exports.updateEmployee = async (req, res) => {
  try {
    await Employee.update(req.params.id, req.body);
    res.status(200).json({ message: "Employee updated successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Xóa tài khoản nhân viên
exports.deleteEmployee = async (req, res) => {
  try {
    await Employee.delete(req.params.id);
    res.status(200).json({ message: "Employee deleted successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Lấy danh sách đơn hàng đã xử lý
exports.getEmployeeOrders = async (req, res) => {
  try {
    const orders = await Employee.getEmployeeOrders(req.params.id);
    res.status(200).json(orders);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Cập nhật mật khẩu
exports.updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    await admin.auth().updateUser(req.params.id, {
      password: newPassword,
    });
    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Quên mật khẩu
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const employee = await Employee.getByEmail(email);
    if (!employee) {
      throw new Error("Employee not found");
    }

    // Gửi email reset password
    await admin.auth().generatePasswordResetLink(email);

    res.status(200).json({ message: "Password reset email sent" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Đặt lại mật khẩu
exports.resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    const employee = await Employee.getByEmail(email);
    if (!employee) {
      throw new Error("Employee not found");
    }

    await admin.auth().updateUser(employee.id, {
      password: newPassword,
    });

    res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
