const { db } = require("../firebase/firebase-admin");

class Order {
  constructor(data) {
    // Thông tin cơ bản
    this.customerId = data.customerId;
    this.employeeId = null; // Ban đầu là null, chỉ được cập nhật khi nhân viên xử lý đơn hàng
    
    // Thông tin thanh toán
    this.total_product_price = data.total_product_price || 0; // Tổng tiền sản phẩm
    this.total_ship_fee = data.total_ship_fee || 0; // Phí vận chuyển
    this.discount = data.discount || 0; // Giảm giá
    this.total_price = data.total_price || 0; // Tổng tiền cuối cùng
    
    // Thông tin đơn hàng
    this.method = data.method || ""; // Phương thức thanh toán
    this.status = data.status || "pending"; // Trạng thái đơn hàng
    this.note = data.note || ""; // Ghi chú
    
    // Chi tiết đơn hàng
    this.order_detail = data.order_detail || []; // Mảng các sản phẩm trong đơn hàng
    
    // Timestamps
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || null;
    this.deletedAt = data.deletedAt || null;
  }

  static async getById(id) {
    try {
      const doc = await db.collection("orders").doc(id).get();
      if (!doc.exists) {
        throw new Error("Order not found");
      }
      return { id: doc.id, ...doc.data() };
    } catch (error) {
      throw new Error(`Error getting order by ID: ${error.message}`);
    }
  }

  async save() {
    try {
      const orderData = {
        customerId: this.customerId,
        employeeId: this.employeeId,
        total_product_price: this.total_product_price,
        total_ship_fee: this.total_ship_fee,
        discount: this.discount,
        total_price: this.total_price,
        method: this.method,
        status: this.status,
        note: this.note,
        order_detail: this.order_detail,
        createdAt: this.createdAt,
        updatedAt: null,
        deletedAt: null
      };

      const orderRef = await db.collection("orders").add(orderData);
      return orderRef.id;
    } catch (error) {
      throw new Error(`Error saving order: ${error.message}`);
    }
  }

  // Regular update method that doesn't modify employeeId
  static async update(id, data) {
    try {
      const updateData = {
        ...data,
        updatedAt: new Date()
      };

      // Remove employeeId from update data if it exists
      delete updateData.employeeId;

      await db.collection("orders").doc(id).update(updateData);
      return true;
    } catch (error) {
      throw new Error(`Error updating order: ${error.message}`);
    }
  }

  // Special method for updating order status by employee
  static async updateStatusByEmployee(id, employeeId, status) {
    try {
      const validStatuses = ["pending", "processing", "shipped", "delivered", "cancelled"];
      if (!validStatuses.includes(status)) {
        throw new Error("Invalid order status");
      }

      const updateData = {
        status,
        employeeId, // Only set employeeId when status is updated by employee
        updatedAt: new Date()
      };

      await db.collection("orders").doc(id).update(updateData);
      return true;
    } catch (error) {
      throw new Error(`Error updating order status: ${error.message}`);
    }
  }

  // Method to process successful payment and update cart
  static async processSuccessfulPayment(orderId) {
    try {
      const order = await this.getById(orderId);
      
      // Get customer's cart
      const cartSnapshot = await db
        .collection("carts")
        .where("customerId", "==", order.customerId)
        .get();

      if (!cartSnapshot.empty) {
        const cartDoc = cartSnapshot.docs[0];
        const cartData = cartDoc.data();
        
        // Process each item in the order
        for (const orderItem of order.order_detail) {
          // Find matching item in cart
          const cartItemIndex = cartData.items.findIndex(
            item => item.productId === orderItem.productId && 
                   JSON.stringify(item.variants) === JSON.stringify(orderItem.variants)
          );

          if (cartItemIndex !== -1) {
            const cartItem = cartData.items[cartItemIndex];
            
            // Update or remove variant quantity
            const variantIndex = cartItem.variants.findIndex(
              v => JSON.stringify(v) === JSON.stringify(orderItem.variants)
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
              cartData.items.splice(cartItemIndex, 1);
            }
          }
        }

        // Update or delete cart
        if (cartData.items.length === 0) {
          // Delete cart if empty
          await cartDoc.ref.delete();
        } else {
          // Update cart with remaining items
          await cartDoc.ref.update({
            items: cartData.items,
            updatedAt: new Date()
          });
        }
      }

      return true;
    } catch (error) {
      throw new Error(`Error processing payment: ${error.message}`);
    }
  }

  static async delete(id) {
    try {
      await db.collection("orders").doc(id).update({
        deletedAt: new Date()
      });
      return true;
    } catch (error) {
      throw new Error(`Error deleting order: ${error.message}`);
    }
  }
}

module.exports = Order; 