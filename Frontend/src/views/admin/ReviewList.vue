<template>
  <div class="list-container">
    <div class="header">
      <h2>Quản lý đánh giá</h2>
    </div>
    <div class="content">
      <ReviewTable
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
    const showReplyModal = ref(false);
    const selectedReview = ref(null);

    const fetchReviews = async () => {
      try {
        loading.value = true;
        reviews.value = await AdminReviewService.getAllReviews();
      } catch (error) {
        toast.error(error.message || "Lỗi khi lấy danh sách đánh giá");
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
@import "../../assets/styles/admin/list.css";
</style>
