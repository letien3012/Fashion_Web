import axios from "axios";

const backendUrl = "http://localhost:3005";
const getAuthHeaders = () => {
  const token = localStorage.getItem("token-admin");
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

const AdminProductService = {
  backendUrl,

  async getAll() {
    return axios.get(`${backendUrl}/api/products`, getAuthHeaders());
  },

  async add(data) {
    return axios.post(`${backendUrl}/api/products/add`, data, getAuthHeaders());
  },

  async update(id, data) {
    return axios.put(
      `${backendUrl}/api/products/update/${id}`,
      data,
      getAuthHeaders()
    );
  },

  async delete(id) {
    return axios.delete(
      `${backendUrl}/api/products/delete/${id}`,
      getAuthHeaders()
    );
  },
};

export default AdminProductService;
