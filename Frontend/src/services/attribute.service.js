import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_BASE_URL}/api/attributes`;

export const attributeService = {
  getAll: async () => {
    try {
      const response = await axios.get(API_URL);
      return response.data.data || [];
    } catch (error) {
      console.error("Error fetching attributes:", error);
      return [];
    }
  },

  getByCatalogueId: async (catalogueId) => {
    try {
      const response = await axios.get(`${API_URL}/catalogue/${catalogueId}`);
      return response.data.data || [];
    } catch (error) {
      console.error(
        `Error fetching attributes for catalogue ${catalogueId}:`,
        error
      );
      return [];
    }
  },

  getById: async (id) => {
    try {
      const response = await axios.get(`${API_URL}/${id}`);
      return response.data.data || null;
    } catch (error) {
      console.error(`Error fetching attribute ${id}:`, error);
      return null;
    }
  },

  add: async (data) => {
    try {
      const response = await axios.post(`${API_URL}/add`, data);
      return response.data.data || null;
    } catch (error) {
      console.error("Error adding attribute:", error);
      throw error;
    }
  },

  update: async (id, data) => {
    try {
      const response = await axios.put(`${API_URL}/update/${id}`, data);
      return response.data.data || null;
    } catch (error) {
      console.error(`Error updating attribute ${id}:`, error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      const response = await axios.delete(`${API_URL}/delete/${id}`);
      return response.data.data || null;
    } catch (error) {
      console.error(`Error deleting attribute ${id}:`, error);
      throw error;
    }
  },
};
