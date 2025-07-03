<template>
  <div>
    <div v-if="showInvoice" class="print-only">
      <!-- Đã xóa OrderInvoice -->
    </div>
    <div v-else class="modal-overlay">
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
                  <span class="value">{{
                    getPaymentMethod(order.method)
                  }}</span>
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
                <div class="info-item" v-if="order.customerId">
                  <span class="label">Email:</span>
                  <span class="value">{{ order.customerId.email }}</span>
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
                      <td colspan="3" class="text-right">
                        Tổng tiền sản phẩm:
                      </td>
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

            <!-- Chi tiết hủy đơn -->
            <div
              class="detail-section"
              v-if="order.status === 'cancelled' && order.actionDetail"
            >
              <div class="section-header">
                <h4>Chi tiết hủy đơn</h4>
              </div>
              <div class="return-details">
                <div class="info-grid">
                  <div class="info-item">
                    <span class="label">Ngày hủy:</span>
                    <span class="value">{{
                      formatDate(order.actionDetail.createdAt)
                    }}</span>
                  </div>
                  <div class="info-item full-width">
                    <span class="label">Lý do hủy:</span>
                    <div class="return-note">{{ order.actionDetail.note }}</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Chi tiết trả hàng -->
            <div
              class="detail-section"
              v-if="order.status === 'returned' && order.actionDetail"
            >
              <div class="section-header">
                <h4>Chi tiết trả hàng</h4>
                <div
                  class="header-actions"
                  v-if="order.actionDetail.status === 'requested'"
                >
                  <button class="btn btn-approve" @click="handleApproveReturn">
                    <i class="fas fa-check"></i> Duyệt
                  </button>
                  <button class="btn btn-reject" @click="handleRejectReturn">
                    <i class="fas fa-times"></i> Từ chối
                  </button>
                </div>
              </div>
              <div class="return-details">
                <div class="info-grid">
                  <div class="info-item">
                    <span class="label">Trạng thái:</span>
                    <span
                      class="value status-badge"
                      :class="getReturnStatusClass(order.actionDetail.status)"
                    >
                      {{ getReturnStatusText(order.actionDetail.status) }}
                    </span>
                  </div>
                  <div class="info-item">
                    <span class="label">Ngày yêu cầu:</span>
                    <span class="value">{{
                      formatDate(order.actionDetail.createdAt)
                    }}</span>
                  </div>
                  <div class="info-item" v-if="order.actionDetail.employeeId">
                    <span class="label">Người xử lý:</span>
                    <span class="value">{{
                      order.employeeId?.fullname || "N/A"
                    }}</span>
                  </div>
                  <div class="info-item" v-if="order.actionDetail.updatedAt">
                    <span class="label">Ngày xử lý:</span>
                    <span class="value">{{
                      formatDate(order.actionDetail.updatedAt)
                    }}</span>
                  </div>
                  <div class="info-item full-width">
                    <span class="label">Lý do trả hàng:</span>
                    <div class="return-note">{{ order.actionDetail.note }}</div>
                  </div>
                  <div
                    class="info-item full-width"
                    v-if="order.actionDetail.images?.length"
                  >
                    <span class="label">Hình ảnh:</span>
                    <div class="return-images">
                      <div
                        v-for="(image, index) in order.actionDetail.images"
                        :key="index"
                        class="image-container"
                      >
                        <img
                          :src="getImageUrl(image)"
                          :alt="'Hình ảnh trả hàng ' + (index + 1)"
                          class="return-image"
                          @click="openImagePreview(image)"
                        />
                        <span class="image-number">{{ index + 1 }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div
              v-if="showShippingLabel"
              style="
                position: fixed;
                top: 0;
                left: 0;
                z-index: 9999;
                background: white;
                padding: 8px;
              "
            >
              <ShippingLabel ref="shippingLabel" :order="order" />
            </div>
          </template>
        </div>
      </div>
    </div>
    <div v-if="showPdfPreview" class="pdf-modal">
      <div class="pdf-modal-content">
        <button class="close-btn" @click="closePdfPreview">Đóng</button>
        <iframe :src="pdfUrl" width="100%" height="600px"></iframe>
      </div>
    </div>
  </div>
</template>

<script>
import OrderService from "../../services/admin/order.service";
import { toast } from "vue3-toastify";
import ShippingLabel from "./ShippingLabel.vue";
import html2pdf from "html2pdf.js";
import Swal from "sweetalert2";

export default {
  name: "OrderDetail",
  components: {
    ShippingLabel,
  },
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
        { value: "processing", label: "Đã xác nhận" },
        { value: "shipping", label: "Đang giao hàng" },
        { value: "delivered", label: "Đã giao hàng" },
        { value: "cancelled", label: "Đã hủy" },
        { value: "returned", label: "Đã trả hàng" },
      ],
      showInvoice: false,
      showPdfPreview: false,
      pdfUrl: null,
      showShippingLabel: false,
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
    async printOrder() {
      this.showShippingLabel = true;
      await this.$nextTick();
      const element = this.$refs.shippingLabel.$el;
      const opt = {
        margin: 5,
        html2canvas: { scale: 2 },
        jsPDF: { unit: "mm", format: [150, 190], orientation: "portrait" },
      };
      const worker = html2pdf().set(opt).from(element);
      const pdfBlob = await worker.outputPdf("blob");
      this.pdfUrl = URL.createObjectURL(pdfBlob);
      this.showPdfPreview = true;
      this.showShippingLabel = false;
    },
    closePdfPreview() {
      this.showPdfPreview = false;
      if (this.pdfUrl) URL.revokeObjectURL(this.pdfUrl);
      this.pdfUrl = null;
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
        processing: "Đã xác nhận",
        shipping: "Đang giao hàng",
        delivered: "Đã giao hàng",
        cancelled: "Đã hủy",
        returned: "Trả hàng",
      };
      return statusMap[status] || status;
    },
    getPaymentMethod(method) {
      const methodMap = {
        COD: "Thanh toán khi nhận hàng (COD)",
        ONLINE: "Thanh toán online",
        STORE: "Thanh toán tại cửa hàng",
      };
      return methodMap[method] || method;
    },
    getImageUrl(imagePath) {
      if (!imagePath) return "";
      return `http://localhost:3005${imagePath}`;
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
    async handleApproveReturn() {
      try {
        const result = await Swal.fire({
          title: "Xác nhận duyệt trả hàng",
          text: "Bạn có chắc chắn muốn duyệt yêu cầu trả hàng này?",
          icon: "question",
          showCancelButton: true,
          confirmButtonText: "Xác nhận",
          cancelButtonText: "Hủy",
          confirmButtonColor: "#52c41a",
          cancelButtonColor: "#ff4d4f",
        });

        if (result.isConfirmed) {
          const userInfo = JSON.parse(localStorage.getItem("employee") || "{}");
          if (!userInfo._id) {
            toast.error(
              "Không tìm thấy thông tin nhân viên. Vui lòng đăng nhập lại!"
            );
            this.$router.push("/admin/login");
            return;
          }

          await OrderService.processReturnRequest(
            this.order._id,
            "approved",
            userInfo._id
          );
          toast.success("Đã duyệt yêu cầu trả hàng thành công!");
          await this.loadOrderDetails();
        }
      } catch (error) {
        console.error("Error approving return request:", error);
        toast.error(
          error.response?.data?.message ||
            error.message ||
            "Không thể duyệt yêu cầu trả hàng"
        );
      }
    },
    async handleRejectReturn() {
      try {
        const result = await Swal.fire({
          title: "Xác nhận từ chối trả hàng",
          text: "Bạn có chắc chắn muốn từ chối yêu cầu trả hàng này?",
          icon: "warning",
          showCancelButton: true,
          confirmButtonText: "Xác nhận",
          cancelButtonText: "Hủy",
          confirmButtonColor: "#ff4d4f",
          cancelButtonColor: "#8c8c8c",
        });

        if (result.isConfirmed) {
          const userInfo = JSON.parse(localStorage.getItem("employee") || "{}");
          if (!userInfo._id) {
            toast.error(
              "Không tìm thấy thông tin nhân viên. Vui lòng đăng nhập lại!"
            );
            this.$router.push("/admin/login");
            return;
          }

          await OrderService.processReturnRequest(
            this.order._id,
            "rejected",
            userInfo._id
          );
          toast.success("Đã từ chối yêu cầu trả hàng!");
          await this.loadOrderDetails();
        }
      } catch (error) {
        console.error("Error rejecting return request:", error);
        toast.error(
          error.response?.data?.message ||
            error.message ||
            "Không thể từ chối yêu cầu trả hàng"
        );
      }
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

.print-only {
  display: none;
}

@media print {
  .modal-overlay {
    display: none;
  }

  .print-only {
    display: block;
  }
}

.pdf-modal {
  position: fixed;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
}
.pdf-modal-content {
  background: #fff;
  padding: 16px;
  border-radius: 8px;
  width: 90vw;
  max-width: 700px;
  box-shadow: 0 2px 16px #0003;
  position: relative;
}
.pdf-modal .close-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 10;
}

.return-images {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: 8px;
}

.return-image {
  width: 100px;
  height: 100px;
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

.return-details {
  padding: 20px;
}

.return-note {
  padding: 12px;
  background-color: #fafafa;
  border-radius: 4px;
  border: 1px solid #f0f0f0;
  color: #262626;
  font-size: 14px;
  line-height: 1.6;
  white-space: pre-wrap;
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

.header-actions {
  display: flex;
  gap: 8px;
}

.btn-approve {
  background-color: #52c41a;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  transition: all 0.3s ease;
}

.btn-approve:hover {
  background-color: #73d13d;
}

.btn-reject {
  background-color: #ff4d4f;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  transition: all 0.3s ease;
}

.btn-reject:hover {
  background-color: #ff7875;
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
