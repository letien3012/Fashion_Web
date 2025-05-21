<template>
  <div class="table-container">
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
        <tr v-for="(supplier, index) in suppliers" :key="supplier._id">
          <td>{{ index + 1 }}</td>
          <td>{{ supplier.name }}</td>
          <td>{{ supplier.phone }}</td>
          <td>{{ supplier.address }}</td>
          <td class="actions">
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
          </td>
        </tr>
        <tr v-if="suppliers.length === 0">
          <td colspan="6" class="text-center">Không có dữ liệu</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import { toast } from "vue3-toastify";
import axios from "axios";
import "../../assets/styles/admin/table.css";

export default {
  name: "SupplierTable",
  props: {
    suppliers: {
      type: Array,
      required: true,
    },
  },
  emits: ["edit", "delete"],
  setup(props, { emit }) {
    const backendUrl = "http://localhost:3005";

    const confirmDelete = async (supplier) => {
      if (confirm("Bạn có chắc chắn muốn xóa nhà cung cấp này?")) {
        try {
          const token = localStorage.getItem("token");
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
    };
  },
};
</script>

<style scoped>
.table-container {
  width: 100%;
  overflow-x: auto;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

table {
  width: 100%;
  border-collapse: collapse;
}

th {
  background-color: #fafafa;
  font-weight: 600;
  text-align: left;
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
}

td {
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.text-center {
  text-align: center;
  color: #999;
  padding: 24px;
}
</style>
