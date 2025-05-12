const Employee = require("../models/employee.model");
const { admin } = require("../firebase/firebase-admin");

// Đăng ký tài khoản nhân viên mới
exports.add = async (req, res) => {
  try {
    const { email, password, fullname, role, address, image, publish } =
      req.body;

    // Validate required fields
    if (!email || !password || !fullname) {
      return res.status(400).json({
        success: false,
        message: "Email, password and fullname are required",
      });
    }

    // Check if email already exists
    const existingEmployee = await Employee.getByEmail(email);
    if (existingEmployee) {
      return res.status(400).json({
        success: false,
        message: "Email already exists",
      });
    }

    // Create new employee
    const employee = new Employee({
      email,
      password,
      fullname,
      role: role || "staff",
      address: address || "",
      image,
      publish: publish !== undefined ? publish : true,
    });

    const id = await employee.save();

    res.status(201).json({
      success: true,
      message: "Employee added successfully",
      data: { id },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error adding employee",
      error: error.message,
    });
  }
};

// Đăng nhập
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const employee = await Employee.getByEmail(email);
    if (!employee) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Check if employee is deleted
    if (employee.deletedAt) {
      return res.status(401).json({
        success: false,
        message: "This account has been deleted",
      });
    }

    // Compare password
    const isMatch = await Employee.comparePassword(password, employee.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Remove password from response
    const { password: _, ...employeeWithoutPassword } = employee;

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: employeeWithoutPassword,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error logging in",
      error: error.message,
    });
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
    const { id } = req.params;
    const { email, password, fullname, role, address, image, publish } =
      req.body;

    // Check if employee exists
    const existingEmployee = await Employee.getById(id);
    if (!existingEmployee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    // If email is being changed, check if new email already exists
    if (email && email !== existingEmployee.email) {
      const emailExists = await Employee.getByEmail(email);
      if (emailExists) {
        return res.status(400).json({
          success: false,
          message: "Email already exists",
        });
      }
    }

    // Prepare update data
    const updateData = {
      email: email || existingEmployee.email,
      fullname: fullname || existingEmployee.fullname,
      role: role || existingEmployee.role,
      address: address !== undefined ? address : existingEmployee.address,
      image: image || existingEmployee.image,
      publish: publish !== undefined ? publish : existingEmployee.publish,
    };

    // Only update password if provided
    if (password) {
      updateData.password = password;
    }

    await Employee.update(id, updateData);

    res.status(200).json({
      success: true,
      message: "Employee updated successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating employee",
      error: error.message,
    });
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

exports.getAllEmployees = async (req, res) => {
  try {
    const employees = await Employee.getAllEmployees();
    res.status(200).json({
      message: "Employees retrieved successfully",
      data: employees,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
