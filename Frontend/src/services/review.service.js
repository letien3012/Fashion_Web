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

const reviewService = {
  backendUrl,

  // Add a new review
  async addReview(formData) {
    try {
      const response = await axios.post(`${backendUrl}/reviews/add`, formData, {
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
        `${backendUrl}/reviews`,
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
        `${backendUrl}/reviews/${id}`,
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching review:", error);
      throw error;
    }
  },

  // Get reviews by product ID
  async getReviewsByProduct(productId) {
    try {
      const response = await axios.get(
        `${backendUrl}/reviews/product/${productId}`,
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
        `${backendUrl}/reviews/customer/${customerId}`,
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
        `${backendUrl}/reviews/update/${id}`,
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
        `${backendUrl}/reviews/delete/${id}`,
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
        `${backendUrl}/reviews/${reviewId}/reply`,
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
