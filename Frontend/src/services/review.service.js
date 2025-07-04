import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

const reviewService = {
  backendUrl: BASE_URL,

  // Add a new review
  async addReview(formData) {
    try {
      const response = await axios.post(`${BASE_URL}/api/reviews/add`, formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error adding review:", error);
      throw error;
    }
  },

  // Get all reviews
  async getAllReviews() {
    try {
      const response = await axios.get(
        `${BASE_URL}/api/reviews`,
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching reviews:", error);
      throw error;
    }
  },

  // Get review by ID
  async getReviewById(id) {
    try {
      const response = await axios.get(
        `${BASE_URL}/api/reviews/${id}`,
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching review:", error);
      throw error;
    }
  },

  // Get reviews by product ID
  async getReviewsByProduct(productId, page = 1, limit = 1000) {
    try {
      const response = await axios.get(
        `${BASE_URL}/api/reviews/product/${productId}?page=${page}&limit=${limit}`,
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching product reviews:", error);
      throw error;
    }
  },

  // Get reviews by customer ID
  async getReviewsByCustomer(customerId) {
    try {
      const response = await axios.get(
        `${BASE_URL}/api/reviews/customer/${customerId}`,
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching customer reviews:", error);
      throw error;
    }
  },

  // Update a review
  async updateReview(id, data) {
    try {
      const response = await axios.put(
        `${BASE_URL}/api/reviews/update/${id}`,
        data,
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      console.error("Error updating review:", error);
      throw error;
    }
  },

  // Delete a review
  async deleteReview(id) {
    try {
      const response = await axios.delete(
        `${BASE_URL}/api/reviews/delete/${id}`,
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      console.error("Error deleting review:", error);
      throw error;
    }
  },

  // Add a reply to a review
  async addReply(reviewId, replyData) {
    try {
      const response = await axios.post(
        `${BASE_URL}/api/reviews/${reviewId}/reply`,
        replyData,
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      console.error("Error adding reply:", error);
      throw error;
    }
  },
};

export { reviewService };
