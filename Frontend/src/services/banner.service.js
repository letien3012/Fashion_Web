import axios from "axios";
const backendUrl = "http://localhost:3005";
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };
};

export const bannerService = {
  getByType: async (type) => {
    try {
      const response = await axios.get(
        `${backendUrl}/api/banners/type/${type}`
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};
