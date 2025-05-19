<template>
  <div v-if="show" class="modal-overlay">
    <div class="modal-content">
      <div class="modal-header">
        <h3>{{ isEditing ? "Chỉnh sửa danh mục" : "Thêm danh mục mới" }}</h3>
        <button class="close-btn" @click="$emit('close')">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <form @submit.prevent="handleSubmit" class="form">
        <div class="form-group">
          <label for="name">Tên danh mục</label>
          <input
            type="text"
            id="name"
            v-model="formData.name"
            required
            placeholder="Nhập tên danh mục"
          />
        </div>

        <div class="form-group">
          <label for="description">Mô tả</label>
          <textarea
            id="description"
            v-model="formData.description"
            placeholder="Nhập mô tả"
            rows="3"
          ></textarea>
        </div>

        <div class="form-group">
          <label>Icon</label>
          <div class="icon-upload">
            <input
              type="file"
              ref="fileInput"
              @change="handleIconChange"
              accept="image/*"
              class="file-input"
            />
            <div class="icon-preview" @click="triggerFileInput">
              <img
                v-if="previewImage"
                :src="previewImage"
                alt="Icon preview"
              />
              <div v-else class="upload-placeholder">
                <i class="fas fa-upload"></i>
                <span>Chọn icon</span>
              </div>
            </div>
          </div>
        </div>

        <div class="form-group">
          <label for="parentId">Danh mục cha</label>
          <select id="parentId" v-model="formData.parentId">
            <option value="">Không có</option>
            <option
              v-for="catalogue in parentCatalogues"
              :key="catalogue._id"
              :value="catalogue._id"
            >
              {{ catalogue.name }}
            </option>
          </select>
        </div>

        <div class="form-actions">
          <button type="button" class="cancel-btn" @click="$emit('close')">
            Hủy
          </button>
          <button type="submit" class="submit-btn">
            {{ isEditing ? "Cập nhật" : "Thêm mới" }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "ProductCatalogueForm",
  props: {
    show: {
      type: Boolean,
      required: true,
    },
    isEditing: {
      type: Boolean,
      default: false,
    },
    initialData: {
      type: Object,
      default: () => ({
        id: null,
        name: "",
        description: "",
        icon: null,
        parentId: null,
      }),
    },
  },
  data() {
    return {
      formData: { ...this.initialData },
      parentCatalogues: [],
      backendUrl: "http://localhost:3005",
      previewImage: null,
    };
  },
  methods: {
    async fetchParentCatalogues() {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `${this.backendUrl}/api/productCatalogues`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (response.data && response.data.data) {
          this.parentCatalogues = response.data.data.filter(
            (cat) => cat._id !== this.formData.id
          );
        }
      } catch (error) {
        console.error("Fetch parent catalogues error:", error);
        this.$emit("error", "Không thể tải danh sách danh mục cha");
      }
    },

    handleIconChange(event) {
      const file = event.target.files[0];
      if (file) {
        if (file.size > 2 * 1024 * 1024) {
          this.$emit("error", "Kích thước file không được vượt quá 2MB");
          return;
        }
        const reader = new FileReader();
        reader.onload = (e) => {
          this.previewImage = e.target.result;
          this.formData.icon = e.target.result;
        };
        reader.readAsDataURL(file);
      }
    },

    triggerFileInput() {
      this.$refs.fileInput.click();
    },

    async handleSubmit() {
      try {
        // Prepare data for submission
        const submitData = {
          id: this.formData.id,
          name: this.formData.name,
          description: this.formData.description,
          parentId: this.formData.parentId || null
        };

        // Handle icon
        if (this.isEditing) {
          // If editing and no new icon selected, keep the old icon path
          if (!this.previewImage && this.formData.icon && !this.formData.icon.startsWith('data:')) {
            submitData.icon = this.formData.icon;
          } else if (this.previewImage) {
            // If new icon selected, use the new icon
            submitData.icon = this.formData.icon;
          }
        } else {
          // For new catalogue, use the selected icon if any
          submitData.icon = this.formData.icon;
        }

        this.$emit("submitCatalogue", submitData);
      } catch (error) {
        console.error("Submit form error:", error);
        this.$emit("error", "Có lỗi xảy ra khi gửi form");
      }
    },
  },
  watch: {
    initialData: {
      handler(newVal) {
        this.formData = { ...newVal };
        this.previewImage = null;
      },
      deep: true,
    },
    show(newVal) {
      if (!newVal) {
        this.previewImage = null;
        if (this.$refs.fileInput) {
          this.$refs.fileInput.value = "";
        }
      }
    },
  },
  created() {
    this.fetchParentCatalogues();
  },
};
</script>

<style scoped>
@import "../../assets/styles/admin/list.css";

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
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  border-bottom: 1px solid #f0f0f0;
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.close-btn {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #999;
}

.close-btn:hover {
  color: #666;
}

.form {
  padding: 24px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
}

.form-group input,
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 14px;
}

.form-group input:focus,
.form-group textarea:focus,
.form-group select:focus {
  border-color: #40a9ff;
  outline: none;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
}

.icon-upload {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.file-input {
  display: none;
}

.icon-preview {
  width: 100px;
  height: 100px;
  border: 2px dashed #d9d9d9;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
}

.icon-preview:hover {
  border-color: #40a9ff;
}

.icon-preview img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: #999;
}

.upload-placeholder i {
  font-size: 24px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}

.cancel-btn,
.submit-btn {
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
}

.cancel-btn {
  background: white;
  border: 1px solid #d9d9d9;
  color: #666;
}

.cancel-btn:hover {
  border-color: #40a9ff;
  color: #40a9ff;
}

.submit-btn {
  background: #1890ff;
  border: none;
  color: white;
}

.submit-btn:hover {
  background: #40a9ff;
}
</style>
