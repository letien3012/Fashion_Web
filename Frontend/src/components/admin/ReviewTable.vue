<template>
  <div class="table-container">
    <div class="table-header">
      <div class="search-filter">
        <div class="search-box">
          <input
            type="text"
            v-model="searchQuery"
            placeholder="Tìm kiếm theo tên khách hàng..."
            @input="handleSearch"
          />
          <i class="fas fa-search"></i>
        </div>
        <div class="filter-box">
          <select v-model="filterRating" @change="handleFilter">
            <option value="">Tất cả đánh giá</option>
            <option value="5">5 sao</option>
            <option value="4">4 sao</option>
            <option value="3">3 sao</option>
            <option value="2">2 sao</option>
            <option value="1">1 sao</option>
          </select>
        </div>
      </div>
    </div>

    <div class="table-content">
      <table>
        <thead>
          <tr>
            <th>Khách hàng</th>
            <th>Sản phẩm</th>
            <th>Đánh giá</th>
            <th>Nội dung</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
            <td colspan="5" class="loading">Đang tải...</td>
          </tr>
          <tr v-else-if="filteredReviews.length === 0">
            <td colspan="5" class="no-data">Không có đánh giá nào</td>
          </tr>
          <tr v-for="review in filteredReviews" :key="review._id">
            <td>
              <div class="customer-info">
                <span class="customer-name">{{
                  review.customerId?.fullname || "Khách hàng"
                }}</span>
                <span class="customer-email">{{
                  review.customerId?.email || ""
                }}</span>
              </div>
            </td>
            <td>{{ review.productId?.name }}</td>
            <td>
              <div class="rating">
                <span
                  v-for="n in 5"
                  :key="n"
                  :class="{ 'star-filled': n <= review.star }"
                  >★</span
                >
              </div>
            </td>
            <td>{{ review.content }}</td>
            <td>
              <div class="actions">
                <button
                  class="reply-btn"
                  @click="$emit('reply', review)"
                  title="Phản hồi"
                >
                  <i class="fas fa-reply"></i>
                </button>
                <button
                  class="delete-btn"
                  @click="confirmDelete(review._id)"
                  title="Xóa"
                >
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import { ref, computed } from "vue";
import { toast } from "vue3-toastify";

export default {
  name: "ReviewTable",
  props: {
    reviews: {
      type: Array,
      required: true,
    },
    loading: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["refresh", "delete", "reply"],
  setup(props, { emit }) {
    const searchQuery = ref("");
    const filterRating = ref("");

    const filteredReviews = computed(() => {
      let result = [...props.reviews];

      // Lọc theo tên khách hàng
      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase();
        result = result.filter(
          (review) =>
            review.customerId?.fullname?.toLowerCase().includes(query) ||
            review.customerId?.email?.toLowerCase().includes(query)
        );
      }

      // Lọc theo số sao
      if (filterRating.value) {
        result = result.filter(
          (review) => review.star === parseInt(filterRating.value)
        );
      }

      return result;
    });

    const handleSearch = () => {
      // Có thể thêm debounce ở đây nếu cần
    };

    const handleFilter = () => {
      // Có thể thêm logic xử lý filter ở đây nếu cần
    };

    const confirmDelete = (reviewId) => {
      if (confirm("Bạn có chắc chắn muốn xóa đánh giá này?")) {
        emit("delete", reviewId);
      }
    };

    return {
      searchQuery,
      filterRating,
      filteredReviews,
      handleSearch,
      handleFilter,
      confirmDelete,
    };
  },
};
</script>

<style scoped>
.table-container {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.table-header {
  padding: 16px;
  border-bottom: 1px solid #e8e8e8;
}

.search-filter {
  display: flex;
  gap: 16px;
  align-items: center;
}

.search-box {
  position: relative;
  flex: 1;
}

.search-box input {
  width: 100%;
  padding: 8px 32px 8px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 14px;
}

.search-box i {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: #999;
}

.filter-box select {
  padding: 8px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 14px;
  min-width: 150px;
}

.table-content {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th,
td {
  padding: 12px 16px;
  text-align: left;
  border-bottom: 1px solid #e8e8e8;
}

th {
  background: #fafafa;
  font-weight: 500;
}

.loading,
.no-data {
  text-align: center;
  color: #999;
  padding: 24px;
}

.customer-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.customer-name {
  font-weight: 500;
}

.customer-email {
  font-size: 0.875rem;
  color: #666;
}

.rating {
  display: flex;
  gap: 2px;
}

.star-filled {
  color: #ffd700;
}

.actions {
  display: flex;
  gap: 8px;
}

.reply-btn,
.delete-btn {
  background: none;
  border: none;
  padding: 4px 8px;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.3s;
}

.reply-btn {
  color: #1890ff;
}

.delete-btn {
  color: #ff4d4f;
}

.reply-btn:hover {
  background: #e6f7ff;
}

.delete-btn:hover {
  background: #fff1f0;
}
</style>
