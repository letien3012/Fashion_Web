import axios from "axios";

const BASE_URL = "http://localhost:3005";
const SUPPLIER_URL = `${BASE_URL}/api/suppliers`;

const getAuthHeader = () => {
  const token = localStorage.getItem("token-admin");
  return { Authorization: `Bearer ${token}` };
};

export const AdminSupplierService = {
  async getAllSuppliers() {
    try {
      const response = await axios.get(SUPPLIER_URL, {
        headers: getAuthHeader(),
      });
      return response.data.data || response.data;
    } catch (error) {
      throw error;
    }
  },

  async createSupplier(supplierData) {
    try {
      const response = await axios.post(SUPPLIER_URL, supplierData, {
        headers: getAuthHeader(),
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async updateSupplier(id, supplierData) {
    try {
      const response = await axios.put(`${SUPPLIER_URL}/${id}`, supplierData, {
        headers: getAuthHeader(),
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async deleteSupplier(id) {
    try {
      const response = await axios.delete(`${SUPPLIER_URL}/${id}`, {
        headers: getAuthHeader(),
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};
