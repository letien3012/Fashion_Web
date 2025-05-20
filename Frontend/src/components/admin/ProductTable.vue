<template>
  <div class="product-table">
    <div class="table-filters mb-4">
      <div class="row">
        <div class="col-md-4">
          <input
            type="text"
            class="form-control"
            v-model="searchQuery"
            placeholder="Tìm kiếm sản phẩm..."
            @input="handleSearch"
          />
        </div>
        <div class="col-md-4">
          <select
            class="form-select"
            v-model="selectedCatalogue"
            @change="handleFilter"
          >
            <option value="">Tất cả danh mục</option>
            <option
              v-for="catalogue in catalogues"
              :key="catalogue.id"
              :value="catalogue.id"
            >
              {{ catalogue.name }}
            </option>
          </select>
        </div>
        <div class="col-md-4">
          <select
            class="form-select"
            v-model="sortBy"
            @change="handleSort"
          >
            <option value="name">Sắp xếp theo tên</option>
            <option value="price">Sắp xếp theo giá</option>
            <option value="createdAt">Sắp xếp theo ngày tạo</option>
          </select>
        </div>
      </div>
    </div>

    <div class="table-responsive">
      <table class="table table-striped">
        <thead>
          <tr>
            <th>Hình ảnh</th>
            <th>Mã sản phẩm</th>
            <th>Tên sản phẩm</th>
            <th>Danh mục</th>
            <th>Giá</th>
            <th>Trạng thái</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
            <td colspan="7" class="text-center">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
            </td>
          </tr>
          <tr v-else-if="filteredProducts.length === 0">
            <td colspan="7" class="text-center">Không có sản phẩm nào</td>
          </tr>
          <tr v-else v-for="product in filteredProducts" :key="product.id">
            <td>
              <img
                :src="product.mainImage"
                :alt="product.name"
                class="product-thumbnail"
              />
            </td>
            <td>{{ product.code }}</td>
            <td>{{ product.name }}</td>
            <td>{{ getCatalogueName(product.catalogueId) }}</td>
            <td>{{ formatPrice(product.price) }}</td>
            <td>
              <span
                :class="[
                  'badge',
                  product.status === 'active' ? 'bg-success' : 'bg-danger',
                ]"
              >
                {{ product.status === "active" ? "Đang bán" : "Ngừng bán" }}
              </span>
            </td>
            <td>
              <div class="btn-group">
                <button
                  class="btn btn-sm btn-primary"
                  @click="$emit('edit', product)"
                >
                  <i class="bi bi-pencil"></i>
                </button>
                <button
                  class="btn btn-sm btn-danger"
                  @click="confirmDelete(product.id)"
                >
                  <i class="bi bi-trash"></i>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="d-flex justify-content-between align-items-center mt-4">
      <div class="text-muted">
        Hiển thị {{ paginatedProducts.length }} / {{ filteredProducts.length }} sản phẩm
      </div>
      <nav>
        <ul class="pagination">
          <li class="page-item" :class="{ disabled: currentPage === 1 }">
            <a class="page-link" href="#" @click.prevent="changePage(currentPage - 1)">
              Trước
            </a>
          </li>
          <li
            v-for="page in totalPages"
            :key="page"
            class="page-item"
            :class="{ active: currentPage === page }"
          >
            <a class="page-link" href="#" @click.prevent="changePage(page)">
              {{ page }}
            </a>
          </li>
          <li class="page-item" :class="{ disabled: currentPage === totalPages }">
            <a class="page-link" href="#" @click.prevent="changePage(currentPage + 1)">
              Sau
            </a>
          </li>
        </ul>
      </nav>
    </div>
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
    catalogues: {
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
      searchQuery: "",
      selectedCatalogue: "",
      sortBy: "name",
      sortOrder: "asc",
      currentPage: 1,
      itemsPerPage: 10,
    };
  },
  computed: {
    filteredProducts() {
      let result = [...this.products];

      // Filter by search query
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        result = result.filter(
          (product) =>
            product.name.toLowerCase().includes(query) ||
            product.code.toLowerCase().includes(query)
        );
      }

      // Filter by catalogue
      if (this.selectedCatalogue) {
        result = result.filter(
          (product) => product.catalogueId === this.selectedCatalogue
        );
      }

      // Sort products
      result.sort((a, b) => {
        let comparison = 0;
        if (this.sortBy === "name") {
          comparison = a.name.localeCompare(b.name);
        } else if (this.sortBy === "price") {
          comparison = a.price - b.price;
        } else if (this.sortBy === "createdAt") {
          comparison = new Date(a.createdAt) - new Date(b.createdAt);
        }
        return this.sortOrder === "asc" ? comparison : -comparison;
      });

      return result;
    },
    paginatedProducts() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.filteredProducts.slice(start, end);
    },
    totalPages() {
      return Math.ceil(this.filteredProducts.length / this.itemsPerPage);
    },
  },
  methods: {
    handleSearch() {
      this.currentPage = 1;
    },
    handleFilter() {
      this.currentPage = 1;
    },
    handleSort() {
      this.sortOrder = this.sortOrder === "asc" ? "desc" : "asc";
    },
    changePage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page;
      }
    },
    getCatalogueName(catalogueId) {
      const catalogue = this.catalogues.find((c) => c.id === catalogueId);
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
  watch: {
    products: {
      handler() {
        this.currentPage = 1;
      },
      deep: true,
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

.table-filters {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.table-filters .form-control,
.table-filters .form-select {
  border: 1px solid #dee2e6;
  border-radius: 4px;
  padding: 8px 12px;
  transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
}

.table-filters .form-control:focus,
.table-filters .form-select:focus {
  border-color: #86b7fe;
  box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
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

.product-thumbnail {
  width: 50px;
  height: 50px;
  object-fit: cover;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease;
}

.product-thumbnail:hover {
  transform: scale(1.1);
}

.btn-group {
  gap: 5px;
}

.btn-group .btn {
  padding: 6px 10px;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.btn-group .btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.btn-group .btn i {
  font-size: 14px;
}

.badge {
  padding: 6px 10px;
  font-weight: 500;
  border-radius: 4px;
}

.pagination {
  margin-bottom: 0;
}

.page-link {
  padding: 8px 12px;
  color: #0d6efd;
  border: 1px solid #dee2e6;
  margin: 0 2px;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.page-link:hover {
  background-color: #e9ecef;
  border-color: #dee2e6;
  color: #0a58ca;
}

.page-item.active .page-link {
  background-color: #0d6efd;
  border-color: #0d6efd;
  color: white;
}

.page-item.disabled .page-link {
  color: #6c757d;
  pointer-events: none;
  background-color: #fff;
  border-color: #dee2e6;
}

/* Modal styles */
:deep(.modal) {
  z-index: 9999;
}

:deep(.modal-backdrop) {
  z-index: 9998;
}

:deep(.modal-dialog) {
  margin: 1.75rem auto;
  max-width: 800px;
  z-index: 10000;
}

:deep(.modal-content) {
  border: none;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 10001;
  position: relative;
}

:deep(.modal-header) {
  border-bottom: 1px solid #dee2e6;
  padding: 1rem 1.5rem;
  background-color: #f8f9fa;
  border-radius: 8px 8px 0 0;
  position: relative;
  z-index: 10002;
}

:deep(.modal-body) {
  padding: 1.5rem;
  position: relative;
  z-index: 10002;
}

:deep(.modal-footer) {
  border-top: 1px solid #dee2e6;
  padding: 1rem 1.5rem;
  background-color: #f8f9fa;
  border-radius: 0 0 8px 8px;
  position: relative;
  z-index: 10002;
}
</style> 