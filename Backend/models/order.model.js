const mongoose = require("mongoose");
const ImageModel = require("./image.model");
const ProductModel = require("./product.model");

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
  voucher: {
    code: { type: String },
    discount: { type: Number },
    max_discount: { type: Number },
  },
  actionDetail: {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      default: null,
    },
    images: [
      {
        type: String,
      },
    ],
    note: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["requested", "approved", "rejected"],
      default: null,
    },
    createdAt: {
      type: Date,
      default: null,
    },
    updatedAt: {
      type: Date,
      default: null,
    },
  },
  province_code: {
    type: String,
    default: "",
  },
  district_code: {
    type: String,
    default: "",
  },
  ward_code: {
    type: String,
    default: "",
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

// Static method to cancel order and update inventory
orderSchema.statics.cancelOrder = async function (orderId, note) {
  try {
    const order = await this.findById(orderId);
    if (!order) {
      throw new Error("Không tìm thấy đơn hàng");
    }

    if (order.status !== "pending") {
      throw new Error("Chỉ có thể hủy đơn hàng ở trạng thái chờ xử lý");
    }

    // Update consignments for each order item
    for (const item of order.order_detail) {
      for (const variant of item.variants) {
        for (const consignment of variant.consignments) {
          // Increase quantity in consignment
          await mongoose
            .model("Consignment")
            .findByIdAndUpdate(consignment.consignmentId, {
              $inc: { current_quantity: consignment.quantity },
            });
        }
      }
    }

    // Update order status and add actionDetail for cancellation
    const updatedOrder = await this.findByIdAndUpdate(
      orderId,
      {
        status: "cancelled",
        actionDetail: {
          note: note || "Đơn hàng bị hủy bởi khách hàng",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        updatedAt: new Date(),
      },
      { new: true }
    );

    return updatedOrder;
  } catch (error) {
    throw new Error(`Lỗi khi hủy đơn hàng: ${error.message}`);
  }
};

// Add static method to handle return request
orderSchema.statics.requestReturn = async function (
  orderId,
  customerId,
  images,
  note
) {
  try {
    const order = await this.findOne({ _id: orderId, customerId });
    if (!order) {
      throw new Error("Không tìm thấy đơn hàng");
    }

    if (order.status !== "delivered") {
      throw new Error("Chỉ có thể yêu cầu trả hàng cho đơn hàng đã giao");
    }

    if (order.actionDetail && order.actionDetail.status) {
      throw new Error("Đơn hàng này đã có yêu cầu trả hàng");
    }

    order.actionDetail = {
      images,
      note,
      status: "requested",
      createdAt: new Date(),
    };

    return await order.save();
  } catch (error) {
    throw new Error(`Lỗi khi yêu cầu trả hàng: ${error.message}`);
  }
};

// Add static method to process return request
orderSchema.statics.processReturnRequest = async function (
  orderId,
  status,
  employeeId
) {
  try {
    const order = await this.findById(orderId);
    if (!order) {
      throw new Error("Không tìm thấy đơn hàng");
    }

    if (!order.actionDetail) {
      throw new Error("Không tìm thấy yêu cầu trả hàng");
    }

    if (order.actionDetail.status !== "requested") {
      throw new Error("Yêu cầu trả hàng đã được xử lý trước đó");
    }

    // Update return request status
    order.actionDetail.status = status;
    order.actionDetail.employeeId = employeeId;
    order.actionDetail.updatedAt = new Date();

    // If approved, update order status to returned and update inventory
    if (status === "approved") {
      order.status = "returned";

      // Update inventory for each item
      for (const item of order.order_detail) {
        for (const variant of item.variants) {
          // Update consignment quantities
          for (const consignment of variant.consignments) {
            await mongoose
              .model("Consignment")
              .findByIdAndUpdate(consignment.consignmentId, {
                $inc: { current_quantity: consignment.quantity },
              });
          }
        }
      }
    }

    await order.save();
    return order;
  } catch (error) {
    throw error;
  }
};

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
