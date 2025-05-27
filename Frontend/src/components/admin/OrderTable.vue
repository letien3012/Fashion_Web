<template>
  <div class="table-container">
    <table>
      <thead>
        <tr>
          <th>Mã đơn hàng</th>
          <th>Khách hàng</th>
          <th>Tổng tiền</th>
          <th>Phương thức</th>
          <th>Trạng thái</th>
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
            <div class="status-container">
              <select
                v-if="canUpdateStatus"
                :value="order.status"
                @change="handleStatusChange($event, order._id)"
                :class="['status-select', getStatusClass(order.status)]"
              >
                <option value="pending">Chờ xử lý</option>
                <option value="processing">Đang xử lý</option>
                <option value="shipping">Đang giao hàng</option>
                <option value="delivered">Đã giao hàng</option>
                <option value="cancelled">Đã hủy</option>
                <option value="returned">Đã trả hàng</option>
              </select>
              <span v-else :class="['status', getStatusClass(order.status)]">
                {{ formatStatus(order.status) }}
              </span>
            </div>
          </td>
          <td>{{ formatDate(order.createdAt) }}</td>
          <td>
            <div class="actions">
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
        processing: "Đang xử lý",
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
        VNPAY: "VNPay",
        MOMO: "MoMo",
      };
      return methodMap[method] || method;
    },
    getStatusClass(status) {
      const classMap = {
        pending: "inactive",
        processing: "active",
        shipping: "active",
        delivered: "active",
        cancelled: "inactive",
        returned: "inactive",
      };
      return classMap[status] || "";
    },
    handleStatusChange(event, orderId) {
      const newStatus = event.target.value;
      this.$emit("update-status", { orderId, newStatus });
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
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

th,
td {
  padding: 12px 15px;
  text-align: left;
  border-bottom: 1px solid #eee;
}

th {
  background-color: #f8f9fa;
  font-weight: 600;
  color: #333;
}

tr:hover {
  background-color: #f8f9fa;
}

.customer-info {
  display: flex;
  flex-direction: column;
}

.customer-info small {
  color: #666;
  font-size: 0.85em;
}

.status {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.9em;
  font-weight: 500;
}

.status.active {
  background-color: #e6f7ff;
  color: #1890ff;
}

.status.inactive {
  background-color: #fff1f0;
  color: #ff4d4f;
}

.actions {
  display: flex;
  gap: 8px;
}

.actions button {
  padding: 6px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
}

.view-btn {
  background-color: #e6f7ff;
  color: #1890ff;
}

.delete-btn {
  background-color: #fff1f0;
  color: #ff4d4f;
}

.actions button:hover {
  opacity: 0.8;
}

.text-center {
  text-align: center;
  color: #999;
  padding: 24px !important;
}

.status-container {
  display: flex;
  align-items: center;
}

.status-select {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.9em;
  font-weight: 500;
  border: 1px solid #d9d9d9;
  cursor: pointer;
  outline: none;
}

.status-select.active {
  background-color: #e6f7ff;
  color: #1890ff;
  border-color: #1890ff;
}

.status-select.inactive {
  background-color: #fff1f0;
  color: #ff4d4f;
  border-color: #ff4d4f;
}

.status-select:hover {
  border-color: #40a9ff;
}

.status-select:focus {
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
}
</style>
