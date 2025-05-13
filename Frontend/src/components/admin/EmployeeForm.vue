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
            <option value="staff">Nhân viên</option>
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
          <img
            v-if="formData.image"
            :src="formData.image"
            class="preview-image"
            alt="Preview"
          />
          <div v-if="isEditing && formData.image" class="current-image-info">
            <small>Ảnh hiện tại</small>
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
          <button type="button" @click="handleSubmit">{{ isEditing ? "Cập nhật" : "Thêm" }}</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
export default {
  name: 'EmployeeForm',
  props: {
    show: {
      type: Boolean,
      required: true
    },
    isEditing: {
      type: Boolean,
      default: false
    },
    initialData: {
      type: Object,
      default: () => ({
        id: null,
        fullname: "",
        email: "",
        password: "",
        role: "staff",
        publish: true,
        address: "",
        image: ""
      })
    }
  },
  data() {
    return {
      formData: { ...this.initialData }
    }
  },
  watch: {
    initialData: {
      handler(newVal) {
        this.formData = { ...newVal }
      },
      deep: true
    },
    show(newVal) {
      if (!newVal && this.$refs.imageInput) {
        this.$refs.imageInput.value = '';
      }
    }
  },
  methods: {
    handleImageUpload(event) {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          this.formData.image = e.target.result;
        };
        reader.readAsDataURL(file);
      }
    },
    handleSubmit() {
      console.log('Form Data before emit:', this.formData);
      this.$emit('submit', { ...this.formData });
    }
  }
}
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

input, select {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

input:focus, select:focus {
  outline: none;
  border-color: #1890ff;
}

.preview-image {
  max-width: 100px;
  max-height: 100px;
  margin-top: 8px;
  border-radius: 4px;
}

.current-image-info {
  margin-top: 4px;
  color: #666;
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