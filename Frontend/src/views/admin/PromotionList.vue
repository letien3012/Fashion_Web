<template>
  <div class="list-container">
    <div class="header">
      <h2>Quản lý khuyến mãi</h2>
      <button class="add-btn" @click="handleAdd">
        <i class="fas fa-plus"></i> Thêm khuyến mãi
      </button>
    </div>

    <div class="content">
      <div class="search-filter">
        <div class="search-box">
          <input
            type="text"
            v-model="searchQuery"
            placeholder="Tìm kiếm theo mã, tên khuyến mãi..."
            @input="handleSearch"
          />
          <i class="fas fa-search"></i>
        </div>
        <div class="filter-box">
          <select v-model="typeFilter" @change="handleFilter">
            <option value="">Tất cả loại</option>
            <option value="product">Giảm giá sản phẩm</option>
            <option value="voucher">Voucher</option>
          </select>
          <select v-model="statusFilter" @change="handleFilter">
            <option value="">Tất cả trạng thái</option>
            <option value="active">Đang áp dụng</option>
            <option value="inactive">Không áp dụng</option>
          </select>
        </div>
      </div>

      <div class="table-container">
        <PromotionTable
          :promotions="paginatedPromotions"
          :loading="loading"
          :showForm="showForm"
          :selectedPromotion="selectedPromotion"
          @edit="handleEdit"
          @delete="handleDelete"
          @saved="handleSaved"
          @close-form="closeForm"
        />

        <div class="pagination-info">
          <span class="showing-info">
            Hiển thị {{ startIndex + 1 }}-{{ endIndex }} /
            {{ filteredPromotions.length }} khuyến mãi
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

      <PromotionForm
        v-if="showForm"
        :showForm="showForm"
        :promotion="selectedPromotion"
        @close="closeForm"
        @saved="handleSaved"
      />
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from "vue";
import axios from "axios";
import { toast } from "vue3-toastify";
import PromotionTable from "../../components/admin/PromotionTable.vue";
import PromotionForm from "../../components/admin/PromotionForm.vue";

export default {
  name: "PromotionList",
  components: {
    PromotionTable,
    PromotionForm,
  },
  setup() {
    const promotions = ref([]);
    const loading = ref(false);
    const searchQuery = ref("");
    const typeFilter = ref("");
    const statusFilter = ref("");
    const showForm = ref(false);
    const selectedPromotion = ref(null);
    const currentPage = ref(1);
    const itemsPerPage = 10;
    const backendUrl = "http://localhost:3005";

    const filteredPromotions = computed(() => {
      let filtered = promotions.value;

      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase();
        filtered = filtered.filter(
          (promotion) =>
            promotion.code?.toLowerCase().includes(query) ||
            promotion.name?.toLowerCase().includes(query)
        );
      }

      if (typeFilter.value) {
        filtered = filtered.filter(
          (promotion) => promotion.type === typeFilter.value
        );
      }

      if (statusFilter.value) {
        filtered = filtered.filter(
          (promotion) => promotion.publish === statusFilter.value
        );
      }

      return filtered;
    });

    const totalPages = computed(() => {
      return Math.ceil(filteredPromotions.value.length / itemsPerPage);
    });

    const startIndex = computed(() => {
      return (currentPage.value - 1) * itemsPerPage;
    });

    const endIndex = computed(() => {
      return Math.min(
        startIndex.value + itemsPerPage,
        filteredPromotions.value.length
      );
    });

    const paginatedPromotions = computed(() => {
      return filteredPromotions.value.slice(startIndex.value, endIndex.value);
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

    const fetchPromotions = async () => {
      try {
        loading.value = true;
        const token = localStorage.getItem("token-admin");
        if (!token) {
          toast.error("Vui lòng đăng nhập để tiếp tục");
          return;
        }

        const response = await axios.get(`${backendUrl}/api/promotions`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data && response.data.data) {
          promotions.value = response.data.data;
        } else {
          toast.error("Dữ liệu trả về không đúng định dạng");
        }
      } catch (error) {
        console.error("Error fetching promotions:", error);
        if (error.response?.status === 401) {
          toast.error("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại");
        } else if (error.response?.data?.message) {
          toast.error(error.response.data.message);
        } else {
          toast.error("Không thể tải danh sách khuyến mãi");
        }
      } finally {
        loading.value = false;
      }
    };

    const handleAdd = () => {
      console.log("Opening form...");
      selectedPromotion.value = null;
      showForm.value = true;
    };

    const closeForm = () => {
      console.log("Closing form...");
      showForm.value = false;
      selectedPromotion.value = null;
    };

    const handleEdit = (promotion) => {
      console.log("Editing promotion:", promotion);
      selectedPromotion.value = promotion;
      showForm.value = true;
    };

    const handleDelete = async (promotion) => {
      try {
        const token = localStorage.getItem("token-admin");
        await axios.delete(`${backendUrl}/api/promotions/${promotion._id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Xóa khuyến mãi thành công");
        await fetchPromotions();
      } catch (error) {
        console.error("Error deleting promotion:", error);
        if (error.response?.status === 401) {
          toast.error("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại");
        } else if (error.response?.data?.message) {
          toast.error(error.response.data.message);
        } else {
          toast.error("Không thể xóa khuyến mãi");
        }
      }
    };

    const handleSaved = () => {
      console.log("Form saved, refreshing data...");
      fetchPromotions();
      closeForm();
    };

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

    onMounted(() => {
      fetchPromotions();
    });

    return {
      promotions,
      loading,
      searchQuery,
      typeFilter,
      statusFilter,
      showForm,
      selectedPromotion,
      currentPage,
      filteredPromotions,
      paginatedPromotions,
      totalPages,
      startIndex,
      endIndex,
      displayedPages,
      handleAdd,
      closeForm,
      handleEdit,
      handleDelete,
      handleSaved,
      handleSearch,
      handleFilter,
      changePage,
    };
  },
};
</script>

<style scoped>
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
  font-size: 24px;
  font-weight: 600;
  color: #1a1a1a;
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
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.add-btn:hover {
  background: #40a9ff;
}

.content {
  background: white;
  border-radius: 8px;
  /* box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); */
  overflow: hidden;
}

.search-filter {
  display: flex;
  gap: 16px;
  padding: 24px;
}

.search-box {
  position: relative;
  flex: 1;
}

.search-box input {
  width: 100%;
  padding: 8px 16px;
  padding-right: 40px;
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

.search-box i {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #8c8c8c;
}

.filter-box {
  display: flex;
  gap: 12px;
}

.filter-box select {
  padding: 8px 16px;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  font-size: 14px;
  min-width: 180px;
  background-color: white;
  cursor: pointer;
  transition: all 0.3s ease;
}

.filter-box select:focus {
  border-color: #40a9ff;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
  outline: none;
}

.table-container {
  position: relative;
}

.pagination-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
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
  .search-filter {
    flex-direction: column;
  }

  .filter-box {
    flex-wrap: wrap;
  }

  .filter-box select {
    min-width: 150px;
  }

  .pagination-info {
    flex-direction: column;
    gap: 16px;
  }
}
</style>
