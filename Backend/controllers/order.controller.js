const Order = require("../models/order.model");
const Customer = require("../models/customer.model");
const Consignment = require("../models/consignment.model");

// Generate unique order code
const generateOrderCode = () => {
  const timestamp = Date.now().toString();
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0");
  return `ORD${timestamp}${random}`;
};

// Create new order
exports.create = async (req, res) => {
  try {
    const {
      customerInfo,
      items,
      total_product_price,
      total_price,
      discount,
      method,
      note,
    } = req.body;
    console.log(req.body);
    // Process each item and its variants to allocate consignments
    for (const item of items) {
      for (const variant of item.variants) {
        let remainingQuantity = variant.quantity;
        variant.consignments = [];

        // Get all available consignments for this variant, sorted by creation date (oldest first)
        const consignments = await Consignment.find({
          productId: item.productId,
          variantId: variant._id,
          publish: true,
          current_quantity: { $gt: 0 },
        }).sort({ createdAt: 1 });

        console.log(
          `Found ${consignments.length} consignments for variant ${variant.sku} (ID: ${variant._id})`
        );

        // Allocate quantities from consignments
        for (const consignment of consignments) {
          if (remainingQuantity <= 0) break;

          const quantityToTake = Math.min(
            remainingQuantity,
            consignment.current_quantity
          );

          // Add consignment allocation to variant
          variant.consignments.push({
            consignmentId: consignment._id,
            quantity: quantityToTake,
          });

          // Update consignment's current quantity
          await Consignment.decreaseQuantity(consignment._id, quantityToTake);

          remainingQuantity -= quantityToTake;
        }

        // If we couldn't fulfill the entire order
        if (remainingQuantity > 0) {
          throw new Error(
            `Không đủ số lượng cho biến thể ${variant.sku} (ID: ${variant._id}). Cần thêm ${remainingQuantity} sản phẩm.`
          );
        }
      }
    }

    // Create order
    const order = new Order({
      customerId: customerInfo.customerId,
      code: generateOrderCode(),
      fullname: customerInfo.name,
      phone: customerInfo.phone,
      address: customerInfo.address,
      order_detail: items,
      total_product_price,
      total_price,
      discount: discount || 0,
      method: method || "COD",
      note: note || "",
      status: "pending",
      voucher: req.body.voucher || null,
    });

    // Update customer information if provided
    if (customerInfo) {
      await Customer.findByIdAndUpdate(customerInfo.customerId, {
        fullname: customerInfo.name,
        phone: customerInfo.phone,
        address: customerInfo.address,
        updatedAt: new Date(),
      });
    }

    const savedOrder = await order.save();
    res.status(201).json({
      message: "Order created successfully",
      order: savedOrder,
    });
  } catch (error) {
    console.error("Error creating order:", error);
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
    const { employeeId } = req.body; // Get employeeId from request body

    await Order.updateStatusByEmployee(req.params.id, employeeId, status);
    res.status(200).json({ message: "Order status updated successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Cancel order by customer
exports.cancelOrder = async (req, res) => {
  try {
    const { note } = req.body;
    const order = await Order.cancelOrder(req.params.id, note);
    res.status(200).json({
      message: "Order cancelled successfully",
      order,
    });
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

// Lấy tất cả đơn hàng của khách hàng đang đăng nhập
exports.getOrdersByCustomer = async (req, res) => {
  try {
    // Lấy id từ token đã decode
    const customerId = req.customer.id;
    // Tùy theo model, ví dụ:
    const orders = await Order.find({ customerId }).sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Lấy tất cả đơn hàng (cho admin)
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("customerId", "email fullname phone address")
      .populate("employeeId", "email fullname")
      .populate("order_detail.productId", "name image")
      .sort({ createdAt: -1 }); // Sắp xếp theo thời gian tạo mới nhất
    res.status(200).json(orders);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
