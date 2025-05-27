<template>
  <Header />
  <SidebarProfile />
  <div class="main-content">
    <!-- Tabs trạng thái đơn hàng -->
    <div class="order-tabs">
      <div
        v-for="tab in orderTabs"
        :key="tab.value"
        :class="['tab', { active: currentTab === tab.value }]"
        @click="currentTab = tab.value"
      >
        {{ tab.label }}
      </div>
    </div>

    <!-- Ô tìm kiếm -->
    <div class="order-search">
      <i class="fas fa-search search-icon"></i>
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Bạn có thể tìm kiếm theo tên ID đơn hàng hoặc Tên Sản phẩm"
      />
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>Đang tải đơn hàng...</p>
    </div>

    <!-- Empty state -->
    <div v-else-if="filteredOrders.length === 0" class="empty-state">
      <img src="../assets/images/empty-order.png" alt="Không có đơn hàng" />
      <p>Bạn chưa có đơn hàng nào</p>
      <router-link to="/" class="continue-shopping"
        >Tiếp tục mua sắm</router-link
      >
    </div>

    <!-- Danh sách đơn hàng -->
    <div v-else class="orders-container">
      <div v-for="order in filteredOrders" :key="order.id" class="order-group">
        <div class="order-header">
          <div class="order-info">
            <span class="order-id">Đơn hàng #{{ order.id.slice(-6) }}</span>
            <span class="order-date">{{ order.date }}</span>
          </div>
          <span class="order-status" :class="order.statusClass">
            {{ order.statusText }}
          </span>
        </div>

        <div class="order-items">
          <div
            v-for="item in order.order_detail"
            :key="item._id"
            class="order-item"
          >
            <img :src="item.productId.image" class="item-image" />
            <div class="item-info">
              <div class="item-title">{{ item.productId.name }}</div>
              <div class="item-variant">
                Phân loại: {{ item.productId.variant }}
              </div>
              <div class="item-qty">Số lượng: {{ item.quantity }}</div>
            </div>
            <div class="item-price">{{ formatPrice(item.price) }}</div>
          </div>
        </div>

        <div class="order-footer">
          <div class="order-summary">
            <div class="summary-row" v-if="order.discount > 0">
              <span>Giảm giá:</span>
              <span class="discount">-{{ formatPrice(order.discount) }}</span>
            </div>
            <div class="summary-row" v-if="order.total_ship_fee > 0">
              <span>Phí vận chuyển:</span>
              <span>{{ formatPrice(order.total_ship_fee) }}</span>
            </div>
            <div class="summary-row total">
              <span>Tổng tiền:</span>
              <span class="total-price">{{ formatPrice(order.total) }}</span>
            </div>
          </div>
          <button
            class="action-btn danger cancel-btn-below"
            v-if="order.status === 'pending'"
            @click="cancelOrder(order.id)"
          >
            Hủy đơn
          </button>
          <div class="order-actions">
            <button
              class="action-btn primary"
              v-if="order.status === 'shipping'"
              @click="confirmReceived(order.id)"
            >
              <i class="fas fa-check"></i>
              Đã nhận hàng
            </button>
            <button
              class="action-btn"
              v-if="order.status === 'delivered'"
              @click="reviewOrder(order.id)"
            >
              <i class="fas fa-star"></i>
              Đánh giá
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
  <Footer />
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import SidebarProfile from "../components/SidebarProfile.vue";
import Header from "../components/Header.vue";
import Footer from "../components/Footer.vue";
import { orderService } from "../services/order.service";
import { productService, getVariantPrice } from "../services/product.service";
import { toast } from "vue3-toastify";
import { useRouter } from "vue-router";

const router = useRouter();
const orders = ref([]);
const loading = ref(false);

const orderTabs = [
  { label: "Tất cả", value: "all" },
  { label: "Chờ xử lý", value: "pending" },
  { label: "Đang xử lý", value: "processing" },
  { label: "Đang giao hàng", value: "shipping" },
  { label: "Đã giao", value: "delivered" },
  { label: "Đã hủy", value: "cancelled" },
  { label: "Đã trả hàng", value: "returned" },
];
const currentTab = ref("all");
const searchQuery = ref("");

const filteredOrders = computed(() => {
  let result = orders.value;
  if (currentTab.value !== "all") {
    result = result.filter((o) => o.statusClass === currentTab.value);
  }
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase();
    result = result.filter(
      (o) =>
        o.shopName.toLowerCase().includes(q) ||
        o.order_detail.some((item) =>
          item.productId.name.toLowerCase().includes(q)
        )
    );
  }
  return result;
});

function formatPrice(val) {
  return val.toLocaleString("vi-VN", { style: "currency", currency: "VND" });
}

onMounted(async () => {
  const userStr = localStorage.getItem("user");
  const token = localStorage.getItem("token");

  if (!userStr || !token) {
    toast.warning("Vui lòng đăng nhập để xem đơn hàng!");
    router.push("/login");
    return;
  }

  try {
    loading.value = true;
    const orderData = await orderService.getCustomerOrders();
    orders.value = await Promise.all(
      orderData.map(async (order) => {
        // Process each order detail to get complete product information
        const orderDetails = await Promise.all(
          order.order_detail.map(async (item) => {
            try {
              // Get complete product information
              const productResponse = await productService.getProductById(
                item.productId
              );
              const product = productResponse.data;

              return {
                _id: item._id,
                productId: {
                  _id: product._id,
                  name: product.name,
                  image: `http://localhost:3005/${product.image}`,
                  variant: item.variants[0]?.sku || "Default",
                },
                quantity: item.quantity,
                price: item.price,
                variants: item.variants.map((v) => ({
                  sku: v.sku,
                  quantity: v.quantity,
                  price: v.price,
                })),
              };
            } catch (error) {
              console.error("Error fetching product details:", error);
              return {
                _id: item._id,
                productId: {
                  _id: item.productId,
                  name: "Product not found",
                  image: "",
                  variant: item.variants[0]?.sku || "Default",
                },
                quantity: item.quantity,
                price: item.price,
                variants: item.variants.map((v) => ({
                  sku: v.sku,
                  quantity: v.quantity,
                  price: v.price,
                })),
              };
            }
          })
        );

        return {
          id: order._id,
          date: new Date(order.createdAt).toLocaleDateString(),
          status: order.status,
          statusClass: order.status,
          statusText: getStatusText(order.status),
          total: order.total_price,
          total_product_price: order.total_product_price,
          discount: order.discount,
          total_ship_fee: order.total_ship_fee,
          method: order.method,
          order_detail: orderDetails,
          canReview: order.status === "completed",
        };
      })
    );
  } catch (error) {
    console.error("Error:", error);
    if (error.response?.status === 401) {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
      router.push("/login");
    } else {
      toast.error("Không thể tải danh sách đơn hàng. Vui lòng thử lại sau.");
    }
  } finally {
    loading.value = false;
  }
});

function getStatusText(status) {
  const statusMap = {
    pending: "Chờ xử lý",
    processing: "Đang xử lý",
    shipping: "Đang giao hàng",
    delivered: "Đã giao",
    cancelled: "Đã hủy",
    returned: "Đã trả hàng",
  };
  return statusMap[status] || status;
}

const cancelOrder = async (orderId) => {
  try {
    // TODO: Implement cancel order logic
    toast.info("Chức năng hủy đơn đang được phát triển");
  } catch (error) {
    toast.error("Không thể hủy đơn hàng");
  }
};

const confirmReceived = async (orderId) => {
  try {
    // TODO: Implement confirm received logic
    toast.info("Chức năng xác nhận đã nhận hàng đang được phát triển");
  } catch (error) {
    toast.error("Không thể xác nhận đã nhận hàng");
  }
};

const reviewOrder = async (orderId) => {
  try {
    // TODO: Implement review order logic
    toast.info("Chức năng đánh giá đơn hàng đang được phát triển");
  } catch (error) {
    toast.error("Không thể mở form đánh giá");
  }
};
</script>

<style scoped>
.main-content {
  flex: 1;
  padding: 30px;
  background: #f8f9fa;
  min-height: calc(100vh - 60px);
}

.order-tabs {
  display: flex;
  background: white;
  border-radius: 8px;
  padding: 8px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.tab {
  padding: 12px 24px;
  cursor: pointer;
  color: #666;
  border-radius: 6px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.tab:hover {
  color: #ee4d2d;
  background: #fff5f5;
}

.tab.active {
  color: #ee4d2d;
  background: #fff5f5;
}

.order-search {
  position: relative;
  margin-bottom: 24px;
}

.search-icon {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: #999;
}

.order-search input {
  width: 100%;
  padding: 12px 16px 12px 40px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.order-search input:focus {
  border-color: #ee4d2d;
  box-shadow: 0 0 0 2px rgba(238, 77, 45, 0.1);
  outline: none;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #ee4d2d;
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

.empty-state {
  text-align: center;
  padding: 40px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.empty-state img {
  width: 200px;
  margin-bottom: 16px;
}

.empty-state p {
  color: #666;
  margin-bottom: 16px;
}

.continue-shopping {
  display: inline-block;
  padding: 12px 24px;
  background: #ee4d2d;
  color: white;
  border-radius: 6px;
  text-decoration: none;
  transition: all 0.3s ease;
}

.continue-shopping:hover {
  background: #f05d40;
}

.orders-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.order-group {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #eee;
  background: #fafafa;
}

.order-info {
  display: flex;
  gap: 16px;
  align-items: center;
}

.order-id {
  font-weight: 600;
  color: #333;
}

.order-date {
  color: #666;
}

.order-status {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 500;
}

.order-status.pending {
  background: #fff7e6;
  color: #fa8c16;
}

.order-status.shipping {
  background: #e6f7ff;
  color: #1890ff;
}

.order-status.delivering {
  background: #f6ffed;
  color: #52c41a;
}

.order-status.completed {
  background: #f6ffed;
  color: #52c41a;
}

.order-status.cancelled {
  background: #fff1f0;
  color: #f5222d;
}

.order-status.returned {
  background: #fff1f0;
  color: #f5222d;
}

.order-items {
  padding: 16px;
}

.order-item {
  display: flex;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #eee;
}

.order-item:last-child {
  border-bottom: none;
}

.item-image {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 4px;
  margin-right: 16px;
}

.item-info {
  flex: 1;
}

.item-title {
  font-weight: 500;
  margin-bottom: 8px;
  color: #333;
}

.item-variant,
.item-qty {
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 4px;
}

.item-price {
  font-weight: 600;
  color: #ee4d2d;
  min-width: 120px;
  text-align: right;
}

.order-footer {
  padding: 16px;
  border-top: 1px solid #eee;
  display: flex;
  flex-direction: column;
  align-items: stretch;
}

.order-summary {
  flex: 1;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  color: #666;
}

.summary-row.total {
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid #eee;
  font-weight: 600;
  color: #333;
}

.discount {
  color: #52c41a;
}

.total-price {
  color: #ee4d2d;
  font-size: 1.2rem;
}

.cancel-btn-below {
  align-self: flex-end;
  margin-top: 16px;
  min-width: 120px;
}

.order-actions {
  display: flex;
  gap: 12px;
  margin-top: 8px;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 8px 16px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
  color: #666;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
}

.action-btn i {
  font-size: 14px;
}

.action-btn:hover {
  border-color: #ee4d2d;
  color: #ee4d2d;
  background: #fff5f5;
}

.action-btn.primary {
  background: #ee4d2d;
  border-color: #ee4d2d;
  color: white;
}

.action-btn.primary:hover {
  background: #f05d40;
  border-color: #f05d40;
}

.action-btn.danger {
  background: #fff1f0;
  border-color: #ff4d4f;
  color: #ff4d4f;
  margin-left: 0;
  min-width: 120px;
}

.action-btn.danger:hover {
  background: #ff4d4f;
  border-color: #ff4d4f;
  color: white;
}
</style>
