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

      <PromotionTable
        :promotions="filteredPromotions"
        :loading="loading"
        :showForm="showForm"
        :selectedPromotion="selectedPromotion"
        @edit="handleEdit"
        @delete="handleDelete"
        @saved="handleSaved"
        @close-form="closeForm"
      />

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
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';
import { toast } from 'vue3-toastify';
import PromotionTable from '../../components/admin/PromotionTable.vue';
import PromotionForm from '../../components/admin/PromotionForm.vue';

export default {
  name: 'PromotionList',
  components: {
    PromotionTable,
    PromotionForm
  },
  setup() {
    const promotions = ref([]);
    const loading = ref(false);
    const searchQuery = ref('');
    const typeFilter = ref('');
    const statusFilter = ref('');
    const showForm = ref(false);
    const selectedPromotion = ref(null);
    const backendUrl = 'http://localhost:3005';

    const filteredPromotions = computed(() => {
      let filtered = promotions.value;

      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase();
        filtered = filtered.filter(promotion => 
          promotion.code?.toLowerCase().includes(query) ||
          promotion.name?.toLowerCase().includes(query)
        );
      }

      if (typeFilter.value) {
        filtered = filtered.filter(promotion => promotion.type === typeFilter.value);
      }

      if (statusFilter.value) {
        filtered = filtered.filter(promotion => promotion.publish === statusFilter.value);
      }

      return filtered;
    });

    const fetchPromotions = async () => {
      try {
        loading.value = true;
        const token = localStorage.getItem('token');
        if (!token) {
          toast.error('Vui lòng đăng nhập để tiếp tục');
          return;
        }

        const response = await axios.get(`${backendUrl}/api/promotions`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data && response.data.data) {
          promotions.value = response.data.data;
        } else {
          toast.error('Dữ liệu trả về không đúng định dạng');
        }
      } catch (error) {
        console.error('Error fetching promotions:', error);
        if (error.response?.status === 401) {
          toast.error('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại');
        } else {
          toast.error('Không thể tải danh sách khuyến mãi');
        }
      } finally {
        loading.value = false;
      }
    };

    const handleAdd = () => {
      console.log('Opening form...');
      selectedPromotion.value = null;
      showForm.value = true;
    };

    const closeForm = () => {
      console.log('Closing form...');
      showForm.value = false;
      selectedPromotion.value = null;
    };

    const handleEdit = (promotion) => {
      console.log('Editing promotion:', promotion);
      selectedPromotion.value = promotion;
      showForm.value = true;
    };

    const handleDelete = async (promotion) => {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`${backendUrl}/api/promotions/${promotion._id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Xóa khuyến mãi thành công');
        await fetchPromotions();
      } catch (error) {
        console.error('Error deleting promotion:', error);
        if (error.response?.status === 401) {
          toast.error('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại');
        } else {
          toast.error('Không thể xóa khuyến mãi');
        }
      }
    };

    const handleSaved = () => {
      console.log('Form saved, refreshing data...');
      fetchPromotions();
      closeForm();
    };

    const handleSearch = () => {
      // Debounce search if needed
    };

    const handleFilter = () => {
      // Additional filter logic if needed
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
      filteredPromotions,
      handleAdd,
      closeForm,
      handleEdit,
      handleDelete,
      handleSaved,
      handleSearch,
      handleFilter
    };
  }
};
</script>

<style scoped>
@import '../../assets/styles/admin/list.css';

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

.filter-box {
  display: flex;
  gap: 12px;
}

.filter-box select {
  padding: 8px 16px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  min-width: 180px;
}
</style> 