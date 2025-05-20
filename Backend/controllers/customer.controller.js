const Customer = require("../models/customer.model");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Đăng ký tài khoản khách hàng mới
exports.register = async (req, res) => {
  try {
    const { email, password, fullname, phone, address } = req.body;
    
    // Kiểm tra email đã tồn tại
    const existingCustomer = await Customer.findOne({ email });
    if (existingCustomer) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // Mã hóa mật khẩu
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Tạo customer mới
    const customer = await Customer.create({
      email,
      password: hashedPassword,
      fullname,
      phone,
      address
    });

    // Tạo JWT token
    const token = jwt.sign(
      { id: customer._id, email: customer.email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: "Customer registered successfully",
      token,
      customer: {
        id: customer._id,
        email: customer.email,
        fullname: customer.fullname,
        phone: customer.phone,
        address: customer.address
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Đăng nhập
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Tìm customer theo email
    const customer = await Customer.findOne({ email });
    if (!customer) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Kiểm tra mật khẩu
    const isMatch = await bcrypt.compare(password, customer.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Tạo JWT token
    const token = jwt.sign(
      { id: customer._id, email: customer.email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: "Login successful",
      token,
      customer: {
        id: customer._id,
        email: customer.email,
        fullname: customer.fullname,
        phone: customer.phone,
        address: customer.address
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Lấy thông tin khách hàng theo ID
exports.getProfile = async (req, res) => {
  try {
    const customer = await Customer.findById(req.customer.id).select('-password');
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }
    res.json(customer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Cập nhật thông tin khách hàng
exports.updateProfile = async (req, res) => {
  try {
    const { fullname, phone, address } = req.body;
    const customer = await Customer.findById(req.customer.id);
    
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }
    
    // Update fields
    customer.fullname = fullname || customer.fullname;
    customer.phone = phone || customer.phone;
    customer.address = address || customer.address;
    customer.updatedAt = new Date();

    await customer.save();

    res.json({
      message: "Profile updated successfully",
      customer: {
        id: customer._id,
        email: customer.email,
        fullname: customer.fullname,
        phone: customer.phone,
        address: customer.address
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Xóa tài khoản khách hàng
exports.deleteAccount = async (req, res) => {
  try {
    const customer = await Customer.findById(req.customer.id);
    
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }
    
    // Soft delete
    customer.deletedAt = new Date();
    await customer.save();

    res.json({ message: "Account deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Lấy danh sách đơn hàng của khách hàng
exports.getCustomerOrders = async (req, res) => {
  try {
    const orders = await Customer.getCustomerOrders(req.params.id);
    res.status(200).json(orders);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Cập nhật mật khẩu
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const customer = await Customer.findById(req.customer.id);
    
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    // Kiểm tra mật khẩu hiện tại
    const isMatch = await bcrypt.compare(currentPassword, customer.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    // Mã hóa mật khẩu mới
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    customer.password = hashedPassword;
    customer.updatedAt = new Date();
    await customer.save();

    res.json({ message: "Password changed successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Quên mật khẩu
exports.requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;
    const customer = await Customer.findOne({ email });

    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    // Generate reset token
    const resetToken = jwt.sign(
      { id: customer._id },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Store reset token in customer document
    customer.resetToken = resetToken;
    customer.resetTokenExpiry = Date.now() + 3600000; // 1 hour
    await customer.save();

    // TODO: Send reset token via email
    // For now, just return the token
    res.json({
      message: "Password reset token generated",
      resetToken
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Đặt lại mật khẩu
exports.resetPassword = async (req, res) => {
  try {
    const { resetToken, newPassword } = req.body;

    // Verify token
    const decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
    const customer = await Customer.findById(decoded.id);

    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    if (customer.resetToken !== resetToken || customer.resetTokenExpiry < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired reset token" });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password and clear reset token
    customer.password = hashedPassword;
    customer.resetToken = undefined;
    customer.resetTokenExpiry = undefined;
    customer.updatedAt = new Date();
    await customer.save();

    res.json({ message: "Password reset successful" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Lấy danh sách khách hàng
exports.getAllCustomers = async (req, res) => {
  try {
    const customers = await Customer.find({ deletedAt: null }).select('-password');
    res.status(200).json({
      message: "Customers retrieved successfully",
      data: customers
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
