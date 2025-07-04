<template>
  <div class="modal" v-if="true">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">
            {{ supplier ? "Cập nhật nhà cung cấp" : "Thêm nhà cung cấp mới" }}
          </h5>
          <button
            type="button"
            class="btn-close"
            @click="$emit('close')"
          ></button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="handleSubmit" class="supplier-form">
            <div class="mb-3">
              <label class="form-label required">Tên nhà cung cấp</label>
              <input
                type="text"
                class="form-control"
                v-model="formData.name"
                :class="{ 'is-invalid': errors.name }"
                required
              />
              <div class="invalid-feedback">{{ errors.name }}</div>
            </div>

            <div class="mb-3">
              <label class="form-label">Địa chỉ</label>
              <input
                type="text"
                class="form-control"
                v-model="formData.address"
                :class="{ 'is-invalid': errors.address }"
              />
              <div class="invalid-feedback">{{ errors.address }}</div>
            </div>

            <div class="mb-3">
              <label class="form-label">Số điện thoại</label>
              <input
                type="text"
                class="form-control"
                v-model="formData.phone"
                :class="{ 'is-invalid': errors.phone }"
              />
              <div class="invalid-feedback">{{ errors.phone }}</div>
            </div>

            <div class="form-actions">
              <button
                type="button"
                class="btn btn-secondary"
                @click="$emit('close')"
              >
                Hủy
              </button>
              <button type="submit" class="btn btn-primary">
                {{ supplier ? "Cập nhật" : "Thêm mới" }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from "vue";
import axios from "axios";
import { toast } from "vue3-toastify";

export default {
  name: "SupplierForm",
  props: {
    supplier: {
      type: Object,
      default: null,
    },
  },
  emits: ["close", "submit"],
  setup(props, { emit }) {
    const formData = ref({
      name: "",
      address: "",
      phone: "",
    });

    const errors = ref({});
    const backendUrl = import.meta.env.VITE_API_URL;

    onMounted(() => {
      if (props.supplier) {
        formData.value = {
          ...props.supplier,
        };
      }
    });

    const handleSubmit = async () => {
      try {
        const token = localStorage.getItem("token-admin");
        if (props.supplier) {
          const response = await axios.put(
            `${backendUrl}/api/suppliers/update/${props.supplier._id}`,
            formData.value,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          toast.success("Cập nhật nhà cung cấp thành công");
        } else {
          const response = await axios.post(
            `${backendUrl}/api/suppliers/add`,
            formData.value,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          toast.success("Thêm nhà cung cấp mới thành công");
        }
        emit("submit");
      } catch (error) {
        console.error("Error submitting form:", error);
        if (error.response?.data?.message) {
          toast.error(error.response.data.message);
        } else {
          toast.error("Có lỗi xảy ra khi lưu nhà cung cấp");
        }
      }
    };

    return {
      formData,
      errors,
      handleSubmit,
    };
  },
};
</script>

<style scoped>
.modal {
  display: block;
  background-color: rgba(0, 0, 0, 0.5);
}

.required::after {
  content: " *";
  color: red;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid #dee2e6;
}
</style>
