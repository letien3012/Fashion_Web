import axios from "axios";

const API_URL = "http://localhost:3005/api";

export const orderService = {
  async getCustomerOrders() {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.log("No token found in getCustomerOrders");
        throw new Error("Vui lòng đăng nhập để xem đơn hàng");
      }

      const response = await axios.get(`${API_URL}/orders/customer`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching customer orders:", error);
      throw error;
    }
  },

  async getOrderById(orderId) {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Vui lòng đăng nhập để xem chi tiết đơn hàng");
      }

      const response = await axios.get(`${API_URL}/orders/${orderId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching order details:", error);
      throw error;
    }
  },

  async create(orderData) {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Vui lòng đăng nhập để đặt hàng");
      }

      const response = await axios.post(`${API_URL}/orders`, orderData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error creating order:", error);
      throw error;
    }
  },

  async cancelOrder(orderId, note) {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Vui lòng đăng nhập để hủy đơn hàng");
      }

      const response = await axios.put(
        `${API_URL}/orders/${orderId}/cancel`,
        { note },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error cancelling order:", error);
      throw error;
    }
  },

  async requestReturn(orderId, data) {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Vui lòng đăng nhập để yêu cầu trả hàng");
      }

      const response = await axios.post(
        `${API_URL}/orders/${orderId}/return`,
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error requesting return:", error);
      throw error;
    }
  },
};
