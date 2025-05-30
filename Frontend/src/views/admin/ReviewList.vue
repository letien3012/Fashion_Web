<template>
  <div class="review-list">
    <div class="page-header">
      <h1>Quản lý đánh giá</h1>
    </div>

    <div class="table-container">
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>Đang tải dữ liệu...</p>
      </div>
      <div v-else-if="error" class="error-state">
        <i class="fas fa-exclamation-circle"></i>
        <p>{{ error }}</p>
        <button class="btn btn-primary" @click="fetchReviews">Thử lại</button>
      </div>
      <ReviewTable
        v-else
        :reviews="reviews"
        :loading="loading"
        @refresh="fetchReviews"
        @delete="handleDelete"
        @reply="handleReply"
      />
    </div>

    <!-- Reply Modal -->
    <ReviewReply
      v-if="showReplyModal"
      :review="selectedReview"
      @close="closeReplyModal"
      @reply-added="handleReplyAdded"
    />
  </div>
</template>

<script>
import ReviewTable from "../../components/admin/ReviewTable.vue";
import ReviewReply from "../../components/admin/ReviewReply.vue";
import { ref, onMounted } from "vue";
import { toast } from "vue3-toastify";
import AdminReviewService from "../../services/admin/review.service";

export default {
  name: "ReviewList",
  components: {
    ReviewTable,
    ReviewReply,
  },
  setup() {
    const reviews = ref([]);
    const loading = ref(false);
    const error = ref(null);
    const showReplyModal = ref(false);
    const selectedReview = ref(null);

    const fetchReviews = async () => {
      try {
        loading.value = true;
        error.value = null;
        reviews.value = await AdminReviewService.getAllReviews();
      } catch (error) {
        error.value = error.message || "Lỗi khi lấy danh sách đánh giá";
        toast.error(error.value);
      } finally {
        loading.value = false;
      }
    };

    const handleDelete = async (reviewId) => {
      try {
        await AdminReviewService.deleteReview(reviewId);
        toast.success("Xóa đánh giá thành công");
        await fetchReviews();
      } catch (error) {
        toast.error(error.message || "Lỗi khi xóa đánh giá");
      }
    };

    const handleReply = (review) => {
      selectedReview.value = review;
      showReplyModal.value = true;
    };

    const closeReplyModal = () => {
      showReplyModal.value = false;
      selectedReview.value = null;
    };

    const handleReplyAdded = () => {
      closeReplyModal();
      fetchReviews();
    };

    onMounted(() => {
      fetchReviews();
    });

    return {
      reviews,
      loading,
      error,
      showReplyModal,
      selectedReview,
      fetchReviews,
      handleDelete,
      handleReply,
      closeReplyModal,
      handleReplyAdded,
    };
  },
};
</script>

<style scoped>
.review-list {
  padding: 24px;
}

.page-header {
  margin-bottom: 24px;
}

.page-header h1 {
  font-size: 24px;
  font-weight: 600;
  color: #262626;
  margin: 0;
}

.table-container {
  background: white;
  border-radius: 4px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.loading-state,
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px;
  color: #8c8c8c;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #1890ff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.error-state i {
  font-size: 24px;
  color: #ff4d4f;
  margin-bottom: 8px;
}

.btn {
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
  border: none;
}

.btn-primary {
  background: #1890ff;
  color: white;
}

.btn-primary:hover {
  background: #40a9ff;
}
</style>
