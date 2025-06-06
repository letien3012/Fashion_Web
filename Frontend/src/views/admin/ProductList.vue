<template>
  <div class="product-list">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2>Quản lý sản phẩm</h2>
      <button class="btn btn-primary" @click="openForm">
        <i class="fas fa-plus"></i> Thêm sản phẩm
      </button>
    </div>

    <div class="filters-section">
      <div class="search-box">
        <i class="fas fa-search"></i>
        <input
          type="text"
          v-model="searchQuery"
          placeholder="Tìm kiếm theo tên hoặc mã sản phẩm..."
          @input="handleSearch"
        />
      </div>

      <div class="filter-group">
        <select
          class="filter-select"
          v-model="selectedCatalogue"
          @change="handleFilter"
        >
          <option value="">Tất cả danh mục</option>
          <option
            v-for="catalogue in productCatalogues"
            :key="catalogue._id"
            :value="catalogue._id"
          >
            {{ catalogue.name }}
          </option>
        </select>

        <select
          class="filter-select"
          v-model="statusFilter"
          @change="handleFilter"
        >
          <option value="">Tất cả trạng thái</option>
          <option value="active">Đang bán</option>
          <option value="inactive">Ngừng bán</option>
        </select>

        <select class="filter-select" v-model="sortBy" @change="handleSort">
          <option value="name">Sắp xếp theo tên</option>
          <option value="price">Sắp xếp theo giá</option>
          <option value="createdAt">Sắp xếp theo ngày tạo</option>
        </select>
        <button class="btn btn-primary" @click="openForm">
          <i class="fas fa-plus"></i> Thêm sản phẩm
        </button>
      </div>
    </div>

    <ProductTable
      :products="filteredProducts"
      :product-catalogues="productCatalogues"
      :loading="loading"
      @edit="handleEdit"
      @delete="handleDelete"
    />

    <div class="pagination-info">
      <span class="showing-info">
        Hiển thị {{ startIndex + 1 }}-{{ endIndex }} /
        {{ filteredProducts.length }} sản phẩm
      </span>
      <div class="pagination">
        <button
          class="page-btn"
          :disabled="currentPage === 1"
          @click="changePage(currentPage - 1)"
        >
          <i class="fas fa-chevron-left"></i>
        </button>

        <template v-for="page in displayedPages" :key="page">
          <button
            v-if="page !== '...'"
            class="page-btn"
            :class="{ active: currentPage === page }"
            @click="changePage(page)"
          >
            {{ page }}
          </button>
          <span v-else class="page-dots">...</span>
        </template>

        <button
          class="page-btn"
          :disabled="currentPage === totalPages"
          @click="changePage(currentPage + 1)"
        >
          <i class="fas fa-chevron-right"></i>
        </button>
      </div>
    </div>
  </div>

  <ProductForm
    v-if="showForm"
    :product="selectedProduct"
    :attribute-catalogues="attributeCatalogues"
    :product-catalogues="productCatalogues"
    @close="closeForm"
    @submit="handleSubmit"
  />
</template>

<script>
import ProductTable from "../../components/admin/ProductTable.vue";
import ProductForm from "../../components/admin/ProductForm.vue";
import axios from "axios";
import { toast } from "vue3-toastify";
import "vue3-toastify/dist/index.css";

export default {
  name: "ProductList",
  components: {
    ProductTable,
    ProductForm,
  },
  data() {
    return {
      products: [],
      attributeCatalogues: [],
      productCatalogues: [],
      loading: false,
      showForm: false,
      selectedProduct: null,
      backendUrl: "http://localhost:3005",
      searchQuery: "",
      selectedCatalogue: "",
      statusFilter: "",
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

      // Filter by status
      if (this.statusFilter) {
        result = result.filter(
          (product) =>
            (this.statusFilter === "active" && product.publish) ||
            (this.statusFilter === "inactive" && !product.publish)
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
    startIndex() {
      return (this.currentPage - 1) * this.itemsPerPage;
    },
    endIndex() {
      return Math.min(
        this.startIndex + this.itemsPerPage,
        this.filteredProducts.length
      );
    },
    displayedPages() {
      const pages = [];
      const maxVisiblePages = 5;

      if (this.totalPages <= maxVisiblePages) {
        for (let i = 1; i <= this.totalPages; i++) {
          pages.push(i);
        }
      } else {
        if (this.currentPage <= 3) {
          for (let i = 1; i <= 4; i++) {
            pages.push(i);
          }
          pages.push("...");
          pages.push(this.totalPages);
        } else if (this.currentPage >= this.totalPages - 2) {
          pages.push(1);
          pages.push("...");
          for (let i = this.totalPages - 3; i <= this.totalPages; i++) {
            pages.push(i);
          }
        } else {
          pages.push(1);
          pages.push("...");
          for (let i = this.currentPage - 1; i <= this.currentPage + 1; i++) {
            pages.push(i);
          }
          pages.push("...");
          pages.push(this.totalPages);
        }
      }

      return pages;
    },
  },
  methods: {
    async fetchProducts() {
      try {
        this.loading = true;
        const token = localStorage.getItem("token-admin");
        if (!token) {
          toast.error("Vui lòng đăng nhập để tiếp tục");
          this.$router.push("/admin/login");
          return;
        }

        const response = await axios.get(`${this.backendUrl}/api/products`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data && response.data.data) {
          this.products = response.data.data;
        } else {
          toast.error("Dữ liệu trả về không đúng định dạng");
        }
      } catch (error) {
        console.error("Error fetching products:", error);
        if (error.response?.status === 401) {
          toast.error("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại");
          this.$router.push("/admin/login");
        } else {
          toast.error(
            "Không thể tải danh sách sản phẩm. Vui lòng thử lại sau."
          );
        }
      } finally {
        this.loading = false;
      }
    },

    async fetchProductCatalogues() {
      try {
        const token = localStorage.getItem("token-admin");
        const response = await axios.get(
          `${this.backendUrl}/api/productCatalogues`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (response.data && response.data.data) {
          this.productCatalogues = response.data.data;
        } else {
          toast.error("Dữ liệu trả về không đúng định dạng");
        }
      } catch (error) {
        console.error("Error fetching product catalogues:", error);
        if (error.response?.status === 401) {
          toast.error("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại");
          this.$router.push("/admin/login");
        } else {
          toast.error(
            "Không thể tải danh sách danh mục. Vui lòng thử lại sau."
          );
        }
      }
    },

    async fetchAttributeCatalogues() {
      try {
        const token = localStorage.getItem("token-admin");
        const response = await axios.get(
          `${this.backendUrl}/api/attributeCatalogues`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (response.data && response.data.data) {
          this.attributeCatalogues = response.data.data;
        } else {
          toast.error("Dữ liệu trả về không đúng định dạng");
        }
      } catch (error) {
        console.error("Error fetching attribute catalogues:", error);
        if (error.response?.status === 401) {
          toast.error("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại");
          this.$router.push("/admin/login");
        } else {
          toast.error(
            "Không thể tải danh sách thuộc tính. Vui lòng thử lại sau."
          );
        }
      }
    },

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

    openForm() {
      this.selectedProduct = null;
      this.showForm = true;
    },

    handleEdit(product) {
      this.selectedProduct = product;
      this.showForm = true;
    },

    async handleDelete(id) {
      try {
        const token = localStorage.getItem("token");
        await axios.delete(`${this.backendUrl}/api/products/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Xóa sản phẩm thành công");
        await this.fetchProducts();
      } catch (error) {
        console.error("Error deleting product:", error);
        if (error.response?.status === 401) {
          toast.error("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại");
          this.$router.push("/admin/login");
        } else {
          toast.error("Không thể xóa sản phẩm. Vui lòng thử lại sau.");
        }
      }
    },

    closeForm() {
      this.showForm = false;
      this.selectedProduct = null;
    },

    async handleSubmit() {
      await this.fetchProducts();
      this.closeForm();
    },
  },
  created() {
    this.fetchProducts();
    this.fetchProductCatalogues();
    this.fetchAttributeCatalogues();
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
.product-list {
  padding: 20px;
}

.page-header {
  margin-bottom: 24px;
}

.page-header h1 {
  font-size: 24px;
  font-weight: 600;
  color: #1a1a1a;
}

.filters-section {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  flex-wrap: wrap;
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
  color: #666;
}

.search-box input {
  width: 100%;
  padding: 8px 12px 8px 36px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.filter-group {
  display: flex;
  gap: 12px;
}

.filter-select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  min-width: 160px;
}

.table-container {
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 16px;
}

.pagination-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #eee;
}

.showing-info {
  color: #666;
  font-size: 14px;
}

.pagination {
  display: flex;
  gap: 8px;
  align-items: center;
}

.page-btn {
  padding: 6px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
  cursor: pointer;
  font-size: 14px;
  color: #333;
}

.page-btn:hover:not(:disabled) {
  background: #f5f5f5;
}

.page-btn.active {
  background: #007bff;
  color: white;
  border-color: #007bff;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-dots {
  color: #666;
}
</style>
