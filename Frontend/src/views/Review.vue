<template>
  <div v-if="show" class="modal-overlay">
    <div class="modal-content">
      <div class="modal-header">
        <h3>Đánh giá đơn hàng #{{ order?.code }}</h3>
        <button class="close-btn" @click="closeModal">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <div class="modal-body">
        <div class="order-items">
          <div class="order-item">
            <img
              :src="
                product.productId.image.startsWith('http')
                  ? product.productId.image
                  : `http://localhost:3005/${product.productId.image}`
              "
              class="item-image"
            />
            <div class="item-info">
              <div class="item-title">{{ product.productId.name }}</div>
              <div class="variants-list">
                <div
                  v-for="variant in product.variants"
                  :key="variant.sku"
                  class="variant-item"
                >
                  <span class="variant-sku">Phân loại: {{ variant.sku }}</span>
                  <span class="variant-quantity"
                    >Số lượng: {{ variant.quantity }}</span
                  >
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="rating-section">
          <h4>Đánh giá sản phẩm</h4>
          <div class="star-rating">
            <i
              v-for="star in 5"
              :key="star"
              :class="['fas', 'fa-star', { active: star <= rating }]"
              @click="rating = star"
            ></i>
          </div>
        </div>

        <div class="content-section">
          <h4>Nội dung đánh giá</h4>
          <textarea
            v-model="content"
            placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm..."
            rows="4"
          ></textarea>
        </div>

        <div class="image-section">
          <h4>Hình ảnh (tùy chọn)</h4>
          <div class="image-upload">
            <input
              type="file"
              ref="fileInput"
              @change="handleImageUpload"
              accept="image/*"
              multiple
              style="display: none"
            />
            <div class="upload-area" @click="$refs.fileInput.click()">
              <i class="fas fa-camera"></i>
              <p>Thêm hình ảnh</p>
              <span class="upload-hint"
                >Tối đa 5 ảnh, mỗi ảnh không quá 5MB</span
              >
            </div>
            <div class="image-preview-container">
              <div
                v-for="(preview, index) in imagePreviews"
                :key="index"
                class="image-preview"
              >
                <img :src="preview" alt="Preview" />
                <button class="remove-image" @click="removeImage(index)">
                  <i class="fas fa-times"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button class="cancel-btn" @click="closeModal">Hủy</button>
        <button
          class="submit-btn"
          :disabled="!isValid || submitting"
          @click="submitReview"
        >
          {{ submitting ? "Đang gửi..." : "Gửi đánh giá" }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { toast } from "vue3-toastify";
import { reviewService } from "../services/review.service";

const props = defineProps({
  show: {
    type: Boolean,
    required: true,
  },
  order: {
    type: Object,
    required: true,
  },
  product: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(["close", "review-submitted"]);

const rating = ref(0);
const content = ref("");
const images = ref([]);
const imagePreviews = ref([]);
const submitting = ref(false);
const fileInput = ref(null);

const isValid = computed(() => {
  return rating.value > 0 && content.value.trim().length > 0;
});

const closeModal = () => {
  emit("close");
  resetForm();
};

const resetForm = () => {
  rating.value = 0;
  content.value = "";
  images.value = [];
  imagePreviews.value = [];
  if (fileInput.value) {
    fileInput.value.value = "";
  }
};

const handleImageUpload = (event) => {
  const files = Array.from(event.target.files);

  // Check if adding new files would exceed the 5 image limit
  if (images.value.length + files.length > 5) {
    toast.error("Chỉ được tải lên tối đa 5 ảnh");
    return;
  }

  files.forEach((file) => {
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Kích thước ảnh không được vượt quá 5MB");
      return;
    }

    // Check file type
    if (!["image/jpeg", "image/png", "image/jpg"].includes(file.type)) {
      toast.error("Chỉ chấp nhận file ảnh JPEG, PNG hoặc JPG");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64Image = e.target.result;
      images.value.push(base64Image);
      imagePreviews.value.push(base64Image);
    };
    reader.readAsDataURL(file);
  });
};

const removeImage = (index) => {
  images.value.splice(index, 1);
  imagePreviews.value.splice(index, 1);
};

const submitReview = async () => {
  if (!isValid.value) return;

  try {
    submitting.value = true;

    // Validate required fields
    const user = JSON.parse(localStorage.getItem("user"));
    const customerId = user?._id;
    const orderId = props.order._id;
    const productId = props.product.productId._id;

    if (!customerId || !orderId || !productId) {
      toast.error("Thiếu thông tin cần thiết. Vui lòng thử lại sau.");
      return;
    }

    const reviewData = {
      customerId,
      orderId,
      productId,
      star: rating.value,
      content: content.value,
      images: images.value,
    };

    const response = await reviewService.addReview(reviewData);
    if (response.success) {
      toast.success("Đánh giá của bạn đã được gửi thành công!");
      emit("review-submitted");
      closeModal();
    } else {
      toast.error(
        response.message || "Không thể gửi đánh giá. Vui lòng thử lại sau."
      );
    }
  } catch (err) {
    toast.error(
      err.response?.data?.message ||
        "Không thể gửi đánh giá. Vui lòng thử lại sau."
    );
  } finally {
    submitting.value = false;
  }
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 8px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
}

.modal-header {
  padding: 16px 24px;
  border-bottom: 1px solid #eee;
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
  font-size: 20px;
  color: #666;
  cursor: pointer;
  padding: 4px;
}

.modal-body {
  padding: 24px;
}

.modal-footer {
  padding: 16px 24px;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.cancel-btn {
  padding: 8px 16px;
  background: #f5f5f5;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.cancel-btn:hover {
  background: #e8e8e8;
}

.submit-btn {
  padding: 8px 16px;
  background: #ee4d2d;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.submit-btn:hover:not(:disabled) {
  background: #f05d40;
}

.submit-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.order-items {
  margin-bottom: 24px;
}

.order-item {
  display: flex;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #eee;
}

.order-item:last-child {
  border-bottom: none;
}

.item-image {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 4px;
  margin-right: 16px;
}

.item-info {
  flex: 1;
}

.item-title {
  font-weight: 500;
  margin-bottom: 8px;
  color: #333;
}

.variants-list {
  margin-top: 8px;
}

.variant-item {
  display: flex;
  justify-content: space-between;
  padding: 4px 0;
  border-bottom: 1px solid #f0f0f0;
}

.variant-item:last-child {
  border-bottom: none;
}

.variant-sku {
  color: #666;
  font-size: 0.9rem;
}

.variant-quantity {
  color: #666;
  font-size: 0.9rem;
}

.rating-section,
.content-section,
.image-section {
  margin-bottom: 24px;
}

h4 {
  color: #333;
  margin-bottom: 16px;
  font-size: 1rem;
}

.star-rating {
  display: flex;
  gap: 8px;
}

.star-rating i {
  font-size: 24px;
  color: #ddd;
  cursor: pointer;
  transition: color 0.3s ease;
}

.star-rating i.active {
  color: #ffc107;
}

textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  resize: vertical;
  font-family: inherit;
}

.image-upload {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.upload-area {
  width: 200px;
  height: 120px;
  border: 2px dashed #ddd;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background-color: #fafafa;
  padding: 16px;
  text-align: center;
}

.upload-area:hover {
  border-color: #ee4d2d;
  color: #ee4d2d;
  background-color: #fff5f5;
}

.upload-area i {
  font-size: 24px;
  margin-bottom: 8px;
  color: #999;
}

.upload-area p {
  font-size: 14px;
  color: #666;
  margin: 0 0 4px 0;
}

.upload-hint {
  font-size: 12px;
  color: #999;
}

.image-preview-container {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-top: 16px;
}

.image-preview {
  position: relative;
  width: 120px;
  height: 120px;
  border-radius: 4px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.image-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 4px;
  transition: transform 0.3s ease;
}

.image-preview:hover img {
  transform: scale(1.05);
}

.remove-image {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 24px;
  height: 24px;
  background: rgba(255, 77, 79, 0.9);
  color: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  opacity: 0;
}

.image-preview:hover .remove-image {
  opacity: 1;
}

.remove-image:hover {
  background: #ff4d4f;
  transform: scale(1.1);
}
</style>
