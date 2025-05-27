<template>
  <div class="modal-overlay">
    <div class="order-detail">
      <div class="detail-header">
        <h3>Chi tiết đơn hàng</h3>
        <div class="header-actions">
          <button
            class="btn btn-secondary"
            @click="printOrder"
            v-if="!isLoading && !error"
          >
            <i class="fas fa-print"></i> In đơn hàng
          </button>
          <button class="close-btn" @click="$emit('close')">
            <i class="fas fa-times"></i>
          </button>
        </div>
      </div>

      <div class="detail-content">
        <div v-if="isLoading" class="loading-state">
          <div class="spinner"></div>
          <p>Đang tải thông tin đơn hàng...</p>
        </div>

        <div v-else-if="error" class="error-state">
          <i class="fas fa-exclamation-circle"></i>
          <p>{{ error }}</p>
          <button class="btn btn-primary" @click="loadOrderDetails">
            Thử lại
          </button>
        </div>

        <template v-else>
          <!-- Thông tin đơn hàng -->
          <div class="detail-section">
            <div class="section-header">
              <h4>Thông tin đơn hàng</h4>
            </div>
            <div class="info-grid">
              <div class="info-item">
                <span class="label">Mã đơn hàng:</span>
                <span class="value code">{{ order.code }}</span>
              </div>
              <div class="info-item">
                <span class="label">Ngày đặt:</span>
                <span class="value">{{ formatDate(order.createdAt) }}</span>
              </div>
              <div class="info-item">
                <span class="label">Trạng thái:</span>
                <div class="status-container">
                  <span class="value status-badge" :class="order.status">
                    {{ getStatusText(order.status) }}
                  </span>
                  <select
                    v-if="canUpdateStatus"
                    v-model="newStatus"
                    class="status-select"
                    @change="handleStatusChange"
                  >
                    <option value="">Cập nhật trạng thái</option>
                    <option
                      v-for="status in availableStatuses"
                      :key="status.value"
                      :value="status.value"
                    >
                      {{ status.label }}
                    </option>
                  </select>
                </div>
              </div>
              <div class="info-item">
                <span class="label">Phương thức thanh toán:</span>
                <span class="value">{{ getPaymentMethod(order.method) }}</span>
              </div>
            </div>
          </div>

          <!-- Thông tin khách hàng -->
          <div class="detail-section">
            <div class="section-header">
              <h4>Thông tin khách hàng</h4>
            </div>
            <div class="info-grid">
              <div class="info-item">
                <span class="label">Họ tên:</span>
                <span class="value">{{ order.fullname || "N/A" }}</span>
              </div>
              <div class="info-item">
                <span class="label">Email:</span>
                <span class="value">{{
                  order.customerId?.email || "N/A"
                }}</span>
              </div>
              <div class="info-item">
                <span class="label">Số điện thoại:</span>
                <span class="value">{{ order.phone || "N/A" }}</span>
              </div>
              <div class="info-item full-width">
                <span class="label">Địa chỉ:</span>
                <span class="value">{{ order.address || "N/A" }}</span>
              </div>
            </div>
          </div>

          <!-- Danh sách sản phẩm -->
          <div class="detail-section">
            <div class="section-header">
              <h4>Danh sách sản phẩm</h4>
            </div>
            <div class="products-table">
              <table>
                <thead>
                  <tr>
                    <th class="product-col">Sản phẩm</th>
                    <th class="price-col">Giá</th>
                    <th class="quantity-col">Số lượng</th>
                    <th class="total-col">Thành tiền</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="item in order.order_detail" :key="item._id">
                    <td>
                      <div class="product-info">
                        <img
                          :src="getImageUrl(item.productId?.image)"
                          :alt="item.productId?.name"
                          class="product-image"
                        />
                        <div class="product-details">
                          <span class="product-name">{{
                            item.productId?.name || "N/A"
                          }}</span>
                        </div>
                      </div>
                    </td>
                    <td class="price">{{ formatPrice(item.price) }}đ</td>
                    <td class="quantity">{{ item.quantity }}</td>
                    <td class="total">
                      {{ formatPrice(item.price * item.quantity) }}đ
                    </td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr class="summary-row">
                    <td colspan="3" class="text-right">Tổng tiền sản phẩm:</td>
                    <td class="subtotal">
                      {{ formatPrice(order.total_product_price) }}đ
                    </td>
                  </tr>
                  <tr class="summary-row">
                    <td colspan="3" class="text-right">Phí vận chuyển:</td>
                    <td class="shipping">
                      {{ formatPrice(order.total_ship_fee) }}đ
                    </td>
                  </tr>
                  <tr class="summary-row">
                    <td colspan="3" class="text-right">Giảm giá:</td>
                    <td class="discount">
                      -{{ formatPrice(order.discount) }}đ
                    </td>
                  </tr>
                  <tr class="summary-row total">
                    <td colspan="3" class="text-right">Tổng thanh toán:</td>
                    <td class="total-amount">
                      {{ formatPrice(order.total_price) }}đ
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          <!-- Ghi chú -->
          <div class="detail-section" v-if="order.note">
            <div class="section-header">
              <h4>Ghi chú</h4>
            </div>
            <div class="note-container">
              <p class="note">{{ order.note }}</p>
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script>
import OrderService from "../../services/admin/order.service";
import { toast } from "vue3-toastify";

export default {
  name: "OrderDetail",
  props: {
    order: {
      type: Object,
      required: true,
    },
    canUpdateStatus: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      isLoading: false,
      error: null,
      newStatus: "",
      availableStatuses: [
        { value: "processing", label: "Đang xử lý" },
        { value: "shipping", label: "Đang giao hàng" },
        { value: "delivered", label: "Đã giao hàng" },
        { value: "cancelled", label: "Đã hủy" },
        { value: "returned", label: "Đã trả hàng" },
      ],
    };
  },
  methods: {
    async loadOrderDetails() {
      this.isLoading = true;
      this.error = null;
      try {
        const orderDetails = await OrderService.getOrderById(this.order._id);
        this.$emit("update:order", orderDetails);
      } catch (error) {
        console.error("Error loading order details:", error);
        this.error =
          error.response?.data?.message ||
          error.message ||
          "Không thể tải thông tin đơn hàng";
        toast.error(this.error);
      } finally {
        this.isLoading = false;
      }
    },
    async handleStatusChange() {
      if (!this.newStatus) return;

      try {
        const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
        await OrderService.updateOrderStatus(
          this.order._id,
          this.newStatus,
          userInfo._id
        );
        toast.success("Cập nhật trạng thái đơn hàng thành công!");
        await this.loadOrderDetails();
        this.newStatus = "";
      } catch (error) {
        console.error("Error updating order status:", error);
        toast.error(
          error.response?.data?.message ||
            error.message ||
            "Không thể cập nhật trạng thái đơn hàng"
        );
      }
    },
    printOrder() {
      window.print();
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
    formatPrice(price) {
      if (!price) return "0";
      return price.toLocaleString("vi-VN");
    },
    getStatusText(status) {
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
    getPaymentMethod(method) {
      const methodMap = {
        COD: "Thanh toán khi nhận hàng",
        BANKING: "Chuyển khoản ngân hàng",
        VNPAY: "Thanh toán qua VNPAY",
      };
      return methodMap[method] || method;
    },
    getImageUrl(imagePath) {
      if (!imagePath) return "";
      return `http://localhost:3005${imagePath}`;
    },
  },
  created() {
    this.loadOrderDetails();
  },
};
</script>

<style scoped>
.order-detail {
  background: #ffffff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  height: 90vh;
  display: flex;
  flex-direction: column;
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 70%;
  max-width: 900px;
  z-index: 1001;
}

/* Remove the old overlay styles */
.order-detail::before {
  display: none;
}

/* Add new overlay styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  backdrop-filter: blur(2px);
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #f0f0f0;
  background-color: #fff;
  flex-shrink: 0;
}

.detail-header h3 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: #1a1a1a;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.25rem;
  color: #666;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.close-btn:hover {
  background-color: #f5f5f5;
  color: #333;
}

.detail-content {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}

.detail-section {
  margin-bottom: 24px;
  background: white;
  border-radius: 8px;
  border: 1px solid #f0f0f0;
  overflow: hidden;
}

.detail-section:last-child {
  margin-bottom: 0;
}

.section-header {
  padding: 16px 20px;
  border-bottom: 1px solid #f0f0f0;
  background-color: #fafafa;
}

.section-header h4 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 500;
  color: #1a1a1a;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  padding: 20px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.info-item.full-width {
  grid-column: 1 / -1;
}

.label {
  font-size: 0.875rem;
  color: #666;
}

.value {
  font-size: 1rem;
  color: #1a1a1a;
  font-weight: 500;
}

.value.code {
  font-family: monospace;
  background: #f5f5f5;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 0.875rem;
  color: #1890ff;
}

.status-badge {
  display: inline-block;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 0.875rem;
  font-weight: 500;
  text-align: center;
}

.status-badge.pending {
  background-color: #fff7e6;
  color: #fa8c16;
  border: 1px solid #ffd591;
}

.status-badge.processing {
  background-color: #e6f7ff;
  color: #1890ff;
  border: 1px solid #91d5ff;
}

.status-badge.shipping {
  background-color: #f6ffed;
  color: #52c41a;
  border: 1px solid #b7eb8f;
}

.status-badge.delivered {
  background-color: #f6ffed;
  color: #52c41a;
  border: 1px solid #b7eb8f;
}

.status-badge.cancelled {
  background-color: #fff1f0;
  color: #f5222d;
  border: 1px solid #ffa39e;
}

.status-badge.returned {
  background-color: #fff1f0;
  color: #f5222d;
  border: 1px solid #ffa39e;
}

.products-table {
  padding: 20px;
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
  border-bottom: 1px solid #f0f0f0;
}

th {
  font-weight: 500;
  color: #666;
  background-color: #fafafa;
  white-space: nowrap;
}

.product-col {
  width: 40%;
}

.price-col,
.quantity-col {
  width: 20%;
}

.total-col {
  width: 20%;
}

.product-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.product-image {
  width: 64px;
  height: 64px;
  object-fit: cover;
  border-radius: 6px;
  border: 1px solid #f0f0f0;
}

.product-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.product-name {
  font-size: 0.875rem;
  color: #1a1a1a;
  font-weight: 500;
  line-height: 1.4;
}

.text-right {
  text-align: right;
}

.summary-row {
  background-color: #fafafa;
}

.summary-row.total {
  background-color: #f6ffed;
  font-weight: 600;
}

.subtotal,
.shipping,
.discount,
.total-amount {
  font-weight: 500;
}

.discount {
  color: #52c41a;
}

.total-amount {
  color: #f5222d;
  font-size: 1.1rem;
}

.note-container {
  padding: 20px;
}

.note {
  padding: 16px;
  background-color: #fafafa;
  border-radius: 6px;
  color: #666;
  font-size: 0.875rem;
  line-height: 1.6;
  border: 1px solid #f0f0f0;
}

/* Custom scrollbar */
.detail-content::-webkit-scrollbar {
  width: 8px;
}

.detail-content::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.detail-content::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 4px;
}

.detail-content::-webkit-scrollbar-thumb:hover {
  background: #999;
}

/* Responsive styles */
@media (max-width: 768px) {
  .info-grid {
    grid-template-columns: 1fr;
    padding: 16px;
  }

  .detail-header {
    padding: 16px;
  }

  .detail-content {
    padding: 16px;
  }

  .products-table {
    padding: 16px;
    margin: 0 -16px;
  }

  table {
    font-size: 0.875rem;
  }

  .product-image {
    width: 50px;
    height: 50px;
  }

  .section-header {
    padding: 12px 16px;
  }

  .note-container {
    padding: 16px;
  }
}

.header-actions {
  display: flex;
  align-items: center;
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

.btn-secondary {
  background-color: #f5f5f5;
  color: #666;
  border: 1px solid #d9d9d9;
}

.btn-secondary:hover {
  background-color: #e8e8e8;
  border-color: #d9d9d9;
}

.status-container {
  display: flex;
  align-items: center;
  gap: 12px;
}

.status-select {
  padding: 6px 12px;
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

@media print {
  .modal-overlay {
    position: static;
    background: none;
  }

  .order-detail {
    position: static;
    transform: none;
    width: 100%;
    height: auto;
    box-shadow: none;
  }

  .header-actions,
  .close-btn {
    display: none;
  }

  .detail-content {
    overflow: visible;
  }
}
</style>
