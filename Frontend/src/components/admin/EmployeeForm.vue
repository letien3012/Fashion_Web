<template>
  <div v-if="show" class="modal">
    <div class="modal-content">
      <h3>{{ isEditing ? "Sửa nhân viên" : "Thêm nhân viên" }}</h3>
      <form @submit.prevent="handleSubmit">
        <div class="form-group">
          <label>Họ tên</label>
          <input v-model="formData.fullname" type="text" required />
        </div>
        <div class="form-group">
          <label>Email</label>
          <input v-model="formData.email" type="email" required />
        </div>
        <div class="form-group">
          <label>Mật khẩu</label>
          <input
            v-model="formData.password"
            type="password"
            :required="!isEditing"
          />
        </div>
        <div class="form-group">
          <label>Vị trí</label>
          <select v-model="formData.role">
            <option value="admin">Admin</option>
            <option value="employee">Nhân viên</option>
          </select>
        </div>
        <div class="form-group">
          <label>Địa chỉ</label>
          <input v-model="formData.address" type="text" />
        </div>
        <div class="form-group">
          <label>Ảnh đại diện</label>
          <input
            type="file"
            accept="image/*"
            @change="handleImageUpload"
            ref="imageInput"
          />
          <div class="image-preview-container">
            <img
              v-if="previewImage"
              :src="previewImage"
              class="preview-image"
              alt="Preview"
            />
            <div v-if="isEditing && formData.image && !previewImage" class="current-image">
              <img
                :src="formData.image.startsWith('http') ? formData.image : `http://localhost:3005${formData.image}`"
                class="preview-image"
                alt="Current"
              />
              <small>Ảnh hiện tại</small>
            </div>
          </div>
        </div>
        <div class="form-group">
          <label>Trạng thái</label>
          <select v-model="formData.publish">
            <option :value="true">Đang làm việc</option>
            <option :value="false">Đã nghỉ</option>
          </select>
        </div>
        <div class="modal-actions">
          <button type="button" @click="$emit('close')">Hủy</button>
          <button type="submit" style="background-color: #1890ff; color: white">
            {{ isEditing ? "Cập nhật" : "Thêm" }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
export default {
  name: "EmployeeForm",
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
        fullname: "",
        email: "",
        password: "",
        role: "employee",
        publish: true,
        address: "",
        image: "",
      }),
    },
  },
  data() {
    return {
      formData: { ...this.initialData },
      previewImage: null,
    };
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
        if (this.$refs.imageInput) {
          this.$refs.imageInput.value = "";
        }
      }
    },
  },
  methods: {
    handleImageUpload(event) {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          this.previewImage = e.target.result;
          this.formData.image = e.target.result;
        };
        reader.readAsDataURL(file);
      }
    },
    handleSubmit() {
      // Validate required fields
      if (!this.formData.fullname || !this.formData.email) {
        this.$emit("error", "Vui lòng điền đầy đủ thông tin bắt buộc");
        return;
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(this.formData.email)) {
        this.$emit("error", "Email không hợp lệ");
        return;
      }

      // If not editing, password is required
      if (!this.isEditing && !this.formData.password) {
        this.$emit("error", "Vui lòng nhập mật khẩu");
        return;
      }

      // Prepare data for submission
      const submitData = {
        id: this.formData.id,
        fullname: this.formData.fullname,
        email: this.formData.email,
        role: this.formData.role,
        address: this.formData.address || "",
        publish: this.formData.publish
      };

      // Add password only if it's provided
      if (this.formData.password) {
        submitData.password = this.formData.password;
      }

      // Handle image
      if (this.isEditing) {
        // If editing and no new image selected, keep the old image path
        if (!this.previewImage && this.formData.image && !this.formData.image.startsWith('data:')) {
          submitData.image = this.formData.image;
        } else if (this.previewImage) {
          // If new image selected, use the new image
          submitData.image = this.previewImage;
        }
      } else {
        // For new employee, use the selected image if any
        submitData.image = this.formData.image;
      }

      this.$emit("submitEmployee", submitData);
    },
  },
};
</script>

<style scoped>
.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 24px;
  border-radius: 8px;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

h3 {
  margin: 0 0 20px;
  color: #333;
}

.form-group {
  margin-bottom: 16px;
}

label {
  display: block;
  margin-bottom: 8px;
  color: #333;
  font-weight: 500;
}

input,
select {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

input:focus,
select:focus {
  outline: none;
  border-color: #1890ff;
}

.image-preview-container {
  margin-top: 10px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
}

.preview-image {
  max-width: 150px;
  max-height: 150px;
  border-radius: 4px;
  object-fit: cover;
  border: 1px solid #ddd;
}

.current-image {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
}

.current-image small {
  color: #666;
  font-size: 12px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}

.modal-actions button {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
}

.modal-actions button[type="button"] {
  background-color: #f5f5f5;
  color: #333;
}

.modal-actions button[type="submit"] {
  background-color: #1890ff;
  color: white;
}

.modal-actions button:hover {
  opacity: 0.8;
}
</style>
