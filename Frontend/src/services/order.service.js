import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const orderService = {
  async getCustomerOrders() {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        return [];
      }

      const response = await axios.get(`${BASE_URL}/api/orders/customer`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        return [];
      }
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

      const response = await axios.get(`${BASE_URL}/api/orders/${orderId}`, {
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

      const response = await axios.post(`${BASE_URL}/api/orders`, orderData, {
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
        `${BASE_URL}/api/orders/${orderId}/cancel`,
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
        `${BASE_URL}/api/orders/${orderId}/return`,
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

  async updateOrderOnlineDetail(orderCode, detail) {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Vui lòng đăng nhập");
      const response = await axios.put(
        `${BASE_URL}/api/orders/${orderCode}/online-detail`,
        { online_method_detail: detail },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async updateOrderStatusByCode(orderCode, status) {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Vui lòng đăng nhập");
      const response = await axios.put(
        `${BASE_URL}/api/orders/${orderCode}/status-by-code`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};
