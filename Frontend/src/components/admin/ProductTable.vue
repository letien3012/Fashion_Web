<template>
  <div class="table-responsive">
    <!-- Bulk Actions Bar -->
    <div v-if="selectedProducts.length > 0" class="bulk-actions-bar">
      <div class="bulk-info">
        <span>{{ selectedProducts.length }} sản phẩm đã chọn</span>
      </div>
      <div class="bulk-buttons">
        <button
          class="btn btn-warning btn-sm"
          @click="bulkTogglePublish"
          title="Thay đổi trạng thái hiển thị"
        >
          <i class="fas fa-eye-slash"></i>
          {{ getBulkToggleText() }}
        </button>
        <button
          class="btn btn-danger btn-sm"
          @click="bulkDelete"
          title="Xóa các sản phẩm đã chọn"
        >
          <i class="fas fa-trash"></i>
          Xóa
        </button>
        <button
          class="btn btn-secondary btn-sm"
          @click="clearSelection"
          title="Bỏ chọn tất cả"
        >
          <i class="fas fa-times"></i>
          Bỏ chọn
        </button>
      </div>
    </div>

    <table class="table">
      <thead>
        <tr>
          <th>
            <input
              type="checkbox"
              :checked="isAllSelected"
              @change="toggleSelectAll"
              class="select-all-checkbox"
            />
          </th>
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
          <td colspan="8" class="text-center">
            <div class="loading-spinner">
              <i class="fas fa-spinner fa-spin"></i>
              <span>Đang tải...</span>
            </div>
          </td>
        </tr>
        <tr v-else-if="products.length === 0">
          <td colspan="8" class="text-center empty-state">
            <i class="fas fa-box-open"></i>
            <p>Không có sản phẩm nào</p>
          </td>
        </tr>
        <tr v-else v-for="product in products" :key="product._id">
          <td>
            <input
              type="checkbox"
              :checked="isProductSelected(product._id)"
              @change="toggleProductSelection(product._id)"
              class="product-checkbox"
            />
          </td>
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
                class="action-btn toggle-btn"
                @click="togglePublish(product._id)"
                :title="product.publish ? 'Ẩn sản phẩm' : 'Hiện sản phẩm'"
              >
                <i :class="product.publish ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
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
  data() {
    return {
      selectedProducts: [],
    };
  },
  computed: {
    isAllSelected() {
      return this.products.length > 0 && this.selectedProducts.length === this.products.length;
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
      this.$emit("delete", id);
    },
    togglePublish(id) {
      const product = this.products.find(p => p._id === id);
      this.$emit("togglePublish", product);
    },
    // Multi-select methods
    toggleSelectAll() {
      if (this.isAllSelected) {
        this.selectedProducts = [];
      } else {
        this.selectedProducts = this.products.map(p => p._id);
      }
    },
    toggleProductSelection(productId) {
      const index = this.selectedProducts.indexOf(productId);
      if (index > -1) {
        this.selectedProducts.splice(index, 1);
      } else {
        this.selectedProducts.push(productId);
      }
    },
    isProductSelected(productId) {
      return this.selectedProducts.includes(productId);
    },
    clearSelection() {
      this.selectedProducts = [];
    },
    getBulkToggleText() {
      const selectedProductObjects = this.products.filter(p => 
        this.selectedProducts.includes(p._id)
      );
      const publishedCount = selectedProductObjects.filter(p => p.publish).length;
      const unpublishedCount = selectedProductObjects.length - publishedCount;
      
      if (publishedCount === 0) {
        return "Hiện tất cả";
      } else if (unpublishedCount === 0) {
        return "Ẩn tất cả";
      } else {
        return "Thay đổi trạng thái";
      }
    },
    bulkTogglePublish() {
      const selectedProductObjects = this.products.filter(p => 
        this.selectedProducts.includes(p._id)
      );
      this.$emit("bulkTogglePublish", selectedProductObjects);
    },
    bulkDelete() {
      const selectedProductObjects = this.products.filter(p => 
        this.selectedProducts.includes(p._id)
      );
      this.$emit("bulkDelete", selectedProductObjects);
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

/* Bulk Actions Bar */
.bulk-actions-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 8px 8px 0 0;
  padding: 12px 16px;
  margin-bottom: 0;
  border-bottom: none;
}

.bulk-info {
  font-weight: 500;
  color: #495057;
}

.bulk-buttons {
  display: flex;
  gap: 8px;
}

.bulk-buttons .btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  font-size: 14px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}

.bulk-buttons .btn:hover {
  transform: translateY(-1px);
}

.bulk-buttons .btn-warning {
  background-color: #ffc107;
  color: #212529;
}

.bulk-buttons .btn-warning:hover {
  background-color: #e0a800;
}

.bulk-buttons .btn-danger {
  background-color: #dc3545;
  color: white;
}

.bulk-buttons .btn-danger:hover {
  background-color: #c82333;
}

.bulk-buttons .btn-secondary {
  background-color: #6c757d;
  color: white;
}

.bulk-buttons .btn-secondary:hover {
  background-color: #5a6268;
}

/* Checkboxes */
.select-all-checkbox,
.product-checkbox {
  width: 16px;
  height: 16px;
  cursor: pointer;
  accent-color: #007bff;
}

.select-all-checkbox {
  margin: 0;
}

.product-checkbox {
  margin: 0;
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

.toggle-btn {
  background-color: #fff3e0;
  color: #f57c00;
}

.toggle-btn:hover {
  background-color: #ffe0b2;
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
