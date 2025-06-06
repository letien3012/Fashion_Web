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
        :reviews="paginatedReviews"
        :loading="loading"
        @refresh="fetchReviews"
        @delete="handleDelete"
        @reply="handleReply"
      />

      <div class="pagination-info">
        <span class="showing-info">
          Hiển thị {{ startIndex + 1 }}-{{ endIndex }} /
          {{ reviews.length }} đánh giá
        </span>
        <div class="pagination">
          <button
            class="page-btn"
            :disabled="currentPage === 1"
            @click="changePage(currentPage - 1)"
          >
            <i class="fas fa-chevron-left"></i>
          </button>

          <template v-for="page in displayedPages" :key="page">
            <button
              v-if="page !== '...'"
              class="page-btn"
              :class="{ active: currentPage === page }"
              @click="changePage(page)"
            >
              {{ page }}
            </button>
            <span v-else class="page-dots">...</span>
          </template>

          <button
            class="page-btn"
            :disabled="currentPage === totalPages"
            @click="changePage(currentPage + 1)"
          >
            <i class="fas fa-chevron-right"></i>
          </button>
        </div>
      </div>
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
import { ref, onMounted, computed } from "vue";
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
    const currentPage = ref(1);
    const itemsPerPage = 10;

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

    const totalPages = computed(() => {
      return Math.ceil(reviews.value.length / itemsPerPage);
    });

    const startIndex = computed(() => {
      return (currentPage.value - 1) * itemsPerPage;
    });

    const endIndex = computed(() => {
      return Math.min(startIndex.value + itemsPerPage, reviews.value.length);
    });

    const paginatedReviews = computed(() => {
      const start = startIndex.value;
      const end = endIndex.value;
      return reviews.value.slice(start, end);
    });

    const displayedPages = computed(() => {
      const pages = [];
      const maxVisiblePages = 5;

      if (totalPages.value <= maxVisiblePages) {
        for (let i = 1; i <= totalPages.value; i++) {
          pages.push(i);
        }
      } else {
        if (currentPage.value <= 3) {
          for (let i = 1; i <= 4; i++) {
            pages.push(i);
          }
          pages.push("...");
          pages.push(totalPages.value);
        } else if (currentPage.value >= totalPages.value - 2) {
          pages.push(1);
          pages.push("...");
          for (let i = totalPages.value - 3; i <= totalPages.value; i++) {
            pages.push(i);
          }
        } else {
          pages.push(1);
          pages.push("...");
          for (let i = currentPage.value - 1; i <= currentPage.value + 1; i++) {
            pages.push(i);
          }
          pages.push("...");
          pages.push(totalPages.value);
        }
      }

      return pages;
    });

    const changePage = (page) => {
      if (page >= 1 && page <= totalPages.value) {
        currentPage.value = page;
      }
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
      currentPage,
      totalPages,
      startIndex,
      endIndex,
      paginatedReviews,
      displayedPages,
      fetchReviews,
      handleDelete,
      handleReply,
      closeReplyModal,
      handleReplyAdded,
      changePage,
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

.pagination-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  border-top: 1px solid #f0f0f0;
}

.showing-info {
  color: #666;
  font-size: 14px;
}

.pagination {
  display: flex;
  gap: 8px;
  align-items: center;
}

.page-btn {
  min-width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  background-color: white;
  color: #666;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.page-btn:hover:not(:disabled) {
  border-color: #40a9ff;
  color: #1890ff;
}

.page-btn.active {
  background-color: #1890ff;
  border-color: #1890ff;
  color: white;
}

.page-btn:disabled {
  background-color: #f5f5f5;
  border-color: #d9d9d9;
  color: #d9d9d9;
  cursor: not-allowed;
}

.page-dots {
  color: #666;
  font-size: 14px;
}

@media (max-width: 768px) {
  .pagination-info {
    flex-direction: column;
    gap: 16px;
  }
}
</style>
