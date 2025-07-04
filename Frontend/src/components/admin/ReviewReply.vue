<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <div class="modal-header">
        <h3>Phản hồi đánh giá</h3>
        <button class="close-btn" @click="$emit('close')">&times;</button>
      </div>

      <div class="modal-body">
        <div class="review-details">
          <div class="customer-info">
            <strong>Khách hàng:</strong>
            {{ review.customerId?.fullname || "Khách hàng" }}
            <span class="customer-email">{{
              review.customerId?.email || ""
            }}</span>
          </div>
          <div class="product-info">
            <strong>Sản phẩm:</strong> {{ review.productId?.name }}
          </div>
          <div class="rating">
            <strong>Đánh giá:</strong>
            <span
              v-for="n in 5"
              :key="n"
              :class="{ 'star-filled': n <= review.star }"
              >★</span
            >
          </div>
          <div class="content">
            <strong>Nội dung:</strong>
            <p>{{ review.content }}</p>
          </div>

          <div
            class="review-images"
            v-if="review.images && review.images.length > 0"
          >
            <strong>Hình ảnh:</strong>
            <div class="image-grid">
              <div
                v-for="(image, index) in review.images"
                :key="index"
                class="image-item"
              >
                <img
                  :src="`${import.meta.env.VITE_API_URL}/${image}`"
                  :alt="'Review image ' + (index + 1)"
                  @click="openImage(`${import.meta.env.VITE_API_URL}/${image}`)"
                />
              </div>
            </div>
          </div>
        </div>

        <div class="reply-form">
          <div class="form-group">
            <label for="reply">Phản hồi của bạn</label>
            <textarea
              id="reply"
              v-model="replyContent"
              rows="4"
              placeholder="Cảm ơn anh/chị rất nhiều vì đã tin tưởng và lựa chọn sản phẩm của chúng tôi!
Chúng tôi rất vui khi biết rằng anh/chị hài lòng với chất lượng sản phẩm và dịch vụ. Sự hài lòng của khách hàng luôn là động lực để chúng tôi cố gắng hoàn thiện hơn mỗi ngày.
Rất mong sẽ tiếp tục được phục vụ anh/chị trong những lần mua sắm tiếp theo!
Chúc anh/chị một ngày vui vẻ và nhiều sức khỏe ❤️"
              :disabled="loading"
            ></textarea>
          </div>

          <div class="template-reply">
            <button
              class="template-btn"
              @click="useTemplateReply"
              :disabled="loading"
            >
              Sử dụng mẫu phản hồi
            </button>
          </div>

          <div class="form-actions">
            <button
              class="cancel-btn"
              @click="$emit('close')"
              :disabled="loading"
            >
              Hủy
            </button>
            <button
              class="submit-btn"
              @click="submitReply"
              :disabled="!replyContent.trim() || loading"
            >
              {{ loading ? "Đang gửi..." : "Gửi phản hồi" }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Image Preview Modal -->
  <div
    v-if="showImagePreview"
    class="image-preview-overlay"
    @click="closeImagePreview"
  >
    <div class="image-preview-content" @click.stop>
      <button class="close-preview-btn" @click="closeImagePreview">
        &times;
      </button>
      <img :src="currentImage" alt="Review image preview" />
    </div>
  </div>
</template>

<script>
import { ref } from "vue";
import { toast } from "vue3-toastify";
import AdminReviewService from "../../services/admin/review.service";

export default {
  name: "ReviewReply",
  props: {
    review: {
      type: Object,
      required: true,
    },
  },
  emits: ["close", "reply-added"],
  setup(props, { emit }) {
    const replyContent = ref("");
    const loading = ref(false);
    const showImagePreview = ref(false);
    const currentImage = ref("");

    const openImage = (image) => {
      currentImage.value = image;
      showImagePreview.value = true;
    };

    const closeImagePreview = () => {
      showImagePreview.value = false;
      currentImage.value = "";
    };

    const templateReply = `Cảm ơn anh/chị rất nhiều vì đã tin tưởng và lựa chọn sản phẩm của chúng tôi!
Chúng tôi rất vui khi biết rằng anh/chị hài lòng với chất lượng sản phẩm và dịch vụ. Sự hài lòng của khách hàng luôn là động lực để chúng tôi cố gắng hoàn thiện hơn mỗi ngày.
Rất mong sẽ tiếp tục được phục vụ anh/chị trong những lần mua sắm tiếp theo!
Chúc anh/chị một ngày vui vẻ và nhiều sức khỏe ❤️`;

    const useTemplateReply = () => {
      replyContent.value = templateReply;
    };

    const submitReply = async () => {
      if (!replyContent.value.trim()) {
        toast.error("Vui lòng nhập nội dung phản hồi");
        return;
      }

      try {
        loading.value = true;
        const employeeData = JSON.parse(localStorage.getItem("employee"));
        if (!employeeData || !employeeData._id) {
          throw new Error("Không tìm thấy thông tin nhân viên");
        }

        const replyData = {
          employeeId: employeeData._id,
          content: replyContent.value.trim(),
          createdAt: new Date(),
        };

        await AdminReviewService.addReply(props.review._id, replyData);
        toast.success("Gửi phản hồi thành công");
        emit("reply-added");
      } catch (error) {
        toast.error(error.message || "Lỗi khi gửi phản hồi");
      } finally {
        loading.value = false;
      }
    };

    return {
      replyContent,
      loading,
      submitReply,
      useTemplateReply,
      openImage,
      showImagePreview,
      currentImage,
      closeImagePreview,
    };
  },
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(8px);
}

.modal-content {
  background: white;
  border-radius: 16px;
  width: 90%;
  max-width: 650px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  animation: modalFadeIn 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes modalFadeIn {
  from {
    opacity: 0;
    transform: translateY(-30px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.modal-header {
  padding: 24px 28px;
  border-bottom: 1px solid #eef2f7;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fafbfc;
  border-radius: 16px 16px 0 0;
}

.modal-header h3 {
  margin: 0;
  color: #1a1f36;
  font-size: 1.35rem;
  font-weight: 700;
  letter-spacing: -0.01em;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #64748b;
  transition: all 0.2s ease;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
}

.close-btn:hover {
  color: #1a1f36;
  background: #f1f5f9;
  transform: rotate(90deg);
}

.modal-body {
  padding: 28px;
}

.review-details {
  margin-bottom: 28px;
  padding: 28px;
  background: #f8fafc;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.02);
}

.review-details > div {
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid #e2e8f0;
}

.review-details > div:last-child {
  margin-bottom: 0;
  padding-bottom: 0;
  border-bottom: none;
}

.customer-info {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.customer-info strong {
  color: #1a1f36;
  font-size: 1.15rem;
  font-weight: 600;
  min-width: 120px;
}

.customer-email {
  font-size: 0.9rem;
  color: #64748b;
  padding: 6px 12px;
  background: #f1f5f9;
  border-radius: 6px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s ease;
}

.customer-email::before {
  content: "✉";
  font-size: 1rem;
}

.customer-email:hover {
  background: #e2e8f0;
  transform: translateY(-1px);
  color: #3b82f6;
}

.product-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.product-info strong {
  color: #1a1f36;
  font-weight: 600;
  min-width: 100px;
}

.rating {
  display: flex;
  align-items: center;
  gap: 14px;
}

.rating strong {
  color: #1a1f36;
  font-weight: 600;
  min-width: 100px;
}

.star-filled {
  color: #fbbf24;
  font-size: 1.5rem;
  text-shadow: 0 2px 4px rgba(251, 191, 36, 0.2);
  transition: transform 0.2s ease;
}

.star-filled:hover {
  transform: scale(1.2);
}

.content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.content strong {
  color: #1a1f36;
  font-weight: 600;
  font-size: 1.1rem;
}

.content p {
  margin: 0;
  padding: 12px 16px;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  color: #475569;
  line-height: 1.6;
  font-size: 1rem;
}

.review-images {
  margin-top: 16px;
}

.review-images strong {
  display: block;
  margin-bottom: 12px;
  color: #1a1f36;
  font-weight: 600;
  font-size: 1.1rem;
}

.image-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 12px;
  margin-top: 8px;
}

.image-item {
  aspect-ratio: 1;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #e2e8f0;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.image-item:hover {
  transform: scale(1.02);
}

.image-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.reply-form {
  margin-top: 28px;
}

.form-group {
  margin-bottom: 24px;
}

.form-group label {
  display: block;
  margin-bottom: 12px;
  color: #1a1f36;
  font-weight: 600;
  font-size: 1.05rem;
}

.form-group textarea {
  width: 100%;
  padding: 16px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  resize: vertical;
  font-size: 1rem;
  line-height: 1.6;
  transition: all 0.3s ease;
  background: #f8fafc;
}

.form-group textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
  background: white;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 16px;
  margin-top: 28px;
}

.cancel-btn,
.submit-btn {
  padding: 12px 24px;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  font-size: 1rem;
}

.cancel-btn {
  background: #f1f5f9;
  border: 2px solid #e2e8f0;
  color: #475569;
}

.submit-btn {
  background: #3b82f6;
  border: none;
  color: white;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
}

.cancel-btn:hover {
  background: #e2e8f0;
  color: #1a1f36;
  transform: translateY(-2px);
}

.submit-btn:hover {
  background: #2563eb;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(59, 130, 246, 0.3);
}

.cancel-btn:disabled,
.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.template-reply {
  margin: 20px 0;
  text-align: center;
}

.template-btn {
  background: #f1f5f9;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  padding: 12px 24px;
  cursor: pointer;
  transition: all 0.3s ease;
  color: #475569;
  font-weight: 600;
  font-size: 1rem;
}

.template-btn:hover {
  background: #e2e8f0;
  border-color: #3b82f6;
  color: #3b82f6;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.1);
}

.template-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.image-preview-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1100;
}

.image-preview-content {
  position: relative;
  max-width: 90%;
  max-height: 90vh;
}

.image-preview-content img {
  max-width: 100%;
  max-height: 90vh;
  object-fit: contain;
  border-radius: 8px;
}

.close-preview-btn {
  position: absolute;
  top: -40px;
  right: 0;
  background: none;
  border: none;
  color: white;
  font-size: 32px;
  cursor: pointer;
  padding: 8px;
  transition: transform 0.2s ease;
}

.close-preview-btn:hover {
  transform: rotate(90deg);
}
</style>
