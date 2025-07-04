import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_BASE_URL}/api/vnpay`;

export const vnpayService = {
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
      console.error("Error creating VNPAY payment:", error);
      throw error;
    }
  },
};
