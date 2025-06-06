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

          <!-- Voucher Selection -->
          <div class="voucher-section">
            <div class="voucher-header">
              <h3>Mã giảm giá</h3>
              <div class="best-price-info" v-if="bestPossiblePrice.voucher">
                <div class="voucher-info">
                  <span class="voucher-name">{{
                    bestPossiblePrice.voucher.name
                  }}</span>
                  <span class="voucher-code">{{
                    bestPossiblePrice.voucher.code
                  }}</span>
                  <span class="voucher-discount"
                    >-{{ bestPossiblePrice.voucher.discount }}%</span
                  >
                </div>
                <div class="price-info">
                  <span class="best-price-value"
                    >₫{{ bestPossiblePrice.price.toLocaleString() }}</span
                  >
                  <span class="best-price-save"
                    >(Tiết kiệm: ₫{{
                      bestPossiblePrice.discount.toLocaleString()
                    }})</span
                  >
                </div>
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
  <Chatbot />
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import { toast } from "vue3-toastify";
import Header from "../components/Header.vue";
import Footer from "../components/Footer.vue";
import Chatbot from "../components/Chatbot.vue";
import { cartService } from "../services/cart.service";
import { productService } from "../services/product.service";
import { getVariantPrice } from "../services/product.service";
import { promotionService } from "../services/promotion.service";

const router = useRouter();
const cartItems = ref([]);
const loading = ref(true);
const error = ref(null);
const selectedItems = ref([]);

// Voucher related states
const appliedVoucher = ref(null);
const availableVouchers = ref([]);
const loadingVouchers = ref(true);

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
  let total = selectedItems.value.reduce((total, item) => {
    return total + item.variant.price * item.variant.quantity;
  }, 0);

  if (appliedVoucher.value) {
    const discount = (total * appliedVoucher.value.discount) / 100;
    const maxDiscount =
      appliedVoucher.value.voucher_condition?.max_discount || Infinity;
    total -= Math.min(discount, maxDiscount);
  }

  return total;
});

const selectedTotalOldPrice = computed(() => {
  return selectedItems.value.reduce((total, item) => {
    return total + item.variant.originPrice * item.variant.quantity;
  }, 0);
});

const bestPossiblePrice = computed(() => {
  if (
    availableVouchers.value.length === 0 ||
    selectedItems.value.length === 0
  ) {
    const subtotal = selectedItems.value.reduce(
      (sum, item) => sum + item.variant.price * item.variant.quantity,
      0
    );
    return {
      price: subtotal,
      voucher: null,
      discount: 0,
    };
  }

  const subtotal = selectedItems.value.reduce(
    (sum, item) => sum + item.variant.price * item.variant.quantity,
    0
  );
  let bestPrice = subtotal;
  let bestVoucher = null;
  let bestDiscount = 0;

  availableVouchers.value.forEach((voucher) => {
    if (voucher.type === "voucher") {
      if (
        !voucher.voucher_condition?.min_order_value ||
        subtotal >= voucher.voucher_condition.min_order_value
      ) {
        const discount = (subtotal * voucher.discount) / 100;
        const maxDiscount = voucher.voucher_condition?.max_discount || Infinity;
        const finalDiscount = Math.min(discount, maxDiscount);
        const priceAfterDiscount = subtotal - finalDiscount;

        if (priceAfterDiscount < bestPrice) {
          bestPrice = priceAfterDiscount;
          bestVoucher = voucher;
          bestDiscount = finalDiscount;
        }
      }
    }
  });

  return {
    price: bestPrice,
    voucher: bestVoucher,
    discount: bestDiscount,
  };
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
        for (const variant of item.variants) {
          try {
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

  if (newQuantity > 0) {
    try {
      // Get current cart first
      const cartResponse = await cartService.getCart();

      if (!cartResponse || !cartResponse._id) {
        throw new Error("Không tìm thấy giỏ hàng");
      }

      // Check if we have enough stock
      const stockResponse = await productService.getVariantStock(
        item.productId._id,
        variant._id
      );

      let currentStock = 0;
      if (stockResponse?.data?.stockQuantity !== undefined) {
        currentStock = stockResponse.data.stockQuantity;
      } else if (stockResponse?.data?.data?.stockQuantity !== undefined) {
        currentStock = stockResponse.data.data.stockQuantity;
      }

      if (currentStock < newQuantity) {
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

        if (updateResponse && updateResponse.success) {
          // Update local state only if API call succeeds
          variant.quantity = newQuantity;
          variant.stockQuantity = currentStock;
          toast.success("Cập nhật số lượng thành công!");
          applyOptimalVoucher();
        } else {
          throw new Error(updateResponse?.message || "Cập nhật thất bại");
        }
      } catch (updateError) {
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
    // Tự động áp dụng voucher tối ưu sau khi xóa sản phẩm
    applyOptimalVoucher();
  } catch (error) {
    toast.error("Xóa sản phẩm thất bại!");
  }
};

const toggleSelectAll = () => {
  if (isAllSelected.value) {
    selectedItems.value = [];
    // Xóa voucher khi bỏ chọn tất cả
    appliedVoucher.value = null;
  } else {
    selectedItems.value = [...flattenedCartItems.value];
    // Tự động áp dụng voucher tối ưu khi chọn tất cả
    applyOptimalVoucher();
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

  // Tự động áp dụng voucher tối ưu khi thay đổi sản phẩm được chọn
  if (selectedItems.value.length > 0) {
    applyOptimalVoucher();
  } else {
    // Nếu không có sản phẩm nào được chọn, xóa voucher đang áp dụng
    appliedVoucher.value = null;
  }
};

const isItemSelected = (item) => {
  const isSelected = selectedItems.value.some(
    (i) => i.variantId === item.variantId
  );
  return isSelected;
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
    // Tự động áp dụng voucher tối ưu sau khi xóa nhiều sản phẩm
    applyOptimalVoucher();
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

// Thêm hàm findOptimalVoucher
const findOptimalVoucher = (vouchers, orderValue) => {
  let optimalVoucher = null;
  let maxDiscount = 0;

  vouchers.forEach((voucher) => {
    if (
      voucher.type === "voucher" &&
      (!voucher.voucher_condition?.min_order_value ||
        orderValue >= voucher.voucher_condition.min_order_value)
    ) {
      const discount = (orderValue * voucher.discount) / 100;
      const maxDiscountAmount =
        voucher.voucher_condition?.max_discount || Infinity;
      const finalDiscount = Math.min(discount, maxDiscountAmount);

      if (finalDiscount > maxDiscount) {
        maxDiscount = finalDiscount;
        optimalVoucher = voucher;
      }
    }
  });

  return optimalVoucher;
};

// Thêm hàm applyOptimalVoucher
const applyOptimalVoucher = () => {
  if (availableVouchers.value.length > 0) {
    const optimalVoucher = findOptimalVoucher(
      availableVouchers.value,
      selectedTotalPrice.value
    );
    if (optimalVoucher) {
      appliedVoucher.value = optimalVoucher;
    }
  }
};

// Sửa lại hàm fetchAvailableVouchers
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
  } finally {
    loadingVouchers.value = false;
  }
};

const copyVoucherCode = (code) => {
  navigator.clipboard
    .writeText(code)
    .then(() => {
      toast.success("Đã sao chép mã giảm giá!");
    })
    .catch(() => {
      toast.error("Không thể sao chép mã giảm giá!");
    });
};

// Remove unrelated logs, add watch for bestPossiblePrice
watch(bestPossiblePrice, (val) => {}, { immediate: true });

onMounted(async () => {
  const token = localStorage.getItem("token");
  if (!token) {
    toast.warning("Vui lòng đăng nhập để xem giỏ hàng!");
    router.push("/login");
  } else {
    await Promise.all([fetchCart(), fetchAvailableVouchers()]);
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

/* Voucher Section Styles */
.voucher-section {
  background: white;
  border-radius: 8px;
  padding: 1rem;
  margin: 0.8rem 0;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
}

.voucher-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.8rem;
  border-bottom: 1px solid #eee;
}

.voucher-header h3 {
  font-size: 1.1rem;
  color: #2c3e50;
  margin: 0;
  font-weight: 600;
}

.best-price-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  background: #f0f7ff;
  padding: 0.8rem;
  border-radius: 6px;
  border: 1px dashed #3498db;
}

.voucher-info {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  flex-wrap: wrap;
}

.voucher-name {
  color: #2c3e50;
  font-weight: 500;
}

.voucher-code {
  color: #3498db;
  font-weight: 600;
  font-family: monospace;
  letter-spacing: 0.5px;
}

.voucher-discount {
  color: #e74c3c;
  font-weight: 600;
}

.price-info {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  flex-wrap: wrap;
}

.best-price-value {
  color: #e74c3c;
  font-weight: 600;
  font-size: 1.1rem;
}

.best-price-save {
  color: #27ae60;
  font-size: 0.9rem;
}

@media (max-width: 768px) {
  .voucher-info,
  .price-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.3rem;
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
