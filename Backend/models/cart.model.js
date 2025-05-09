const { db } = require("../firebase/firebase-admin");

class Cart {
  constructor(data) {
    this.customerId = data.customerId;
    this.cart_detail = data.cart_detail || [];
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || null;
    this.deletedAt = data.deletedAt || null;
  }

  // Validate cart detail
  static validateCartDetail(detail) {
    if (!detail.productId) {
      throw new Error("Product ID is required in cart detail");
    }
    if (!detail.variant) {
      throw new Error("Variant information is required in cart detail");
    }
    if (typeof detail.quantity !== 'number' || detail.quantity <= 0) {
      throw new Error("Quantity must be a positive number");
    }
    return true;
  }

  // Lấy giỏ hàng theo customerId
  static async getByCustomerId(customerId) {
    try {
      const snapshot = await db
        .collection("carts")
        .where("customerId", "==", customerId)
        .get();
      
      if (snapshot.empty) {
        return null;
      }

      const cart = snapshot.docs[0];
      return { id: cart.id, ...cart.data() };
    } catch (error) {
      throw new Error(`Error getting cart: ${error.message}`);
    }
  }

  // Lưu giỏ hàng mới
  async save() {
    try {
      // Validate cart details
      if (this.cart_detail && this.cart_detail.length > 0) {
        this.cart_detail.forEach(detail => {
          Cart.validateCartDetail(detail);
        });
      }

      const cartData = {
        customerId: this.customerId,
        cart_detail: this.cart_detail,
        createdAt: this.createdAt,
        updatedAt: null,
        deletedAt: null,
      };

      const cartRef = await db.collection("carts").add(cartData);
      return cartRef.id;
    } catch (error) {
      throw new Error(`Error saving cart: ${error.message}`);
    }
  }

  // Cập nhật giỏ hàng
  static async update(id, data) {
    try {
      // Validate cart details if they exist
      if (data.cart_detail && data.cart_detail.length > 0) {
        data.cart_detail.forEach(detail => {
          Cart.validateCartDetail(detail);
        });
      }

      const updateData = {
        ...data,
        updatedAt: new Date(),
      };

      await db.collection("carts").doc(id).update(updateData);
      return true;
    } catch (error) {
      throw new Error(`Error updating cart: ${error.message}`);
    }
  }

  // Thêm sản phẩm vào giỏ hàng
  static async addToCart(cartId, detail) {
    try {
      Cart.validateCartDetail(detail);

      const cart = await this.getById(cartId);
      const cart_detail = cart.cart_detail || [];

      // Kiểm tra xem sản phẩm đã có trong giỏ hàng chưa
      const existingIndex = cart_detail.findIndex(
        item => item.productId === detail.productId && 
                item.variant.sku === detail.variant.sku
      );

      if (existingIndex !== -1) {
        // Nếu đã có, cập nhật số lượng
        cart_detail[existingIndex].quantity += detail.quantity;
      } else {
        // Nếu chưa có, thêm mới
        cart_detail.push(detail);
      }

      await db.collection("carts").doc(cartId).update({
        cart_detail: cart_detail,
        updatedAt: new Date()
      });

      return true;
    } catch (error) {
      throw new Error(`Error adding to cart: ${error.message}`);
    }
  }

  // Cập nhật số lượng sản phẩm trong giỏ hàng
  static async updateCartItemQuantity(cartId, productId, variantSku, quantity) {
    try {
      const cart = await this.getById(cartId);
      const cart_detail = cart.cart_detail || [];

      const itemIndex = cart_detail.findIndex(
        item => item.productId === productId && 
                item.variant.sku === variantSku
      );

      if (itemIndex === -1) {
        throw new Error("Item not found in cart");
      }

      if (quantity <= 0) {
        // Nếu số lượng <= 0, xóa sản phẩm khỏi giỏ hàng
        cart_detail.splice(itemIndex, 1);
      } else {
        // Cập nhật số lượng
        cart_detail[itemIndex].quantity = quantity;
      }

      await db.collection("carts").doc(cartId).update({
        cart_detail: cart_detail,
        updatedAt: new Date()
      });

      return true;
    } catch (error) {
      throw new Error(`Error updating cart item quantity: ${error.message}`);
    }
  }

  // Xóa sản phẩm khỏi giỏ hàng
  static async removeFromCart(cartId, productId, variantSku) {
    try {
      const cart = await this.getById(cartId);
      const cart_detail = cart.cart_detail || [];

      const itemIndex = cart_detail.findIndex(
        item => item.productId === productId && 
                item.variant.sku === variantSku
      );

      if (itemIndex === -1) {
        throw new Error("Item not found in cart");
      }

      cart_detail.splice(itemIndex, 1);

      await db.collection("carts").doc(cartId).update({
        cart_detail: cart_detail,
        updatedAt: new Date()
      });

      return true;
    } catch (error) {
      throw new Error(`Error removing from cart: ${error.message}`);
    }
  }

  // Xóa giỏ hàng
  static async delete(id) {
    try {
      await db.collection("carts").doc(id).delete();
      return true;
    } catch (error) {
      throw new Error(`Error deleting cart: ${error.message}`);
    }
  }
}

module.exports = Cart; 