<template>
  <div v-if="show" class="modal-overlay">
    <div class="modal-content">
      <div class="modal-header">
        <h3>{{ isEditing ? "Chỉnh sửa nhân viên" : "Thêm nhân viên mới" }}</h3>
        <button class="close-btn" @click="$emit('close')">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <form @submit.prevent="handleSubmit" class="form">
        <div class="form-group">
          <label for="fullname"
            >Họ và tên <span class="required">*</span></label
          >
          <input
            type="text"
            id="fullname"
            v-model="formData.fullname"
            required
            placeholder="Nhập họ và tên"
          />
        </div>

        <div class="form-group">
          <label for="email">Email <span class="required">*</span></label>
          <input
            type="email"
            id="email"
            v-model="formData.email"
            required
            placeholder="Nhập email"
          />
        </div>

        <div class="form-group">
          <label for="phone"
            >Số điện thoại <span class="required">*</span></label
          >
          <input
            type="tel"
            id="phone"
            v-model="formData.phone"
            required
            placeholder="Nhập số điện thoại"
          />
        </div>

        <div class="form-group">
          <label for="password" v-if="!isEditing"
            >Mật khẩu <span class="required">*</span></label
          >
          <input
            type="password"
            id="password"
            v-model="formData.password"
            :required="!isEditing"
            placeholder="Nhập mật khẩu"
            v-if="!isEditing"
          />
        </div>

        <div class="form-group">
          <label for="address">Địa chỉ</label>
          <input
            type="text"
            id="address"
            v-model="formData.address"
            placeholder="Nhập địa chỉ"
          />
        </div>

        <div class="form-group">
          <label for="role">Vị trí</label>
          <select id="role" v-model="formData.role">
            <option value="employee">Nhân viên</option>
            <option value="admin">Quản trị viên</option>
          </select>
        </div>

        <div class="form-group">
          <label for="image">Ảnh đại diện</label>
          <input
            type="file"
            id="image"
            accept="image/*"
            @change="handleImageUpload"
            ref="imageInput"
          />
          <div class="image-preview" v-if="previewImage">
            <img :src="previewImage" alt="Preview" />
          </div>
          <div
            class="current-image"
            v-if="isEditing && formData.image && !previewImage"
          >
            <img
              :src="`http://localhost:3005${formData.image}`"
              alt="Current"
            />
            <small>Ảnh hiện tại</small>
          </div>
        </div>

        <div class="form-group">
          <label for="publish">Trạng thái</label>
          <select id="publish" v-model="formData.publish">
            <option :value="true">Đang làm việc</option>
            <option :value="false">Đã nghỉ</option>
          </select>
        </div>

        <div class="form-actions">
          <button
            type="button"
            class="cancel-btn"
            @click="$emit('close')"
            :disabled="loading"
          >
            Hủy
          </button>
          <button type="submit" class="submit-btn" :disabled="loading">
            {{ isEditing ? "Cập nhật" : "Thêm mới" }}
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
      required: true,
    },
    loading: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      formData: {
        _id: null,
        fullname: "",
        email: "",
        phone: "",
        password: "",
        address: "",
        role: "employee",
        image: "",
        publish: true,
      },
      previewImage: null,
    };
  },
  watch: {
    initialData: {
      handler(newVal) {
        if (newVal) {
          console.log("Initial Data:", newVal); // Debug log
          this.formData = {
            _id: newVal._id || null,
            fullname: newVal.fullname || "",
            email: newVal.email || "",
            phone: newVal.phone || "",
            password: "", // Không hiển thị password khi edit
            address: newVal.address || "",
            role: newVal.role || "employee",
            image: newVal.image || "",
            publish: newVal.publish !== undefined ? newVal.publish : true,
          };

          // Nếu có ảnh, hiển thị ảnh hiện tại
          if (newVal.image) {
            this.previewImage = null; // Reset preview image để hiển thị ảnh hiện tại
          }
        }
      },
      immediate: true,
      deep: true,
    },
    show(newVal) {
      if (!newVal) {
        // Reset form khi đóng modal
        this.formData = {
          _id: null,
          fullname: "",
          email: "",
          phone: "",
          password: "",
          address: "",
          role: "employee",
          image: "",
          publish: true,
        };
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
      if (!this.validateForm()) {
        return;
      }

      // Chuẩn bị dữ liệu để gửi
      const submitData = {
        ...this.formData,
        // Nếu đang edit và không có ảnh mới, giữ nguyên ảnh cũ
        image:
          this.isEditing && !this.previewImage && this.formData.image
            ? this.formData.image
            : this.formData.image,
      };

      // Nếu đang edit và không có password mới, không gửi password
      if (this.isEditing && !submitData.password) {
        delete submitData.password;
      }

      console.log("Submit Data:", submitData); // Debug log
      this.$emit("submitEmployee", submitData);
    },
    validateForm() {
      if (!this.formData.fullname.trim()) {
        this.$emit("error", "Vui lòng nhập họ và tên");
        return false;
      }
      if (!this.formData.email.trim()) {
        this.$emit("error", "Vui lòng nhập email");
        return false;
      }
      if (!this.formData.phone.trim()) {
        this.$emit("error", "Vui lòng nhập số điện thoại");
        return false;
      }
      if (!this.isEditing && !this.formData.password) {
        this.$emit("error", "Vui lòng nhập mật khẩu");
        return false;
      }
      return true;
    },
  },
  emits: ["close", "submitEmployee", "error"],
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
  width: 100%;
  max-width: 500px;
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
  font-size: 1.25rem;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.25rem;
  color: #999;
  cursor: pointer;
  padding: 4px;
}

.close-btn:hover {
  color: #666;
}

.form {
  padding: 24px;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #333;
  font-weight: 500;
}

.required {
  color: #ff4d4f;
}

input,
select {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 1rem;
  transition: all 0.3s;
}

input:focus,
select:focus {
  border-color: #1890ff;
  outline: none;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
}

.image-preview,
.current-image {
  margin-top: 8px;
  max-width: 200px;
}

.image-preview img,
.current-image img {
  width: 100%;
  height: auto;
  border-radius: 4px;
  border: 1px solid #d9d9d9;
}

.current-image small {
  display: block;
  margin-top: 4px;
  color: #666;
  font-size: 0.875rem;
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
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s;
}

.cancel-btn {
  background: white;
  border: 1px solid #d9d9d9;
  color: #666;
}

.submit-btn {
  background: #1890ff;
  border: none;
  color: white;
}

.cancel-btn:hover {
  border-color: #1890ff;
  color: #1890ff;
}

.submit-btn:hover {
  background: #40a9ff;
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
