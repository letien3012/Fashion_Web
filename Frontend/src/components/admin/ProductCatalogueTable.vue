<template>
  <div class="table-container">
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
            <div class="catalogue-name">
              <img
                :src="
                  catalogue.icon
                    ? `http://localhost:3005${catalogue.icon}`
                    : '/default-catalogue-icon.jpg'
                "
                :alt="catalogue.name"
                class="catalogue-icon"
              />
              {{ catalogue.name }}
            </div>
          </td>
          <td>{{ catalogue.description || "-" }}</td>
          <td>{{ getParentName(catalogue.parentId) }}</td>
          <td class="actions">
            <button class="edit-btn" @click="$emit('edit', catalogue)">
              <i class="fas fa-edit"></i>
            </button>
            <button class="delete-btn" @click="$emit('delete', catalogue)">
              <i class="fas fa-trash"></i>
            </button>
          </td>
        </tr>
        <tr v-if="catalogues.length === 0">
          <td colspan="5" class="text-center">Không có dữ liệu</td>
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
  },
};
</script>

<style scoped>
@import "../../assets/styles/admin/table.css";

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

.catalogue-name {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
}

.catalogue-icon {
  width: 24px;
  height: 24px;
  object-fit: contain;
  border-radius: 4px;
}

.text-center {
  text-align: center;
  color: #999;
  padding: 24px;
}
</style>
