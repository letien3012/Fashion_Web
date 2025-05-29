<template>
  <div class="list-container">
    <div class="header">
      <h2>Quản lý danh mục thuộc tính</h2>
      <button class="add-btn" @click="openAddModal">
        <i class="fas fa-plus"></i> Thêm danh mục
      </button>
    </div>

    <div class="content">
      <AttributeCatalogueTable
        :catalogues="catalogues"
        :loading="loading"
        @edit="editCatalogue"
        @delete="confirmDelete"
      />

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
    };
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
        const response = await AdminAttributeCatalogueService.getAll();
        if (response.data && response.data.data) {
          this.catalogues = response.data.data;
        } else {
          toast.error("Dữ liệu trả về không đúng định dạng");
        }
      } catch (error) {
        console.error("Fetch catalogues error:", error);
        if (error.response?.status === 401) {
          toast.error("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại");
          this.$router.push("/admin/login");
        } else {
          toast.error(
            "Không thể tải danh sách danh mục. Vui lòng thử lại sau."
          );
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
  },
};
</script>

<style scoped>
@import "../../assets/styles/admin/common.css";

.list-container {
  padding: 24px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.header h2 {
  margin: 0;
  color: #333;
  font-size: 1.5rem;
}

.add-btn {
  padding: 8px 16px;
  background-color: #1890ff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.add-btn:hover {
  opacity: 0.8;
}

.content {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 24px;
}
</style>
