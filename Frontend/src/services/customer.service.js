import axios from "axios";

const API_URL = "http://localhost:3005/api";

export const customerService = {
  async updateProfile(profileData) {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Vui lòng đăng nhập để cập nhật thông tin");
      }

      const response = await axios.put(
        `${API_URL}/customers/profile`,
        profileData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error updating profile:", error);
      throw error;
    }
  },
};
