<template>
  <div class="list-container">
    <div class="header">
      <h2>Quản lý danh mục sản phẩm</h2>
      <button class="add-btn" @click="openAddModal">
        <i class="fas fa-plus"></i> Thêm danh mục
      </button>
    </div>

    <div class="content">
      <ProductCatalogueTable
        :catalogues="catalogues"
        @edit="editCatalogue"
        @delete="confirmDelete"
      />

      <ProductCatalogueForm
        :show="showAddModal"
        :is-editing="isEditing"
        :initial-data="formData"
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
      showAddModal: false,
      isEditing: false,
      formData: {
        id: null,
        name: "",
        description: "",
        icon: null,
        parentId: null,
      },
    };
  },
  methods: {
    openAddModal() {
      this.isEditing = false;
      this.formData = {
        id: null,
        name: "",
        description: "",
        icon: null,
        parentId: null,
      };
      this.showAddModal = true;
    },

    async fetchCatalogues() {
      try {
        const response = await AdminProductCatalogueService.getAll();
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
          this.fetchCatalogues();
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
        let response;

        if (this.isEditing) {
          // Update existing catalogue
          response = await AdminProductCatalogueService.update(formData.id, {
            name: formData.name.trim(),
          });

          if (response.status === 200) {
            toast.success("Cập nhật danh mục thành công");
            this.closeModal();
            await this.fetchCatalogues();
          }
        } else {
          // Add new catalogue
          response = await AdminProductCatalogueService.add({
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

    handleFormError(error) {
      toast.error(error);
    },

    closeModal() {
      this.showAddModal = false;
      this.isEditing = false;
      this.formData = {
        id: null,
        name: "",
        description: "",
        icon: null,
        parentId: null,
      };
    },
  },
  created() {
    this.fetchCatalogues();
  },
};
</script>

<style scoped>
@import "../../assets/styles/admin/list.css";
</style>
