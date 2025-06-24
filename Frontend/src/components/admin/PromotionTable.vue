<template>
  <div class="table-container">
    <table>
      <thead>
        <tr>
          <th>Mã</th>
          <th>Tên</th>
          <th>Loại</th>
          <th>Giảm giá</th>
          <th>Trạng thái</th>
          <th>Thời gian</th>
          <th>Thao tác</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="promotion in promotions" :key="promotion._id">
          <td>{{ promotion.code }}</td>
          <td>{{ promotion.name }}</td>
          <td>
            <span :class="getTypeBadgeClass(promotion.type)">
              {{ getTypeLabel(promotion.type) }}
            </span>
          </td>
          <td>{{ promotion.discount }}%</td>
          <td>
            <span
              :class="
                getStatusBadgeClass(promotion.publish, promotion.end_date)
              "
            >
              {{ getStatusLabel(promotion.publish, promotion.end_date) }}
            </span>
          </td>
          <td>
            <div>{{ formatDate(promotion.start_date) }}</div>
            <div>{{ formatDate(promotion.end_date) }}</div>
          </td>
          <td class="actions">
            <button
              class="edit-btn"
              @click="editPromotion(promotion)"
              title="Sửa"
            >
              <i class="fas fa-edit"></i>
            </button>
            <button
              class="delete-btn"
              @click="confirmDelete(promotion)"
              title="Xóa"
            >
              <i class="fas fa-trash"></i>
            </button>
          </td>
        </tr>
        <tr v-if="promotions.length === 0">
          <td colspan="7" class="no-data">Không có dữ liệu</td>
        </tr>
      </tbody>
    </table>
  </div>

  <!-- Delete Confirmation Modal -->
  <div
    class="modal fade"
    :class="{ show: showDeleteModal }"
    v-if="showDeleteModal"
  >
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Xác nhận xóa</h5>
          <button
            type="button"
            class="btn-close"
            @click="showDeleteModal = false"
          ></button>
        </div>
        <div class="modal-body">
          <p>
            Bạn có chắc chắn muốn xóa khuyến mãi "{{ selectedPromotion?.name }}"
            không?
          </p>
        </div>
        <div class="modal-footer">
          <button
            type="button"
            class="btn btn-secondary"
            @click="showDeleteModal = false"
          >
            Hủy
          </button>
          <button type="button" class="btn btn-danger" @click="deletePromotion">
            Xóa
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from "vue";

export default {
  name: "PromotionTable",
  props: {
    promotions: {
      type: Array,
      required: true,
    },
    loading: {
      type: Boolean,
      default: false,
    },
    showForm: {
      type: Boolean,
      required: true,
    },
    selectedPromotion: {
      type: Object,
      default: null,
    },
  },
  emits: ["edit", "delete", "saved", "close-form"],
  setup(props, { emit }) {
    const showDeleteModal = ref(false);
    const selectedPromotion = ref(null);

    const editPromotion = (promotion) => {
      console.log("Table: Emitting edit event for promotion:", promotion);
      emit("edit", promotion);
    };

    const closeForm = () => {
      console.log("Table: Emitting close-form event");
      emit("close-form");
    };

    const confirmDelete = (promotion) => {
      selectedPromotion.value = promotion;
      showDeleteModal.value = true;
    };

    const deletePromotion = () => {
      emit("delete", selectedPromotion.value);
      showDeleteModal.value = false;
    };

    const handleSaved = () => {
      console.log("Table: Emitting saved event");
      emit("saved");
    };

    const getTypeLabel = (type) => {
      return type === "product" ? "Giảm giá sản phẩm" : "Voucher";
    };

    const getTypeBadgeClass = (type) => {
      return {
        "badge bg-primary": type === "product",
        "badge bg-success": type === "voucher",
      };
    };

    const getStatusLabel = (status, endDate) => {
      const now = new Date();
      if (endDate && new Date(endDate) < now) {
        return "Hết hạn";
      }
      return status === "active" ? "Đang áp dụng" : "Không áp dụng";
    };

    const getStatusBadgeClass = (status, endDate) => {
      const now = new Date();
      if (endDate && new Date(endDate) < now) {
        return { "badge bg-expired": true };
      }
      return {
        "badge bg-success": status === "active",
        "badge bg-secondary": status === "inactive",
      };
    };

    const formatDate = (date) => {
      return new Date(date).toLocaleString("vi-VN");
    };

    return {
      showDeleteModal,
      selectedPromotion,
      editPromotion,
      closeForm,
      confirmDelete,
      deletePromotion,
      handleSaved,
      getTypeLabel,
      getTypeBadgeClass,
      getStatusLabel,
      getStatusBadgeClass,
      formatDate,
    };
  },
};
</script>

<style scoped>
.table-container {
  width: 100%;
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  background: white;
}

th {
  background: #fafafa;
  padding: 12px 16px;
  text-align: left;
  font-weight: 500;
  color: #262626;
  border-bottom: 1px solid #f0f0f0;
}

td {
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
  color: #262626;
}

.badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.875rem;
  font-weight: 500;
}

.bg-primary {
  background-color: #e6f7ff;
  color: #fff;
}

.bg-success {
  background-color: #f6ffed;
  color: #fff;
}

.bg-secondary {
  background-color: #f5f5f5;
  color: #8c8c8c;
}

.bg-expired {
  background-color: #ffeaea;
  color: #ff4d4f;
}

.actions {
  display: flex;
  gap: 8px;
}

.edit-btn,
.delete-btn {
  padding: 6px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.edit-btn {
  background: #e6f7ff;
  color: #1890ff;
}

.edit-btn:hover {
  background: #bae7ff;
}

.delete-btn {
  background: #fff1f0;
  color: #ff4d4f;
}

.delete-btn:hover {
  background: #ffccc7;
}

.no-data {
  text-align: center;
  color: #8c8c8c;
  padding: 24px;
}

tr:hover {
  background-color: #fafafa;
}

/* Modal styles */
.modal {
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

.modal.show {
  display: flex;
}

.modal-dialog {
  background: white;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.modal-content {
  border-radius: 8px;
  overflow: hidden;
}

.modal-header {
  padding: 16px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-title {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 500;
  color: #262626;
}

.btn-close {
  background: none;
  border: none;
  font-size: 1.25rem;
  color: #8c8c8c;
  cursor: pointer;
  padding: 4px;
  line-height: 1;
}

.modal-body {
  padding: 20px;
}

.modal-footer {
  padding: 16px 20px;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.btn {
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
}

.btn-secondary {
  background: #f5f5f5;
  color: #262626;
}

.btn-secondary:hover {
  background: #e8e8e8;
}

.btn-danger {
  background: #ff4d4f;
  color: white;
}

.btn-danger:hover {
  background: #ff7875;
}
</style>
