<template>
  <div class="table-container">
    <table>
      <thead>
        <tr>
          <th>
            <input
              type="checkbox"
              :checked="allSelected"
              @change="$emit('select-all-orders', $event.target.checked)"
            />
          </th>
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
          <td>
            <input
              type="checkbox"
              :checked="selectedOrderIds.includes(order._id)"
              @change="$emit('select-order', order._id, $event.target.checked)"
            />
          </td>
          <td>{{ order.code || order._id }}</td>
          <td>
            <div class="customer-info">
              <span>{{
                order.fullname ||
                order.customer?.fullname ||
                order.customerId?.fullname
              }}</span>
              <small>
                <template v-if="order.customerId">{{
                  order.customerId.email
                }}</template>
                <template v-else></template>
              </small>
            </div>
          </td>
          <td>{{ formatPrice(order.total_price) }}</td>
          <td>
            <template v-if="getPaymentMethodIcon(order.method)">
              <img
                :src="getPaymentMethodIcon(order.method)"
                :alt="order.method"
                style="height: 28px; max-width: 60px; object-fit: contain"
                @error="onImgError"
              />
            </template>
            <template v-else>
              <span>{{ formatPaymentMethod(order.method) }}</span>
            </template>
          </td>
          <td>
            <span :class="['status', getStatusClass(order.status)]">
              {{ formatStatusDisplay(order.status) }}
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
                  {{ formatStatusAction(nextStatus) }}
                </button>
                <button
                  v-if="
                    order.status === 'returned' &&
                    order.actionDetail?.status === 'requested'
                  "
                  @click="handleProcessReturn(order._id)"
                  class="status-btn status-return"
                >
                  Xử lý trả hàng
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

    <!-- Return Request Modal -->
    <div v-if="showReturnModal" class="modal-overlay">
      <div class="modal-content">
        <div class="modal-header">
          <h3>Thông tin yêu cầu trả hàng</h3>
          <button class="close-btn" @click="closeReturnModal">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <div class="return-info">
            <div class="info-item">
              <span class="label">Trạng thái:</span>
              <span
                class="value status-badge"
                :class="selectedOrder?.actionDetail?.status"
              >
                {{ getReturnStatusText(selectedOrder?.actionDetail?.status) }}
              </span>
            </div>
            <div class="info-item">
              <span class="label">Ngày yêu cầu:</span>
              <span class="value">{{
                formatDate(selectedOrder?.actionDetail?.createdAt)
              }}</span>
            </div>
            <div class="info-item">
              <span class="label">Lý do trả hàng:</span>
              <span class="value">{{ selectedOrder?.actionDetail?.note }}</span>
            </div>
            <div
              class="info-item"
              v-if="selectedOrder?.actionDetail?.images?.length"
            >
              <span class="label">Hình ảnh:</span>
              <div class="return-images">
                <img
                  v-for="(image, index) in selectedOrder?.actionDetail?.images"
                  :key="index"
                  :src="getImageUrl(image)"
                  :alt="'Hình ảnh trả hàng ' + (index + 1)"
                  class="return-image"
                  @click="openImagePreview(image)"
                />
              </div>
            </div>
          </div>
          <div
            class="modal-actions"
            v-if="selectedOrder?.actionDetail?.status === 'requested'"
          >
            <button class="btn btn-approve" @click="handleApproveReturn">
              <i class="fas fa-check"></i> Duyệt
            </button>
            <button class="btn btn-reject" @click="handleRejectReturn">
              <i class="fas fa-times"></i> Từ chối
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal nhập lý do hủy đơn -->
    <div v-if="showCancelModal" class="modal-overlay">
      <div class="modal-content">
        <div class="modal-header">
          <h3>Hủy đơn hàng</h3>
          <button class="close-btn" @click="closeCancelModal">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label for="cancelReason">Lý do hủy đơn hàng:</label>
            <textarea
              id="cancelReason"
              v-model="cancelReason"
              class="form-control"
              rows="4"
              placeholder="Nhập lý do hủy đơn hàng"
            />
          </div>
          <div class="modal-footer">
            <button class="btn" @click="closeCancelModal">Hủy</button>
            <button
              class="btn btn-approve"
              @click="confirmCancelOrder"
              :disabled="!cancelReason.trim()"
            >
              <i class="fas fa-check"></i> Xác nhận hủy đơn
            </button>
          </div>
        </div>
      </div>
    </div>
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
    selectedOrderIds: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      showReturnModal: false,
      selectedOrder: null,
      showCancelModal: false,
      orderToCancel: null,
      cancelReason: "",
    };
  },
  computed: {
    allSelected() {
      return (
        this.orders.length > 0 &&
        this.orders.every((order) => this.selectedOrderIds.includes(order._id))
      );
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
    formatStatusDisplay(status) {
      const statusMap = {
        pending: "Chờ xử lý",
        processing: "Đã xác nhận",
        shipping: "Đang giao hàng",
        delivered: "Đã giao hàng",
        cancelled: "Đã hủy",
        returned: "Trả hàng",
      };
      return statusMap[status] || status;
    },
    formatStatusAction(status) {
      const statusMap = {
        pending: "Chờ xử lý",
        processing: "Xác nhận",
        shipping: "Vận chuyển",
        delivered: "Đã giao hàng",
        cancelled: "Hủy đơn",
        returned: "Trả hàng",
      };
      return statusMap[status] || status;
    },
    formatPaymentMethod(method) {
      const methodMap = {
        COD: "Thanh toán khi nhận hàng",
        ONLINE: "Thanh toán online",
        STORE: "Thanh toán tại cửa hàng",
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
        shipping: ["delivered"],
        delivered: [],
        cancelled: [],
        returned: [],
      };
      return statusFlow[currentStatus] || [];
    },
    async handleStatusChange(event, orderId) {
      const newStatus = event.target.value;
      if (newStatus === "cancelled") {
        this.orderToCancel = orderId;
        this.showCancelModal = true;
        return;
      }
      const result = await Swal.fire({
        title: "Xác nhận thay đổi trạng thái?",
        text: `Bạn có chắc chắn muốn chuyển trạng thái đơn hàng sang "${this.formatStatusDisplay(
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
    openImagePreview(image) {
      window.open(this.getImageUrl(image), "_blank");
    },
    getImageUrl(imagePath) {
      if (!imagePath) return "";
      return `${import.meta.env.VITE_API_URL}${imagePath}`;
    },
    handleProcessReturn(orderId) {
      this.selectedOrder = this.orders.find((order) => order._id === orderId);
      this.showReturnModal = true;
    },
    closeReturnModal() {
      this.showReturnModal = false;
      this.selectedOrder = null;
    },
    async handleApproveReturn() {
      try {
        await this.$emit("process-return", this.selectedOrder._id, "approved");
        this.closeReturnModal();
      } catch (error) {
        console.error("Error approving return:", error);
      }
    },
    async handleRejectReturn() {
      try {
        await this.$emit("process-return", this.selectedOrder._id, "rejected");
        this.closeReturnModal();
      } catch (error) {
        console.error("Error rejecting return:", error);
      }
    },
    getPaymentMethodIcon(method) {
      switch ((method || "").toUpperCase()) {
        case "COD":
          return new URL("../../assets/images/COD_LOGO.png", import.meta.url)
            .href;
        case "PAYOS":
          return new URL("../../assets/images/payos.png", import.meta.url).href;
        case "PAYPAL":
          return new URL("../../assets/images/PAYPAL_LOGO.png", import.meta.url)
            .href;
        case "VNPAY":
          return new URL("../../assets/images/vnpay.webp", import.meta.url)
            .href;
        case "STORE":
          return ""; // Không có icon cho STORE
        default:
          return "";
      }
    },
    onImgError(e) {
      e.target.style.display = "none";
    },
    closeCancelModal() {
      this.showCancelModal = false;
      this.orderToCancel = null;
      this.cancelReason = "";
    },
    async confirmCancelOrder() {
      const note = this.cancelReason.trim();
      this.$emit("update-status", {
        orderId: this.orderToCancel,
        newStatus: "cancelled",
        note,
      });
      this.closeCancelModal();
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
  color: #f5222d;
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

.status-return {
  background-color: #fff7e6;
  color: #fa8c16;
  border: 1px solid #ffd591;
}

.status-return:hover {
  background-color: #fff1e6;
  border-color: #ffa940;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.modal-content {
  background: #fff;
  border-radius: 14px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.18);
  width: 95%;
  max-width: 600px;
  padding: 0;
  overflow: hidden;
  animation: modalFadeIn 0.25s;
}

@keyframes modalFadeIn {
  from {
    opacity: 0;
    transform: translateY(-30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-header {
  background: linear-gradient(90deg, #1890ff 0%, #40a9ff 100%);
  color: #fff;
  padding: 18px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.18rem;
  font-weight: 600;
}

.close-btn {
  background: none;
  border: none;
  color: #fff;
  font-size: 22px;
  cursor: pointer;
  transition: color 0.2s;
}

.close-btn:hover {
  color: #f5222d;
}

.modal-body {
  padding: 22px 24px 10px 24px;
}

.form-group {
  margin-bottom: 18px;
}

.form-group label {
  font-weight: 500;
  color: #333;
  margin-bottom: 7px;
  display: block;
}

.form-control {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  font-size: 1rem;
  transition: border 0.2s;
  background: #fafcff;
  margin-top: 4px;
}

.form-control:focus {
  border-color: #1890ff;
  outline: none;
  background: #fff;
}

textarea.form-control {
  min-height: 70px;
  resize: vertical;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 24px 18px 24px;
  border-top: 1px solid #f0f0f0;
  background: #fafcff;
}

.btn {
  padding: 8px 18px;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 500;
  border: none;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
  outline: none;
  display: flex;
  align-items: center;
  gap: 7px;
}

.btn-approve {
  background: linear-gradient(90deg, #52c41a 0%, #73d13d 100%);
  color: #fff;
}

.btn-approve:disabled {
  background: #e0e0e0;
  color: #aaa;
  cursor: not-allowed;
}

.btn-approve:hover:not(:disabled) {
  background: linear-gradient(90deg, #389e0d 0%, #52c41a 100%);
}

.btn {
  background: #f0f0f0;
  color: #333;
}

.btn:hover {
  background: #e6f7ff;
  color: #1890ff;
}

@media (max-width: 600px) {
  .modal-content {
    max-width: 98vw;
    padding: 0;
  }
  .modal-header,
  .modal-body,
  .modal-footer {
    padding-left: 12px;
    padding-right: 12px;
  }
}

.return-info {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.label {
  font-size: 14px;
  color: #666;
}

.value {
  font-size: 16px;
  color: #262626;
}

.return-images {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 16px;
  margin-top: 12px;
}

.image-container {
  position: relative;
  aspect-ratio: 1;
}

.return-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 4px;
  border: 1px solid #f0f0f0;
  cursor: pointer;
  transition: all 0.3s ease;
}

.return-image:hover {
  transform: scale(1.05);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.image-number {
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
}

.modal-actions {
  display: flex;
  gap: 12px;
  margin-top: 24px;
  justify-content: flex-end;
}

.status-badge {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
}

.status-badge.requested {
  background-color: #fff7e6;
  color: #fa8c16;
  border: 1px solid #ffd591;
}

.status-badge.approved {
  background-color: #f6ffed;
  color: #52c41a;
  border: 1px solid #b7eb8f;
}

.status-badge.rejected {
  background-color: #fff1f0;
  color: #f5222d;
  border: 1px solid #ffa39e;
}
</style>
