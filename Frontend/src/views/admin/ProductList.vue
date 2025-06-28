<template>
  <div class="product-list">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2>Quản lý sản phẩm</h2>
      <div class="d-flex gap-2">
        <button class="btn btn-outline-primary" @click="downloadTemplate">
          <i class="fas fa-download"></i> Tải template Excel
        </button>
        <button class="btn btn-outline-success" @click="openImportModal">
          <i class="fas fa-file-excel"></i> Import Excel
        </button>
        <button class="btn btn-primary" @click="openForm">
          <i class="fas fa-plus"></i> Thêm sản phẩm
        </button>
      </div>
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
      </div>
    </div>

    <ProductTable
      :products="filteredProducts"
      :product-catalogues="productCatalogues"
      :loading="loading"
      @edit="handleEdit"
      @delete="handleDelete"
      @togglePublish="handleTogglePublish"
      @bulkTogglePublish="handleBulkTogglePublish"
      @bulkDelete="handleBulkDelete"
      ref="productTable"
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

  <!-- Import Excel Modal -->
  <div v-if="showImportModal" class="modal fade show d-block" tabindex="-1">
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Import sản phẩm từ Excel</h5>
          <button
            type="button"
            class="btn-close"
            @click="closeImportModal"
          ></button>
        </div>
        <div class="modal-body">
          <div class="alert alert-info">
            <h6><i class="fas fa-info-circle"></i> Hướng dẫn sử dụng:</h6>
            <ol>
              <li>Tải template Excel để xem cấu trúc file</li>
              <li>
                Điền thông tin sản phẩm và biến thể vào sheet "Sản phẩm và Biến
                thể"
              </li>
              <li>Upload file Excel để import</li>
            </ol>
            <p><strong>Cấu trúc file Excel:</strong></p>
            <ul>
              <li>
                <strong>Thông tin sản phẩm:</strong> Mã SP, Tên SP, Mô tả, Danh
                mục ID, Giá SP, Hình SP
              </li>
              <li>
                <strong>Thông tin biến thể:</strong> Mã BT, Tên BT, Màu, Size,
                Thương hiệu, Giá BT, Tồn kho, Hình BT
              </li>
            </ul>
            <p><strong>Lưu ý quan trọng:</strong></p>
            <ul>
              <li>Mỗi sản phẩm có thể có nhiều biến thể</li>
              <li>
                Các dòng có cùng Mã sản phẩm sẽ được nhóm thành một sản phẩm
              </li>
              <li>
                <strong>Tên thuộc tính:</strong> Hệ thống sẽ tự động tạo danh
                mục thuộc tính dựa trên tên thuộc tính
              </li>
              <li>
                <strong>Ví dụ:</strong> "Size S" → Danh mục "Size", Thuộc tính
                "S"
              </li>
              <li>
                <strong>Ví dụ:</strong> "Thương hiệu Nike" → Danh mục "Thương
                hiệu", Thuộc tính "Nike"
              </li>
              <li>
                <strong>Ví dụ:</strong> "gsdeiugdieuhgu" → Danh mục
                "gsdeiugdieuhgu", Thuộc tính "gsdeiugdieuhgu"
              </li>
              <li>Mã sản phẩm và Mã biến thể phải là duy nhất</li>
              <li>Danh mục ID phải tồn tại trong hệ thống</li>
              <li>File Excel phải có định dạng .xlsx</li>
            </ul>
          </div>

          <div class="file-upload-section">
            <label class="form-label">Chọn file Excel (.xlsx)</label>
            <input
              type="file"
              class="form-control"
              @change="handleFileSelect"
              accept=".xlsx,.xls"
              ref="fileInput"
            />
            <div class="form-text">Chỉ hỗ trợ file Excel (.xlsx, .xls)</div>
          </div>

          <div v-if="importResults" class="import-results mt-4">
            <h6>Kết quả import:</h6>
            <div class="alert alert-info">
              <strong>Tổng số dòng:</strong> {{ importResults.total }}
            </div>

            <div
              v-if="importResults.success.length > 0"
              class="alert alert-success"
            >
              <strong>Thành công:</strong>
              {{ importResults.success.length }} sản phẩm
              <ul class="mt-2 mb-0">
                <li v-for="item in importResults.success" :key="item.row">
                  Dòng {{ item.row }}: {{ item.code }} - {{ item.name }}
                </li>
              </ul>
            </div>

            <div
              v-if="importResults.errors.length > 0"
              class="alert alert-danger"
            >
              <strong>Lỗi:</strong> {{ importResults.errors.length }} dòng
              <ul class="mt-2 mb-0">
                <li v-for="item in importResults.errors" :key="item.row">
                  Dòng {{ item.row }}: {{ item.error }}
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button
            type="button"
            class="btn btn-secondary"
            @click="closeImportModal"
          >
            Đóng
          </button>
          <button
            type="button"
            class="btn btn-primary"
            @click="importExcel"
            :disabled="!selectedFile || importing"
          >
            <span
              v-if="importing"
              class="spinner-border spinner-border-sm me-2"
            ></span>
            {{ importing ? "Đang import..." : "Import" }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import ProductTable from "../../components/admin/ProductTable.vue";
import ProductForm from "../../components/admin/ProductForm.vue";
import axios from "axios";
import { toast } from "vue3-toastify";
import "vue3-toastify/dist/index.css";
import AdminProductService from "../../services/admin/product.service";
import Swal from "sweetalert2";

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
      showImportModal: false,
      selectedFile: null,
      importing: false,
      importResults: null,
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
        const result = await Swal.fire({
          title: "Xác nhận xóa",
          text: "Bạn có chắc chắn muốn xóa sản phẩm này? Sản phẩm sẽ được ẩn khỏi danh sách.",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#d33",
          cancelButtonColor: "#3085d6",
          confirmButtonText: "Xóa",
          cancelButtonText: "Hủy",
        });

        if (result.isConfirmed) {
          await AdminProductService.delete(id);
          toast.success("Xóa sản phẩm thành công");
          await this.fetchProducts();
        }
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

    openImportModal() {
      this.showImportModal = true;
    },

    closeImportModal() {
      this.showImportModal = false;
      this.selectedFile = null;
      this.importing = false;
      this.importResults = null;
    },

    handleFileSelect(event) {
      const file = event.target.files[0];
      if (file) {
        this.selectedFile = file;
      }
    },

    async importExcel() {
      this.importing = true;
      try {
        const formData = new FormData();
        formData.append("file", this.selectedFile);

        const token = localStorage.getItem("token-admin");
        const response = await axios.post(
          `${this.backendUrl}/api/products/import-excel`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );

        if (response.data && response.data.results) {
          this.importResults = response.data.results;
          toast.success("Import thành công");
          await this.fetchProducts();
        } else {
          toast.error("Dữ liệu trả về không đúng định dạng");
        }
      } catch (error) {
        console.error("Error importing Excel:", error);
        if (error.response?.status === 401) {
          toast.error("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại");
          this.$router.push("/admin/login");
        } else {
          toast.error("Không thể import Excel. Vui lòng thử lại sau.");
        }
      } finally {
        this.importing = false;
      }
    },

    async downloadTemplate() {
      try {
        const token = localStorage.getItem("token-admin");
        const response = await axios.get(
          `${this.backendUrl}/api/products/download-template`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            responseType: "blob",
          }
        );

        // Tạo link download
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "product_template.xlsx");
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);

        toast.success("Tải template thành công");
      } catch (error) {
        console.error("Error downloading template:", error);
        if (error.response?.status === 401) {
          toast.error("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại");
          this.$router.push("/admin/login");
        } else {
          toast.error("Không thể tải template. Vui lòng thử lại sau.");
        }
      }
    },

    async handleTogglePublish(product) {
      try {
        const result = await Swal.fire({
          title: "Xác nhận thay đổi trạng thái",
          text: `Bạn có chắc chắn muốn thay đổi trạng thái của sản phẩm "${product.name}"?`,
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#d33",
          cancelButtonColor: "#3085d6",
          confirmButtonText: "Đồng ý",
          cancelButtonText: "Hủy",
        });

        if (result.isConfirmed) {
          await AdminProductService.togglePublish(product._id);
          toast.success("Thay đổi trạng thái thành công");
          await this.fetchProducts();
          // Clear selection after successful operation
          this.$refs.productTable.clearSelection();
        }
      } catch (error) {
        console.error("Error toggling product publish status:", error);
        if (error.response?.status === 401) {
          toast.error("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại");
          this.$router.push("/admin/login");
        } else {
          toast.error("Không thể thay đổi trạng thái sản phẩm. Vui lòng thử lại sau.");
        }
      }
    },

    async handleBulkTogglePublish(productIds) {
      try {
        const result = await Swal.fire({
          title: "Xác nhận thay đổi trạng thái",
          text: "Bạn có chắc chắn muốn thay đổi trạng thái của các sản phẩm đã chọn?",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#d33",
          cancelButtonColor: "#3085d6",
          confirmButtonText: "Đồng ý",
          cancelButtonText: "Hủy",
        });

        if (result.isConfirmed) {
          await AdminProductService.bulkTogglePublish(productIds);
          toast.success("Thay đổi trạng thái thành công");
          await this.fetchProducts();
          // Clear selection after successful operation
          this.$refs.productTable.clearSelection();
        }
      } catch (error) {
        console.error("Error bulk toggling product publish status:", error);
        if (error.response?.status === 401) {
          toast.error("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại");
          this.$router.push("/admin/login");
        } else {
          toast.error("Không thể thay đổi trạng thái sản phẩm. Vui lòng thử lại sau.");
        }
      }
    },

    async handleBulkDelete(productIds) {
      try {
        const result = await Swal.fire({
          title: "Xác nhận xóa",
          text: "Bạn có chắc chắn muốn xóa các sản phẩm đã chọn? Sản phẩm sẽ được ẩn khỏi danh sách.",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#d33",
          cancelButtonColor: "#3085d6",
          confirmButtonText: "Xóa",
          cancelButtonText: "Hủy",
        });

        if (result.isConfirmed) {
          await AdminProductService.bulkDelete(productIds);
          toast.success("Xóa sản phẩm thành công");
          await this.fetchProducts();
          // Clear selection after successful operation
          this.$refs.productTable.clearSelection();
        }
      } catch (error) {
        console.error("Error bulk deleting products:", error);
        if (error.response?.status === 401) {
          toast.error("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại");
          this.$router.push("/admin/login");
        } else {
          toast.error("Không thể xóa sản phẩm. Vui lòng thử lại sau.");
        }
      }
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

/* Import Modal Styles */
.modal {
  display: block;
  background-color: rgba(0, 0, 0, 0.5);
}

.import-instructions {
  background-color: #f8f9fa;
  padding: 16px;
  border-radius: 8px;
  border-left: 4px solid #007bff;
}

.import-instructions h6 {
  color: #007bff;
  margin-bottom: 12px;
}

.import-instructions ol {
  margin-bottom: 0;
  padding-left: 20px;
}

.import-instructions li {
  margin-bottom: 8px;
  color: #495057;
  line-height: 1.5;
}

.file-upload-section {
  border: 2px dashed #dee2e6;
  padding: 24px;
  border-radius: 8px;
  text-align: center;
  transition: all 0.3s ease;
}

.file-upload-section:hover {
  border-color: #007bff;
  background-color: #f8f9fa;
}

.import-results {
  max-height: 300px;
  overflow-y: auto;
}

.import-results .alert {
  margin-bottom: 12px;
}

.import-results ul {
  margin-bottom: 0;
  padding-left: 20px;
}

.import-results li {
  margin-bottom: 4px;
  font-size: 14px;
}

.gap-2 {
  gap: 0.5rem;
}
</style>
