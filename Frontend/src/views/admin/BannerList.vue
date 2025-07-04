<template>
  <div class="banner-list">
    <div class="page-header">
      <h1>Quản lý banner</h1>
      <button class="add-btn" @click="openForm">
        <i class="fas fa-plus"></i>
        Thêm banner mới
      </button>
    </div>

    <div class="filters-section">
      <div class="search-box">
        <i class="fas fa-search"></i>
        <input
          type="text"
          v-model="searchQuery"
          placeholder="Tìm kiếm theo tên..."
          @input="handleSearch"
        />
      </div>

      <div class="filter-group">
        <select
          class="filter-select"
          v-model="filterType"
          @change="handleFilter"
        >
          <option value="">Tất cả loại banner</option>
          <option value="main">Banner chính</option>
          <option value="sub">Banner phụ</option>
          <option value="promotion">Khuyến mãi</option>
        </select>

        <select
          class="filter-select"
          v-model="filterStatus"
          @change="handleFilter"
        >
          <option value="">Tất cả trạng thái</option>
          <option value="true">Đang hiển thị</option>
          <option value="false">Đang ẩn</option>
        </select>
      </div>
    </div>

    <BannerTable
      :banners="paginatedBanners"
      :backendUrl="backendUrl"
      @edit="editBanner"
      @delete="confirmDelete"
    />

    <div class="pagination-info">
      <span class="showing-info">
        Hiển thị {{ paginationInfo.start }} - {{ paginationInfo.end }} của
        {{ filteredBanners.length }} kết quả
      </span>
      <div class="pagination">
        <button
          class="page-btn"
          :disabled="currentPage === 1"
          @click="changePage(currentPage - 1)"
        >
          <i class="fas fa-chevron-left"></i>
        </button>

        <template v-for="page in totalPages" :key="page">
          <button
            class="page-btn"
            :class="{ active: currentPage === page }"
            @click="changePage(page)"
          >
            {{ page }}
          </button>
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

    <BannerForm
      :show="showForm"
      :isEditing="isEditing"
      :banner="formData"
      :backendUrl="backendUrl"
      @close="closeForm"
      @submit="handleSubmit"
      @error="handleError"
    />
  </div>
</template>

<script>
import axios from "axios";
import { toast } from "vue3-toastify";
import "vue3-toastify/dist/index.css";
import BannerTable from "../../components/admin/BannerTable.vue";
import BannerForm from "../../components/admin/BannerForm.vue";

export default {
  name: "BannerList",
  components: {
    BannerTable,
    BannerForm,
  },
  data() {
    return {
      banners: [],
      showForm: false,
      isEditing: false,
      formData: {
        name: "",
        type: "main",
        content: "",
        image: null,
        publish: true,
      },
      backendUrl: import.meta.env.VITE_API_BASE_URL,
      searchQuery: "",
      filterType: "",
      filterStatus: "",
      currentPage: 1,
      itemsPerPage: 10,
    };
  },
  computed: {
    filteredBanners() {
      return this.banners.filter((banner) => {
        const matchesSearch = banner.name
          .toLowerCase()
          .includes(this.searchQuery.toLowerCase());
        const matchesType = !this.filterType || banner.type === this.filterType;
        const matchesStatus =
          !this.filterStatus || banner.publish.toString() === this.filterStatus;
        return matchesSearch && matchesType && matchesStatus;
      });
    },
    paginatedBanners() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.filteredBanners.slice(start, end);
    },
    totalPages() {
      return Math.ceil(this.filteredBanners.length / this.itemsPerPage);
    },
    paginationInfo() {
      const start = (this.currentPage - 1) * this.itemsPerPage + 1;
      const end = Math.min(
        start + this.itemsPerPage - 1,
        this.filteredBanners.length
      );
      return { start, end };
    },
  },
  async created() {
    await this.fetchBanners();
  },
  methods: {
    async fetchBanners() {
      try {
        const token = localStorage.getItem("token-admin");
        if (!token) {
          toast.error("Vui lòng đăng nhập để tiếp tục");
          this.$router.push("/admin/login");
          return;
        }

        const response = await axios.get(`${this.backendUrl}/api/banners`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        this.banners = response.data.data;
      } catch (error) {
        toast.error(
          error.response?.data?.message || "Lỗi khi tải danh sách banner"
        );
      }
    },

    openForm() {
      this.isEditing = false;
      this.formData = {
        name: "",
        type: "main",
        content: "",
        image: null,
        publish: true,
      };
      this.showForm = true;
    },

    closeForm() {
      this.showForm = false;
      this.formData = {
        name: "",
        type: "main",
        content: "",
        image: null,
        publish: true,
      };
    },

    editBanner(banner) {
      this.isEditing = true;
      this.formData = { ...banner };
      this.showForm = true;
    },

    async handleSubmit(formData) {
      try {
        const token = localStorage.getItem("token-admin");

        // Tạo object dữ liệu để gửi
        const bannerData = {
          name: formData.name,
          type: formData.type,
          content: formData.content || "",
          publish: formData.publish,
          image: formData.image, // Gửi base64 image trực tiếp
        };

        if (this.isEditing) {
          const response = await axios.put(
            `${this.backendUrl}/api/banners/update/${formData._id}`,
            bannerData,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          );
          toast.success("Cập nhật banner thành công");
        } else {
          const response = await axios.post(
            `${this.backendUrl}/api/banners/add`,
            bannerData,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          );
          toast.success("Thêm banner mới thành công");
        }

        await this.fetchBanners();
        this.closeForm();
      } catch (error) {
        toast.error(error.response?.data?.message || "Lỗi khi lưu banner");
      }
    },

    async confirmDelete(banner) {
      if (confirm(`Bạn có chắc chắn muốn xóa banner "${banner.name}"?`)) {
        try {
          const token = localStorage.getItem("token-admin");
          await axios.delete(
            `${this.backendUrl}/api/banners/delete/${banner._id}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          toast.success("Xóa banner thành công");
          await this.fetchBanners();
        } catch (error) {
          toast.error(error.response?.data?.message || "Lỗi khi xóa banner");
        }
      }
    },

    handleError(message) {
      toast.error(message);
    },

    handleSearch() {
      this.currentPage = 1;
    },

    handleFilter() {
      this.currentPage = 1;
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
.banner-list {
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

.pagination-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  border-top: 1px solid #f0f0f0;
  margin-top: 16px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
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
