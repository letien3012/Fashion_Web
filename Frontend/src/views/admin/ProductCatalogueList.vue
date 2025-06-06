<template>
  <div class="product-catalogue-list">
    <div class="page-header">
      <h1>Quản lý danh mục sản phẩm</h1>
      <button class="add-btn" @click="openAddModal">
        <i class="fas fa-plus"></i> Thêm danh mục
      </button>
    </div>

    <div class="filters-section">
      <div class="search-box">
        <i class="fas fa-search"></i>
        <input
          type="text"
          v-model="searchQuery"
          placeholder="Tìm kiếm theo tên danh mục..."
          @input="handleSearch"
        />
      </div>
    </div>

    <div class="table-container">
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>Đang tải dữ liệu...</p>
      </div>
      <div v-else-if="error" class="error-state">
        <i class="fas fa-exclamation-circle"></i>
        <p>{{ error }}</p>
        <button class="btn btn-primary" @click="fetchCatalogues">
          Thử lại
        </button>
      </div>
      <template v-else>
        <ProductCatalogueTable
          :catalogues="paginatedCatalogues"
          @edit="editCatalogue"
          @delete="confirmDelete"
        />

        <div class="pagination-info">
          <span class="showing-info">
            Hiển thị {{ startIndex + 1 }}-{{ endIndex }} /
            {{ filteredCatalogues.length }} danh mục
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
      </template>
    </div>

    <ProductCatalogueForm
      :show="showAddModal"
      :is-editing="isEditing"
      :initial-data="formData"
      @close="closeModal"
      @submitCatalogue="handleSubmit"
      @error="handleFormError"
    />
  </div>
</template>

<script>
import Swal from "sweetalert2";
import { toast } from "vue3-toastify";
import "vue3-toastify/dist/index.css";
import ProductCatalogueTable from "../../components/admin/ProductCatalogueTable.vue";
import ProductCatalogueForm from "../../components/admin/ProductCatalogueForm.vue";
import AdminProductCatalogueService from "../../services/admin/productCatalogue.service";

export default {
  name: "ProductCatalogueList",
  components: {
    ProductCatalogueTable,
    ProductCatalogueForm,
  },
  data() {
    return {
      catalogues: [],
      filteredCatalogues: [],
      searchQuery: "",
      currentPage: 1,
      itemsPerPage: 10,
      showAddModal: false,
      isEditing: false,
      formData: {
        _id: null,
        name: "",
        description: "",
        icon: null,
        parentId: null,
        publish: true,
      },
      loading: false,
      error: null,
    };
  },
  computed: {
    totalPages() {
      return Math.ceil(this.filteredCatalogues.length / this.itemsPerPage);
    },
    startIndex() {
      return (this.currentPage - 1) * this.itemsPerPage;
    },
    endIndex() {
      return Math.min(
        this.startIndex + this.itemsPerPage,
        this.filteredCatalogues.length
      );
    },
    paginatedCatalogues() {
      return this.filteredCatalogues.slice(this.startIndex, this.endIndex);
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
    openAddModal() {
      this.isEditing = false;
      this.formData = {
        _id: null,
        name: "",
        description: "",
        icon: null,
        parentId: null,
        publish: true,
      };
      this.showAddModal = true;
    },

    async fetchCatalogues() {
      try {
        this.loading = true;
        this.error = null;
        const response = await AdminProductCatalogueService.getAll();
        if (response.data && response.data.data) {
          this.catalogues = response.data.data;
          this.filteredCatalogues = [...this.catalogues];
        } else {
          this.error = "Dữ liệu trả về không đúng định dạng";
          toast.error(this.error);
        }
      } catch (error) {
        console.error("Fetch catalogues error:", error);
        if (error.response?.status === 401) {
          this.error = "Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại";
          toast.error(this.error);
          this.$router.push("/admin/login");
        } else {
          this.error =
            "Không thể tải danh sách danh mục. Vui lòng thử lại sau.";
          toast.error(this.error);
        }
      } finally {
        this.loading = false;
      }
    },

    handleSearch() {
      this.currentPage = 1;
      if (!this.searchQuery.trim()) {
        this.filteredCatalogues = [...this.catalogues];
        return;
      }

      const query = this.searchQuery.toLowerCase().trim();
      this.filteredCatalogues = this.catalogues.filter((catalogue) =>
        catalogue.name.toLowerCase().includes(query)
      );
    },

    changePage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page;
      }
    },

    editCatalogue(catalogue) {
      this.isEditing = true;
      this.formData = { ...catalogue };
      this.showAddModal = true;
    },

    async confirmDelete(catalogue) {
      const result = await Swal.fire({
        title: "Xác nhận xóa?",
        text: `Bạn có chắc chắn muốn xóa danh mục "${catalogue.name}"?`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#ff4d4f",
        cancelButtonColor: "#d9d9d9",
        confirmButtonText: "Xóa",
        cancelButtonText: "Hủy",
      });

      if (result.isConfirmed) {
        this.handleDelete(catalogue);
      }
    },

    async handleDelete(catalogue) {
      try {
        const response = await AdminProductCatalogueService.delete(
          catalogue._id
        );
        if (response.status === 200) {
          toast.success("Xóa danh mục thành công");
          await this.fetchCatalogues();
          this.handleSearch(); // Re-apply search filter
        }
      } catch (error) {
        console.error("Delete catalogue error:", error);
        if (error.response?.status === 401) {
          toast.error("Phiên đăng nhập hết hạn");
          this.$router.push("/admin/login");
        } else {
          toast.error(
            error.response?.data?.message || "Có lỗi xảy ra khi xóa danh mục"
          );
        }
      }
    },

    async handleSubmit(formData) {
      try {
        this.loading = true;
        await this.fetchCatalogues();
        this.handleSearch(); // Re-apply search filter
        this.closeModal();
      } catch (error) {
        console.error("Submit error:", error);
        toast.error("Có lỗi xảy ra khi cập nhật danh sách");
      } finally {
        this.loading = false;
      }
    },

    handleFormError(error) {
      toast.error(error);
    },

    closeModal() {
      this.showAddModal = false;
      this.isEditing = false;
      this.formData = {
        _id: null,
        name: "",
        description: "",
        icon: null,
        parentId: null,
        publish: true,
      };
    },
  },
  created() {
    this.fetchCatalogues();
  },
};
</script>

<style scoped>
.product-catalogue-list {
  padding: 24px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.page-header h1 {
  font-size: 24px;
  font-weight: 600;
  color: #262626;
  margin: 0;
}

.add-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: #1890ff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.add-btn:hover {
  background: #40a9ff;
}

.filters-section {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
}

.search-box {
  position: relative;
  flex: 1;
  max-width: 300px;
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
  transition: all 0.3s ease;
}

.search-box input:focus {
  border-color: #40a9ff;
  outline: none;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
}

.table-container {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.loading-state,
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px;
  color: #8c8c8c;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #1890ff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.error-state i {
  font-size: 24px;
  color: #ff4d4f;
  margin-bottom: 8px;
}

.btn {
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
  border: none;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-primary {
  background: #1890ff;
  color: white;
}

.btn-primary:hover {
  background: #40a9ff;
}

.pagination-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  border-top: 1px solid #f0f0f0;
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
  min-width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  background-color: white;
  color: #666;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.page-btn:hover:not(:disabled) {
  border-color: #40a9ff;
  color: #1890ff;
}

.page-btn.active {
  background-color: #1890ff;
  border-color: #1890ff;
  color: white;
}

.page-btn:disabled {
  background-color: #f5f5f5;
  border-color: #d9d9d9;
  color: #d9d9d9;
  cursor: not-allowed;
}

.page-dots {
  color: #666;
  font-size: 14px;
}

@media (max-width: 768px) {
  .pagination-info {
    flex-direction: column;
    gap: 16px;
  }
}
</style>
