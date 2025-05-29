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
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 8px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  padding: 16px 24px;
  border-bottom: 1px solid #e8e8e8;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  margin: 0;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #999;
}

.modal-body {
  padding: 24px;
}

.review-details {
  margin-bottom: 24px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 4px;
}

.review-details > div {
  margin-bottom: 8px;
}

.review-details > div:last-child {
  margin-bottom: 0;
}

.rating {
  display: flex;
  align-items: center;
  gap: 8px;
}

.star-filled {
  color: #ffd700;
}

.reply-form {
  margin-top: 24px;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #333;
}

.form-group textarea {
  width: 100%;
  padding: 8px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  resize: vertical;
}

.form-group textarea:focus {
  outline: none;
  border-color: #40a9ff;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.cancel-btn,
.submit-btn {
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s;
}

.cancel-btn {
  background: #f5f5f5;
  border: 1px solid #d9d9d9;
  color: #666;
}

.submit-btn {
  background: #1890ff;
  border: none;
  color: white;
}

.cancel-btn:hover {
  background: #e8e8e8;
}

.submit-btn:hover {
  background: #40a9ff;
}

.cancel-btn:disabled,
.submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.customer-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 12px;
}

.customer-email {
  font-size: 0.875rem;
  color: #666;
  margin-left: 24px;
}

.template-reply {
  margin: 12px 0;
  text-align: center;
}

.template-btn {
  background: #f0f0f0;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  padding: 8px 16px;
  cursor: pointer;
  transition: all 0.3s;
  color: #666;
}

.template-btn:hover {
  background: #e8e8e8;
  border-color: #40a9ff;
  color: #40a9ff;
}

.template-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
