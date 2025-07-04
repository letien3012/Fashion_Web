<template>
  <div class="product-catalogue-table">
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Tên danh mục</th>
          <th>Mô tả</th>
          <th>Danh mục cha</th>
          <th>Thao tác</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="catalogue in catalogues" :key="catalogue._id">
          <td>{{ catalogue._id }}</td>
          <td>
            <div class="catalogue-info">
              <img
                :src="
                  catalogue.icon
                    ? `${apiUrl}${catalogue.icon}`
                    : fallbackIcon
                "
                :alt="catalogue.name"
                class="catalogue-icon"
                @error="onIconError($event)"
              />
              <span class="name">{{ catalogue.name }}</span>
            </div>
          </td>
          <td>{{ catalogue.description || "-" }}</td>
          <td>{{ getParentName(catalogue.parentId) }}</td>
          <td>
            <div class="action-buttons">
              <button class="edit-btn" @click="$emit('edit', catalogue)">
                <i class="fas fa-edit"></i>
              </button>
              <button
                class="delete-btn"
                :class="{ disabled: !catalogue.canDelete }"
                @click="$emit('delete', catalogue)"
                :title="getDeleteTooltip(catalogue)"
              >
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </td>
        </tr>
        <tr v-if="catalogues.length === 0">
          <td colspan="5" class="no-data">Không có dữ liệu</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
export default {
  name: "ProductCatalogueTable",
  props: {
    catalogues: {
      type: Array,
      required: true,
    },
  },
  methods: {
    getParentName(parentId) {
      if (!parentId) return "-";
      const parent = this.catalogues.find((cat) => cat._id === parentId);
      return parent ? parent.name : "-";
    },
    getDeleteTooltip(catalogue) {
      if (catalogue.canDelete === false) {
        return catalogue.deleteReason || "Không thể xóa danh mục này";
      }
      return "Xóa danh mục";
    },
    onIconError(event) {
      event.target.src = this.fallbackIcon;
    },
  },
};
</script>

<style scoped>
.product-catalogue-table {
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
  align-items: center;
  gap: 8px;
}

.catalogue-icon {
  width: 24px;
  height: 24px;
  border-radius: 4px;
  object-fit: cover;
}

.name {
  font-weight: 500;
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

.delete-btn.disabled {
  background: #f5f5f5;
  color: #d9d9d9;
  cursor: not-allowed;
}

.delete-btn.disabled:hover {
  background: #f5f5f5;
  color: #d9d9d9;
}

.no-data {
  text-align: center;
  color: #8c8c8c;
  padding: 24px !important;
}
</style>
