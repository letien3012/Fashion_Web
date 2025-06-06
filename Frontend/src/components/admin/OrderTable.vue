<template>
  <div class="table-container">
    <table>
      <thead>
        <tr>
          <th>Mã đơn hàng</th>
          <th>Khách hàng</th>
          <th>Tổng tiền</th>
          <th>Phương thức</th>
          <th>Trạng thái hiện tại</th>
          <th>Ngày tạo</th>
          <th>Thao tác</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="order in orders" :key="order._id">
          <td>{{ order.code || order._id }}</td>
          <td>
            <div class="customer-info">
              <span>{{
                order.customer?.fullname || order.customerId?.fullname
              }}</span>
              <small>{{
                order.customer?.email || order.customerId?.email
              }}</small>
            </div>
          </td>
          <td>{{ formatPrice(order.total_price) }}</td>
          <td>{{ formatPaymentMethod(order.method) }}</td>
          <td>
            <span :class="['status', getStatusClass(order.status)]">
              {{ formatStatus(order.status) }}
            </span>
          </td>
          <td>{{ formatDate(order.createdAt) }}</td>
          <td>
            <div class="actions">
              <div v-if="canUpdateStatus" class="status-actions">
                <button
                  v-for="nextStatus in getValidNextStatuses(order.status)"
                  :key="nextStatus"
                  @click="
                    handleStatusChange(
                      { target: { value: nextStatus } },
                      order._id
                    )
                  "
                  :class="['status-btn', getStatusClass(nextStatus)]"
                >
                  {{ formatStatus(nextStatus) }}
                </button>
              </div>
              <div class="action-buttons">
                <button class="view-btn" @click="$emit('view', order._id)">
                  <i class="fas fa-eye"></i>
                </button>
                <button
                  v-if="canDelete"
                  class="delete-btn"
                  @click="$emit('delete', order._id)"
                >
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </div>
          </td>
        </tr>
        <tr v-if="orders.length === 0">
          <td colspan="7" class="text-center">Chưa có dữ liệu</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import Swal from "sweetalert2";

export default {
  name: "OrderTable",
  props: {
    orders: {
      type: Array,
      required: true,
    },
    canUpdateStatus: {
      type: Boolean,
      default: false,
    },
    canDelete: {
      type: Boolean,
      default: false,
    },
  },
  methods: {
    formatPrice(price) {
      if (!price) return "0 ₫";
      return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }).format(price);
    },
    formatDate(date) {
      if (!date) return "";
      return new Date(date).toLocaleDateString("vi-VN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    },
    formatStatus(status) {
      const statusMap = {
        pending: "Chờ xử lý",
        processing: "Đã xác nhận",
        shipping: "Đang giao hàng",
        delivered: "Đã giao hàng",
        cancelled: "Đã hủy",
        returned: "Đã trả hàng",
      };
      return statusMap[status] || status;
    },
    formatPaymentMethod(method) {
      const methodMap = {
        COD: "Thanh toán khi nhận hàng",
        ONLINE: "Thanh toán online",
      };
      return methodMap[method] || method;
    },
    getStatusClass(status) {
      const classMap = {
        pending: "status-pending",
        processing: "status-processing",
        shipping: "status-shipping",
        delivered: "status-delivered",
        cancelled: "status-cancelled",
        returned: "status-returned",
      };
      return classMap[status] || "";
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
    async handleStatusChange(event, orderId) {
      const newStatus = event.target.value;

      const result = await Swal.fire({
        title: "Xác nhận thay đổi trạng thái?",
        text: `Bạn có chắc chắn muốn chuyển trạng thái đơn hàng sang "${this.formatStatus(
          newStatus
        )}"?`,
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Xác nhận",
        cancelButtonText: "Hủy",
        confirmButtonColor: "#1890ff",
        cancelButtonColor: "#ff4d4f",
      });

      if (result.isConfirmed) {
        this.$emit("update-status", { orderId, newStatus });
      }
    },
  },
};
</script>

<style scoped>
.table-container {
  width: 100%;
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  background: white;
}

th {
  background: #fafafa;
  padding: 12px 16px;
  text-align: left;
  font-weight: 500;
  color: #262626;
  border-bottom: 1px solid #f0f0f0;
}

td {
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
  color: #262626;
}

.customer-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.customer-info span {
  font-weight: 500;
  color: #1890ff;
}

.customer-info small {
  color: #8c8c8c;
  font-size: 0.9em;
}

.status-container {
  display: flex;
  align-items: center;
}

.status-buttons {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.current-status {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  display: inline-block;
}

.next-status-buttons {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.status-btn {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  border: 1px solid transparent;
  transition: all 0.3s;
  white-space: nowrap;
}

.status-btn:hover {
  opacity: 0.8;
}

.status-pending {
  color: #d46b08;
}

.status-processing {
  color: #096dd9;
}

.status-shipping {
  color: #389e0d;
}

.status-delivered {
  color: #531dab;
}

.status-cancelled {
  color: #cf1322;
}

.status-returned {
  color: #595959;
}

.actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.status-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.view-btn,
.delete-btn {
  padding: 6px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.view-btn {
  background: #e6f7ff;
  color: #1890ff;
}

.view-btn:hover {
  background: #bae7ff;
}

.delete-btn {
  background: #fff1f0;
  color: #ff4d4f;
}

.delete-btn:hover {
  background: #ffccc7;
}

.text-center {
  text-align: center;
  color: #8c8c8c;
  padding: 24px;
}

tr:hover {
  background: #fafafa;
}

.no-next-status,
.no-permission {
  color: #8c8c8c;
  font-size: 14px;
  font-style: italic;
}
</style>
