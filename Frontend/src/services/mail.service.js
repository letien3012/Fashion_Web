import axios from "axios";

const API_URL = "http://localhost:3005/api/mail";

export const mailService = {
  // Gửi mã xác thực
  async sendVerificationCode(email) {
    try {
      const response = await axios.post(`${API_URL}/send-code`, { email });
      return response.data;
    } catch (error) {
      console.error("Error sending verification code:", error);
      throw error;
    }
  },

  // Gửi email reset password
  async sendResetPasswordMail(email) {
    try {
      const response = await axios.post(`${API_URL}/send-reset-password`, {
        email,
      });
      return response.data;
    } catch (error) {
      console.error("Error sending reset password mail:", error);
      throw error;
    }
  },

  // Gửi email xác nhận đơn hàng
  async sendOrderConfirmation(orderCode) {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${API_URL}/send-order-confirmation`,
        { orderCode },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error sending order confirmation:", error);
      throw error;
    }
  },
};
