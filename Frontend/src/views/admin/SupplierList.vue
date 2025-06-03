<template>
  <div class="supplier-list">
    <div class="page-header">
      <h1>Quản lý nhà cung cấp</h1>
      <button class="add-btn" @click="showForm = true">
        <i class="fas fa-plus"></i> Thêm mới
      </button>
    </div>

    <div class="filters-section">
      <div class="search-box">
        <i class="fas fa-search"></i>
        <input
          type="text"
          v-model="searchQuery"
          placeholder="Tìm kiếm theo tên nhà cung cấp..."
          @input="handleSearch"
        />
      </div>
    </div>

    <div class="table-container">
      <SupplierTable
        :suppliers="filteredSuppliers"
        :current-page="currentPage"
        :items-per-page="itemsPerPage"
        @edit="handleEdit"
        @delete="handleDelete"
      />

      <div class="pagination-info">
        <span class="showing-info">
          Hiển thị {{ startIndex + 1 }}-{{ endIndex }} /
          {{ filteredSuppliers.length }} nhà cung cấp
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

    <SupplierForm
      v-if="showForm"
      :supplier="selectedSupplier"
      @close="closeForm"
      @submit="handleSubmit"
    />
  </div>
</template>

<script>
import { ref, computed, onMounted } from "vue";
import { toast } from "vue3-toastify";
import SupplierTable from "../../components/admin/SupplierTable.vue";
import SupplierForm from "../../components/admin/SupplierForm.vue";
import { AdminSupplierService } from "../../services/admin/supplier.service";

export default {
  name: "SupplierList",
  components: {
    SupplierTable,
    SupplierForm,
  },
  setup() {
    const suppliers = ref([]);
    const showForm = ref(false);
    const selectedSupplier = ref(null);
    const searchQuery = ref("");
    const currentPage = ref(1);
    const itemsPerPage = 10;

    const fetchSuppliers = async () => {
      try {
        suppliers.value = await AdminSupplierService.getAllSuppliers();
      } catch (error) {
        console.error("Error fetching suppliers:", error);
        toast.error("Không thể tải danh sách nhà cung cấp");
      }
    };

    const filteredSuppliers = computed(() => {
      if (!searchQuery.value) return suppliers.value;

      const query = searchQuery.value.toLowerCase();
      return suppliers.value.filter((supplier) =>
        supplier.name.toLowerCase().includes(query)
      );
    });

    const totalPages = computed(() => {
      return Math.ceil(filteredSuppliers.value.length / itemsPerPage);
    });

    const startIndex = computed(() => {
      return (currentPage.value - 1) * itemsPerPage;
    });

    const endIndex = computed(() => {
      return Math.min(
        startIndex.value + itemsPerPage,
        filteredSuppliers.value.length
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

    const changePage = (page) => {
      currentPage.value = page;
    };

    const handleEdit = (supplier) => {
      selectedSupplier.value = supplier;
      showForm.value = true;
    };

    const handleDelete = async (supplierId) => {
      try {
        await AdminSupplierService.deleteSupplier(supplierId);
        suppliers.value = suppliers.value.filter((s) => s._id !== supplierId);
        toast.success("Xóa nhà cung cấp thành công");
      } catch (error) {
        console.error("Error deleting supplier:", error);
        toast.error("Không thể xóa nhà cung cấp");
      }
    };

    const closeForm = () => {
      showForm.value = false;
      selectedSupplier.value = null;
    };

    const handleSubmit = () => {
      closeForm();
      fetchSuppliers();
    };

    onMounted(() => {
      fetchSuppliers();
    });

    return {
      suppliers,
      showForm,
      selectedSupplier,
      searchQuery,
      currentPage,
      itemsPerPage,
      filteredSuppliers,
      totalPages,
      startIndex,
      endIndex,
      displayedPages,
      handleSearch,
      changePage,
      handleEdit,
      handleDelete,
      closeForm,
      handleSubmit,
    };
  },
};
</script>

<style scoped>
.supplier-list {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.page-header h1 {
  margin: 0;
  font-size: 24px;
  font-weight: 500;
  color: #262626;
}

.add-btn {
  padding: 8px 16px;
  background: #1890ff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
}

.add-btn:hover {
  background: #40a9ff;
}

.filters-section {
  margin-bottom: 24px;
  display: flex;
  gap: 16px;
}

.search-box {
  position: relative;
  flex: 1;
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

.pagination-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-top: 1px solid #f0f0f0;
}

.showing-info {
  color: #8c8c8c;
}

.pagination {
  display: flex;
  gap: 8px;
  align-items: center;
}

.page-btn {
  min-width: 32px;
  height: 32px;
  padding: 0 8px;
  border: 1px solid #d9d9d9;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.page-btn:hover:not(:disabled) {
  border-color: #1890ff;
  color: #1890ff;
}

.page-btn.active {
  background: #1890ff;
  border-color: #1890ff;
  color: white;
}

.page-btn:disabled {
  cursor: not-allowed;
  color: #d9d9d9;
}

.page-dots {
  color: #8c8c8c;
}
</style>
