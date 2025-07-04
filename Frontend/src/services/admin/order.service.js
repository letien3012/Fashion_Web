import axios from "axios";

const API_URL = import.meta.env.VITE_API_BASE_URL + "/api";

class OrderService {
  // Lấy tất cả đơn hàng
  async getAllOrders() {
    try {
      const response = await axios.get(`${API_URL}/orders`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }

  // Lấy đơn hàng theo ID
  async getOrderById(id) {
    try {
      const response = await axios.get(`${API_URL}/orders/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }

  // Lấy đơn hàng của khách hàng
  async getOrdersByCustomer(customerId) {
    try {
      const response = await axios.get(`${API_URL}/orders/customer`, {
        params: { customerId },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }

  // Cập nhật trạng thái đơn hàng
  async updateOrderStatus(orderId, status, employeeId, note) {
    try {
      const response = await axios.put(`${API_URL}/orders/${orderId}/status`, {
        status,
        employeeId,
        note,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }

  // Xóa đơn hàng
  async deleteOrder(orderId) {
    try {
      const response = await axios.delete(`${API_URL}/orders/${orderId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }

  async processReturnRequest(orderId, status, employeeId) {
    try {
      const token = localStorage.getItem("token-admin");
      if (!token) {
        throw new Error("Vui lòng đăng nhập để xử lý yêu cầu trả hàng");
      }

      const response = await axios.put(
        `${API_URL}/orders/${orderId}/return`,
        { status, employeeId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error("Error processing return request:", error);
      throw error;
    }
  }
}

export default new OrderService();
