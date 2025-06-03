<template>
  <div class="import-receipt-list">
    <div class="admin-list-header">
      <h2>Danh sách phiếu nhập hàng</h2>
      <div class="header-actions">
        <button class="btn btn-primary" @click="openCreateForm">
          <i class="fas fa-plus"></i> Tạo phiếu nhập mới
        </button>
      </div>
    </div>

    <div class="search-filter">
      <div class="search-box">
        <input
          type="text"
          v-model="searchQuery"
          placeholder="Tìm kiếm theo mã phiếu, nhà cung cấp..."
          @input="handleSearch"
        />
        <i class="fas fa-search"></i>
      </div>
      <div class="filter-box">
        <select v-model="statusFilter" @change="handleFilter">
          <option value="">Tất cả trạng thái</option>
          <option value="pending">Chờ xử lý</option>
          <option value="processing">Đang xử lý</option>
          <option value="completed">Hoàn thành</option>
          <option value="cancelled">Đã hủy</option>
        </select>
      </div>
    </div>

    <ImportReceiptTable
      :importReceipts="filteredReceipts"
      @edit="editReceipt"
      @delete="deleteReceipt"
      @view="viewDetails"
      @update-status="showUpdateStatusForm"
    />

    <ImportReceiptForm
      v-if="showForm"
      :receipt="selectedReceipt"
      :isViewMode="isViewMode"
      :isVisible="showForm"
      @close="closeForm"
      @saved="handleSaved"
    />
  </div>
</template>

<script>
import { ref, computed, onMounted } from "vue";
import ImportReceiptTable from "../../components/admin/ImportReceiptTable.vue";
import ImportReceiptForm from "../../components/admin/ImportReceiptForm.vue";
import axios from "axios";
import { toast } from "vue3-toastify";

export default {
  name: "ImportReceiptList",
  components: {
    ImportReceiptTable,
    ImportReceiptForm,
  },
  setup() {
    const showForm = ref(false);
    const selectedReceipt = ref(null);
    const isViewMode = ref(false);
    const importReceipts = ref([]);
    const searchQuery = ref("");
    const statusFilter = ref("");
    const backendUrl = "http://localhost:3005";

    const filteredReceipts = computed(() => {
      let filtered = importReceipts.value;

      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase();
        filtered = filtered.filter(
          (receipt) =>
            receipt.code?.toLowerCase().includes(query) ||
            receipt.supplier?.name?.toLowerCase().includes(query)
        );
      }

      if (statusFilter.value) {
        filtered = filtered.filter(
          (receipt) => receipt.status === statusFilter.value
        );
      }

      return filtered;
    });

    const fetchReceipts = async () => {
      try {
        const token = localStorage.getItem("token-admin");
        // Ensure the token is available
        if (!token) {
          toast.error("Vui lòng đăng nhập để tiếp tục");
          return;
        }

        const response = await axios.get(`${backendUrl}/api/import-receipts`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const arr = Array.isArray(response.data)
          ? response.data
          : response.data.data || [];
        importReceipts.value = arr.filter((r) => r && r._id);
      } catch (error) {
        console.error("Error fetching receipts:", error);
        if (error.response?.status === 401) {
          toast.error("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại");
        } else {
          toast.error("Không thể tải danh sách phiếu nhập");
        }
      }
    };

    const handleSearch = () => {
      // Debounce search if needed
    };

    const handleFilter = () => {
      // Additional filter logic if needed
    };

    const openCreateForm = () => {
      selectedReceipt.value = null;
      isViewMode.value = false;
      showForm.value = true;
    };

    const editReceipt = (receipt) => {
      selectedReceipt.value = { ...receipt };
      isViewMode.value = false;
      showForm.value = true;
    };

    const viewDetails = (receipt) => {
      selectedReceipt.value = { ...receipt };
      isViewMode.value = true;
      showForm.value = true;
    };

    const deleteReceipt = async (receipt) => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          toast.error("Vui lòng đăng nhập để tiếp tục");
          return;
        }

        const response = await axios.delete(
          `${backendUrl}/api/import-receipts/delete/${receipt._id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (response.status === 200) {
          toast.success("Xóa phiếu nhập thành công");
          await fetchReceipts();
        }
      } catch (error) {
        console.error("Error deleting receipt:", error);
        if (error.response?.status === 401) {
          toast.error("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại");
        } else {
          toast.error("Không thể xóa phiếu nhập");
        }
      }
    };

    const showUpdateStatusForm = (receipt) => {
      selectedReceipt.value = receipt;
      isViewMode.value = false;
      showForm.value = true;
    };

    const closeForm = () => {
      showForm.value = false;
      selectedReceipt.value = null;
      isViewMode.value = false;
    };

    const handleSaved = () => {
      closeForm();
      fetchReceipts();
    };

    onMounted(() => {
      fetchReceipts();
    });

    return {
      showForm,
      selectedReceipt,
      isViewMode,
      importReceipts,
      searchQuery,
      statusFilter,
      filteredReceipts,
      openCreateForm,
      editReceipt,
      deleteReceipt,
      viewDetails,
      showUpdateStatusForm,
      closeForm,
      handleSaved,
      handleSearch,
      handleFilter,
    };
  },
};
</script>

<style scoped>
@import "../../assets/styles/admin/list.css";

.import-receipt-list {
  padding: 24px;
}

.admin-list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.admin-list-header h2 {
  margin: 0;
  color: #333;
  font-size: 1.5rem;
  font-weight: 600;
}

.search-filter {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
}

.search-box {
  position: relative;
  flex: 1;
}

.search-box input {
  width: 100%;
  padding: 8px 16px;
  padding-right: 40px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.search-box i {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #666;
}

.filter-box select {
  padding: 8px 16px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  min-width: 200px;
}

.header-actions {
  display: flex;
  gap: 12px;
}
</style>
