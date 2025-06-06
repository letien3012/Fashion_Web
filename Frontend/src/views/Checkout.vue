<template>
  <Header />
  <div class="page-container">
    <div class="breadcrumb">
      <router-link to="/">Trang chủ</router-link>
      <span class="separator">/</span>
      <router-link to="/cart">Giỏ hàng</router-link>
      <span class="separator">/</span>
      <span class="current">Thanh toán</span>
    </div>
    <div class="checkout-container">
      <div class="checkout-wrapper">
        <h1>Thanh toán</h1>
        <div class="row g-4">
          <!-- Thông tin khách hàng -->
          <div class="col-12 col-lg-7">
            <div class="checkout-form">
              <h2>Thông tin nhận hàng</h2>
              <form @submit.prevent="submitOrder">
                <div class="form-group">
                  <label>Họ tên <span class="required">*</span></label>
                  <input
                    v-model="customer.name"
                    required
                    placeholder="Nhập họ tên của bạn"
                    class="form-control"
                  />
                </div>
                <div class="form-group">
                  <label>Số điện thoại <span class="required">*</span></label>
                  <input
                    v-model="customer.phone"
                    required
                    pattern="[0-9]{10}"
                    title="Vui lòng nhập số điện thoại hợp lệ (10 số)"
                    placeholder="Nhập số điện thoại của bạn"
                    class="form-control"
                  />
                </div>
                <div class="form-group">
                  <label>Địa chỉ <span class="required">*</span></label>
                  <input
                    v-model="customer.address"
                    required
                    placeholder="Nhập địa chỉ của bạn"
                    class="form-control"
                  />
                </div>
                <div class="form-group">
                  <label>Ghi chú</label>
                  <textarea
                    v-model="customer.note"
                    rows="2"
                    placeholder="Nhập ghi chú (nếu có)"
                    class="form-control"
                  />
                </div>

                <!-- Payment Method Selection -->
                <div class="payment-method-section">
                  <h3>Phương thức thanh toán</h3>
                  <div class="payment-methods">
                    <label class="payment-method">
                      <input
                        type="radio"
                        v-model="paymentMethod"
                        value="COD"
                        name="paymentMethod"
                      />
                      <div class="method-content">
                        <i class="fas fa-money-bill-wave"></i>
                        <div class="method-info">
                          <span class="method-name"
                            >Thanh toán khi nhận hàng (COD)</span
                          >
                          <span class="method-description"
                            >Thanh toán bằng tiền mặt khi nhận hàng</span
                          >
                        </div>
                      </div>
                    </label>
                    <label class="payment-method">
                      <input
                        type="radio"
                        v-model="paymentMethod"
                        value="ONLINE"
                        name="paymentMethod"
                      />
                      <div class="method-content">
                        <i class="fas fa-credit-card"></i>
                        <div class="method-info">
                          <span class="method-name">Thanh toán online</span>
                          <span class="method-description"
                            >Thanh toán qua thẻ ngân hàng hoặc ví điện tử</span
                          >
                        </div>
                      </div>
                    </label>
                  </div>
                </div>
              </form>
            </div>
          </div>

          <!-- Thông tin sản phẩm -->
          <div class="col-12 col-lg-5">
            <div class="checkout-products">
              <h2>Sản phẩm</h2>
              <div
                v-for="item in checkoutItems"
                :key="item.variantId"
                class="checkout-product"
              >
                <img
                  :src="
                    item.productId.image.startsWith('http')
                      ? item.productId.image
                      : `http://localhost:3005/${item.productId.image}`
                  "
                  alt=""
                />
                <div class="product-info">
                  <div class="product-name">{{ item.productId.name }}</div>
                  <div class="product-sku">
                    Phân loại: {{ item.variant.sku }}
                  </div>
                  <div class="product-quantity">
                    Số lượng: {{ item.variant.quantity }}
                  </div>
                  <div class="product-price">
                    <template
                      v-if="item.variant.price < item.variant.originPrice"
                    >
                      <span class="price-old"
                        >₫{{
                          (
                            item.variant.originPrice * item.variant.quantity
                          ).toLocaleString()
                        }}</span
                      >
                      <span class="price-sale"
                        >₫{{
                          (
                            item.variant.price * item.variant.quantity
                          ).toLocaleString()
                        }}</span
                      >
                    </template>
                    <template v-else>
                      <span class="price-sale"
                        >₫{{
                          (
                            item.variant.price * item.variant.quantity
                          ).toLocaleString()
                        }}</span
                      >
                    </template>
                  </div>
                </div>
              </div>

              <!-- Voucher Section -->
              <div class="voucher-section">
                <div class="voucher-header">
                  <div class="voucher-title">
                    <i class="fas fa-ticket-alt"></i>
                    <h3>Mã giảm giá</h3>
                  </div>
                  <button
                    v-if="!showVoucherInput"
                    @click="showVoucherInput = true"
                    class="apply-voucher-btn"
                  >
                    <i class="fas fa-plus"></i>
                    Áp dụng mã
                  </button>
                </div>

                <!-- Voucher Input -->
                <div v-if="showVoucherInput" class="voucher-input-container">
                  <div class="voucher-input-wrapper">
                    <div class="input-group">
                      <i class="fas fa-tag input-icon"></i>
                      <input
                        v-model="voucherCode"
                        type="text"
                        placeholder="Nhập mã giảm giá"
                        class="voucher-input"
                      />
                    </div>
                    <button
                      @click="applyVoucher"
                      :disabled="!voucherCode || applyingVoucher"
                      class="apply-btn"
                    >
                      <i
                        class="fas"
                        :class="
                          applyingVoucher ? 'fa-spinner fa-spin' : 'fa-check'
                        "
                      ></i>
                      {{ applyingVoucher ? "Đang áp dụng..." : "Áp dụng" }}
                    </button>
                  </div>
                  <button @click="showVoucherInput = false" class="cancel-btn">
                    <i class="fas fa-times"></i>
                    Hủy
                  </button>
                </div>

                <!-- Applied Voucher -->
                <div v-if="appliedVoucher" class="applied-voucher">
                  <div class="voucher-info">
                    <div class="voucher-details">
                      <i class="fas fa-ticket-alt voucher-icon"></i>
                      <span class="voucher-code">{{
                        appliedVoucher.code
                      }}</span>
                    </div>
                    <div class="voucher-discount">
                      <i class="fas fa-percentage"></i>
                      Giảm {{ appliedVoucher.discount }}%
                    </div>
                  </div>
                  <button
                    @click="removeVoucher"
                    class="remove-voucher-btn"
                    title="Xóa mã giảm giá"
                  >
                    <i class="fas fa-times"></i>
                  </button>
                </div>

                <!-- Available Vouchers -->
                <div class="available-vouchers">
                  <h4>
                    <i class="fas fa-gift"></i>
                    Mã giảm giá có thể áp dụng
                  </h4>
                  <div v-if="loadingVouchers" class="voucher-loading">
                    <div class="loading-spinner"></div>
                    <p>Đang tải mã giảm giá...</p>
                  </div>
                  <div
                    v-else-if="availableVouchers.length === 0"
                    class="no-vouchers"
                  >
                    <i class="fas fa-ticket-alt"></i>
                    <p>Hiện không có mã giảm giá nào</p>
                  </div>
                  <div v-else class="voucher-list">
                    <div
                      v-for="voucher in availableVouchers"
                      :key="voucher._id"
                      class="voucher-item"
                      :class="{ selected: appliedVoucher?._id === voucher._id }"
                      @click="selectVoucher(voucher)"
                    >
                      <div class="voucher-content">
                        <div class="voucher-main">
                          <i class="fas fa-ticket-alt"></i>
                          <span class="voucher-code">{{ voucher.code }}</span>
                        </div>
                        <div
                          class="voucher-description"
                          v-if="voucher.description"
                        >
                          {{ voucher.description }}
                        </div>
                        <div class="voucher-conditions">
                          <span
                            v-if="voucher.voucher_condition?.min_order_value"
                            class="condition-item"
                          >
                            <i class="fas fa-shopping-cart"></i>
                            Đơn tối thiểu: ₫{{
                              voucher.voucher_condition.min_order_value.toLocaleString()
                            }}
                          </span>
                          <span
                            v-if="voucher.voucher_condition?.max_discount"
                            class="condition-item"
                          >
                            <i class="fas fa-tags"></i>
                            Giảm tối đa: ₫{{
                              voucher.voucher_condition.max_discount.toLocaleString()
                            }}
                          </span>
                          <span class="voucher-date">
                            <i class="fas fa-clock"></i>
                            Áp dụng đến: {{ formatDate(voucher.end_date) }}
                          </span>
                        </div>
                      </div>
                      <div class="voucher-discount">
                        <i class="fas fa-percentage"></i>
                        Giảm {{ voucher.discount }}%
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="checkout-summary">
                <div>
                  <span>Tổng giá gốc:</span>
                  <span class="summary-old"
                    >₫{{ totalProductPrice.toLocaleString() }}</span
                  >
                </div>
                <div v-if="totalDiscount > 0">
                  <span>Tiết kiệm:</span>
                  <span class="summary-save"
                    >₫{{ totalDiscount.toLocaleString() }}</span
                  >
                </div>
                <div v-if="appliedVoucher" class="voucher-applied">
                  <span>Mã giảm giá:</span>
                  <span class="voucher-code"
                    >{{ appliedVoucher.code }} (-{{
                      appliedVoucher.discount
                    }}%)</span
                  >
                </div>
                <div class="total-price">
                  <span>Tổng thanh toán:</span>
                  <span class="summary-price"
                    >₫{{ totalPrice.toLocaleString() }}</span
                  >
                </div>
              </div>

              <button
                class="submit-btn"
                type="submit"
                @click="submitOrder"
                :disabled="isLoading"
              >
                {{ isLoading ? "Đã xác nhận..." : "Đặt hàng" }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <Footer />
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import Header from "../components/Header.vue";
import Footer from "../components/Footer.vue";
import { useRouter } from "vue-router";
import { toast } from "vue3-toastify";
import { orderService } from "../services/order.service";
import { cartService } from "../services/cart.service";
import { promotionService } from "../services/promotion.service";

const router = useRouter();
const checkoutItems = ref([]);
const isLoading = ref(false);
const appliedVoucher = ref(null);
const availableVouchers = ref([]);
const loadingVouchers = ref(true);
const showVoucherInput = ref(false);
const voucherCode = ref("");
const applyingVoucher = ref(false);
const customer = ref({
  name: "",
  phone: "",
  address: "",
  note: "",
});
const paymentMethod = ref("COD");

// Validation rules
const validatePhone = (phone) => {
  const phoneRegex = /^[0-9]{10}$/;
  return phoneRegex.test(phone);
};

const validateForm = () => {
  if (!customer.value.name.trim()) {
    toast.error("Vui lòng nhập họ tên!");
    return false;
  }
  if (!validatePhone(customer.value.phone)) {
    toast.error("Vui lòng nhập số điện thoại hợp lệ (10 số)!");
    return false;
  }
  if (!customer.value.address.trim()) {
    toast.error("Vui lòng nhập địa chỉ!");
    return false;
  }
  return true;
};

// Thêm hàm fetchAvailableVouchers
const fetchAvailableVouchers = async () => {
  loadingVouchers.value = true;
  try {
    const response = await promotionService.getActivePromotions();
    if (response?.data) {
      availableVouchers.value = response.data.filter(
        (promotion) => promotion.type === "voucher"
      );
    }
  } catch (error) {
    console.error("Error fetching vouchers:", error);
    toast.error("Không thể tải danh sách mã giảm giá");
  } finally {
    loadingVouchers.value = false;
  }
};

// Thêm hàm selectVoucher
const selectVoucher = (voucher) => {
  console.log("Check min_order_value:", {
    totalPriceBeforeVoucher: totalPriceBeforeVoucher.value,
    min_order_value: voucher.voucher_condition?.min_order_value,
  });
  if (
    voucher.voucher_condition?.min_order_value &&
    totalPriceBeforeVoucher.value < voucher.voucher_condition.min_order_value
  ) {
    toast.error(
      `Đơn hàng tối thiểu phải là ₫${voucher.voucher_condition.min_order_value.toLocaleString()}`
    );
    return;
  }

  appliedVoucher.value = voucher;
  localStorage.setItem("appliedVoucher", JSON.stringify(voucher));
  toast.success(
    `Đã áp dụng mã giảm giá ${voucher.code} - Giảm ${voucher.discount}%`
  );
};

// Thêm hàm applyVoucher
const applyVoucher = async () => {
  if (!voucherCode.value) return;

  applyingVoucher.value = true;
  try {
    const response = await promotionService.getByCode(voucherCode.value);
    if (response?.data) {
      const voucher = response.data;

      if (voucher.type !== "voucher") {
        toast.error("Mã không phải là voucher giảm giá!");
        return;
      }

      console.log("Check min_order_value:", {
        totalPriceBeforeVoucher: totalPriceBeforeVoucher.value,
        min_order_value: voucher.voucher_condition?.min_order_value,
      });
      if (
        voucher.voucher_condition?.min_order_value &&
        totalPriceBeforeVoucher.value <
          voucher.voucher_condition.min_order_value
      ) {
        toast.error(
          `Đơn hàng tối thiểu phải là ₫${voucher.voucher_condition.min_order_value.toLocaleString()}`
        );
        return;
      }

      appliedVoucher.value = voucher;
      localStorage.setItem("appliedVoucher", JSON.stringify(voucher));
      showVoucherInput.value = false;
      voucherCode.value = "";
      toast.success("Áp dụng mã giảm giá thành công!", {
        autoClose: 3000,
      });
    }
  } catch (error) {
    toast.error("Mã giảm giá không hợp lệ hoặc đã hết hạn!");
  } finally {
    applyingVoucher.value = false;
  }
};

// Thêm hàm removeVoucher
const removeVoucher = () => {
  appliedVoucher.value = null;
  localStorage.removeItem("appliedVoucher");
  toast.info("Đã xóa mã giảm giá");
};

// Thêm formatDate function
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

onMounted(async () => {
  const items = localStorage.getItem("checkoutItems");
  const voucher = localStorage.getItem("appliedVoucher");
  if (items) {
    checkoutItems.value = JSON.parse(items);
  } else {
    toast.warning("Không có sản phẩm để thanh toán!");
    router.push("/cart");
  }

  if (voucher) {
    appliedVoucher.value = JSON.parse(voucher);
  }

  await fetchAvailableVouchers();

  // Pre-fill customer information from localStorage
  const userInfo = localStorage.getItem("user");
  if (userInfo) {
    try {
      const user = JSON.parse(userInfo);
      customer.value = {
        name: user.fullname || user.name || "",
        phone: user.phone || "",
        address: user.address || "",
        note: "",
      };
    } catch (error) {
      console.error("Error parsing user info:", error);
    }
  }
});

const totalProductPrice = computed(() =>
  checkoutItems.value.reduce(
    (sum, item) => sum + item.variant.originPrice * item.variant.quantity,
    0
  )
);

const totalPriceBeforeVoucher = computed(() =>
  checkoutItems.value.reduce(
    (sum, item) => sum + item.variant.price * item.variant.quantity,
    0
  )
);

const totalPrice = computed(() => {
  let total = checkoutItems.value.reduce(
    (sum, item) => sum + item.variant.price * item.variant.quantity,
    0
  );

  if (appliedVoucher.value) {
    const discount = (total * appliedVoucher.value.discount) / 100;
    const maxDiscount =
      appliedVoucher.value.voucher_condition?.max_discount || Infinity;
    total -= Math.min(discount, maxDiscount);
  }

  return total;
});

const totalDiscount = computed(() => {
  const productDiscount =
    totalProductPrice.value -
    checkoutItems.value.reduce(
      (sum, item) => sum + item.variant.price * item.variant.quantity,
      0
    );

  let voucherDiscount = 0;
  if (appliedVoucher.value) {
    const subtotal = checkoutItems.value.reduce(
      (sum, item) => sum + item.variant.price * item.variant.quantity,
      0
    );
    const discount = (subtotal * appliedVoucher.value.discount) / 100;
    const maxDiscount =
      appliedVoucher.value.voucher_condition?.max_discount || Infinity;
    voucherDiscount = Math.min(discount, maxDiscount);
  }

  return productDiscount + voucherDiscount;
});

const submitOrder = async () => {
  if (!validateForm()) {
    return;
  }

  try {
    isLoading.value = true;

    const userInfo = JSON.parse(localStorage.getItem("user"));

    const orderData = {
      items: checkoutItems.value.map((item) => ({
        productId: item.productId._id,
        variants: [
          {
            _id: item.variant._id,
            sku: item.variant.sku,
            quantity: item.variant.quantity,
            price: item.variant.price,
          },
        ],
        quantity: item.variant.quantity,
        price: item.variant.price,
      })),
      customerInfo: {
        customerId: userInfo.id,
        name: customer.value.name,
        phone: customer.value.phone,
        address: customer.value.address,
      },
      total_product_price: totalProductPrice.value,
      total_price: totalPrice.value,
      discount: totalDiscount.value,
      method: paymentMethod.value,
      note: customer.value.note || "",
      voucher: appliedVoucher.value
        ? {
            code: appliedVoucher.value.code,
            discount: appliedVoucher.value.discount,
            max_discount: appliedVoucher.value.voucher_condition?.max_discount,
          }
        : null,
    };

    const response = await orderService.create(orderData);
    if (response) {
      localStorage.removeItem("checkoutItems");
      localStorage.removeItem("appliedVoucher");

      try {
        const cart = await cartService.getCart();
        if (cart) {
          for (const item of checkoutItems.value) {
            await cartService.removeFromCart(
              cart._id,
              item.productId._id,
              item.variantId
            );
          }
        }
      } catch {
        // Silently handle cart removal error
      }

      toast.success("Đặt hàng thành công!", {
        autoClose: 500,
      });
      router.push("/");
    }
  } catch (error) {
    console.error("Error creating order:", error);
    toast.error(error.response?.data?.message || "Có lỗi xảy ra khi đặt hàng!");
  } finally {
    isLoading.value = false;
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

.checkout-container {
  min-height: 100vh;
  background-color: #f8f9fa;
  padding: 2rem 0;
  margin-bottom: 3rem;
}

.checkout-wrapper {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.checkout-container h1 {
  color: #2c3e50;
  font-size: 1.75rem;
  margin-bottom: 1.5rem;
  text-align: center;
  font-weight: 600;
}

.checkout-content {
  display: flex;
  gap: 2rem;
  flex-wrap: wrap;
}

.checkout-form,
.checkout-products {
  background: #fff;
  border-radius: 10px;
  padding: 1.5rem;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  height: 100%;
}

.checkout-form h2 {
  color: #2c3e50;
  font-size: 1.25rem;
  margin-bottom: 1.25rem;
  font-weight: 600;
}

.form-group {
  margin-bottom: 1.25rem;
}

.form-group label {
  font-weight: 500;
  display: block;
  margin-bottom: 0.4rem;
  color: #4b5563;
  font-size: 0.95rem;
}

.form-control {
  width: 100%;
  padding: 0.7rem 0.9rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.95rem;
  background: #fff;
  transition: all 0.2s ease;
}

.form-control:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.checkout-products {
  flex: 1.2;
  min-width: 300px;
  order: 2;
  background: #fff;
  border-radius: 10px;
  padding: 1.25rem;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.checkout-products h2 {
  color: #2c3e50;
  font-size: 1.25rem;
  margin-bottom: 1.25rem;
  font-weight: 600;
}

.checkout-product {
  display: flex;
  gap: 1.25rem;
  border-bottom: 1px solid #edf2f7;
  padding: 1.25rem 0;
  align-items: center;
  transition: transform 0.2s ease;
}

.checkout-product:hover {
  transform: translateX(5px);
}

.checkout-product img {
  width: 90px;
  height: 90px;
  object-fit: cover;
  border-radius: 8px;
  background: #f8f9fa;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.product-info {
  flex: 1;
}

.product-name {
  font-weight: 600;
  font-size: 1.1rem;
  color: #2c3e50;
  margin-bottom: 0.4rem;
}

.product-sku,
.product-quantity {
  color: #64748b;
  font-size: 0.95rem;
  margin-bottom: 0.25rem;
}

.product-price {
  margin-top: 0.5rem;
}

.price-old {
  color: #94a3b8;
  text-decoration: line-through;
  margin-right: 0.8rem;
  font-size: 0.95rem;
}

.price-sale {
  color: #ef4444;
  font-weight: 600;
  font-size: 1.1rem;
}

.checkout-summary {
  margin: 1.5rem 0 1.25rem 0;
  font-size: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  background: #f8fafc;
  padding: 1.25rem;
  border-radius: 8px;
}

.checkout-summary > div {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #4b5563;
}

.total-price {
  font-weight: 600;
  font-size: 1.2rem;
  margin-top: 0.6rem;
  padding-top: 0.6rem;
  border-top: 2px solid #e2e8f0;
  color: #2c3e50;
}

.summary-price {
  color: #ef4444;
  font-weight: 600;
}

.summary-old {
  color: #94a3b8;
  text-decoration: line-through;
}

.summary-save {
  color: #10b981;
  font-weight: 500;
}

.submit-btn {
  width: 100%;
  padding: 1rem;
  background: #3b82f6;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-top: 1.5rem;
}

.submit-btn:hover {
  background: #2563eb;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);
}

.submit-btn:disabled {
  background: #94a3b8;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.required {
  color: #ef4444;
  margin-left: 2px;
}

.form-control:invalid,
.form-control:invalid:focus {
  border-color: #ef4444;
}

.form-control:valid,
.form-control:valid:focus {
  border-color: #10b981;
}

@media (max-width: 991px) {
  .checkout-wrapper {
    padding: 0 0.75rem;
  }

  .checkout-form,
  .checkout-products {
    margin-bottom: 1rem;
  }
}

@media (max-width: 576px) {
  .checkout-wrapper {
    padding: 0 0.5rem;
  }

  .checkout-form,
  .checkout-products {
    padding: 1rem;
  }
}

.voucher-applied {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #4b5563;
  font-size: 0.95rem;
  padding: 0.4rem 0;
  border-bottom: 1px dashed #e2e8f0;
}

.voucher-code {
  color: #3b82f6;
  font-weight: 500;
  background: #f0f7ff;
  padding: 0.2rem 0.6rem;
  border-radius: 4px;
  border: 1px dashed #3b82f6;
}

/* Voucher Section Styles */
.voucher-section {
  background: white;
  border-radius: 8px;
  padding: 1rem;
  margin: 1rem 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.voucher-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.8rem;
  border-bottom: 1px solid #f0f0f0;
}

.voucher-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.voucher-title i {
  color: #3498db;
  font-size: 1rem;
}

.voucher-header h3 {
  font-size: 1.1rem;
  color: #2c3e50;
  margin: 0;
  font-weight: 600;
}

.apply-voucher-btn {
  background: #3498db;
  border: none;
  color: white;
  padding: 0.4rem 0.8rem;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s;
  font-weight: 500;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.voucher-input-container {
  margin-bottom: 1rem;
  background: #f8f9fa;
  padding: 0.8rem;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.voucher-input-wrapper {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  margin-bottom: 0.6rem;
}

.input-group {
  flex: 1;
  position: relative;
  width: 100%;
}

.input-icon {
  position: absolute;
  left: 0.8rem;
  top: 50%;
  transform: translateY(-50%);
  color: #6c757d;
  font-size: 0.9rem;
}

.voucher-input {
  width: 100%;
  padding: 0.6rem 0.8rem 0.6rem 2rem;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  font-size: 0.9rem;
  transition: all 0.3s;
}

.apply-btn {
  width: 100%;
  background: #3498db;
  color: white;
  border: none;
  padding: 0.6rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s;
  font-weight: 500;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
}

.applied-voucher {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f0f7ff;
  padding: 0.8rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  border: 1px solid #3498db;
}

.voucher-info {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.voucher-details {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.voucher-icon {
  color: #3498db;
  font-size: 1rem;
}

.voucher-code {
  font-weight: 600;
  color: #2c3e50;
  font-size: 1rem;
  background: white;
  padding: 0.3rem 0.6rem;
  border-radius: 4px;
  border: 1px dashed #3498db;
}

.voucher-discount {
  color: #e74c3c;
  font-weight: 600;
  font-size: 1rem;
  background: #fff5f5;
  padding: 0.3rem 0.8rem;
  border-radius: 6px;
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.remove-voucher-btn {
  background: none;
  border: none;
  color: #6c757d;
  cursor: pointer;
  padding: 0.5rem;
  transition: all 0.3s;
  font-size: 1.1rem;
}

.remove-voucher-btn:hover {
  color: #e74c3c;
  transform: scale(1.1);
}

.available-vouchers {
  margin-top: 1rem;
}

.available-vouchers h4 {
  color: #2c3e50;
  margin-bottom: 0.8rem;
  font-size: 1rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.voucher-list {
  display: flex;
  flex-direction: row;
  gap: 0.7rem;
  overflow-x: auto;
  overflow-y: hidden;
  width: 100%;
  max-width: 100%;
  padding-bottom: 0.3rem;
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
}

.voucher-item {
  min-width: 280px;
  max-width: 100%;
  flex: 0 0 280px;
  background: #f8f9fa;
  border-radius: 12px;
  border: 1.2px dashed #d1d5db;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.03);
  position: relative;
  padding: 0.5rem 0.7rem;
  margin-bottom: 0;
  scroll-snap-align: start;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 110px;
  transition: box-shadow 0.2s, border-color 0.2s;
}

.voucher-item.selected {
  border-color: #3498db;
  background: #eaf6ff;
  box-shadow: 0 4px 16px rgba(52, 152, 219, 0.08);
}

.voucher-item::before,
.voucher-item::after {
  content: "";
  position: absolute;
  width: 18px;
  height: 36px;
  background: #fff;
  border-radius: 50%;
  top: 50%;
  transform: translateY(-50%);
  z-index: 2;
}

.voucher-item::before {
  left: -9px;
  border-right: 1.5px dashed #d1d5db;
}

.voucher-item::after {
  right: -9px;
  border-left: 1.5px dashed #d1d5db;
}

.voucher-main {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  margin-bottom: 0.2rem;
}

.voucher-code {
  font-weight: bold;
  font-size: 1rem;
  color: #22223b;
  letter-spacing: 0.5px;
  background: #fff;
  border: 1px dashed #bcd;
  border-radius: 6px;
  padding: 0.1rem 0.5rem;
  margin-right: 0.2rem;
}

.voucher-conditions {
  font-size: 0.92rem;
  color: #666;
  margin-bottom: 0.1rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem 0.7rem;
  align-items: center;
}

.voucher-conditions .condition-item {
  display: flex;
  align-items: center;
  gap: 0.2rem;
  font-size: 0.92rem;
}

.voucher-date {
  color: #888;
  font-size: 0.92rem;
  margin-bottom: 0.1rem;
  display: flex;
  align-items: center;
  gap: 0.2rem;
}

.voucher-description {
  color: #444;
  font-size: 0.92rem;
  margin: 0.1rem 0 0.2rem 0;
  line-height: 1.3;
}

.voucher-discount {
  color: #e74c3c;
  font-weight: 600;
  font-size: 0.95rem;
  background: #fff5f5;
  padding: 0.18rem 0.7rem;
  border-radius: 5px;
  white-space: nowrap;
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  margin-top: 0.2rem;
}

@media (min-width: 576px) {
  .voucher-input-wrapper {
    flex-direction: row;
  }

  .apply-btn {
    width: auto;
    min-width: 100px;
  }
}

@media (max-width: 576px) {
  .voucher-section {
    padding: 0.8rem;
  }

  .voucher-header {
    flex-direction: column;
    gap: 0.8rem;
    align-items: flex-start;
  }

  .voucher-item {
    min-width: 260px;
    flex: 0 0 260px;
  }

  .voucher-conditions {
    font-size: 0.85rem;
  }
}
.payment-method-section {
  margin: 1.5rem 0;
  padding: 1.25rem;
  background: #f8fafc;
  border-radius: 8px;
}

.payment-method-section h3 {
  color: #2c3e50;
  font-size: 1.1rem;
  margin-bottom: 1rem;
  font-weight: 600;
}

.payment-methods {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.payment-method {
  display: flex;
  align-items: center;
  padding: 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: white;
}

.payment-method:hover {
  border-color: #3b82f6;
}

.payment-method input[type="radio"] {
  margin-right: 1rem;
  width: 20px;
  height: 20px;
  accent-color: #3b82f6;
}

.method-content {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
}

.method-content i {
  font-size: 1.5rem;
  color: #3b82f6;
}

.method-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.method-name {
  font-weight: 600;
  color: #2c3e50;
  font-size: 1rem;
}

.method-description {
  color: #64748b;
  font-size: 0.9rem;
}

.payment-method input[type="radio"]:checked + .method-content {
  color: #3b82f6;
}

.payment-method input[type="radio"]:checked + .method-content .method-name {
  color: #3b82f6;
}

@media (max-width: 576px) {
  .payment-method {
    padding: 0.8rem;
  }

  .method-content i {
    font-size: 1.2rem;
  }

  .method-name {
    font-size: 0.9rem;
  }

  .method-description {
    font-size: 0.8rem;
  }
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
