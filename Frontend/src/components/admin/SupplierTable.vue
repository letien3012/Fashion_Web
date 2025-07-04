<template>
  <div class="supplier-table">
    <table>
      <thead>
        <tr>
          <th>STT</th>
          <th>Tên nhà cung cấp</th>
          <th>Số điện thoại</th>
          <th>Địa chỉ</th>
          <th>Thao tác</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(supplier, index) in paginatedSuppliers" :key="supplier._id">
          <td>{{ startIndex + index + 1 }}</td>
          <td>{{ supplier.name }}</td>
          <td>{{ supplier.phone }}</td>
          <td>{{ supplier.address }}</td>
          <td>
            <div class="action-buttons">
              <button
                class="edit-btn"
                @click="$emit('edit', supplier)"
                title="Chỉnh sửa"
              >
                <i class="fas fa-edit"></i>
              </button>
              <button
                class="delete-btn"
                @click="confirmDelete(supplier)"
                title="Xóa"
              >
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </td>
        </tr>
        <tr v-if="suppliers.length === 0">
          <td colspan="5" class="no-data">Không có dữ liệu</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import { ref, computed } from "vue";
import { toast } from "vue3-toastify";
import axios from "axios";

export default {
  name: "SupplierTable",
  props: {
    suppliers: {
      type: Array,
      required: true,
    },
    currentPage: {
      type: Number,
      required: true,
    },
    itemsPerPage: {
      type: Number,
      required: true,
    },
  },
  emits: ["edit", "delete"],
  setup(props, { emit }) {
    const backendUrl = import.meta.env.VITE_API_URL;

    const startIndex = computed(() => {
      return (props.currentPage - 1) * props.itemsPerPage;
    });

    const paginatedSuppliers = computed(() => {
      return props.suppliers.slice(
        startIndex.value,
        startIndex.value + props.itemsPerPage
      );
    });

    const confirmDelete = async (supplier) => {
      if (confirm("Bạn có chắc chắn muốn xóa nhà cung cấp này?")) {
        try {
          const token = localStorage.getItem("token-admin");
          await axios.delete(
            `${backendUrl}/api/suppliers/delete/${supplier._id}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          toast.success("Xóa nhà cung cấp thành công");
          emit("delete", supplier._id);
        } catch (error) {
          console.error("Error deleting supplier:", error);
          if (error.response?.data?.message) {
            toast.error(error.response.data.message);
          } else {
            toast.error("Có lỗi xảy ra khi xóa nhà cung cấp");
          }
        }
      }
    };

    return {
      confirmDelete,
      startIndex,
      paginatedSuppliers,
    };
  },
};
</script>

<style scoped>
.supplier-table {
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

.action-buttons {
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
  background: #ffa39e;
}

.no-data {
  text-align: center;
  color: #8c8c8c;
  padding: 24px;
}
</style>
