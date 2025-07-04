import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_URL = `${BASE_URL}/api/payos`;

export const payosService = {
  async createPayment(orderData) {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${API_URL}/create-payment`,
        orderData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error creating PayOS payment:", error);
      throw error;
    }
  },

  async verifyPayment(paymentId) {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${API_URL}/verify-payment`,
        { paymentId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error verifying PayOS payment:", error);
      throw error;
    }
  },
};
