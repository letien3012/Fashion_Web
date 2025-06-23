import axios from "axios";
import authService from "./auth.service";

const API_URL = "http://localhost:3005/api/carts";

export const cartService = {
  async addToCart(cartItem) {
    try {
      // Check if user is logged in
      const currentUser = authService.getCurrentUser();
      if (!currentUser) {
        throw new Error("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng");
      }

      // Format data according to backend model
      const cartData = {
        productId: cartItem.productId,
        variants: [
          {
            _id: cartItem.variantId,
            quantity: cartItem.quantity,
            price: cartItem.price,
            sku: `${cartItem.attributeName1}-${cartItem.attributeName2}`,
          },
        ],
        quantity: cartItem.quantity,
      };

      // First, try to get existing cart
      let cartId;
      try {
        const cartResponse = await axios.get(
          `${API_URL}/customer/${currentUser.id}`,
          {
            headers: {
              Authorization: `Bearer ${currentUser.token}`,
            },
          }
        );
        cartId = cartResponse.data._id;
      } catch (error) {
        // If cart doesn't exist, create new cart
        const createCartResponse = await axios.post(
          `${API_URL}/create`,
          {
            customerId: currentUser.id,
          },
          {
            headers: {
              Authorization: `Bearer ${currentUser.token}`,
            },
          }
        );
        // Use _id from response
        cartId = createCartResponse.data._id;
        if (!cartId) {
          throw new Error("Không thể tạo giỏ hàng mới");
        }
      }

      // Add item to cart
      const response = await axios.post(`${API_URL}/${cartId}/add`, cartData, {
        headers: {
          Authorization: `Bearer ${currentUser.token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error in addToCart:", error);
      throw error;
    }
  },

  async getCart() {
    try {
      const currentUser = authService.getCurrentUser();
      if (!currentUser) {
        throw new Error("Vui lòng đăng nhập để xem giỏ hàng");
      }

      const response = await axios.get(
        `${API_URL}/customer/${currentUser.id}`,
        {
          headers: {
            Authorization: `Bearer ${currentUser.token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error in getCart:", error);
      throw error;
    }
  },

  async updateCartItem(cartId, productId, variantId, quantity) {
    try {
      const currentUser = authService.getCurrentUser();
      if (!currentUser) {
        throw new Error("Vui lòng đăng nhập để cập nhật giỏ hàng");
      }

      console.log("Updating cart item:", {
        cartId,
        productId,
        variantId,
        quantity,
      });

      const response = await axios.put(
        `${API_URL}/${cartId}/update`,
        {
          productId,
          variantId,
          quantity,
        },
        {
          headers: {
            Authorization: `Bearer ${currentUser.token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error in updateCartItem:", error);
      throw error;
    }
  },

  async removeFromCart(cartId, productId, variantId) {
    try {
      const currentUser = authService.getCurrentUser();
      if (!currentUser) {
        throw new Error("Vui lòng đăng nhập để xóa sản phẩm khỏi giỏ hàng");
      }

      const response = await axios.delete(
        `${API_URL}/${cartId}/items/${productId}/${variantId}`,
        {
          headers: {
            Authorization: `Bearer ${currentUser.token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error in removeFromCart:", error);
      throw error;
    }
  },

  // Alias for removeFromCart to maintain compatibility
  async removeCartItem(cartId, productId, variantId) {
    return this.removeFromCart(cartId, productId, variantId);
  },

  // Clean cart - remove deleted/unpublished items
  async cleanCart() {
    try {
      const currentUser = authService.getCurrentUser();
      if (!currentUser) {
        throw new Error("Vui lòng đăng nhập để thực hiện thao tác này");
      }

      const response = await axios.post(
        `${API_URL}/customer/${currentUser.id}/clean`,
        {},
        {
          headers: {
            Authorization: `Bearer ${currentUser.token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error cleaning cart:", error);
      throw error;
    }
  },
};
