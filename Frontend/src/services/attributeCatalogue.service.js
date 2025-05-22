import axios from "axios";

const backendUrl = "http://localhost:3005";
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

const attributeCatalogueService = {
  backendUrl, // Export thuộc tính này để dùng ở component

  async getAll() {
    return axios.get(`${backendUrl}/api/attributeCatalogues`, getAuthHeaders());
  },

  async add(data) {
    return axios.post(
      `${backendUrl}/api/attributeCatalogues/add`,
      data,
      getAuthHeaders()
    );
  },

  async update(id, data) {
    return axios.put(
      `${backendUrl}/api/attributeCatalogues/update/${id}`,
      data,
      getAuthHeaders()
    );
  },

  async delete(id) {
    return axios.delete(
      `${backendUrl}/api/attributeCatalogues/delete/${id}`,
      getAuthHeaders()
    );
  },
};

export default attributeCatalogueService;
