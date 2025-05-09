const Order = require("../models/order.model");

// Create new order
exports.create = async (req, res) => {
  try {
    const order = new Order(req.body);
    const id = await order.save();
    res.status(201).json({
      message: "Order created successfully",
      id
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get order by ID
exports.getById = async (req, res) => {
  try {
    const order = await Order.getById(req.params.id);
    res.status(200).json(order);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

// Update order (regular update - doesn't modify employeeId)
exports.update = async (req, res) => {
  try {
    await Order.update(req.params.id, req.body);
    res.status(200).json({ message: "Order updated successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update order status by employee
exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const employeeId = req.user.id; // Assuming you have authentication middleware

    await Order.updateStatusByEmployee(req.params.id, employeeId, status);
    res.status(200).json({ message: "Order status updated successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Process successful payment
exports.processPayment = async (req, res) => {
  try {
    await Order.processSuccessfulPayment(req.params.id);
    res.status(200).json({ message: "Payment processed successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete order
exports.delete = async (req, res) => {
  try {
    await Order.delete(req.params.id);
    res.status(200).json({ message: "Order deleted successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}; 