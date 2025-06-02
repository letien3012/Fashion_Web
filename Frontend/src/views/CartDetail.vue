<template>
  <Header />
  <div class="page-container">
    <div class="breadcrumb">
      <router-link to="/">Trang chủ</router-link>
      <span class="separator">/</span>
      <span class="current">Giỏ hàng</span>
    </div>
    <div class="cart-container">
      <div class="cart-wrapper">
        <div class="cart-header">
          <h1>Giỏ Hàng</h1>
          <p class="cart-subtitle">Quản lý sản phẩm bạn muốn mua</p>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="loading-container">
          <div class="loading-spinner"></div>
          <p>Đang tải giỏ hàng...</p>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="error-container">
          <div class="error-icon">!</div>
          <p>{{ error }}</p>
          <button @click="fetchCart" class="retry-button">Thử lại</button>
        </div>

        <!-- Empty Cart -->
        <div v-else-if="cartItems.length === 0" class="empty-cart">
          <div class="empty-cart-icon">
            <i class="fas fa-shopping-cart"></i>
          </div>
          <h2>Giỏ hàng trống</h2>
          <p>Bạn chưa có sản phẩm nào trong giỏ hàng</p>
          <router-link to="/" class="continue-shopping">
            Tiếp tục mua sắm
          </router-link>
        </div>

        <!-- Cart Content -->
        <div v-else class="cart-content">
          <!-- Cart Actions -->
          <div class="cart-actions">
            <label class="select-all">
              <input
                type="checkbox"
                :checked="isAllSelected"
                @change="toggleSelectAll"
              />
              <span>Chọn tất cả ({{ flattenedCartItems.length }})</span>
            </label>
            <button
              v-if="selectedItems.length > 0"
              @click="removeSelectedItems"
              class="remove-selected"
            >
              <i class="fas fa-trash"></i>
              Xóa đã chọn
            </button>
          </div>

          <!-- Cart Items -->
          <div class="cart-items">
            <div
              v-for="item in flattenedCartItems"
              :key="item.variantId"
              class="cart-item"
            >
              <div class="item-select">
                <input
                  type="checkbox"
                  :checked="isItemSelected(item)"
                  @change="toggleItemSelection(item)"
                />
              </div>
              <div class="item-content">
                <div class="item-image">
                  <img
                    :src="
                      'http://localhost:3005/' +
                      (item.variant.image || item.productId.image)
                    "
                    :alt="item.productId.name"
                  />
                </div>
                <div class="item-details">
                  <h3 class="item-name">{{ item.productId.name }}</h3>
                  <p class="item-variant">Phân loại: {{ item.variant.sku }}</p>
                  <div class="item-quantity">
                    <button
                      @click="updateQuantity(item, item.variant, -1)"
                      :disabled="item.variant.quantity <= 1"
                      class="quantity-btn"
                    >
                      <i class="fas fa-minus"></i>
                    </button>
                    <span class="quantity">{{ item.variant.quantity }}</span>
                    <button
                      @click="updateQuantity(item, item.variant, 1)"
                      :disabled="
                        item.variant.quantity >= item.variant.stockQuantity
                      "
                      class="quantity-btn"
                    >
                      <i class="fas fa-plus"></i>
                    </button>
                  </div>
                  <p
                    :class="[
                      'stock-status',
                      item.variant.stockQuantity === undefined
                        ? 'stock-unknown'
                        : item.variant.quantity >= item.variant.stockQuantity
                        ? 'stock-warning'
                        : 'stock-available',
                    ]"
                  >
                    {{
                      item.variant.stockQuantity === undefined
                        ? "Đang cập nhật tồn kho"
                        : item.variant.quantity >= item.variant.stockQuantity
                        ? `Chỉ còn ${item.variant.stockQuantity} sản phẩm`
                        : `Còn ${item.variant.stockQuantity} sản phẩm trong kho`
                    }}
                  </p>
                </div>
                <div class="item-price-wrapper">
                  <div class="item-price">
                    <template
                      v-if="item.variant.price < item.variant.originPrice"
                    >
                      <span class="original-price">
                        ₫{{
                          (
                            item.variant.originPrice * item.variant.quantity
                          ).toLocaleString()
                        }}
                      </span>
                      <span class="sale-price">
                        ₫{{
                          (
                            item.variant.price * item.variant.quantity
                          ).toLocaleString()
                        }}
                      </span>
                    </template>
                    <template v-else>
                      <span class="sale-price">
                        ₫{{
                          (
                            item.variant.price * item.variant.quantity
                          ).toLocaleString()
                        }}
                      </span>
                    </template>
                  </div>
                </div>
                <button class="remove-item" @click="removeItem(item)">
                  <i class="fas fa-trash-alt"></i>
                </button>
              </div>
            </div>
          </div>

          <!-- Cart Summary -->
          <div class="cart-summary">
            <div class="summary-content">
              <div class="selected-count">
                Đã chọn {{ selectedItems.length }} sản phẩm
              </div>
              <div class="price-summary">
                <template v-if="selectedTotalOldPrice > selectedTotalPrice">
                  <div class="price-row">
                    <span>Tổng tiền hàng:</span>
                    <span class="original-total">
                      ₫{{ selectedTotalOldPrice.toLocaleString() }}
                    </span>
                  </div>
                  <div class="price-row">
                    <span>Tiết kiệm:</span>
                    <span class="savings">
                      ₫{{
                        (
                          selectedTotalOldPrice - selectedTotalPrice
                        ).toLocaleString()
                      }}
                    </span>
                  </div>
                  <div class="price-row total">
                    <span>Thành tiền:</span>
                    <span class="final-price">
                      ₫{{ selectedTotalPrice.toLocaleString() }}
                    </span>
                  </div>
                </template>
                <template v-else>
                  <div class="price-row total">
                    <span>Thành tiền:</span>
                    <span class="final-price">
                      ₫{{ selectedTotalPrice.toLocaleString() }}
                    </span>
                  </div>
                </template>
              </div>
              <button
                class="checkout-button"
                @click="checkout"
                :disabled="selectedItems.length === 0"
              >
                Thanh Toán
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
import { useRouter } from "vue-router";
import { toast } from "vue3-toastify";
import Header from "../components/Header.vue";
import Footer from "../components/Footer.vue";
import { cartService } from "../services/cart.service";
import { productService } from "../services/product.service";
import axios from "axios";
import { getVariantPrice } from "../services/product.service";

const router = useRouter();
const cartItems = ref([]);
const loading = ref(true);
const error = ref(null);
const selectedItems = ref([]);

const flattenedCartItems = computed(() => {
  return cartItems.value.flatMap((item) =>
    item.variants.map((variant) => ({
      ...item,
      variant,
      variantId: variant._id,
      productId: item.productId,
      _id: item._id, // keep the cart item id for removal
    }))
  );
});

const isAllSelected = computed(() => {
  return (
    flattenedCartItems.value.length > 0 &&
    selectedItems.value.length === flattenedCartItems.value.length
  );
});

const selectedTotalPrice = computed(() => {
  return selectedItems.value.reduce((total, item) => {
    return total + item.variant.price * item.variant.quantity;
  }, 0);
});

const selectedTotalOldPrice = computed(() => {
  return selectedItems.value.reduce((total, item) => {
    return total + item.variant.originPrice * item.variant.quantity;
  }, 0);
});

const fetchCart = async () => {
  loading.value = true;
  error.value = null;
  try {
    const cart = await cartService.getCart();
    if (cart && cart.items) {
      cartItems.value = cart.items;
      // Fetch stock quantity for each variant
      for (const item of cartItems.value) {
        console.log("Processing item:", item);
        for (const variant of item.variants) {
          try {
            // Log productId và variantId trước khi gọi API
            console.log(
              "Call getVariantPrice with:",
              item.productId._id,
              variant._id
            );

            // Lấy giá gốc/giá giảm từ backend
            const priceData = await getVariantPrice(
              item.productId._id,
              variant._id
            );
            // Lưu vào variant để dùng khi render
            variant.originPrice = priceData.price;
            variant.priceSale = priceData.priceSale;
            // Gán stockQuantity nếu có
            if (typeof priceData.stockQuantity === "number") {
              variant.stockQuantity = priceData.stockQuantity;
            } else {
              // Nếu không có, gọi API lấy tồn kho
              const stockRes = await productService.getVariantStock(
                item.productId._id,
                variant._id
              );
              if (stockRes?.data?.stockQuantity !== undefined) {
                variant.stockQuantity = stockRes.data.stockQuantity;
              } else if (stockRes?.data?.data?.stockQuantity !== undefined) {
                variant.stockQuantity = stockRes.data.data.stockQuantity;
              } else {
                variant.stockQuantity = 0; // fallback
              }
            }
          } catch (err) {
            variant.stockQuantity = 0;
            variant.originPrice = variant.price; // fallback
            variant.priceSale = null;
            console.error("getVariantPrice error:", err);
          }
        }
      }
    } else {
      cartItems.value = [];
    }
  } catch (err) {
    error.value = "Không thể tải giỏ hàng. Vui lòng thử lại sau.";
    cartItems.value = [];
  } finally {
    loading.value = false;
  }
};

const updateQuantity = async (item, variant, change) => {
  const newQuantity = variant.quantity + change;
  console.log("Updating quantity:", { item, variant, change, newQuantity });

  if (newQuantity > 0) {
    try {
      // Get current cart first
      const cartResponse = await cartService.getCart();
      console.log("Current cart:", cartResponse);

      if (!cartResponse || !cartResponse._id) {
        throw new Error("Không tìm thấy giỏ hàng");
      }

      // Check if we have enough stock
      const stockResponse = await productService.getVariantStock(
        item.productId._id,
        variant._id
      );
      console.log("Current stock response:", stockResponse);

      let currentStock = 0;
      if (stockResponse?.data?.stockQuantity !== undefined) {
        currentStock = stockResponse.data.stockQuantity;
      } else if (stockResponse?.data?.data?.stockQuantity !== undefined) {
        currentStock = stockResponse.data.data.stockQuantity;
      }

      console.log(
        "Current stock:",
        currentStock,
        "Requested quantity:",
        newQuantity
      );

      if (currentStock < newQuantity) {
        console.log("Insufficient stock:", {
          current: currentStock,
          requested: newQuantity,
        });
        toast.warning(`Chỉ còn ${currentStock} sản phẩm trong kho!`);
        return;
      }

      // Update cart item quantity
      try {
        const updateResponse = await cartService.updateCartItem(
          cartResponse._id,
          item.productId._id,
          variant._id,
          newQuantity
        );
        console.log("Update cart response:", updateResponse);

        if (updateResponse && updateResponse.success) {
          // Update local state only if API call succeeds
          variant.quantity = newQuantity;
          variant.stockQuantity = currentStock;
          toast.success("Cập nhật số lượng thành công!");
        } else {
          throw new Error(updateResponse?.message || "Cập nhật thất bại");
        }
      } catch (updateError) {
        console.error("Error updating cart:", updateError);
        if (updateError.response?.status === 400) {
          toast.error(
            updateError.response?.data?.message || "Số lượng không hợp lệ!"
          );
        } else {
          toast.error("Cập nhật số lượng thất bại!");
        }
        // Refresh cart to ensure sync with server
        await fetchCart();
      }
    } catch (error) {
      console.error("Error checking stock:", error);
      toast.error("Không thể kiểm tra số lượng tồn kho!");
    }
  } else {
    toast.warning("Số lượng sản phẩm phải lớn hơn 0!");
  }
};

const removeItem = async (item) => {
  try {
    // Get current cart first
    const cartResponse = await cartService.getCart();
    if (!cartResponse || !cartResponse._id) {
      throw new Error("Không tìm thấy giỏ hàng");
    }

    // Remove only the specific variant
    await cartService.removeCartItem(
      cartResponse._id,
      item.productId._id,
      item.variant._id
    );

    await fetchCart(); // Refresh cart after removal
    selectedItems.value = selectedItems.value.filter(
      (i) => i.variantId !== item.variant._id
    );
    toast.success("Đã xóa sản phẩm khỏi giỏ hàng!");
  } catch (error) {
    console.error("Error removing item:", error);
    toast.error("Xóa sản phẩm thất bại!");
  }
};

const toggleSelectAll = () => {
  if (isAllSelected.value) {
    selectedItems.value = [];
  } else {
    selectedItems.value = [...flattenedCartItems.value];
  }
};

const toggleItemSelection = (item) => {
  const index = selectedItems.value.findIndex(
    (i) => i.variantId === item.variantId
  );
  if (index === -1) {
    selectedItems.value.push(item);
  } else {
    selectedItems.value.splice(index, 1);
  }
};

const isItemSelected = (item) => {
  return selectedItems.value.some((i) => i.variantId === item.variantId);
};

const removeSelectedItems = async () => {
  try {
    // Lấy cartId hiện tại
    const cartResponse = await cartService.getCart();
    if (!cartResponse || !cartResponse._id) {
      throw new Error("Không tìm thấy giỏ hàng");
    }
    // Xóa từng variant đã chọn
    for (const item of selectedItems.value) {
      await cartService.removeCartItem(
        cartResponse._id,
        item.productId._id,
        item.variant._id
      );
    }
    await fetchCart();
    selectedItems.value = [];
    toast.success("Đã xóa các sản phẩm đã chọn!");
  } catch (error) {
    toast.error("Xóa sản phẩm thất bại!");
  }
};

const checkout = () => {
  if (selectedItems.value.length === 0) {
    toast.warning("Vui lòng chọn ít nhất một sản phẩm để thanh toán!");
    return;
  }
  // Store selected items in localStorage for checkout page
  localStorage.setItem("checkoutItems", JSON.stringify(selectedItems.value));
  router.push("/checkout");
};

onMounted(async () => {
  const token = localStorage.getItem("token");
  if (!token) {
    toast.warning("Vui lòng đăng nhập để xem giỏ hàng!");
    router.push("/login");
  } else {
    await fetchCart();
  }
});
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

.cart-container {
  min-height: 100vh;
  background-color: #f8f9fa;
  padding: 2rem 0;
  margin-bottom: 3rem;
}

.cart-wrapper {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.cart-header {
  text-align: center;
  margin-bottom: 2rem;
}

.cart-header h1 {
  font-size: 2.5rem;
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.cart-subtitle {
  color: #6c757d;
  font-size: 1.1rem;
}

.loading-container,
.error-container {
  text-align: center;
  padding: 3rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #3498db;
  border-radius: 50%;
  margin: 0 auto 1rem;
  animation: spin 1s linear infinite;
}

.error-icon {
  width: 60px;
  height: 60px;
  background: #ff6b6b;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  margin: 0 auto 1rem;
}

.retry-button {
  background: #3498db;
  color: white;
  border: none;
  padding: 0.75rem 2rem;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.3s;
}

.retry-button:hover {
  background: #2980b9;
}

.empty-cart {
  text-align: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.empty-cart-icon {
  font-size: 4rem;
  color: #bdc3c7;
  margin-bottom: 1rem;
}

.continue-shopping {
  display: inline-block;
  background: #3498db;
  color: white;
  padding: 1rem 2rem;
  border-radius: 6px;
  text-decoration: none;
  margin-top: 1rem;
  transition: background 0.3s;
}

.continue-shopping:hover {
  background: #2980b9;
}

.cart-content {
  background: white;
  border-radius: 12px;
  overflow: hidden;
}

.cart-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: white;
  border-radius: 12px 12px 0 0;
  margin-bottom: 1rem;
}

.select-all {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.select-all input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.remove-selected {
  background: #ff6b6b;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: background 0.3s;
}

.remove-selected:hover {
  background: #ff5252;
}

.cart-items {
  background: white;
  border-radius: 12px;
  overflow: hidden;
}

.cart-item {
  display: flex;
  align-items: flex-start;
  padding: 1.5rem;
  border-bottom: 1px solid #eee;
  position: relative;
}

.item-select {
  padding-top: 0.5rem;
  margin-right: 1rem;
}

.item-select input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.item-content {
  display: flex;
  flex: 1;
  gap: 1.5rem;
  align-items: center;
}

.item-image img {
  width: 120px;
  height: 120px;
  object-fit: cover;
  border-radius: 8px;
}

.item-details {
  flex: 1;
}

.item-name {
  font-size: 1.2rem;
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.item-variant {
  color: #6c757d;
  margin-bottom: 1rem;
}

.item-quantity {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.5rem;
}

.quantity-btn {
  width: 32px;
  height: 32px;
  border: 1px solid #dee2e6;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

.quantity-btn:not(:disabled):hover {
  background: #f8f9fa;
}

.quantity-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.quantity {
  font-size: 1.1rem;
  font-weight: 500;
  min-width: 40px;
  text-align: center;
}

.stock-status {
  font-size: 0.9rem;
  margin-top: 0.5rem;
}

.stock-warning {
  color: #ff6b6b;
}

.stock-available {
  color: #51cf66;
}

.stock-unknown {
  color: #adb5bd;
}

.item-price-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 140px;
  height: 100%;
}

.item-price {
  text-align: center;
  min-width: 120px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
}

.sale-price {
  color: #ff424e;
  font-size: 1.3rem;
  font-weight: 700;
  letter-spacing: 0.5px;
  line-height: 1.1;
}

.original-price {
  color: #b0b0b0;
  font-size: 1rem;
  text-decoration: line-through;
  font-weight: 400;
  margin-top: 2px;
}

.remove-item {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  color: #adb5bd;
  cursor: pointer;
  transition: color 0.3s;
  font-size: 1.5rem;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.remove-item:hover {
  color: #ff424e;
}

.remove-item i {
  font-size: 1.1rem;
}

.cart-summary {
  background: white;
  border-radius: 12px;
  margin-top: 1rem;
  padding: 1.5rem;
}

.summary-content {
  max-width: 400px;
  margin-left: auto;
}

.selected-count {
  color: #6c757d;
  margin-bottom: 1rem;
}

.price-summary {
  border-top: 1px solid #eee;
  padding-top: 1rem;
}

.price-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  color: #6c757d;
}

.price-row.total {
  font-size: 1.2rem;
  color: #2c3e50;
  font-weight: 600;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #eee;
}

.original-total {
  text-decoration: line-through;
  color: #adb5bd;
}

.savings {
  color: #51cf66;
}

.final-price {
  color: #ff6b6b;
  font-size: 1.4rem;
}

.checkout-button {
  width: 100%;
  background: #3498db;
  color: white;
  border: none;
  padding: 1rem;
  border-radius: 6px;
  font-size: 1.1rem;
  cursor: pointer;
  margin-top: 1rem;
  transition: background 0.3s;
}

.checkout-button:not(:disabled):hover {
  background: #2980b9;
}

.checkout-button:disabled {
  background: #bdc3c7;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .cart-container {
    padding: 1rem 0;
  }

  .cart-header h1 {
    font-size: 2rem;
  }

  .item-content {
    flex-direction: column;
  }

  .item-image img {
    width: 100%;
    height: 200px;
  }

  .item-price {
    text-align: left;
    margin-top: 1rem;
  }

  .cart-actions {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }

  .summary-content {
    max-width: 100%;
  }

  .cart-item {
    flex-direction: column;
    padding: 1rem;
  }

  .item-select {
    position: absolute;
    top: 1rem;
    left: 1rem;
    margin-right: 0;
    z-index: 1;
  }

  .item-content {
    margin-left: 2rem;
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

  .cart-container {
    padding: 1rem 0;
  }

  .cart-header h1 {
    font-size: 1.8rem;
  }

  .cart-subtitle {
    font-size: 0.9rem;
  }
}
</style>
