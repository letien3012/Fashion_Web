import axios from "axios";
const backendUrl = import.meta.env.VITE_API_BASE_URL;
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
