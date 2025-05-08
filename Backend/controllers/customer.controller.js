const Customer = require("../models/customer.model");
const { admin } = require("../firebase/firebase-admin");

// Đăng ký tài khoản khách hàng mới
exports.add = async (req, res) => {
  try {
    const customer = new Customer(req.body);
    const id = await customer.save();
    res.status(201).json({
      message: "Customer added successfully",
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
    const customer = await Customer.getById(userCredential.uid);

    // Tạo custom token
    const token = await admin.auth().createCustomToken(userCredential.uid);

    res.status(200).json({
      message: "Login successful",
      token,
      customer: {
        id: customer.id,
        email: customer.email,
        fullname: customer.fullname,
      },
    });
  } catch (error) {
    res.status(401).json({ message: "Invalid credentials" });
  }
};

// Lấy thông tin khách hàng theo ID
exports.getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.getById(req.params.id);
    res.status(200).json(customer);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

// Cập nhật thông tin khách hàng
exports.updateCustomer = async (req, res) => {
  try {
    await Customer.update(req.params.id, req.body);
    res.status(200).json({ message: "Customer updated successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Xóa tài khoản khách hàng
exports.deleteCustomer = async (req, res) => {
  try {
    await Customer.delete(req.params.id);
    res.status(200).json({ message: "Customer deleted successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
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
    const customer = await Customer.getByEmail(email);
    if (!customer) {
      throw new Error("Customer not found");
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
    const customer = await Customer.getByEmail(email);
    if (!customer) {
      throw new Error("Customer not found");
    }

    await admin.auth().updateUser(customer.id, {
      password: newPassword,
    });

    res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Thêm controller mới này
exports.getAllCustomers = async (req, res) => {
  try {
    const customers = await Customer.getAll();
    res.status(200).json({
      message: "Customers retrieved successfully",
      data: customers
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
