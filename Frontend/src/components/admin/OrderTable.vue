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
                <option value="processing">Đã xác nhận</option>
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

.status {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.9em;
  font-weight: 500;
}

.status.active {
  background: #e6f7ff;
  color: #1890ff;
}

.status.inactive {
  background: #fff1f0;
  color: #ff4d4f;
}

.status-select {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.9em;
  font-weight: 500;
  border: 1px solid #d9d9d9;
  cursor: pointer;
  outline: none;
  background: #fff;
}

.status-select.active {
  border-color: #1890ff;
  color: #1890ff;
}

.status-select.inactive {
  border-color: #ff4d4f;
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
</style>
