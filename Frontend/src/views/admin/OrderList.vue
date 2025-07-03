<template>
  <div class="order-list">
    <div
      class="page-header"
      style="display: flex; align-items: center; justify-content: space-between"
    >
      <h1>Quản lý đơn hàng</h1>
    </div>

    <div class="filters-section">
      <div class="row">
        <div class="col-lg-8">
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
        </div>
        <div class="col-lg-2">
          <div>
            <button class="btn btn-primary" @click="showOrderAddModal = true">
              Thêm đơn hàng mới
            </button>
          </div>
        </div>
        <div class="col-lg-2">
          <div
            style="
              margin-bottom: 12px;
              display: flex;
              gap: 12px;
              align-items: center;
            "
          >
            <button
              class="btn btn-primary"
              :disabled="selectedOrderIds.length === 0"
              @click="showBulkPrintModal = true"
            >
              <i class="fas fa-print"></i> In hàng loạt ({{
                selectedOrderIds.length
              }})
            </button>
          </div>
        </div>
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
    <div class="filter-return" v-if="statusFilter === 'returned'">
      <div class="return-status-filters">
        <button
          v-for="status in returnStatuses"
          :key="status.value"
          @click="returnStatusFilter = status.value"
          :class="[
            'status-btn',
            { active: returnStatusFilter === status.value },
          ]"
        >
          {{ status.label }}
        </button>
      </div>
    </div>
    <div class="filter-return"></div>
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
        :selected-order-ids="selectedOrderIds"
        @select-order="handleSelectOrder"
        @select-all-orders="handleSelectAllOrders"
        @view="viewOrder"
        @update-status="handleUpdateStatus"
        @delete="deleteOrder"
        @process-return="handleProcessReturn"
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

    <OrderAdd
      :show="showOrderAddModal"
      @close="showOrderAddModal = false"
      @order-added="loadOrders"
    />

    <div v-if="showBulkPrintModal" class="modal-overlay" style="z-index: 2000">
      <div class="bulk-print-modal">
        <button
          class="close-btn"
          @click="closeBulkPrintModal"
          style="position: absolute; top: 16px; right: 16px"
        >
          Đóng
        </button>
        <h3>In phiếu giao hàng ({{ selectedOrderIds.length }})</h3>
        <div class="bulk-print-labels single-col">
          <div
            v-for="order in selectedOrdersForPrint"
            :key="order._id"
            class="bulk-print-label-row"
          >
            <ShippingLabel
              :order="order"
              :ref="(el) => setShippingLabelRef(order._id, el)"
            />
          </div>
        </div>
        <button
          class="btn btn-primary"
          @click="bulkExportPDF"
          style="margin-top: 24px"
        >
          <i class="fas fa-file-pdf"></i> Xuất PDF tất cả
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import OrderTable from "../../components/admin/OrderTable.vue";
import OrderDetail from "../../components/admin/OrderDetail.vue";
import OrderService from "../../services/admin/order.service";
import { toast } from "vue3-toastify";
import Swal from "sweetalert2";
import ShippingLabel from "../../components/admin/ShippingLabel.vue";
import OrderAdd from "../../components/admin/OrderAdd.vue";

export default {
  name: "OrderList",
  components: {
    OrderTable,
    OrderDetail,
    ShippingLabel,
    OrderAdd,
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
        { value: "returned", label: "Trả hàng" },
      ],
      showReturnRequests: false,
      returnStatusFilter: "",
      returnStatuses: [
        { value: "", label: "Tất cả" },
        { value: "requested", label: "Chờ xử lý" },
        { value: "approved", label: "Đã duyệt" },
        { value: "rejected", label: "Đã từ chối" },
      ],
      selectedOrderIds: [],
      showBulkPrintModal: false,
      shippingLabelRefs: {},
      showOrderAddModal: false,
    };
  },
  computed: {
    filteredOrders() {
      let filtered = this.orders;

      // Filter return requests if enabled
      if (this.statusFilter === "returned" && this.returnStatusFilter) {
        filtered = filtered.filter(
          (order) => order.actionDetail?.status === this.returnStatusFilter
        );
      }

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
    selectedOrdersForPrint() {
      return this.filteredOrders.filter((order) =>
        this.selectedOrderIds.includes(order._id)
      );
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
    async handleUpdateStatus({ orderId, newStatus, note }) {
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
          note, // log ra để kiểm tra
        });

        await OrderService.updateOrderStatus(
          orderId,
          newStatus,
          userInfo._id,
          note
        );

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
        shipping: ["delivered"],
        delivered: [],
        cancelled: [],
        returned: [],
      };
      return statusFlow[currentStatus] || [];
    },
    async handleProcessReturn(orderId, status) {
      try {
        const userInfo = JSON.parse(localStorage.getItem("employee") || "{}");
        if (!userInfo._id) {
          toast.error(
            "Không tìm thấy thông tin nhân viên. Vui lòng đăng nhập lại!"
          );
          this.$router.push("/admin/login");
          return;
        }

        const result = await Swal.fire({
          title: `Xác nhận ${
            status === "approved" ? "duyệt" : "từ chối"
          } trả hàng`,
          text: `Bạn có chắc chắn muốn ${
            status === "approved" ? "duyệt" : "từ chối"
          } yêu cầu trả hàng này?`,
          icon: status === "approved" ? "question" : "warning",
          showCancelButton: true,
          confirmButtonText: "Xác nhận",
          cancelButtonText: "Hủy",
          confirmButtonColor: status === "approved" ? "#52c41a" : "#ff4d4f",
          cancelButtonColor: "#8c8c8c",
        });

        if (result.isConfirmed) {
          await OrderService.processReturnRequest(
            orderId,
            status,
            userInfo._id
          );

          toast.success(
            `Yêu cầu trả hàng đã được ${
              status === "approved" ? "duyệt" : "từ chối"
            }`
          );

          // Refresh orders list
          await this.loadOrders();
        }
      } catch (error) {
        console.error("Error processing return request:", error);
        toast.error(
          error.response?.data?.message ||
            error.message ||
            "Không thể xử lý yêu cầu trả hàng"
        );
      }
    },
    getReturnStatusText(status) {
      const statusMap = {
        requested: "Chờ xử lý",
        approved: "Đã duyệt",
        rejected: "Đã từ chối",
      };
      return statusMap[status] || status;
    },
    getReturnStatusClass(status) {
      const statusMap = {
        requested: "status-pending",
        approved: "status-success",
        rejected: "status-cancelled",
      };
      return statusMap[status] || "";
    },
    handleSelectOrder(orderId, checked) {
      if (checked) {
        if (!this.selectedOrderIds.includes(orderId))
          this.selectedOrderIds.push(orderId);
      } else {
        this.selectedOrderIds = this.selectedOrderIds.filter(
          (id) => id !== orderId
        );
      }
    },
    handleSelectAllOrders(checked) {
      if (checked) {
        const ids = this.paginatedOrders.map((order) => order._id);
        this.selectedOrderIds = Array.from(
          new Set([...this.selectedOrderIds, ...ids])
        );
      } else {
        const ids = this.paginatedOrders.map((order) => order._id);
        this.selectedOrderIds = this.selectedOrderIds.filter(
          (id) => !ids.includes(id)
        );
      }
    },
    setShippingLabelRef(orderId, el) {
      if (el) this.shippingLabelRefs[orderId] = el.$el || el;
    },
    closeBulkPrintModal() {
      this.showBulkPrintModal = false;
      this.shippingLabelRefs = {};
    },
    async bulkExportPDF() {
      const html2pdf = (await import("html2pdf.js")).default;
      for (const order of this.selectedOrdersForPrint) {
        const el = this.shippingLabelRefs[order._id];
        if (!el) continue;
        await html2pdf()
          .from(el)
          .set({
            margin: 5,
            jsPDF: { unit: "mm", format: [170, 190], orientation: "landscape" },
          })
          .save(`shipping_${order.code || order._id}.pdf`);
      }
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

.filter-return {
  margin: 16px 0;
  padding: 8px 0;
  border-top: 1px solid #f0f0f0;
  border-bottom: 1px solid #f0f0f0;
}

.return-status-filters {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.bulk-print-modal {
  background: #fff;
  padding: 32px 24px 24px 24px;
  border-radius: 14px;
  max-width: 1200px;
  width: 95vw;
  max-height: 90vh;
  margin: 40px auto;
  position: relative;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.18);
  display: flex;
  flex-direction: column;
}

.bulk-print-modal h3 {
  margin-top: 0;
  margin-bottom: 24px;
  font-size: 2rem;
  font-weight: 600;
  text-align: left;
}

.bulk-print-labels {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 32px;
  overflow-y: auto;
  padding-bottom: 12px;
  max-height: 60vh;
}

.bulk-print-labels.single-col {
  flex-direction: column;
  align-items: center;
}

.bulk-print-label-row {
  display: flex;
  justify-content: center;
  width: 100%;
  margin-bottom: 16px;
}

.bulk-print-modal .close-btn {
  position: absolute;
  top: 16px;
  right: 16px;
  background: #f5f5f5;
  border: none;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  font-size: 1.1rem;
  color: #333;
  cursor: pointer;
  box-shadow: 0 2px 8px #0001;
  transition: background 0.2s;
}

.bulk-print-modal .close-btn:hover {
  background: #e0e0e0;
}

.bulk-print-modal .btn.btn-primary {
  margin-top: 18px;
  min-width: 180px;
  font-size: 1.1rem;
}

@media (max-width: 900px) {
  .bulk-print-modal {
    max-width: 99vw;
    padding: 16px 4px 16px 4px;
  }
  .bulk-print-labels {
    gap: 12px;
  }
}
</style>
