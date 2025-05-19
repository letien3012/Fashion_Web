<template>
  <div class="product-list">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2>Quản lý sản phẩm</h2>
      <button class="btn btn-primary" @click="openForm">
        Thêm sản phẩm mới
      </button>
    </div>

    <ProductTable
      :products="products"
      :catalogues="attributeCatalogues"
      :loading="loading"
      @edit="handleEdit"
      @delete="handleDelete"
    />

    <ProductForm
      v-if="showForm"
      :product="selectedProduct"
      :attribute-catalogues="attributeCatalogues"
      :product-catalogues="productCatalogues"
      @close="closeForm"
      @submit="handleSubmit"
    />
  </div>
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
      backendUrl: "http://localhost:3005"
    };
  },
  methods: {
    async fetchProducts() {
      try {
        this.loading = true;
        const token = localStorage.getItem("token");
        if (!token) {
          toast.error("Vui lòng đăng nhập để tiếp tục");
          this.$router.push("/admin/login");
          return;
        }

        const response = await axios.get(`${this.backendUrl}/api/products`, {
          headers: { Authorization: `Bearer ${token}` }
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
          toast.error("Không thể tải danh sách sản phẩm. Vui lòng thử lại sau.");
        }
      } finally {
        this.loading = false;
      }
    },

    async fetchProductCatalogues() {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`${this.backendUrl}/api/productCatalogues`, {
          headers: { Authorization: `Bearer ${token}` }
        });

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
          toast.error("Không thể tải danh sách danh mục. Vui lòng thử lại sau.");
        }
      }
    },

    async fetchAttributeCatalogues() {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`${this.backendUrl}/api/attributeCatalogues`, {
          headers: { Authorization: `Bearer ${token}` }
        });

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
          toast.error("Không thể tải danh sách thuộc tính. Vui lòng thử lại sau.");
        }
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
          headers: { Authorization: `Bearer ${token}` }
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
    }
  },
  created() {
    this.fetchProducts();
    this.fetchProductCatalogues();
    this.fetchAttributeCatalogues();
  }
};
</script>

<style scoped>
.product-list {
  padding: 20px;
}
</style>
