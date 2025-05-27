const Employee = require("../models/employee.model");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const ImageModel = require("../models/image.model");

const JWT_SECRET = process.env.JWT_SECRET || "fashion_web_secret_key_2024";

// Đăng ký tài khoản nhân viên mới
exports.add = async (req, res) => {
  try {
    const { fullname, email, password, role, address, publish } = req.body;
    let image = null;

    // Handle image upload if present
    if (req.body.image) {
      image = await ImageModel.saveImage(req.body.image);
    }

    // Validate required fields
    if (!fullname || !email || !password) {
      return res.status(400).json({
        message: "Vui lòng nhập đầy đủ thông tin",
      });
    }

    // Check if email already exists
    const existingEmployee = await Employee.findOne({ email });
    if (existingEmployee) {
      return res.status(400).json({
        message: "Email đã tồn tại",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new employee
    const employee = new Employee({
      fullname,
      email,
      password: hashedPassword,
      role,
      address,
      image,
      publish,
    });

    await employee.save();

    res.status(201).json({
      message: "Thêm nhân viên thành công",
      employee: {
        _id: employee._id,
        fullname: employee.fullname,
        email: employee.email,
        role: employee.role,
        address: employee.address,
        image: employee.image,
        publish: employee.publish,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi server",
      error: error.message,
    });
  }
};

// Đăng nhập
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log("=== Login Attempt ===");
    console.log("Email:", email);
    console.log("Password:", password);

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập email và mật khẩu",
      });
    }

    const employee = await Employee.findOne({ email, deletedAt: null });
    console.log("Found employee:", employee ? "Yes" : "No");
    if (!employee) {
      return res.status(401).json({
        success: false,
        message: "Email hoặc mật khẩu không đúng",
      });
    }

    console.log("Stored hashed password:", employee.password);
    console.log("Attempting to compare passwords...");
    console.log("Input password:", password);

    // Compare password
    const isMatch = await bcrypt.compare(password, employee.password);
    console.log("Password match result:", isMatch);
    console.log("=== End Login Attempt ===");

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Email hoặc mật khẩu không đúng",
      });
    }

    // Remove password from response
    const { password: _, ...employeeWithoutPassword } = employee.toObject();

    // Create token
    const token = jwt.sign(
      {
        id: employee._id,
        email: employee.email,
        role: employee.role,
        fullname: employee.fullname,
      },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    // Set cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    });

    res.status(200).json({
      success: true,
      message: "Đăng nhập thành công",
      token,
      employee: employeeWithoutPassword,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi đăng nhập. Vui lòng thử lại sau",
      error: error.message,
    });
  }
};

// Lấy thông tin nhân viên theo ID
exports.getEmployeeById = async (req, res) => {
  try {
    const employee = await Employee.findActiveById(req.params.id);
    if (!employee) {
      return res.status(404).json({
        message: "Không tìm thấy nhân viên",
      });
    }
    const { password, ...employeeWithoutPassword } = employee.toObject();
    res.status(200).json(employeeWithoutPassword);
  } catch (error) {
    console.error("Get employee by ID error:", error);
    res.status(500).json({
      message: "Lỗi server",
      error: error.message,
    });
  }
};

// Cập nhật thông tin nhân viên
exports.updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const { fullname, email, password, role, address, publish } = req.body;
    let image = null;

    const employee = await Employee.findById(id);
    if (!employee) {
      return res.status(404).json({
        message: "Không tìm thấy nhân viên",
      });
    }

    // Update fields
    employee.fullname = fullname || employee.fullname;
    employee.email = email || employee.email;
    employee.role = role || employee.role;
    employee.address = address || employee.address;
    employee.publish = publish !== undefined ? publish : employee.publish;

    // Update password if provided
    if (password) {
      employee.password = await bcrypt.hash(password, 10);
    }

    // Handle image update
    if (req.body.image) {
      // If image is a base64 string (new image)
      if (req.body.image.startsWith("data:")) {
        image = await ImageModel.saveImage(req.body.image);
        // Delete old image if exists
        if (employee.image) {
          await ImageModel.deleteImage(employee.image);
        }
        employee.image = image;
      }
      // If image is a path (old image), keep it
      else if (req.body.image.startsWith("/images/")) {
        employee.image = req.body.image;
      }
    }

    await employee.save();

    res.status(200).json({
      message: "Cập nhật nhân viên thành công",
      employee: {
        _id: employee._id,
        fullname: employee.fullname,
        email: employee.email,
        role: employee.role,
        address: employee.address,
        image: employee.image,
        publish: employee.publish,
      },
    });
  } catch (error) {
    console.error("Update employee error:", error);
    res.status(500).json({
      message: "Lỗi server",
      error: error.message,
    });
  }
};

// Xóa tài khoản nhân viên (soft delete)
exports.deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ID
    if (!id) {
      return res.status(400).json({
        message: "ID nhân viên không hợp lệ",
      });
    }

    // Find active employee
    const employee = await Employee.findActiveById(id);
    if (!employee) {
      return res.status(404).json({
        message: "Không tìm thấy nhân viên",
      });
    }

    // Check if trying to delete self
    if (req.employee && req.employee._id.toString() === id) {
      return res.status(400).json({
        message: "Không thể xóa tài khoản của chính mình",
      });
    }

    // Soft delete by setting deletedAt
    employee.deletedAt = new Date();
    await employee.save();

    res.status(200).json({
      message: "Xóa nhân viên thành công",
    });
  } catch (error) {
    console.error("Delete employee error:", error);
    res.status(500).json({
      message: "Lỗi server",
      error: error.message,
    });
  }
};

// Lấy danh sách đơn hàng đã xử lý
exports.getEmployeeOrders = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    const orders = await Order.find({
      employeeId: req.params.id,
      deletedAt: null,
    }).populate("customerId", "email fullname");

    res.status(200).json(orders);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Cập nhật mật khẩu
exports.updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const employee = await Employee.findById(req.params.id);

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, employee.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    employee.password = hashedPassword;
    employee.updatedAt = new Date();
    await employee.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Quên mật khẩu
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const employee = await Employee.findOne({ email });
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    // Generate reset token
    const resetToken = jwt.sign(
      { id: employee._id },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "1h" }
    );

    // TODO: Send email with reset token
    // For now, just return the token
    res.status(200).json({
      message: "Password reset token generated",
      resetToken,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Đặt lại mật khẩu
exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    // Verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your-secret-key"
    );
    const employee = await Employee.findById(decoded.id);

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    employee.password = hashedPassword;
    employee.updatedAt = new Date();
    await employee.save();

    res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getAllEmployees = async (req, res) => {
  try {
    const employees = await Employee.getAllEmployees();
    res.status(200).json({
      message: "Lấy danh sách nhân viên thành công",
      data: employees,
    });
  } catch (error) {
    console.error("Get all employees error:", error);
    res.status(500).json({
      message: "Lỗi server",
      error: error.message,
    });
  }
};

// Temporary function to reset admin password
exports.resetAdminPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    const employee = await Employee.findOne({ email });
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy tài khoản",
      });
    }

    console.log("Original password:", newPassword);

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    console.log("New hashed password:", hashedPassword);

    // Update password
    employee.password = hashedPassword;
    await employee.save();

    // Verify the new password immediately
    const isMatch = await bcrypt.compare(newPassword, hashedPassword);
    console.log("Verification after save:", isMatch);

    res.status(200).json({
      success: true,
      message: "Đặt lại mật khẩu thành công",
      verification: isMatch,
    });
  } catch (error) {
    console.error("Reset admin password error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server",
      error: error.message,
    });
  }
};

// Test function to verify password hashing
exports.testPassword = async (req, res) => {
  try {
    const { password } = req.body;
    console.log("Original password:", password);

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log("Hashed password:", hashedPassword);

    // Compare immediately
    const isMatch = await bcrypt.compare(password, hashedPassword);
    console.log("Immediate comparison result:", isMatch);

    res.status(200).json({
      success: true,
      originalPassword: password,
      hashedPassword: hashedPassword,
      isMatch: isMatch,
    });
  } catch (error) {
    console.error("Test password error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server",
      error: error.message,
    });
  }
};

// Direct password update
exports.updatePasswordDirectly = async (req, res) => {
  try {
    const { email, password } = req.body;

    const employee = await Employee.findOne({ email });
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy tài khoản",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update directly in database
    await Employee.updateOne({ email }, { $set: { password: hashedPassword } });

    // Verify the update
    const updatedEmployee = await Employee.findOne({ email });
    const isMatch = await bcrypt.compare(password, updatedEmployee.password);

    res.status(200).json({
      success: true,
      message: "Cập nhật mật khẩu thành công",
      verification: isMatch,
      hashedPassword: updatedEmployee.password,
    });
  } catch (error) {
    console.error("Update password error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server",
      error: error.message,
    });
  }
};
