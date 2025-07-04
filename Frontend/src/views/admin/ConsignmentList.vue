<template>
  <div class="consignment-list">
    <div class="page-header">
      <h1>Quản lý kho hàng</h1>
    </div>

    <div class="filters-section">
      <div class="search-box">
        <i class="fas fa-search"></i>
        <input
          type="text"
          v-model="searchQuery"
          placeholder="Tìm kiếm theo mã lô hàng..."
          @input="handleSearch"
        />
      </div>

      <div class="filter-group">
        <select
          class="filter-select"
          v-model="selectedProduct"
          @change="handleFilter"
        >
          <option value="">Tất cả sản phẩm</option>
          <option
            v-for="product in products"
            :key="product._id"
            :value="product._id"
          >
            {{ product.name }}
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
      </div>
    </div>

    <div class="table-container">
      <ConsignmentTable
        :consignments="filteredConsignments"
        @edit="handleEdit"
      />

      <div class="pagination-info">
        <span class="showing-info">
          Hiển thị {{ startIndex + 1 }}-{{ endIndex }} /
          {{ groupedConsignments.length }} lô hàng
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

    <ConsignmentForm
      :is-visible="showForm"
      :initial-data="selectedConsignment"
      :products="products"
      :all-consignments="consignments"
      @close="closeForm"
      @submit="handleSubmit"
    />
  </div>
</template>

<script>
import { ref, computed, onMounted } from "vue";
import { toast } from "vue3-toastify";
import axios from "axios";
import ConsignmentTable from "../../components/admin/ConsignmentTable.vue";
import ConsignmentForm from "../../components/admin/ConsignmentForm.vue";

export default {
  name: "ConsignmentList",
  components: {
    ConsignmentTable,
    ConsignmentForm,
  },
  setup() {
    const consignments = ref([]);
    const products = ref([]);
    const searchQuery = ref("");
    const selectedProduct = ref("");
    const statusFilter = ref("");
    const currentPage = ref(1);
    const itemsPerPage = 10;
    const loading = ref(false);
    const showForm = ref(false);
    const selectedConsignment = ref(null);

    const fetchConsignments = async () => {
      try {
        loading.value = true;
        const response = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/api/consignments`
        );
        consignments.value = response.data.data;
      } catch (error) {
        console.error("Error fetching consignments:", error);
        toast.error("Không thể tải danh sách lô hàng");
      } finally {
        loading.value = false;
      }
    };

    const fetchProducts = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/api/products`
        );
        products.value = response.data.data;
      } catch (error) {
        console.error("Error fetching products:", error);
        toast.error("Không thể tải danh sách sản phẩm");
      }
    };

    const filteredConsignments = computed(() => {
      let result = [...consignments.value];

      // Lọc theo mã lô hàng
      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase();
        result = result.filter((consignment) =>
          consignment.code.toLowerCase().includes(query)
        );
      }

      // Lọc theo sản phẩm
      if (selectedProduct.value) {
        result = result.filter(
          (consignment) => consignment.productId === selectedProduct.value
        );
      }

      // Lọc theo trạng thái
      if (statusFilter.value) {
        result = result.filter(
          (consignment) =>
            (statusFilter.value === "active" && consignment.publish) ||
            (statusFilter.value === "inactive" && !consignment.publish)
        );
      }

      return result;
    });

    const groupedConsignments = computed(() => {
      const groups = {};
      filteredConsignments.value.forEach((consignment) => {
        const prefix = consignment.code.split("-")[0];
        if (!groups[prefix]) {
          groups[prefix] = {
            prefix,
            consignments: [],
          };
        }
        groups[prefix].consignments.push(consignment);
      });
      return Object.values(groups);
    });

    const paginatedConsignments = computed(() => {
      return groupedConsignments.value.slice(startIndex.value, endIndex.value);
    });

    const totalPages = computed(() => {
      return Math.ceil(filteredConsignments.value.length / itemsPerPage);
    });

    const startIndex = computed(() => {
      return (currentPage.value - 1) * itemsPerPage;
    });

    const endIndex = computed(() => {
      return Math.min(
        startIndex.value + itemsPerPage,
        groupedConsignments.value.length
      );
    });

    const displayedPages = computed(() => {
      const pages = [];
      const maxVisiblePages = 5;

      if (totalPages.value <= maxVisiblePages) {
        for (let i = 1; i <= totalPages.value; i++) {
          pages.push(i);
        }
      } else {
        if (currentPage.value <= 3) {
          for (let i = 1; i <= 4; i++) {
            pages.push(i);
          }
          pages.push("...");
          pages.push(totalPages.value);
        } else if (currentPage.value >= totalPages.value - 2) {
          pages.push(1);
          pages.push("...");
          for (let i = totalPages.value - 3; i <= totalPages.value; i++) {
            pages.push(i);
          }
        } else {
          pages.push(1);
          pages.push("...");
          for (let i = currentPage.value - 1; i <= currentPage.value + 1; i++) {
            pages.push(i);
          }
          pages.push("...");
          pages.push(totalPages.value);
        }
      }

      return pages;
    });

    const handleSearch = () => {
      currentPage.value = 1;
    };

    const handleFilter = () => {
      currentPage.value = 1;
    };

    const changePage = (page) => {
      if (page >= 1 && page <= totalPages.value) {
        currentPage.value = page;
      }
    };

    const handleEdit = (consignment) => {
      selectedConsignment.value = consignment;
      showForm.value = true;
    };

    const closeForm = () => {
      showForm.value = false;
      selectedConsignment.value = null;
    };

    const handleSubmit = async (formData) => {
      try {
        const publishStatus =
          formData.publish === true || formData.publish === "true";
        await axios.put(
          `${import.meta.env.VITE_API_BASE_URL}/api/consignments/${formData._id}/publish`,
          { publish: publishStatus }
        );
        toast.success("Cập nhật trạng thái lô hàng thành công");
        closeForm();
        await fetchConsignments();
      } catch (error) {
        console.error("Error saving consignment:", error);
        toast.error("Không thể lưu lô hàng");
      }
    };

    onMounted(() => {
      fetchConsignments();
      fetchProducts();
    });

    return {
      consignments,
      products,
      searchQuery,
      selectedProduct,
      statusFilter,
      currentPage,
      loading,
      showForm,
      selectedConsignment,
      filteredConsignments,
      groupedConsignments,
      paginatedConsignments,
      totalPages,
      startIndex,
      endIndex,
      displayedPages,
      handleSearch,
      handleFilter,
      changePage,
      handleEdit,
      closeForm,
      handleSubmit,
    };
  },
};
</script>

<style scoped>
.consignment-list {
  padding: 24px;
}

.page-header {
  margin-bottom: 24px;
}

.page-header h1 {
  font-size: 24px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
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
  min-width: 250px;
}

.search-box i {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #999;
}

.search-box input {
  width: 100%;
  padding: 8px 12px 8px 36px;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  font-size: 14px;
  transition: all 0.3s ease;
}

.search-box input:focus {
  border-color: #40a9ff;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
  outline: none;
}

.filter-group {
  display: flex;
  gap: 12px;
  align-items: center;
}

.filter-select {
  padding: 8px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  font-size: 14px;
  min-width: 180px;
  background-color: white;
  cursor: pointer;
  transition: all 0.3s ease;
}

.filter-select:focus {
  border-color: #40a9ff;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
  outline: none;
}

.table-container {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
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
  .filters-section {
    flex-direction: column;
  }

  .filter-group {
    flex-wrap: wrap;
  }

  .filter-select {
    min-width: 150px;
  }

  .pagination-info {
    flex-direction: column;
    gap: 16px;
  }
}
</style>
