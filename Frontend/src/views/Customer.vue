<template>
  <Header></Header>
  <div class="page-container">
    <div class="breadcrumb">
      <router-link to="/">Trang chủ</router-link>
      <span class="separator">/</span>
      <span class="current">Đơn hàng của tôi</span>
    </div>
    <div class="row">
      <div class="col-md-3">
        <SidebarProfile />
      </div>
      <div class="col-md-9">
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
            <img
              src="../assets/images/empty-order.png"
              alt="Không có đơn hàng"
            />
            <p>Bạn chưa có đơn hàng nào</p>
            <router-link to="/" class="continue-shopping"
              >Tiếp tục mua sắm</router-link
            >
          </div>

          <!-- Danh sách đơn hàng -->
          <div v-else class="orders-container">
            <div
              v-for="order in filteredOrders"
              :key="order.id"
              class="order-group"
            >
              <div class="order-header">
                <div class="order-info">
                  <span class="order-id">Đơn hàng #{{ order.code }}</span>
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
                    <span class="discount"
                      >-{{ formatPrice(order.discount) }}</span
                    >
                  </div>
                  <div class="summary-row" v-if="order.total_ship_fee > 0">
                    <span>Phí vận chuyển:</span>
                    <span>{{ formatPrice(order.total_ship_fee) }}</span>
                  </div>
                  <div class="summary-row total">
                    <span>Tổng tiền:</span>
                    <span class="total-price">{{
                      formatPrice(order.total)
                    }}</span>
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

          <!-- Product Selection Modal -->
          <div v-if="showProductSelectionModal" class="modal-overlay">
            <div class="modal-content">
              <div class="modal-header">
                <h3>Chọn sản phẩm để đánh giá</h3>
                <button class="close-btn" @click="closeProductSelectionModal">
                  <i class="fas fa-times"></i>
                </button>
              </div>

              <div class="modal-body">
                <div class="product-list">
                  <div
                    v-for="product in availableProducts"
                    :key="product.productId._id"
                    class="product-item"
                    @click="selectProductForReview(product)"
                  >
                    <img
                      :src="
                        product.productId.image.startsWith('http')
                          ? product.productId.image
                          : `http://localhost:3005/${product.productId.image}`
                      "
                      class="product-image"
                    />
                    <div class="product-info">
                      <div class="product-name">
                        {{ product.productId.name }}
                      </div>
                      <div class="product-variants">
                        {{ product.variants.length }} biến thể
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Review Modal -->
          <Review
            v-if="showReviewModal"
            :show="showReviewModal"
            :order="selectedOrder"
            :product="selectedProduct"
            @close="closeReviewModal"
            @review-submitted="handleReviewSubmitted"
          />

          <!-- Cancel Order Modal -->
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
                  <select
                    id="cancelReason"
                    v-model="cancelReason"
                    class="form-control"
                  >
                    <option value="">Chọn lý do hủy đơn</option>
                    <option value="Đổi ý không muốn mua nữa">
                      Đổi ý không muốn mua nữa
                    </option>
                    <option value="Đặt nhầm sản phẩm">Đặt nhầm sản phẩm</option>
                    <option value="Tìm thấy sản phẩm rẻ hơn">
                      Tìm thấy sản phẩm rẻ hơn
                    </option>
                    <option value="Không còn nhu cầu">Không còn nhu cầu</option>
                    <option value="other">Lý do khác</option>
                  </select>
                </div>
                <div v-if="cancelReason === 'other'" class="form-group">
                  <label for="otherReason">Nhập lý do khác:</label>
                  <textarea
                    id="otherReason"
                    v-model="otherReason"
                    class="form-control"
                    rows="3"
                    placeholder="Nhập lý do hủy đơn hàng của bạn"
                  ></textarea>
                </div>
                <div class="modal-footer">
                  <button class="action-btn" @click="closeCancelModal">
                    Hủy
                  </button>
                  <button
                    class="action-btn danger"
                    @click="confirmCancelOrder"
                    :disabled="
                      !cancelReason ||
                      (cancelReason === 'other' && !otherReason)
                    "
                  >
                    Xác nhận hủy đơn
                  </button>
                </div>
              </div>
            </div>
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
import Review from "./Review.vue";
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
  { label: "Đã xác nhận", value: "processing" },
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
          code: order.code,
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
    processing: "Đã xác nhận",
    shipping: "Đang giao hàng",
    delivered: "Đã giao",
    cancelled: "Đã hủy",
    returned: "Đã trả hàng",
  };
  return statusMap[status] || status;
}

// Cancel modal state
const showCancelModal = ref(false);
const cancelReason = ref("");
const otherReason = ref("");
const orderToCancel = ref(null);

const cancelOrder = async (orderId) => {
  orderToCancel.value = orderId;
  showCancelModal.value = true;
};

const closeCancelModal = () => {
  showCancelModal.value = false;
  cancelReason.value = "";
  otherReason.value = "";
  orderToCancel.value = null;
};

const confirmCancelOrder = async () => {
  try {
    const note =
      cancelReason.value === "other" ? otherReason.value : cancelReason.value;

    await orderService.cancelOrder(orderToCancel.value, note);
    toast.success("Hủy đơn hàng thành công!");

    // Refresh orders list
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
          code: order.code,
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
    closeCancelModal();
  } catch (error) {
    console.error("Error cancelling order:", error);
    toast.error(error.response?.data?.message || "Không thể hủy đơn hàng");
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

// Review modal state
const showReviewModal = ref(false);
const selectedOrder = ref(null);
const selectedProduct = ref(null);

const reviewOrder = async (orderId) => {
  try {
    loading.value = true;
    const orderData = await orderService.getOrderById(orderId);
    if (!orderData) {
      throw new Error("Không tìm thấy thông tin đơn hàng");
    }

    // Kiểm tra số lượng sản phẩm khác nhau trong đơn hàng
    const uniqueProducts = new Map();
    orderData.order_detail.forEach((item) => {
      const productId = item.productId._id;
      if (!uniqueProducts.has(productId)) {
        uniqueProducts.set(productId, {
          productId: item.productId,
          variants: item.variants,
          quantity: item.quantity,
        });
      }
    });

    // Nếu chỉ có 1 sản phẩm, mở modal đánh giá trực tiếp
    if (uniqueProducts.size === 1) {
      selectedOrder.value = orderData;
      // Lấy tất cả biến thể của sản phẩm từ order_detail
      const orderItem = orderData.order_detail.find(
        (item) =>
          item.productId._id ===
          Array.from(uniqueProducts.values())[0].productId._id
      );
      selectedProduct.value = {
        productId: orderItem.productId,
        variants: orderItem.variants,
      };
      showReviewModal.value = true;
    } else {
      // Nếu có nhiều sản phẩm, hiển thị modal chọn sản phẩm
      showProductSelectionModal.value = true;
      selectedOrder.value = orderData;
      availableProducts.value = Array.from(uniqueProducts.values());
    }
  } catch (error) {
    console.error("Error fetching order:", error);
    toast.error("Không thể mở form đánh giá");
  } finally {
    loading.value = false;
  }
};

const closeReviewModal = () => {
  showReviewModal.value = false;
  selectedOrder.value = null;
  selectedProduct.value = null;
};

// Thêm state cho modal chọn sản phẩm
const showProductSelectionModal = ref(false);
const availableProducts = ref([]);

const selectProductForReview = (product) => {
  // Lấy tất cả biến thể của sản phẩm từ order_detail
  const orderItem = selectedOrder.value.order_detail.find(
    (item) => item.productId._id === product.productId._id
  );
  selectedProduct.value = {
    productId: orderItem.productId,
    variants: orderItem.variants,
  };
  showProductSelectionModal.value = false;
  showReviewModal.value = true;
};

const closeProductSelectionModal = () => {
  showProductSelectionModal.value = false;
  selectedOrder.value = null;
  availableProducts.value = [];
};

const handleReviewSubmitted = async () => {
  try {
    // Close the review modal
    closeReviewModal();
    // Refresh the orders list after successful review
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
          code: order.code,
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
    console.error("Error refreshing orders:", error);
    toast.error("Không thể cập nhật danh sách đơn hàng");
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.page-container {
  width: 95%;
  margin: 0 auto;
  padding: 20px;
  box-sizing: border-box;
}

@media (max-width: 991px) {
  .page-container {
    width: 100%;
    padding: 10px;
    max-width: 100vw;
    overflow-x: hidden;
  }
  .row {
    margin: 0 !important;
  }
  .col-md-3,
  .col-md-9 {
    padding: 0 !important;
  }
  .col-md-3 {
    margin-bottom: 15px;
  }
}

.breadcrumb {
  margin-bottom: 20px;
  font-size: 14px;
}

@media (max-width: 991px) {
  .breadcrumb {
    font-size: 12px;
    margin-bottom: 15px;
    padding: 0 10px;
  }
}

.breadcrumb a {
  color: #666;
  text-decoration: none;
}

.breadcrumb .separator {
  margin: 0 8px;
  color: #999;
}

.breadcrumb .current {
  color: #e63946;
}

.main-content {
  padding: 30px;
  background: #f8f9fa;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  box-sizing: border-box;
}

@media (max-width: 991px) {
  .main-content {
    padding: 15px;
  }
}

.order-tabs {
  display: flex;
  background: white;
  border-radius: 8px;
  padding: 8px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  -ms-overflow-style: none;
}
.order-tabs::-webkit-scrollbar {
  display: none;
}
@media (max-width: 991px) {
  .order-tabs {
    padding: 5px;
    margin-bottom: 15px;
  }
  .tab {
    padding: 8px 16px;
    font-size: 0.9rem;
    white-space: nowrap;
    min-width: max-content;
  }
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
@media (max-width: 991px) {
  .order-search {
    margin-bottom: 15px;
  }
  .order-search input {
    padding: 8px 16px 8px 35px;
    font-size: 0.9rem;
  }
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

/* Loading styles */
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

/* Empty state styles */
.empty-state {
  text-align: center;
  padding: 40px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

@media (max-width: 768px) {
  .empty-state {
    padding: 20px;
  }

  .empty-state img {
    width: 150px;
  }
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

/* Orders container styles */
.orders-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

@media (max-width: 768px) {
  .orders-container {
    gap: 15px;
  }
}

/* Order group styles */
.order-group {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  margin-bottom: 20px;
}

@media (max-width: 768px) {
  .order-group {
    border-radius: 6px;
    margin-bottom: 15px;
  }
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #eee;
  background: #fafafa;
}

@media (max-width: 768px) {
  .order-header {
    flex-direction: column;
    gap: 10px;
    padding: 12px;
  }
}

.order-info {
  display: flex;
  gap: 16px;
  align-items: center;
}

@media (max-width: 768px) {
  .order-info {
    flex-direction: column;
    gap: 5px;
    width: 100%;
  }
}

.order-id {
  font-weight: 600;
  color: #333;
}

@media (max-width: 768px) {
  .order-id {
    font-size: 0.9rem;
  }
}

.order-date {
  color: #666;
}

@media (max-width: 768px) {
  .order-date {
    font-size: 0.8rem;
  }
}

.order-status {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 500;
}

@media (max-width: 768px) {
  .order-status {
    align-self: flex-start;
    font-size: 0.8rem;
    padding: 4px 8px;
  }
}

/* Order items styles */
.order-items {
  padding: 16px;
}

@media (max-width: 768px) {
  .order-items {
    padding: 12px;
  }
}

.order-item {
  display: flex;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #eee;
}

@media (max-width: 768px) {
  .order-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
    padding: 12px;
  }
}

.item-image {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 4px;
  margin-right: 16px;
}

@media (max-width: 768px) {
  .item-image {
    width: 60px;
    height: 60px;
    margin-right: 0;
  }
}

.item-info {
  flex: 1;
}

@media (max-width: 768px) {
  .item-info {
    width: 100%;
  }
}

.item-title {
  font-weight: 500;
  margin-bottom: 8px;
  color: #333;
}

@media (max-width: 768px) {
  .item-title {
    font-size: 0.9rem;
  }
}

.item-variant,
.item-qty {
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 4px;
}

@media (max-width: 768px) {
  .item-variant,
  .item-qty {
    font-size: 0.8rem;
  }
}

.item-price {
  font-weight: 600;
  color: #ee4d2d;
  min-width: 120px;
  text-align: right;
}

@media (max-width: 768px) {
  .item-price {
    width: 100%;
    text-align: left;
    margin-top: 5px;
    font-size: 0.9rem;
  }
}

/* Order footer styles */
.order-footer {
  padding: 16px;
  border-top: 1px solid #eee;
  display: flex;
  flex-direction: column;
  align-items: stretch;
}

@media (max-width: 768px) {
  .order-footer {
    padding: 12px;
  }
}

.order-summary {
  flex: 1;
}

@media (max-width: 768px) {
  .order-summary {
    margin-bottom: 15px;
  }
}

.summary-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  color: #666;
}

@media (max-width: 768px) {
  .summary-row {
    font-size: 0.9rem;
  }
}

.summary-row.total {
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid #eee;
  font-weight: 600;
  color: #333;
}

@media (max-width: 768px) {
  .summary-row.total {
    font-size: 1rem;
  }
}

.discount {
  color: #52c41a;
}

.total-price {
  color: #ee4d2d;
  font-size: 1.2rem;
}

/* Action buttons styles */
.order-actions {
  display: flex;
  gap: 12px;
  margin-top: 8px;
}

@media (max-width: 768px) {
  .order-actions {
    flex-direction: column;
    gap: 8px;
  }
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

@media (max-width: 768px) {
  .action-btn {
    width: 100%;
    padding: 8px;
    font-size: 0.9rem;
  }
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
  width: 120px;
  min-width: 120px;
  max-width: 120px;
  padding: 8px 0;
  text-align: center;
}
@media (max-width: 991px) {
  .action-btn.danger {
    margin-top: 10px;
  }
}

/* Modal styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 8px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
}

@media (max-width: 768px) {
  .modal-content {
    width: 95%;
    margin: 10px;
  }
}

.modal-header {
  padding: 16px 24px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

@media (max-width: 768px) {
  .modal-header {
    padding: 12px 16px;
  }

  .modal-header h3 {
    font-size: 1.1rem;
  }
}

.modal-header h3 {
  margin: 0;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  font-size: 20px;
  color: #666;
  cursor: pointer;
  padding: 4px;
}

.modal-body {
  padding: 24px;
}

@media (max-width: 768px) {
  .modal-body {
    padding: 16px;
  }
}

/* Product list styles */
.product-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.product-item {
  display: flex;
  align-items: center;
  padding: 16px;
  border: 1px solid #eee;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

@media (max-width: 768px) {
  .product-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
    padding: 12px;
  }
}

.product-item:hover {
  border-color: #ee4d2d;
  background: #fff5f5;
}

.product-image {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 4px;
  margin-right: 16px;
}

@media (max-width: 768px) {
  .product-image {
    width: 60px;
    height: 60px;
    margin-right: 0;
  }
}

.product-info {
  flex: 1;
}

@media (max-width: 768px) {
  .product-info {
    width: 100%;
  }
}

.product-name {
  font-weight: 500;
  margin-bottom: 8px;
  color: #333;
}

@media (max-width: 768px) {
  .product-name {
    font-size: 0.9rem;
  }
}

.product-variants {
  color: #666;
  font-size: 0.9rem;
}

@media (max-width: 768px) {
  .product-variants {
    font-size: 0.8rem;
  }
}

/* Responsive cho màn hình rất nhỏ */
@media (max-width: 576px) {
  .page-container {
    padding: 5px;
  }
  .breadcrumb {
    font-size: 11px;
    padding: 0 5px;
  }
  .main-content {
    padding: 8px;
  }
  .order-tabs {
    padding: 3px;
  }
  .order-search input {
    padding: 6px 10px 6px 30px;
    font-size: 0.85rem;
  }
}

/* Cancel Modal Styles */
.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #333;
}

.form-control {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.form-control:focus {
  border-color: #ee4d2d;
  outline: none;
  box-shadow: 0 0 0 2px rgba(238, 77, 45, 0.1);
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

textarea.form-control {
  resize: vertical;
  min-height: 80px;
}

select.form-control {
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 10px center;
  background-size: 16px;
  padding-right: 30px;
}
</style>
