<template>
  <div class="table-container">
    <div v-if="loading" class="loading-overlay">
      <i class="fas fa-spinner fa-spin"></i>
      <span>Đang tải dữ liệu...</span>
    </div>
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Tên danh mục</th>
          <th>Thao tác</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="catalogue in catalogues" :key="catalogue._id">
          <td>{{ catalogue._id }}</td>
          <td>{{ catalogue.name }}</td>
          <td class="actions">
            <button
              class="edit-btn"
              @click="handleEdit(catalogue)"
              :disabled="loading"
              title="Sửa"
            >
              <i class="fas fa-edit"></i>
            </button>
            <button
              class="delete-btn"
              @click="$emit('delete', catalogue)"
              :disabled="loading"
              title="Xóa"
            >
              <i class="fas fa-trash"></i>
            </button>
          </td>
        </tr>
        <tr v-if="!loading && catalogues.length === 0">
          <td colspan="5" class="text-center">Không có dữ liệu</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
export default {
  name: "AttributeCatalogueTable",
  props: {
    catalogues: {
      type: Array,
      required: true,
    },
    loading: {
      type: Boolean,
      default: false,
    },
  },
  methods: {
    handleEdit(catalogue) {
      if (!catalogue || !catalogue._id) {
        this.$emit("error", "Dữ liệu không hợp lệ");
        return;
      }
      this.$emit("edit", catalogue);
    },
  },
};
</script>

<style scoped>
@import "../../assets/styles/admin/table.css";

.table-container {
  width: 100%;
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 1rem;
  background-color: white;
}

th,
td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #e8e8e8;
}

th {
  background-color: #fafafa;
  font-weight: 500;
  color: #333;
}

tr:hover {
  background-color: #fafafa;
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
  display: flex;
  align-items: center;
  justify-content: center;
}

.edit-btn {
  background-color: #1890ff;
  color: white;
}

.delete-btn {
  background-color: #ff4d4f;
  color: white;
}

.edit-btn:hover {
  background-color: #40a9ff;
}

.delete-btn:hover {
  background-color: #ff7875;
}

.text-center {
  text-align: center;
  color: #999;
  padding: 24px;
}
</style>
