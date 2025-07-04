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

const AdminAttributeService = {
  backendUrl,

  async getAll() {
    return axios.get(`${backendUrl}/api/attributes`, getAuthHeaders());
  },

  async add(data) {
    return axios.post(
      `${backendUrl}/api/attributes/add`,
      data,
      getAuthHeaders()
    );
  },

  async update(id, data) {
    return axios.put(
      `${backendUrl}/api/attributes/update/${id}`,
      data,
      getAuthHeaders()
    );
  },

  async delete(id) {
    return axios.delete(
      `${backendUrl}/api/attributes/delete/${id}`,
      getAuthHeaders()
    );
  },
};

export default AdminAttributeService;
