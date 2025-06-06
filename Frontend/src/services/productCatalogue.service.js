import axios from "axios";

const API_URL = "http://localhost:3005/api/productCatalogues";

export const productCatalogueService = {
  getAll: async () => {
    try {
      const response = await axios.get(API_URL);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getTree: async () => {
    try {
      const response = await axios.get(`${API_URL}/tree`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getById: async (id) => {
    try {
      const response = await axios.get(`${API_URL}/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getChildren: async (id) => {
    try {
      const response = await axios.get(`${API_URL}/${id}/children`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};
