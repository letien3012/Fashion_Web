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
              placeholder="Tìm kiếm theo mã đơn hàng hoặc tên sản phẩm"
            />
          </div>

          <!-- Loading state -->
          <div v-if="loading" class="loading-container">
            <div class="loading-spinner"></div>
            <p>Đang tải đơn hàng...</p>
          </div>

          <!-- Empty state -->
          <div v-else-if="filteredOrders.length === 0" class="empty-state">
            <p>Bạn chưa có đơn hàng nào</p>
            <router-link to="/" class="continue-shopping"
              >Tiếp tục mua sắm</router-link
            >
          </div>

          <!-- Danh sách đơn hàng -->
          <div v-else class="orders-container">
            <div
              v-for="order in paginatedOrders"
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
                    <template v-if="!item.productId.isUnavailable">
                      <router-link
                        :to="`/product-detail/${item.productId._id}`"
                        class="item-title product-link"
                      >
                        {{ item.productId.name }}
                      </router-link>
                    </template>
                    <template v-else>
                      <span
                        class="item-title unavailable-link"
                        @click="
                          toast.warning(
                            'Rất tiếc, sản phẩm này hiện đã ngừng kinh doanh hoặc tạm thời không còn bán. Vui lòng tham khảo các sản phẩm khác nhé!'
                          )
                        "
                        style="cursor: not-allowed; color: #aaa"
                      >
                        {{ item.productId.name }}
                      </span>
                    </template>
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
                <div class="order-actions-row">
                  <button
                    class="action-btn danger cancel-btn-below"
                    v-if="order.status === 'pending'"
                    @click="cancelOrder(order.id)"
                  >
                    Hủy đơn
                  </button>
                  <button
                    class="action-btn retry-pay-btn"
                    :disabled="isRetrying"
                    v-if="
                      order.method == 'PAYOS' &&
                      order.status === 'pending' &&
                      (!order.online_method_detail ||
                        order.online_method_detail.status !== 'PAID')
                    "
                    @click="retryPayosPayment(order)"
                  >
                    <span v-if="!isRetrying">Thanh toán lại</span>
                    <span v-else>Đang chuyển hướng...</span>
                  </button>
                  <button
                    v-if="order.canReview"
                    class="action-btn primary"
                    @click="reviewOrder(order.id)"
                  >
                    Đánh giá đơn hàng
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Pagination -->
          <div v-if="totalPages > 1" class="pagination">
            <button
              class="page-btn"
              :disabled="currentPage === 1"
              @click="currentPage--"
            >
              <i class="fas fa-chevron-left"></i>
            </button>
            <button
              v-for="page in totalPages"
              :key="page"
              class="page-btn"
              :class="{ active: currentPage === page }"
              @click="currentPage = page"
            >
              {{ page }}
            </button>
            <button
              class="page-btn"
              :disabled="currentPage === totalPages"
              @click="currentPage++"
            >
              <i class="fas fa-chevron-right"></i>
            </button>
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

          <!-- Return Request Modal -->
          <div v-if="showReturnModal" class="modal-overlay">
            <div class="modal-content">
              <div class="modal-header">
                <h3>Yêu cầu trả hàng</h3>
                <button class="close-btn" @click="closeReturnModal">
                  <i class="fas fa-times"></i>
                </button>
              </div>
              <div class="modal-body">
                <div class="form-group">
                  <label for="returnNote">Lý do trả hàng:</label>
                  <textarea
                    id="returnNote"
                    v-model="returnNote"
                    class="form-control"
                    rows="3"
                    placeholder="Nhập lý do trả hàng của bạn"
                  ></textarea>
                </div>
                <div class="form-group">
                  <label>Hình ảnh sản phẩm:</label>
                  <div class="image-upload">
                    <input
                      type="file"
                      ref="fileInput"
                      @change="handleFileUpload"
                      multiple
                      accept="image/*"
                      style="display: none"
                    />
                    <button class="upload-btn" @click="$refs.fileInput.click()">
                      <i class="fas fa-camera"></i>
                      Chọn ảnh
                    </button>
                  </div>
                  <div class="image-preview" v-if="returnImages.length > 0">
                    <div
                      v-for="(image, index) in returnImages"
                      :key="index"
                      class="preview-item"
                    >
                      <img :src="image" alt="Preview" />
                      <button class="remove-image" @click="removeImage(index)">
                        <i class="fas fa-times"></i>
                      </button>
                    </div>
                  </div>
                </div>
                <div class="modal-footer">
                  <button class="action-btn" @click="closeReturnModal">
                    Hủy
                  </button>
                  <button
                    class="action-btn warning"
                    @click="submitReturnRequest"
                    :disabled="!returnNote || returnImages.length === 0"
                  >
                    Gửi yêu cầu
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
  <Chatbot />
</template>

<script setup>
import { ref, onMounted, computed, watch } from "vue";
import SidebarProfile from "../components/SidebarProfile.vue";
import Header from "../components/Header.vue";
import Footer from "../components/Footer.vue";
import Chatbot from "../components/Chatbot.vue";
import Review from "./Review.vue";
import { orderService } from "../services/order.service";
import { payosService } from "../services/payos.service";
import { productService, getVariantPrice } from "../services/product.service";
import { toast } from "vue3-toastify";
import { useRouter } from "vue-router";

const router = useRouter();
const orders = ref([]);
const loading = ref(false);

// Pagination state
const currentPage = ref(1);
const itemsPerPage = ref(10); // 10 orders per page

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
        o.code.toLowerCase().includes(q) ||
        o.order_detail.some((item) =>
          item.productId.name.toLowerCase().includes(q)
        )
    );
  }
  return result;
});

// Pagination computed properties
const totalPages = computed(() => {
  return Math.ceil(filteredOrders.value.length / itemsPerPage.value);
});

const paginatedOrders = computed(() => {
  const startIndex = (currentPage.value - 1) * itemsPerPage.value;
  const endIndex = startIndex + itemsPerPage.value;
  return filteredOrders.value.slice(startIndex, endIndex);
});

// Add new computed property to check if order is within return period
const isWithinReturnPeriod = (orderDate) => {
  const orderDateTime = new Date(orderDate);
  const currentDate = new Date();
  const diffTime = Math.abs(currentDate - orderDateTime);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays <= 15;
};

// Watchers for pagination
watch(currentTab, () => {
  currentPage.value = 1;
});

watch(searchQuery, () => {
  currentPage.value = 1;
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
              // Kiểm tra trạng thái sản phẩm
              const isUnavailable =
                !!product.deletedAt || product.publish === false;
              return {
                _id: item._id,
                productId: {
                  _id: product._id,
                  name: product.name,
                  image: `http://localhost:3005/${product.image}`,
                  variant: item.variants[0]?.sku || "Default",
                  isUnavailable,
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
                  isUnavailable: true,
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

        // Bổ sung: nếu là đơn online mà thiếu paymentUrl nhưng có paymentId, cảnh báo
        let online_method_detail = order.online_method_detail;
        if (
          order.method !== "COD" &&
          online_method_detail &&
          !online_method_detail.paymentUrl &&
          online_method_detail.paymentId
        ) {
          // Nếu có thể tự tạo link từ paymentId, hãy tạo ở đây (nếu PayOS hỗ trợ)
          // Ví dụ: online_method_detail.paymentUrl = `https://payos.vn/payment/${online_method_detail.paymentId}`;
          // Nếu không, chỉ cảnh báo
          online_method_detail.missingPaymentUrl = true;
        }

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
          online_method_detail: online_method_detail,
          order_detail: orderDetails,
          canReview:
            order.status === "completed" || order.status === "delivered",
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
    returned: "Trả hàng",
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
                  isUnavailable:
                    !!product.deletedAt || product.publish === false,
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
                  isUnavailable: true,
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
          canReview:
            order.status === "completed" || order.status === "delivered",
        };
      })
    );
    closeCancelModal();
  } catch (error) {
    console.error("Error cancelling order:", error);
    toast.error(error.response?.data?.message || "Không thể hủy đơn hàng");
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
                  isUnavailable:
                    !!product.deletedAt || product.publish === false,
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
                  isUnavailable: true,
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
          canReview:
            order.status === "completed" || order.status === "delivered",
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

// Return request state
const showReturnModal = ref(false);
const returnNote = ref("");
const returnImages = ref([]);
const selectedOrderId = ref(null);

const requestReturn = (orderId) => {
  selectedOrderId.value = orderId;
  showReturnModal.value = true;
};

const closeReturnModal = () => {
  showReturnModal.value = false;
  returnNote.value = "";
  returnImages.value = [];
  selectedOrderId.value = null;
};

const handleFileUpload = (event) => {
  const files = event.target.files;
  for (let file of files) {
    const reader = new FileReader();
    reader.onload = (e) => {
      returnImages.value.push(e.target.result);
    };
    reader.readAsDataURL(file);
  }
};

const removeImage = (index) => {
  returnImages.value.splice(index, 1);
};

const submitReturnRequest = async () => {
  try {
    await orderService.requestReturn(selectedOrderId.value, {
      images: returnImages.value,
      note: returnNote.value,
    });
    toast.success("Yêu cầu trả hàng đã được gửi thành công");
    closeReturnModal();
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
                  isUnavailable:
                    !!product.deletedAt || product.publish === false,
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
                  isUnavailable: true,
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
          canReview:
            order.status === "completed" || order.status === "delivered",
        };
      })
    );
  } catch (error) {
    console.error("Error submitting return request:", error);
    toast.error(
      error.response?.data?.message || "Không thể gửi yêu cầu trả hàng"
    );
  }
};

const isRetrying = ref(false);
async function retryPayosPayment(order) {
  if (!confirm("Bạn có chắc chắn muốn thanh toán lại cho đơn hàng này?"))
    return;
  try {
    isRetrying.value = true;
    // Tạo orderCode mới để PayOS tạo QR mới
    const newOrderCode = `${Date.now()}`;
    // Gọi đúng service và method để tạo link thanh toán
    const payosRes = await payosService.createPayment({
      orderCode: newOrderCode,
      total_price: order.total,
      customerInfo: {
        name: order.fullname,
        phone: order.phone,
        address: order.address,
        province_code: order.actionDetail?.province_code || "",
        district_code: order.actionDetail?.district_code || "",
        ward_code: order.actionDetail?.ward_code || "",
      },
      items: order.order_detail,
    });
    if (payosRes && payosRes.paymentUrl) {
      // Cập nhật lại thông tin thanh toán online cho đơn hàng
      await orderService.updateOrderOnlineDetail(order.code, {
        paymentUrl: payosRes.paymentUrl,
        paymentId: payosRes.paymentId,
        orderCode: payosRes.orderCode,
        status: "PAID",
      });
      // Cập nhật trạng thái đơn hàng sang processing với orderCode mới
      await orderService.updateOrderStatusByCode(
        payosRes.orderCode,
        "processing"
      );
      // Chuyển hướng đến trang thanh toán
      window.location.href = payosRes.paymentUrl;
    } else {
      toast.error("Không lấy được link thanh toán mới từ PayOS!");
    }
  } catch (e) {
    toast.error(
      "Lỗi khi tạo lại link thanh toán: " +
        (e?.response?.data?.message || e.message)
    );
  } finally {
    isRetrying.value = false;
  }
}
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
.order-actions-row {
  display: flex;
  align-items: center;
  gap: 10px;
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
  width: 150px;
  min-width: 120px;
  max-width: 150px;
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

.warning {
  background: #fff7e6;
  border-color: #ffa940;
  color: #d46b08;
}

.warning:hover {
  background: #fff1d6;
  border-color: #ff9c2e;
  color: #ad4e00;
}

.image-upload {
  margin-top: 10px;
}

.upload-btn {
  padding: 8px 16px;
  background: #f5f5f5;
  border: 1px dashed #d9d9d9;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #666;
}

.upload-btn:hover {
  border-color: #ee4d2d;
  color: #ee4d2d;
}

.image-preview {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 10px;
}

.preview-item {
  position: relative;
  width: 100px;
  height: 100px;
}

.preview-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 4px;
}

.remove-image {
  position: absolute;
  top: -8px;
  right: -8px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #ff4d4f;
  color: white;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
}

.remove-image:hover {
  background: #ff7875;
}

.order-cancellation-info {
  padding: 12px 16px;
  background-color: #fff1f0;
  border-bottom: 1px solid #ffccc7;
}

.cancellation-note {
  color: #ff4d4f;
  font-size: 0.9rem;
  margin-bottom: 4px;
}

.cancellation-note i {
  margin-right: 8px;
}

.cancellation-date {
  color: #666;
  font-size: 0.8rem;
}

.product-link {
  color: #333;
  text-decoration: none;
  cursor: pointer;
  transition: color 0.2s;
}
.product-link:hover {
  color: #e63946;
  text-decoration: none;
}

.unavailable-link {
  color: #aaa;
  cursor: not-allowed;
  pointer-events: auto;
  text-decoration: none;
  transition: color 0.2s;
}
.unavailable-link:hover {
  color: #aaa;
}

/* Pagination styles */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  margin-top: 30px;
  padding: 20px 0;
}

.page-btn {
  min-width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  color: #666;
  cursor: pointer;
  transition: all 0.3s ease;
  padding: 0 12px;
}

.page-btn:hover:not(:disabled) {
  border-color: #ff6b6b;
  color: #ff6b6b;
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(255, 107, 107, 0.1);
}

.page-btn.active {
  background: #ff6b6b;
  color: white;
  border-color: #ff6b6b;
  font-weight: 500;
}

.page-btn:disabled {
  background: #f5f5f5;
  color: #999;
  cursor: not-allowed;
  border-color: #e0e0e0;
}

.page-btn i {
  font-size: 12px;
}

@media (max-width: 768px) {
  .pagination {
    gap: 5px;
    margin-top: 20px;
    padding: 15px 0;
  }

  .page-btn {
    min-width: 35px;
    height: 35px;
    font-size: 13px;
    padding: 0 8px;
  }
}

@media (max-width: 576px) {
  .pagination {
    gap: 3px;
    margin-top: 15px;
    padding: 10px 0;
  }

  .page-btn {
    min-width: 30px;
    height: 30px;
    font-size: 12px;
    padding: 0 6px;
  }
}

.retry-pay-btn {
  background: #f0f7ff;
  border: 1px solid #2563eb;
  color: #2563eb;
  margin-left: 0;
  width: 180px;
  min-width: 140px;
  max-width: 180px;
  padding: 8px 0;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border-radius: 4px;
  font-weight: 500;
  font-size: 1rem;
  box-shadow: none;
  transition: all 0.3s ease;
  cursor: pointer;
}
@media (max-width: 991px) {
  .retry-pay-btn {
    margin-top: 10px;
    width: 100%;
    min-width: unset;
    max-width: unset;
  }
}
.retry-pay-btn:hover:not(:disabled) {
  background: #2563eb;
  color: #fff;
  border-color: #2563eb;
}
.retry-pay-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
</style>
