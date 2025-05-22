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

const productCatalogueService = {
  backendUrl,

  async getAll() {
    return axios.get(`${backendUrl}/api/productCatalogues`, getAuthHeaders());
  },

  async add(data) {
    return axios.post(
      `${backendUrl}/api/productCatalogues/add`,
      data,
      getAuthHeaders()
    );
  },

  async update(id, data) {
    return axios.put(
      `${backendUrl}/api/productCatalogues/update/${id}`,
      data,
      getAuthHeaders()
    );
  },

  async delete(id) {
    return axios.delete(
      `${backendUrl}/api/productCatalogues/delete/${id}`,
      getAuthHeaders()
    );
  },
};

export default productCatalogueService;
