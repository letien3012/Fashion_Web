<template>
  <div class="list-container">
    <div class="admin-list-header">
      <h2>Quản lý đơn hàng</h2>
      <!-- <div class="header-actions">
        <button class="btn btn-primary" @click="openCreateForm">
          <i class="fas fa-plus"></i> Tạo đơn hàng mới
        </button>
      </div> -->
    </div>

    <div class="search-filter">
      <div class="search-box">
        <input
          type="text"
          v-model="searchQuery"
          placeholder="Tìm kiếm theo mã đơn hàng, tên khách hàng..."
          @input="handleSearch"
        />
        <i class="fas fa-search"></i>
      </div>
      <div class="filter-box">
        <select v-model="statusFilter" @change="handleFilter">
          <option value="">Tất cả trạng thái</option>
          <option value="pending">Chờ xử lý</option>
          <option value="processing">Đang xử lý</option>
          <option value="shipping">Đang giao hàng</option>
          <option value="delivered">Đã giao hàng</option>
          <option value="cancelled">Đã hủy</option>
          <option value="returned">Đã trả hàng</option>
        </select>

        <div class="date-filter">
          <label for="startDate">Từ ngày:</label>
          <input
            type="date"
            id="startDate"
            v-model="startDateFilter"
            @change="handleFilter"
          />
        </div>

        <div class="date-filter">
          <label for="endDate">Đến ngày:</label>
          <input
            type="date"
            id="endDate"
            v-model="endDateFilter"
            @change="handleFilter"
          />
        </div>

        <select v-model="sortBy" @change="handleSort">
          <option value="">Sắp xếp theo giá</option>
          <option value="asc">Giá tăng dần</option>
          <option value="desc">Giá giảm dần</option>
        </select>
      </div>
    </div>

    <div class="content">
      <div v-if="isLoading" class="loading-state">
        <div class="spinner"></div>
        <p>Loading orders...</p>
      </div>
      <div v-else-if="error" class="error-state">
        <i class="fas fa-exclamation-circle"></i>
        <p>{{ error }}</p>
        <button class="btn btn-primary" @click="loadOrders">Retry</button>
      </div>
      <OrderTable
        v-else
        :orders="paginatedOrders"
        :can-update-status="true"
        :can-delete="isAdmin"
        @view="viewOrder"
        @update-status="handleUpdateStatus"
        @delete="deleteOrder"
      />
    </div>

    <div class="pagination">
      <button
        class="btn btn-secondary"
        :disabled="currentPage === 1"
        @click="currentPage--"
      >
        <i class="fas fa-chevron-left"></i>
      </button>
      <span class="page-info">Trang {{ currentPage }} / {{ totalPages }}</span>
      <button
        class="btn btn-secondary"
        :disabled="currentPage === totalPages"
        @click="currentPage++"
      >
        <i class="fas fa-chevron-right"></i>
      </button>
    </div>

    <OrderDetail
      v-if="selectedOrder"
      :order="selectedOrder"
      @close="closeOrderDetail"
    />
  </div>
</template>

<script>
import OrderTable from "../../components/admin/OrderTable.vue";
import OrderDetail from "../../components/admin/OrderDetail.vue";
import OrderService from "../../services/admin/order.service";
import { toast } from "vue3-toastify";

export default {
  name: "OrderList",
  components: {
    OrderTable,
    OrderDetail,
  },
  data() {
    return {
      orders: [],
      selectedOrder: null,
      statusFilter: "",
      isAdmin: false,
      searchQuery: "",
      currentPage: 1,
      itemsPerPage: 10,
      sortBy: "",
      startDateFilter: null,
      endDateFilter: null,
      isLoading: false,
      error: null,
    };
  },
  computed: {
    filteredOrders() {
      let filtered = this.orders;

      // Lọc theo từ khóa tìm kiếm
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        filtered = filtered.filter(
          (order) =>
            order.code?.toLowerCase().includes(query) ||
            order.customer?.fullname?.toLowerCase().includes(query) ||
            order.customerId?.fullname?.toLowerCase().includes(query)
        );
      }

      // Lọc theo trạng thái
      if (this.statusFilter) {
        filtered = filtered.filter(
          (order) => order.status === this.statusFilter
        );
      }

      // Lọc theo khoảng thời gian
      if (this.startDateFilter || this.endDateFilter) {
        const start = this.startDateFilter
          ? new Date(this.startDateFilter)
          : null;
        const end = this.endDateFilter ? new Date(this.endDateFilter) : null;

        filtered = filtered.filter((order) => {
          const orderDate = new Date(order.createdAt);

          // Adjust end date to include the whole day
          if (end) {
            end.setHours(23, 59, 59, 999);
          }

          let isAfterStart = true;
          if (start) {
            isAfterStart = orderDate >= start;
          }

          let isBeforeEnd = true;
          if (end) {
            isBeforeEnd = orderDate <= end;
          }

          return isAfterStart && isBeforeEnd;
        });
      }

      // Sắp xếp theo giá
      if (this.sortBy) {
        filtered.sort((a, b) => {
          const priceA = a.total_price || 0; // Use total_price based on OrderTable.vue
          const priceB = b.total_price || 0; // Use total_price based on OrderTable.vue
          return this.sortBy === "asc" ? priceA - priceB : priceB - priceA;
        });
      }

      return filtered;
    },
    totalPages() {
      return Math.ceil(this.filteredOrders.length / this.itemsPerPage);
    },
    paginatedOrders() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.filteredOrders.slice(start, end);
    },
  },
  async created() {
    const token = localStorage.getItem("token");
    if (!token) {
      this.$router.push("/admin/login");
      return;
    }
    await this.loadOrders();
  },
  methods: {
    async loadOrders() {
      this.isLoading = true;
      this.error = null;
      try {
        console.log("Fetching all orders...");
        const response = await OrderService.getAllOrders();

        // Validate response data
        if (!response || !Array.isArray(response)) {
          throw new Error("Invalid response format from server");
        }

        // Transform and validate each order
        this.orders = response.map((order) => {
          // Ensure all required fields exist
          if (!order._id || !order.code || !order.status) {
            console.warn("Order missing required fields:", order);
          }

          // Ensure dates are properly formatted
          if (order.createdAt) {
            order.createdAt = new Date(order.createdAt);
          }
          if (order.updatedAt) {
            order.updatedAt = new Date(order.updatedAt);
          }

          return order;
        });

        console.log("Successfully loaded orders:", this.orders.length);
      } catch (error) {
        console.error("Error loading orders:", error);
        this.error =
          error.response?.data?.message ||
          error.message ||
          "Failed to load orders";

        if (error.response?.status === 401) {
          toast.error("Session expired. Please login again");
          this.$router.push("/admin/login");
        } else {
          toast.error(this.error);
        }
      } finally {
        this.isLoading = false;
      }
    },
    async viewOrder(orderId) {
      try {
        console.log("Fetching order details for:", orderId);
        const order = await OrderService.getOrderById(orderId);
        console.log("Order Details:", order);
        this.selectedOrder = order;
      } catch (error) {
        console.error("Lỗi khi tải chi tiết đơn hàng:", error);
        // Handle error
      }
    },
    closeOrderDetail() {
      this.selectedOrder = null;
    },
    async deleteOrder(orderId) {
      if (!confirm("Bạn có chắc chắn muốn xóa đơn hàng này?")) return;

      try {
        console.log("Deleting order:", orderId);
        await OrderService.deleteOrder(orderId);
        await this.loadOrders();
      } catch (error) {
        console.error("Lỗi khi xóa đơn hàng:", error);
        // Handle error
      }
    },
    handleSearch() {
      // Debounce search if needed
      console.log("Searching with query:", this.searchQuery);
      this.currentPage = 1; // Reset to first page on search
    },
    handleFilter() {
      this.currentPage = 1; // Reset to first page when filter changes
    },
    handleSort() {
      this.currentPage = 1; // Reset to first page when sorting changes
    },
    openCreateForm() {
      // Implement openCreateForm method
      console.log("Opening create form");
    },
    async handleUpdateStatus({ orderId, newStatus }) {
      try {
        const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
        console.log("Updating order status:", {
          orderId,
          newStatus,
          employeeId: userInfo._id,
        });

        await OrderService.updateOrderStatus(orderId, newStatus, userInfo._id);

        toast.success("Cập nhật trạng thái đơn hàng thành công!");

        // Cập nhật lại danh sách đơn hàng để hiển thị trạng thái mới
        await this.loadOrders();

        // Nếu chi tiết đơn hàng đang mở, cập nhật nó
        if (this.selectedOrder && this.selectedOrder._id === orderId) {
          // Tìm đơn hàng vừa cập nhật trong danh sách mới
          const updatedOrder = this.orders.find(
            (order) => order._id === orderId
          );
          if (updatedOrder) {
            this.selectedOrder = updatedOrder;
          }
        }
      } catch (error) {
        console.error("Lỗi khi cập nhật trạng thái đơn hàng:", error);
        const errorMessage =
          error.message || "Không thể cập nhật trạng thái đơn hàng.";
        toast.error(errorMessage);
      }
    },
  },
};
</script>

<style scoped>
@import "../../assets/styles/admin/list.css";

.list-container {
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

.header-actions {
  display: flex;
  gap: 12px;
}

.btn {
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
}

.btn-primary {
  background-color: #1890ff;
  color: white;
  border: none;
}

.btn-primary:hover {
  background-color: #40a9ff;
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
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 14px;
  transition: all 0.3s ease;
}

.search-box input:focus {
  outline: none;
  border-color: #1890ff;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
}

.search-box i {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #999;
  font-size: 14px;
}

.filter-box {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  align-items: center;
}

.filter-box select {
  min-width: 150px;
  padding: 8px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 14px;
  color: #333;
  background-color: white;
  cursor: pointer;
  transition: all 0.3s ease;
}

.filter-box select:focus {
  outline: none;
  border-color: #1890ff;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
}

.date-filter {
  display: flex;
  align-items: center;
  gap: 8px;
}

.date-filter label {
  font-size: 14px;
  color: #333;
  white-space: nowrap;
}

.date-filter input[type="date"] {
  padding: 8px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 14px;
  color: #333;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 150px;
}

.date-filter input[type="date"]:focus {
  outline: none;
  border-color: #1890ff;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
}

.content {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 24px;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(2px);
}

.modal-content {
  background: white;
  border-radius: 8px;
  max-width: 800px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  position: relative;
  z-index: 1001;
}

.status-modal {
  padding: 24px;
  text-align: center;
}

.status-modal h3 {
  margin-bottom: 24px;
  color: #333;
  font-size: 1.25rem;
  font-weight: 500;
}

.status-select {
  width: 100%;
  padding: 10px 16px;
  margin-bottom: 24px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 14px;
  color: #333;
  background-color: white;
  cursor: pointer;
  transition: all 0.3s ease;
}

.status-select:focus {
  outline: none;
  border-color: #1890ff;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.cancel-btn,
.confirm-btn {
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  border: none;
  font-weight: 500;
  font-size: 14px;
  transition: all 0.3s ease;
}

.cancel-btn {
  background-color: #f5f5f5;
  color: #666;
}

.confirm-btn {
  background-color: #1890ff;
  color: white;
}

.cancel-btn:hover {
  background-color: #e8e8e8;
}

.confirm-btn:hover {
  background-color: #40a9ff;
}

/* Responsive styles */
@media (max-width: 768px) {
  .search-filter {
    flex-direction: column;
  }

  .filter-box {
    flex-direction: column;
  }

  .filter-box select,
  .filter-box input[type="date"],
  .date-filter {
    width: 100%;
  }

  .admin-list-header {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }

  .header-actions {
    width: 100%;
  }

  .btn {
    width: 100%;
    justify-content: center;
  }

  .date-filter {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }

  .date-filter label {
    margin-bottom: 4px;
  }
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin-top: 24px;
  padding: 12px 0;
  background-color: #f8f9fa;
  border-top: 1px solid #eee;
  border-bottom: 1px solid #eee;
}

.page-info {
  font-size: 15px;
  color: #555;
  font-weight: 500;
}

.btn-secondary {
  background-color: #fff;
  color: #007bff;
  border: 1px solid #007bff;
  padding: 8px 15px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 4px;
}

.btn-secondary i {
  font-size: 12px;
}

.btn-secondary:hover:not(:disabled) {
  background-color: #007bff;
  color: #fff;
  border-color: #007bff;
}

.btn-secondary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  background-color: #f8f9fa;
  color: #999;
  border-color: #ddd;
}

@media (max-width: 768px) {
  .pagination {
    flex-direction: row;
    gap: 8px;
    padding: 10px 0;
  }

  .btn-secondary {
    padding: 6px 10px;
  }

  .page-info {
    font-size: 14px;
  }
}

.loading-state,
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  text-align: center;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #1890ff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.error-state i {
  font-size: 48px;
  color: #ff4d4f;
  margin-bottom: 16px;
}

.error-state p {
  color: #666;
  margin-bottom: 16px;
}
</style>
