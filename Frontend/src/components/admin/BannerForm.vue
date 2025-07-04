<template>
  <div class="modal fade" :class="{ show: show }" v-if="show">
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">
            {{ isEditing ? "Chỉnh sửa banner" : "Thêm banner mới" }}
          </h5>
          <button
            type="button"
            class="btn-close"
            @click="$emit('close')"
          ></button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="handleSubmit">
            <div class="row">
              <div class="col-md-8">
                <div class="mb-3">
                  <label class="form-label"
                    >Tên banner <span class="text-danger">*</span></label
                  >
                  <input
                    type="text"
                    class="form-control"
                    v-model="formData.name"
                    required
                    placeholder="Nhập tên banner"
                  />
                </div>
                <div class="mb-3">
                  <label class="form-label"
                    >Loại banner <span class="text-danger">*</span></label
                  >
                  <select class="form-select" v-model="formData.type" required>
                    <option value="main">Banner chính</option>
                    <option value="sub">Banner phụ</option>
                    <option value="promotion">Khuyến mãi</option>
                  </select>
                </div>
                <div class="mb-3">
                  <label class="form-label">Nội dung</label>
                  <textarea
                    class="form-control"
                    v-model="formData.content"
                    rows="3"
                    placeholder="Nhập nội dung banner (nếu có)"
                  ></textarea>
                </div>
                <div class="mb-3">
                  <div class="form-check form-switch">
                    <input
                      type="checkbox"
                      class="form-check-input"
                      v-model="formData.publish"
                      id="publishCheck"
                    />
                    <label class="form-check-label" for="publishCheck">
                      Hiển thị banner
                    </label>
                  </div>
                </div>
              </div>
              <div class="col-md-4">
                <div class="mb-3">
                  <label class="form-label"
                    >Hình ảnh <span class="text-danger">*</span></label
                  >
                  <div class="image-upload-container">
                    <input
                      type="file"
                      class="form-control"
                      @change="handleImageUpload"
                      accept="image/*"
                      :required="!isEditing"
                    />
                    <div class="image-preview mt-2" v-if="formData.image">
                      <img
                        :src="getImageUrl(formData.image)"
                        class="img-fluid rounded"
                        @error="handleImageError"
                      />
                      <button
                        type="button"
                        class="btn btn-danger btn-sm remove-image"
                        @click="removeImage"
                        v-if="formData.image"
                      >
                        <i class="fas fa-times"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="text-end mt-4">
              <button
                type="button"
                class="btn btn-light me-2"
                @click="$emit('close')"
              >
                Hủy
              </button>
              <button type="submit" class="btn btn-primary">
                <i class="fas fa-save me-2"></i>
                {{ isEditing ? "Cập nhật" : "Thêm mới" }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
  <div class="modal-backdrop fade" :class="{ show: show }" v-if="show"></div>
</template>

<script>
export default {
  name: "BannerForm",
  props: {
    show: {
      type: Boolean,
      required: true,
    },
    isEditing: {
      type: Boolean,
      default: false,
    },
    banner: {
      type: Object,
      default: () => ({
        name: "",
        type: "main",
        content: "",
        image: null,
        publish: true,
      }),
    },
    backendUrl: {
      type: String,
      default: import.meta.env.VITE_API_URL,
    },
  },
  emits: ["close", "submit"],
  data() {
    return {
      formData: {
        name: "",
        type: "main",
        content: "",
        image: null,
        publish: true,
      },
    };
  },
  watch: {
    banner: {
      handler(newVal) {
        this.formData = { ...newVal };
      },
      immediate: true,
    },
  },
  methods: {
    handleSubmit() {
      this.$emit("submit", this.formData);
    },

    getImageUrl(image) {
      if (!image) return "";
      if (image.startsWith("data:image")) return image;
      if (image.startsWith("http")) return image;
      return `${this.backendUrl}/${image}`;
    },

    handleImageError(e) {
      e.target.src = "/images/placeholder.jpg";
    },

    handleImageUpload(event) {
      const file = event.target.files[0];
      if (file) {
        // Kiểm tra kích thước file (giới hạn 2MB)
        if (file.size > 2 * 1024 * 1024) {
          this.$emit("error", "Kích thước file không được vượt quá 2MB");
          return;
        }

        // Kiểm tra loại file
        if (!file.type.startsWith("image/")) {
          this.$emit("error", "File phải là hình ảnh");
          return;
        }

        // Tạo URL tạm thời để preview ngay lập tức
        const tempUrl = URL.createObjectURL(file);
        // Cập nhật src của ảnh preview
        const previewImg = document.querySelector(".image-preview img");
        if (previewImg) {
          previewImg.src = tempUrl;
        }
        // Chuyển file thành base64 để gửi
        const reader = new FileReader();
        reader.onload = (e) => {
          this.formData.image = e.target.result; // Lưu toàn bộ data URL
        };
        reader.readAsDataURL(file);
      }
    },

    removeImage() {
      this.formData.image = null;
      // Giải phóng URL tạm nếu có
      const previewImg = document.querySelector(".image-preview img");
      if (previewImg && previewImg.src.startsWith("blob:")) {
        URL.revokeObjectURL(previewImg.src);
      }
    },
  },
};
</script>

<style scoped>
/* Modal Styles */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1050;
  display: none;
  overflow-y: auto;
}

.modal.show {
  display: block;
}

.modal-dialog {
  position: relative;
  width: auto;
  margin: 1.75rem auto;
  max-width: 800px;
  transform: translateY(-20px);
  transition: transform 0.3s ease-out;
}

.modal.show .modal-dialog {
  transform: translateY(0);
}

.modal-content {
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 0.5rem 1.5rem rgba(0, 0, 0, 0.2);
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem;
  border-bottom: 1px solid #e9ecef;
  background-color: #f8f9fa;
  border-radius: 12px 12px 0 0;
  position: sticky;
  top: 0;
  z-index: 1;
}

.modal-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #2c3e50;
}

.btn-close {
  padding: 0.5rem;
  background: transparent;
  border: 0;
  cursor: pointer;
  font-size: 1.5rem;
  line-height: 1;
  opacity: 0.7;
  transition: opacity 0.2s ease;
}

.btn-close:hover {
  opacity: 1;
}

.modal-body {
  position: relative;
  flex: 1 1 auto;
  padding: 1.5rem;
  overflow-y: auto;
}

/* Form Styles */
.form-label {
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #495057;
}

.form-control,
.form-select {
  display: block;
  width: 100%;
  padding: 0.625rem 0.875rem;
  font-size: 1rem;
  line-height: 1.5;
  color: #495057;
  background-color: #fff;
  border: 1px solid #ced4da;
  border-radius: 6px;
  transition: all 0.2s ease-in-out;
}

.form-control:focus,
.form-select:focus {
  border-color: #80bdff;
  outline: 0;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.15);
}

.form-check {
  display: flex;
  align-items: center;
  padding-left: 40px;
}

.form-check-input {
  margin-right: 0.5rem;
  cursor: pointer;
}

/* Image Upload Styles */
.image-upload-container {
  position: relative;
  border: 2px dashed #dee2e6;
  border-radius: 8px;
  padding: 1rem;
  transition: all 0.2s ease;
  max-width: 100%;
}

.image-upload-container:hover {
  border-color: #80bdff;
}

.image-preview {
  position: relative;
  margin-top: 1rem;
  border-radius: 8px;
  overflow: hidden;
  max-width: 100%;
  aspect-ratio: 16/9;
}

.image-preview img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: 8px;
  transition: transform 0.2s ease;
  background-color: #f8f9fa;
}

.image-preview img:hover {
  transform: scale(1.02);
}

.remove-image {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  padding: 0.375rem 0.75rem;
  font-size: 0.875rem;
  line-height: 1.5;
  border-radius: 4px;
  color: #fff;
  background-color: rgba(220, 53, 69, 0.9);
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  z-index: 2;
}

.remove-image:hover {
  background-color: #dc3545;
  transform: scale(1.05);
}

/* Button Styles */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 500;
  text-align: center;
  vertical-align: middle;
  user-select: none;
  padding: 0.625rem 1.25rem;
  font-size: 1rem;
  line-height: 1.5;
  border-radius: 6px;
  transition: all 0.2s ease-in-out;
  gap: 0.5rem;
}

.btn-light {
  color: #495057;
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
}

.btn-light:hover {
  background-color: #e9ecef;
  border-color: #ced4da;
}

.btn-primary {
  color: #fff;
  background-color: #0d6efd;
  border: 1px solid #0d6efd;
}

.btn-primary:hover {
  background-color: #0b5ed7;
  border-color: #0a58ca;
  transform: translateY(-1px);
}

.btn-danger {
  color: #fff;
  background-color: #dc3545;
  border: 1px solid #dc3545;
}

.btn-danger:hover {
  background-color: #bb2d3b;
  border-color: #b02a37;
}

/* Modal Backdrop */
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1040;
  display: none;
  backdrop-filter: blur(2px);
}

.modal-backdrop.show {
  display: block;
}

/* Utility Classes */
.text-danger {
  color: #dc3545;
}

.mb-3 {
  margin-bottom: 1rem;
}

.mt-2 {
  margin-top: 0.5rem;
}

.mt-4 {
  margin-top: 1.5rem;
}

.me-2 {
  margin-right: 0.5rem;
}

.text-end {
  text-align: end;
}

/* Responsive Adjustments */
@media (max-width: 768px) {
  .modal-dialog {
    margin: 1rem;
    max-width: calc(100% - 2rem);
  }

  .modal-body {
    padding: 1rem;
  }

  .btn {
    padding: 0.5rem 1rem;
  }

  .image-preview {
    aspect-ratio: 4/3;
  }
}
</style>
