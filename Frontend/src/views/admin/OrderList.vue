<template>
  <div class="order-list">
    <div class="page-header">
      <h1>Quản lý đơn hàng</h1>
    </div>

    <div class="filters-section">
      <div class="status-filters">
        <button
          v-for="status in orderStatuses"
          :key="status.value"
          @click="statusFilter = status.value"
          :class="['status-btn', { active: statusFilter === status.value }]"
        >
          {{ status.label }}
        </button>
      </div>

      <div class="filter-group">
        <div class="search-box">
          <i class="fas fa-search"></i>
          <input
            type="text"
            v-model="searchQuery"
            placeholder="Tìm kiếm theo mã đơn hàng, tên khách hàng..."
            @input="handleSearch"
          />
        </div>

        <div class="date-filter">
          <input
            type="date"
            v-model="startDateFilter"
            @change="handleFilter"
            class="filter-select"
            placeholder="Từ ngày"
          />
        </div>

        <div class="date-filter">
          <input
            type="date"
            v-model="endDateFilter"
            @change="handleFilter"
            class="filter-select"
            placeholder="Đến ngày"
          />
        </div>

        <select v-model="sortBy" @change="handleSort" class="filter-select">
          <option value="">Sắp xếp theo giá</option>
          <option value="asc">Giá tăng dần</option>
          <option value="desc">Giá giảm dần</option>
        </select>
      </div>
    </div>

    <div class="table-container">
      <div v-if="isLoading" class="loading-state">
        <div class="spinner"></div>
        <p>Đang tải dữ liệu...</p>
      </div>
      <div v-else-if="error" class="error-state">
        <i class="fas fa-exclamation-circle"></i>
        <p>{{ error }}</p>
        <button class="btn btn-primary" @click="loadOrders">Thử lại</button>
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

      <div class="pagination-info">
        <span class="showing-info">
          Hiển thị {{ startIndex + 1 }}-{{ endIndex }} /
          {{ filteredOrders.length }} đơn hàng
        </span>
        <div class="pagination">
          <button
            class="page-btn"
            :disabled="currentPage === 1"
            @click="currentPage--"
          >
            <i class="fas fa-chevron-left"></i>
          </button>

          <template v-for="page in displayedPages" :key="page">
            <button
              v-if="page !== '...'"
              class="page-btn"
              :class="{ active: currentPage === page }"
              @click="currentPage = page"
            >
              {{ page }}
            </button>
            <span v-else class="page-dots">...</span>
          </template>

          <button
            class="page-btn"
            :disabled="currentPage === totalPages"
            @click="currentPage++"
          >
            <i class="fas fa-chevron-right"></i>
          </button>
        </div>
      </div>
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
      orderStatuses: [
        { value: "", label: "Tất cả" },
        { value: "pending", label: "Chờ xử lý" },
        { value: "processing", label: "Đã xác nhận" },
        { value: "shipping", label: "Đang giao hàng" },
        { value: "delivered", label: "Đã giao hàng" },
        { value: "cancelled", label: "Đã hủy" },
        { value: "returned", label: "Đã trả hàng" },
      ],
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
    startIndex() {
      return (this.currentPage - 1) * this.itemsPerPage;
    },
    endIndex() {
      return Math.min(
        this.currentPage * this.itemsPerPage,
        this.filteredOrders.length
      );
    },
    displayedPages() {
      const pages = [];
      const totalPages = this.totalPages;
      const currentPage = this.currentPage;

      if (totalPages <= 5) {
        for (let i = 1; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        if (currentPage <= 3) {
          pages.push(1, 2, 3, "...", totalPages);
        } else if (currentPage >= totalPages - 2) {
          pages.push(1, "...", totalPages - 2, totalPages - 1, totalPages);
        } else {
          pages.push(
            1,
            "...",
            currentPage - 1,
            currentPage,
            currentPage + 1,
            "...",
            totalPages
          );
        }
      }

      return pages;
    },
  },
  async created() {
    const token = localStorage.getItem("token-admin");
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
        const userInfo = JSON.parse(localStorage.getItem("employee") || "{}");
        if (!userInfo._id) {
          toast.error(
            "Không tìm thấy thông tin nhân viên. Vui lòng đăng nhập lại!"
          );
          this.$router.push("/admin/login");
          return;
        }

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
          error.response?.data?.message ||
          error.message ||
          "Không thể cập nhật trạng thái đơn hàng.";
        toast.error(errorMessage);
      }
    },
    getValidNextStatuses(currentStatus) {
      const statusFlow = {
        pending: ["processing", "cancelled"],
        processing: ["shipping", "cancelled"],
        shipping: ["delivered", "returned"],
        delivered: ["returned"],
        cancelled: [],
        returned: [],
      };
      return statusFlow[currentStatus] || [];
    },
  },
};
</script>

<style scoped>
.order-list {
  padding: 24px;
}

.page-header {
  margin-bottom: 24px;
}

.page-header h1 {
  font-size: 24px;
  font-weight: 600;
  color: #262626;
  margin: 0;
}

.filters-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 24px;
}

.status-filters {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  padding: 8px 0;
}

.search-box {
  position: relative;
  width: 100%;
  max-width: 500px;
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
  font-size: 14px;
  transition: all 0.3s;
}

.search-box input:focus {
  border-color: #40a9ff;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
  outline: none;
}

.filter-group {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.filter-select {
  padding: 8px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 14px;
  min-width: 150px;
  background: white;
  cursor: pointer;
  transition: all 0.3s;
}

.filter-select:focus {
  border-color: #40a9ff;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
  outline: none;
}

.date-filter {
  position: relative;
}

.date-filter input {
  padding: 8px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 14px;
  min-width: 150px;
  background: white;
  cursor: pointer;
  transition: all 0.3s;
}

.date-filter input:focus {
  border-color: #40a9ff;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
  outline: none;
}

.table-container {
  background: white;
  border-radius: 4px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.loading-state,
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px;
  color: #8c8c8c;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #1890ff;
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
  font-size: 24px;
  color: #ff4d4f;
  margin-bottom: 8px;
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
  font-size: 14px;
}

.pagination {
  display: flex;
  gap: 8px;
  align-items: center;
}

.page-btn {
  padding: 6px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  background: white;
  color: #262626;
  cursor: pointer;
  transition: all 0.3s;
}

.page-btn:hover:not(:disabled) {
  border-color: #40a9ff;
  color: #40a9ff;
}

.page-btn.active {
  background: #1890ff;
  border-color: #1890ff;
  color: white;
}

.page-btn:disabled {
  background: #f5f5f5;
  border-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.page-dots {
  color: #8c8c8c;
}

.btn {
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
  border: none;
}

.btn-primary {
  background: #1890ff;
  color: white;
}

.btn-primary:hover {
  background: #40a9ff;
}

.status-btn {
  padding: 8px 16px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  background: white;
  color: #262626;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 14px;
}

.status-btn:hover {
  border-color: #40a9ff;
  color: #40a9ff;
}

.status-btn.active {
  background: #1890ff;
  border-color: #1890ff;
  color: white;
}
</style>
