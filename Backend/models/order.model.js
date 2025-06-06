const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Customer",
    required: true,
  },
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee",
    default: null,
  },
  code: {
    type: String,
    required: true,
    unique: true,
  },
  fullname: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  total_product_price: {
    type: Number,
    default: 0,
  },
  total_ship_fee: {
    type: Number,
    default: 0,
  },
  discount: {
    type: Number,
    default: 0,
  },
  total_price: {
    type: Number,
    default: 0,
  },
  method: {
    type: String,
    default: "",
  },
  status: {
    type: String,
    enum: [
      "pending",
      "processing",
      "shipping",
      "delivered",
      "cancelled",
      "returned",
    ],
    default: "pending",
  },
  note: {
    type: String,
    default: "",
  },
  order_detail: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },
      variants: [
        {
          sku: String,
          quantity: Number,
          price: Number,
          consignments: [
            {
              consignmentId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Consignment",
                required: true,
              },
              quantity: {
                type: Number,
                required: true,
              },
            },
          ],
        },
      ],
      quantity: Number,
      price: Number,
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: null,
  },
  deletedAt: {
    type: Date,
    default: null,
  },
});

// Static method to get order by ID
orderSchema.statics.getById = async function (id) {
  try {
    const order = await this.findById(id)
      .populate("customerId", "email fullname")
      .populate("employeeId", "email fullname")
      .populate("order_detail.productId", "name image");

    if (!order) {
      throw new Error("Không tìm thấy đơn hàng");
    }
    return order;
  } catch (error) {
    throw new Error(`Lỗi khi lấy đơn hàng theo ID: ${error.message}`);
  }
};

// Static method to update order status by employee
orderSchema.statics.updateStatusByEmployee = async function (
  id,
  employeeId,
  status
) {
  try {
    // Define valid status transitions
    const validTransitions = {
      pending: ["processing", "cancelled"],
      processing: ["shipping", "cancelled"],
      shipping: ["delivered", "cancelled"],
      delivered: ["returned"],
      cancelled: [],
      returned: [],
    };

    // Find the current order to check its status
    const currentOrder = await this.findById(id);

    if (!currentOrder) {
      throw new Error("Không tìm thấy đơn hàng");
    }

    const currentStatus = currentOrder.status;

    // Check if the requested status transition is valid
    if (
      !validTransitions[currentStatus] ||
      !validTransitions[currentStatus].includes(status)
    ) {
      throw new Error(
        `Chuyển trạng thái từ "${currentStatus}" sang "${status}" không hợp lệ.`
      );
    }

    const order = await this.findByIdAndUpdate(
      id,
      {
        status,
        employeeId,
        updatedAt: new Date(),
      },
      { new: true }
    );

    if (!order) {
      throw new Error("Không tìm thấy đơn hàng");
    }

    return order;
  } catch (error) {
    throw new Error(`Lỗi: ${error.message}`);
  }
};

// Static method to process successful payment and update cart
orderSchema.statics.processSuccessfulPayment = async function (orderId) {
  try {
    const order = await this.findById(orderId);
    if (!order) {
      throw new Error("Không tìm thấy đơn hàng");
    }

    // Get customer's cart
    const Cart = mongoose.model("Cart");
    const cart = await Cart.findOne({ customerId: order.customerId });

    if (cart) {
      // Process each item in the order
      for (const orderItem of order.order_detail) {
        // Find matching item in cart
        const cartItemIndex = cart.items.findIndex(
          (item) =>
            item.productId.toString() === orderItem.productId.toString() &&
            JSON.stringify(item.variants) === JSON.stringify(orderItem.variants)
        );

        if (cartItemIndex !== -1) {
          const cartItem = cart.items[cartItemIndex];

          // Update or remove variant quantity
          const variantIndex = cartItem.variants.findIndex(
            (v) => JSON.stringify(v) === JSON.stringify(orderItem.variants)
          );

          if (variantIndex !== -1) {
            // Reduce quantity or remove variant if quantity becomes 0
            cartItem.variants[variantIndex].quantity -= orderItem.quantity;

            if (cartItem.variants[variantIndex].quantity <= 0) {
              cartItem.variants.splice(variantIndex, 1);
            }
          }

          // Remove item from cart if no variants left
          if (cartItem.variants.length === 0) {
            cart.items.splice(cartItemIndex, 1);
          }
        }
      }

      // Update or delete cart
      if (cart.items.length === 0) {
        // Delete cart if empty
        await Cart.findByIdAndDelete(cart._id);
      } else {
        // Update cart with remaining items
        cart.updatedAt = new Date();
        await cart.save();
      }
    }

    return true;
  } catch (error) {
    throw new Error(`Lỗi khi xử lý thanh toán: ${error.message}`);
  }
};

// Static method to get orders by customer
orderSchema.statics.getOrdersByCustomer = async function (customerId) {
  try {
    // Lấy tất cả đơn hàng của customer, có thể populate thêm thông tin sản phẩm
    return await this.find({ customerId })
      .populate("order_detail.productId", "name image")
      .sort({ createdAt: -1 });
  } catch (error) {
    throw new Error(
      `Lỗi khi lấy danh sách đơn hàng của khách hàng: ${error.message}`
    );
  }
};

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
