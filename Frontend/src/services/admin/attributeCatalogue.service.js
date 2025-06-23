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

const AdminAttributeCatalogueService = {
  backendUrl, // Export thuộc tính này để dùng ở component

  async getAll() {
    try {
      const response = await axios.get(
        `${backendUrl}/api/attributeCatalogues`,
        getAuthHeaders()
      );
      return response;
    } catch (error) {
      console.error("Error fetching attribute catalogues:", error);
      throw new Error(
        error.response?.data?.message ||
          "Không thể tải danh sách danh mục thuộc tính"
      );
    }
  },

  async add(data) {
    try {
      const response = await axios.post(
        `${backendUrl}/api/attributeCatalogues/add`,
        data,
        getAuthHeaders()
      );
      return response;
    } catch (error) {
      console.error("Error adding attribute catalogue:", error);
      throw new Error(
        error.response?.data?.message || "Không thể thêm danh mục thuộc tính"
      );
    }
  },

  async update(id, data) {
    try {
      const response = await axios.put(
        `${backendUrl}/api/attributeCatalogues/update/${id}`,
        data,
        getAuthHeaders()
      );
      return response;
    } catch (error) {
      console.error("Error updating attribute catalogue:", error);
      throw new Error(
        error.response?.data?.message ||
          "Không thể cập nhật danh mục thuộc tính"
      );
    }
  },

  async delete(id) {
    try {
      const response = await axios.delete(
        `${backendUrl}/api/attributeCatalogues/delete/${id}`,
        getAuthHeaders()
      );
      return response;
    } catch (error) {
      console.error("Error deleting attribute catalogue:", error);
      throw new Error(
        error.response?.data?.message || "Không thể xóa danh mục thuộc tính"
      );
    }
  },
};

export default AdminAttributeCatalogueService;
