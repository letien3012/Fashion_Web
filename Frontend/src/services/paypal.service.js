// PayPal service cho frontend
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_URL = `${BASE_URL}/api/paypal`;

export const paypalService = {
  async createOrder(orderData) {
    // Gửi thông tin đơn hàng lên backend, nhận về approveUrl PayPal
    const res = await axios.post(`${API_URL}/create-paypal`, orderData);
    return res.data;
  },
  async captureOrder(orderId) {
    // Gửi orderId lên backend để xác thực/capture
    const res = await axios.post(`${API_URL}/capture-order`, { orderId });
    return res.data;
  },
};
