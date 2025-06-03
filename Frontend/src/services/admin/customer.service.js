import axios from "axios";

const backendUrl = "http://localhost:3000";
const getAuthHeaders = () => {
  const token = localStorage.getItem("token-admin");
  return {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };
};

const AdminCustomerService = {
  backendUrl,

  async getAll() {
    return axios.get(`${backendUrl}/api/customers`, getAuthHeaders());
  },

  async updateStatus(id, status) {
    return axios.put(
      `${backendUrl}/api/customers/update-status/${id}`,
      { status },
      getAuthHeaders()
    );
  },

  async delete(id) {
    return axios.delete(`${backendUrl}/api/customers/${id}`, getAuthHeaders());
  },
};

export default AdminCustomerService;
