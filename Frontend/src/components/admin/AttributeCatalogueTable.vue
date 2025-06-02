<template>
  <div class="table-container">
    <div class="table-header">
      <div class="search-filter">
        <div class="search-box">
          <input
            type="text"
            v-model="searchQuery"
            placeholder="Tìm kiếm theo tên danh mục..."
            @input="handleSearch"
          />
          <i class="fas fa-search"></i>
        </div>
      </div>
    </div>

    <div class="table-content">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Tên danh mục</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
            <td colspan="3" class="loading">Đang tải...</td>
          </tr>
          <tr v-else-if="filteredCatalogues.length === 0">
            <td colspan="3" class="no-data">Không có dữ liệu</td>
          </tr>
          <tr v-for="catalogue in filteredCatalogues" :key="catalogue._id">
            <td>
              <span class="catalogue-id">{{ catalogue._id }}</span>
            </td>
            <td>
              <div class="catalogue-info">
                <span class="catalogue-name">{{ catalogue.name }}</span>
              </div>
            </td>
            <td>
              <div class="actions">
                <button
                  class="action-btn edit"
                  @click="handleEdit(catalogue)"
                  :disabled="loading"
                  title="Sửa"
                >
                  <i class="fas fa-edit"></i>
                </button>
                <button
                  class="action-btn delete"
                  @click="$emit('delete', catalogue)"
                  :disabled="loading"
                  title="Xóa"
                >
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import { ref, computed } from "vue";

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
  emits: ["edit", "delete", "error"],
  setup(props) {
    const searchQuery = ref("");

    const filteredCatalogues = computed(() => {
      let result = [...props.catalogues];

      // Lọc theo tên danh mục
      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase();
        result = result.filter((catalogue) =>
          catalogue.name.toLowerCase().includes(query)
        );
      }

      return result;
    });

    const handleSearch = () => {
      // Có thể thêm debounce ở đây nếu cần
    };

    const handleEdit = (catalogue) => {
      if (!catalogue || !catalogue._id) {
        this.$emit("error", "Dữ liệu không hợp lệ");
        return;
      }
      this.$emit("edit", catalogue);
    };

    return {
      searchQuery,
      filteredCatalogues,
      handleSearch,
      handleEdit,
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

.catalogue-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.catalogue-name {
  font-weight: 500;
  color: #1890ff;
}

.catalogue-id {
  color: #8c8c8c;
  font-size: 0.9em;
}

.actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  padding: 6px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.action-btn.edit {
  background: #e6f7ff;
  color: #1890ff;
}

.action-btn.edit:hover {
  background: #bae7ff;
}

.action-btn.delete {
  background: #fff1f0;
  color: #ff4d4f;
}

.action-btn.delete:hover {
  background: #ffccc7;
}

.loading,
.no-data {
  text-align: center;
  color: #8c8c8c;
  padding: 24px;
}

tr:hover {
  background: #fafafa;
}

.search-filter {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
  align-items: center;
}

.search-box {
  position: relative;
  flex: 1;
  min-width: 300px;
}

.search-box i {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #8c8c8c;
}

.search-box input {
  width: 100%;
  padding: 8px 12px 8px 36px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 14px;
  transition: all 0.3s;
}

.search-box input:focus {
  border-color: #40a9ff;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
  outline: none;
}
</style>
