const Order = require("../models/order.model");

// Lấy danh sách tất cả đơn hàng
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.getAll();
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Lấy thông tin đơn hàng theo ID
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.getById(req.params.id);
    res.status(200).json(order);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

// Tạo đơn hàng mới
exports.createOrder = async (req, res) => {
  try {
    const order = new Order(req.body);
    const orderId = await order.save();
    res.status(201).json({
      message: "Order created successfully",
      orderId,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Cập nhật trạng thái đơn hàng
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status, note } = req.body;
    await Order.updateStatus(req.params.id, status, note);
    res.status(200).json({ message: "Order status updated successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Hủy đơn hàng
exports.cancelOrder = async (req, res) => {
  try {
    const { reason } = req.body;
    await Order.updateStatus(req.params.id, "cancelled", reason);
    res.status(200).json({ message: "Order cancelled successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Lấy chi tiết sản phẩm trong đơn hàng
exports.getOrderItems = async (req, res) => {
  try {
    const order = await Order.getById(req.params.id);
    res.status(200).json(order.items);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

// Thêm sản phẩm vào đơn hàng
exports.addOrderItem = async (req, res) => {
  try {
    await Order.addItem(req.params.id, req.body);
    res.status(200).json({ message: "Item added to order successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Cập nhật số lượng sản phẩm trong đơn hàng
exports.updateOrderItem = async (req, res) => {
  try {
    const { quantity } = req.body;
    await Order.updateItem(req.params.id, req.params.itemId, quantity);
    res.status(200).json({ message: "Order item updated successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Xóa sản phẩm khỏi đơn hàng
exports.removeOrderItem = async (req, res) => {
  try {
    await Order.removeItem(req.params.id, req.params.itemId);
    res.status(200).json({ message: "Item removed from order successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Lấy lịch sử trạng thái đơn hàng
exports.getOrderHistory = async (req, res) => {
  try {
    const history = await Order.getHistory(req.params.id);
    res.status(200).json(history);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

// Thanh toán đơn hàng
exports.processPayment = async (req, res) => {
  try {
    const { paymentMethod, amount } = req.body;
    // Xử lý thanh toán ở đây (có thể tích hợp với các cổng thanh toán)
    await Order.updatePaymentStatus(req.params.id, "paid");
    res.status(200).json({ message: "Payment processed successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Xác nhận đã nhận hàng
exports.confirmDelivery = async (req, res) => {
  try {
    await Order.updateStatus(
      req.params.id,
      "delivered",
      "Customer confirmed delivery"
    );
    res.status(200).json({ message: "Delivery confirmed successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
