import axios from "axios";

const backendUrl = "http://localhost:3005/api";
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

class AdminReviewService {
  // Lấy danh sách đánh giá
  async getAllReviews() {
    try {
      const response = await axios.get(
        `${backendUrl}/reviews`,
        getAuthHeaders()
      );
      return response.data.data.reviews;
    } catch (error) {
      throw error.response?.data?.message || "Lỗi khi lấy danh sách đánh giá";
    }
  }

  // Xóa đánh giá
  async deleteReview(id) {
    try {
      const response = await axios.delete(
        `${backendUrl}/reviews/delete/${id}`,
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Lỗi khi xóa đánh giá";
    }
  }

  // Thêm phản hồi cho đánh giá
  async addReply(reviewId, replyData) {
    try {
      const response = await axios.post(
        `${backendUrl}/reviews/${reviewId}/reply`,
        replyData,
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Lỗi khi thêm phản hồi";
    }
  }
}

export default new AdminReviewService();
