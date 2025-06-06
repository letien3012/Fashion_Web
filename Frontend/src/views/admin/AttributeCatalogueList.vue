<template>
  <div class="catalogue-list">
    <div class="page-header">
      <h1>Quản lý danh mục thuộc tính</h1>
      <button class="btn btn-primary" @click="openAddModal">
        <i class="fas fa-plus"></i> Thêm danh mục
      </button>
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
      <AttributeCatalogueTable
        v-else
        :catalogues="paginatedCatalogues"
        :loading="loading"
        @edit="editCatalogue"
        @delete="confirmDelete"
      />

      <div class="pagination-info">
        <span class="showing-info">
          Hiển thị {{ startIndex + 1 }}-{{ endIndex }} /
          {{ catalogues.length }} danh mục
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

    <AttributeCatalogueForm
      :show="showModal"
      :is-editing="isEditing"
      :initial-data="formData"
      :loading="loading"
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
import AttributeCatalogueTable from "../../components/admin/AttributeCatalogueTable.vue";
import AttributeCatalogueForm from "../../components/admin/AttributeCatalogueForm.vue";
import AdminAttributeCatalogueService from "../../services/admin/attributeCatalogue.service";

export default {
  name: "AttributeCatalogueList",
  components: {
    AttributeCatalogueTable,
    AttributeCatalogueForm,
  },
  data() {
    return {
      catalogues: [],
      showModal: false,
      isEditing: false,
      formData: {
        id: null,
        name: "",
      },
      loading: false,
      error: null,
      currentPage: 1,
      itemsPerPage: 10,
    };
  },
  computed: {
    totalPages() {
      return Math.ceil(this.catalogues.length / this.itemsPerPage);
    },
    startIndex() {
      return (this.currentPage - 1) * this.itemsPerPage;
    },
    endIndex() {
      return Math.min(
        this.startIndex + this.itemsPerPage,
        this.catalogues.length
      );
    },
    paginatedCatalogues() {
      const start = this.startIndex;
      const end = this.endIndex;
      return this.catalogues.slice(start, end);
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
  created() {
    this.fetchCatalogues();
  },
  methods: {
    openAddModal() {
      this.isEditing = false;
      this.formData = {
        id: null,
        name: "",
      };
      this.showModal = true;
    },

    editCatalogue(catalogue) {
      if (!catalogue || !catalogue._id) {
        toast.error("Dữ liệu không hợp lệ");
        return;
      }

      this.isEditing = true;
      this.formData = {
        id: catalogue._id,
        name: catalogue.name,
      };
      this.showModal = true;
    },

    closeModal() {
      this.showModal = false;
      this.isEditing = false;
      this.formData = {
        id: null,
        name: "",
      };
    },

    async fetchCatalogues() {
      try {
        this.loading = true;
        this.error = null;
        const response = await AdminAttributeCatalogueService.getAll();
        if (response.data && response.data.data) {
          this.catalogues = response.data.data;
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

    async confirmDelete(catalogue) {
      const result = await Swal.fire({
        title: "Xác nhận xóa?",
        text: "Bạn có chắc chắn muốn xóa danh mục này?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Xóa",
        cancelButtonText: "Hủy",
        showLoaderOnConfirm: true,
        preConfirm: async () => {
          try {
            await AdminAttributeCatalogueService.delete(catalogue._id);
            return true;
          } catch (error) {
            Swal.showValidationMessage(
              error.response?.data?.message || error.message
            );
          }
        },
        allowOutsideClick: () => !Swal.isLoading(),
      });

      if (result.isConfirmed) {
        toast.success("Xóa danh mục thành công");
        await this.fetchCatalogues();
      }
    },

    async handleSubmit(formData) {
      try {
        this.loading = true;
        let response;

        if (this.isEditing) {
          // Update existing catalogue
          response = await AdminAttributeCatalogueService.update(formData.id, {
            name: formData.name.trim(),
          });

          if (response.status === 200) {
            toast.success("Cập nhật danh mục thành công");
            this.closeModal();
            await this.fetchCatalogues();
          }
        } else {
          // Add new catalogue
          response = await AdminAttributeCatalogueService.add({
            name: formData.name.trim(),
          });

          if (response.status === 201) {
            toast.success("Thêm danh mục thành công");
            this.closeModal();
            await this.fetchCatalogues();
          }
        }
      } catch (error) {
        console.error("Submit error:", error);
        if (error.response?.status === 401) {
          toast.error("Phiên đăng nhập đã hết hạn");
          this.$router.push("/admin/login");
        } else if (error.response?.data?.message) {
          toast.error(error.response.data.message);
        } else {
          toast.error("Có lỗi xảy ra. Vui lòng thử lại sau.");
        }
      } finally {
        this.loading = false;
      }
    },

    handleFormError(message) {
      toast.error(message);
    },

    changePage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page;
      }
    },
  },
};
</script>

<style scoped>
.catalogue-list {
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

.table-container {
  background: white;
  border-radius: 4px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
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
