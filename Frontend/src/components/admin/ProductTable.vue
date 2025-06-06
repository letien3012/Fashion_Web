<template>
  <div class="table-responsive">
    <table class="table">
      <thead>
        <tr>
          <th>Hình ảnh</th>
          <th>Mã sản phẩm</th>
          <th>Tên sản phẩm</th>
          <th>Danh mục</th>

          <th>Trạng thái</th>
          <th>Thao tác</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="loading">
          <td colspan="7" class="text-center">
            <div class="loading-spinner">
              <i class="fas fa-spinner fa-spin"></i>
              <span>Đang tải...</span>
            </div>
          </td>
        </tr>
        <tr v-else-if="products.length === 0">
          <td colspan="7" class="text-center empty-state">
            <i class="fas fa-box-open"></i>
            <p>Không có sản phẩm nào</p>
          </td>
        </tr>
        <tr v-else v-for="product in products" :key="product._id">
          <td>
            <div class="product-image">
              <img
                :src="`http://localhost:3005${product.image}`"
                :alt="product.name"
                class="product-thumbnail"
              />
            </div>
          </td>
          <td>{{ product.code }}</td>
          <td>
            <div class="product-name">{{ product.name }}</div>
          </td>
          <td>{{ getCatalogueName(product.catalogueId) }}</td>
          <td>
            <span
              :class="[
                'status-badge',
                product.publish ? 'status-active' : 'status-inactive',
              ]"
            >
              {{ product.publish ? "Đang bán" : "Ngừng bán" }}
            </span>
          </td>
          <td>
            <div class="action-buttons">
              <button
                class="action-btn edit-btn"
                @click="$emit('edit', product)"
                title="Chỉnh sửa"
              >
                <i class="fas fa-edit"></i>
              </button>
              <button
                class="action-btn delete-btn"
                @click="confirmDelete(product._id)"
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
</template>

<script>
import { toast } from "vue3-toastify";

export default {
  name: "ProductTable",
  props: {
    products: {
      type: Array,
      required: true,
    },
    productCatalogues: {
      type: Array,
      required: true,
    },
    loading: {
      type: Boolean,
      default: false,
    },
  },
  methods: {
    getCatalogueName(catalogueId) {
      if (!catalogueId) return "N/A";

      // Nếu catalogueId là một object (đã populate)
      if (typeof catalogueId === "object" && catalogueId !== null) {
        return catalogueId.name || "N/A";
      }

      // Nếu catalogueId là string (ID)
      const catalogue = this.productCatalogues.find((c) => {
        const catalogueIdStr = String(catalogueId).trim();
        const cIdStr = String(c._id).trim();
        return catalogueIdStr === cIdStr;
      });
      return catalogue ? catalogue.name : "N/A";
    },
    formatPrice(price) {
      return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }).format(price);
    },
    confirmDelete(id) {
      if (confirm("Bạn có chắc chắn muốn xóa sản phẩm này?")) {
        this.$emit("delete", id);
      }
    },
  },
};
</script>

<style scoped>
.product-table {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: relative;
  z-index: 1;
}

.table {
  margin-bottom: 0;
}

.table thead th {
  background-color: #f8f9fa;
  border-bottom: 2px solid #dee2e6;
  color: #495057;
  font-weight: 600;
  padding: 12px;
  vertical-align: middle;
}

.table tbody td {
  padding: 12px;
  vertical-align: middle;
  border-bottom: 1px solid #dee2e6;
}

.product-image {
  width: 60px;
  height: 60px;
  border-radius: 4px;
  overflow: hidden;
}

.product-thumbnail {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-name {
  font-weight: 500;
  color: #2c3e50;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.status-active {
  background-color: #e8f5e9;
  color: #2e7d32;
}

.status-inactive {
  background-color: #ffebee;
  color: #c62828;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.action-btn {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.edit-btn {
  background-color: #e3f2fd;
  color: #1976d2;
}

.edit-btn:hover {
  background-color: #bbdefb;
}

.delete-btn {
  background-color: #ffebee;
  color: #d32f2f;
}

.delete-btn:hover {
  background-color: #ffcdd2;
}

.loading-spinner {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 24px;
  color: #666;
}

.loading-spinner i {
  font-size: 20px;
}

.empty-state {
  padding: 48px 24px;
  color: #666;
}

.empty-state i {
  font-size: 48px;
  margin-bottom: 16px;
  color: #ddd;
}

.empty-state p {
  margin: 0;
  font-size: 16px;
}
</style>
