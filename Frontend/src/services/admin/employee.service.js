import axios from "axios";

const backendUrl = import.meta.env.VITE_API_BASE_URL;
const getAuthHeaders = () => {
  const token = localStorage.getItem("token-admin");
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

const AdminEmployeeService = {
  backendUrl,

  async getAll() {
    return axios.get(`${backendUrl}/api/employees`, getAuthHeaders());
  },

  async add(data) {
    return axios.post(
      `${backendUrl}/api/employees/add`,
      data,
      getAuthHeaders()
    );
  },

  async update(id, data) {
    return axios.put(
      `${backendUrl}/api/employees/update/${id}`,
      data,
      getAuthHeaders()
    );
  },

  async delete(id) {
    return axios.delete(
      `${backendUrl}/api/employees/delete/${id}`,
      getAuthHeaders()
    );
  },

  async search(query) {
    return axios.get(`${backendUrl}/api/employees/search`, {
      params: { query },
      ...getAuthHeaders(),
    });
  },

  async getStats() {
    return axios.get(`${backendUrl}/api/employees/stats`, getAuthHeaders());
  },
};

export default AdminEmployeeService;
