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
        <div class="checkout-content">
          <!-- Thông tin sản phẩm -->
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
                <div class="product-sku">Phân loại: {{ item.variant.sku }}</div>
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
          </div>

          <!-- Thông tin khách hàng -->
          <div class="checkout-form">
            <h2>Thông tin nhận hàng</h2>
            <form @submit.prevent="submitOrder">
              <div class="form-group">
                <label>Họ tên <span class="required">*</span></label>
                <input
                  v-model="customer.name"
                  required
                  placeholder="Nhập họ tên của bạn"
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
                />
              </div>
              <div class="form-group">
                <label>Địa chỉ <span class="required">*</span></label>
                <input
                  v-model="customer.address"
                  required
                  placeholder="Nhập địa chỉ của bạn"
                />
              </div>
              <div class="form-group">
                <label>Ghi chú</label>
                <textarea
                  v-model="customer.note"
                  rows="2"
                  placeholder="Nhập ghi chú (nếu có)"
                />
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
                <div class="total-price">
                  <span>Tổng thanh toán:</span>
                  <span class="summary-price"
                    >₫{{ totalPrice.toLocaleString() }}</span
                  >
                </div>
              </div>
              <button class="submit-btn" type="submit" :disabled="isLoading">
                {{ isLoading ? "Đã xác nhận..." : "Đặt hàng" }}
              </button>
            </form>
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

const router = useRouter();
const checkoutItems = ref([]);
const isLoading = ref(false);
const customer = ref({
  name: "",
  phone: "",
  address: "",
  note: "",
});

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

onMounted(async () => {
  const items = localStorage.getItem("checkoutItems");
  if (items) {
    checkoutItems.value = JSON.parse(items);
  } else {
    toast.warning("Không có sản phẩm để thanh toán!");
    router.push("/cart");
  }

  // Pre-fill customer information from localStorage
  const userInfo = localStorage.getItem("user");
  if (userInfo) {
    try {
      const user = JSON.parse(userInfo);
      console.log("User info:", user);

      // Map user info to form fields, handling both Google login and regular login
      customer.value = {
        name: user.fullname || user.name || "", // Handle both fullname and name fields
        phone: user.phone || "",
        address: user.address || "",
        note: "",
      };

      console.log("Customer form data:", customer.value);
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

const totalPrice = computed(() =>
  checkoutItems.value.reduce(
    (sum, item) => sum + item.variant.price * item.variant.quantity,
    0
  )
);

const totalDiscount = computed(
  () => totalProductPrice.value - totalPrice.value
);

const submitOrder = async () => {
  if (!validateForm()) {
    return;
  }

  try {
    isLoading.value = true;

    // Get user info from localStorage
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
      method: "COD",
      note: customer.value.note || "",
    };

    const response = await orderService.create(orderData);
    if (response) {
      // Clear checkout items from localStorage
      localStorage.removeItem("checkoutItems");

      // Try to remove items from cart if cart exists
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

      toast.success("Đặt hàng thành công!");
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

.checkout-products {
  flex: 1.2;
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

.checkout-form {
  flex: 1;
  background: #fff;
  border-radius: 10px;
  padding: 1.5rem;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
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

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 0.7rem 0.9rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.95rem;
  background: #fff;
  transition: all 0.2s ease;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
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
  padding: 0.9rem;
  background: #3b82f6;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  text-transform: uppercase;
  letter-spacing: 0.5px;
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

.form-group input:invalid,
.form-group input:invalid:focus {
  border-color: #ef4444;
}

.form-group input:valid,
.form-group input:valid:focus {
  border-color: #10b981;
}

@media (max-width: 900px) {
  .checkout-content {
    flex-direction: column;
  }

  .checkout-container {
    padding: 1.25rem 0;
  }

  .checkout-wrapper {
    padding: 0 0.75rem;
  }

  .checkout-product img {
    width: 70px;
    height: 70px;
  }
}

/* Additional responsive styles */
@media (max-width: 576px) {
  .page-container {
    padding: 5px;
  }

  .breadcrumb {
    font-size: 11px;
    padding: 0 5px;
  }

  .checkout-container {
    padding: 1rem 0;
  }

  .checkout-wrapper {
    padding: 0 0.5rem;
  }

  .checkout-container h1 {
    font-size: 1.5rem;
  }
}
</style>
