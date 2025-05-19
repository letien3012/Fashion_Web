<template>
  <div v-if="show" class="modal-overlay">
    <div class="modal-content">
      <div class="modal-header">
        <h3>{{ isEditing ? "Cập nhật danh mục" : "Thêm danh mục mới" }}</h3>
        <button class="close-btn" @click="closeModal" :disabled="loading">
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
            :disabled="loading"
            required
            placeholder="Nhập tên danh mục"
          />
        </div>

        <div class="form-actions">
          <button
            type="button"
            class="cancel-btn"
            @click="closeModal"
            :disabled="loading"
          >
            Hủy
          </button>
          <button
            type="submit"
            class="submit-btn"
            :disabled="loading || !isFormValid"
          >
            <span v-if="loading" class="loading-spinner"></span>
            {{ isEditing ? "Cập nhật" : "Thêm mới" }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
export default {
  name: "AttributeCatalogueForm",
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
      }),
    },
    loading: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      formData: {
        id: null,
        name: "",
      },
    };
  },
  computed: {
    isFormValid() {
      return this.formData.name.trim().length > 0;
    },
  },
  watch: {
    initialData: {
      immediate: true,
      handler(newVal) {
        if (newVal) {
          this.formData = {
            id: newVal.id,
            name: newVal.name || "",
          };
        }
      },
    },
  },
  methods: {
    closeModal() {
      this.$emit("close");
    },
    handleSubmit() {
      if (!this.isFormValid) {
        this.$emit("error", "Vui lòng nhập tên danh mục");
        return;
      }

      this.$emit("submitCatalogue", {
        id: this.formData.id,
        name: this.formData.name.trim(),
      });
    },
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
  width: 100%;
  max-width: 500px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
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
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.3s ease;
}

.close-btn:hover {
  color: #666;
}

.close-btn:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.form {
  padding: 24px;
}

.form-group {
  margin-bottom: 24px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #333;
  font-weight: 500;
}

.form-group input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 14px;
  transition: all 0.3s ease;
}

.form-group input:focus {
  border-color: #1890ff;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
  outline: none;
}

.form-group input:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
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
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.cancel-btn {
  background: none;
  border: 1px solid #d9d9d9;
  color: #666;
}

.cancel-btn:hover {
  color: #1890ff;
  border-color: #1890ff;
}

.submit-btn {
  background-color: #1890ff;
  border: none;
  color: white;
  display: flex;
  align-items: center;
  gap: 8px;
}

.submit-btn:hover {
  opacity: 0.8;
}

.submit-btn:disabled {
  background-color: #d9d9d9;
  cursor: not-allowed;
}

.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid #ffffff;
  border-radius: 50%;
  border-top-color: transparent;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
