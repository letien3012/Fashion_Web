import axios from "axios";

const API_URL = "http://localhost:3005/api";

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
  async updateOrderStatus(orderId, status, employeeId) {
    try {
      const response = await axios.put(`${API_URL}/orders/${orderId}/status`, {
        status,
        employeeId,
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
}

export default new OrderService();
