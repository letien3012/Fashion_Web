<template>
  <div class="cart-popup" v-if="visible">
    <div class="cart-popup-content">
      <div v-if="cart.length === 0" class="empty-cart">
        <img
          src="../assets/images/no_cart.png"
          alt="Không có sản phẩm"
          class="empty-img"
        />
        <p>Không có sản phẩm trong giỏ hàng</p>
      </div>
      <div v-else class="cart-items-list">
        <div
          v-for="item in flattenedCart"
          :key="item.variantId"
          class="cart-item"
        >
          <img
            :src="
              'http://localhost:3005/' +
              (item.variant.image || item.productId.image)
            "
            alt="Ảnh sản phẩm"
            class="item-img"
          />
          <div class="item-details">
            <div class="item-title">{{ item.productId?.name }}</div>
            <div class="variant-row">
              <div class="variant-info">
                Phân loại: {{ item.variant.sku }} x{{ item.variant.quantity }}
              </div>
              <div class="item-price-wrapper">
                <template
                  v-if="
                    item.productId?.priceSale &&
                    item.productId?.priceSale < item.variant.price
                  "
                >
                  <span class="price-sale"
                    >₫{{ item.productId.priceSale.toLocaleString() }}</span
                  >
                  <span class="price-old"
                    >₫{{ item.variant.price.toLocaleString() }}</span
                  >
                  <div
                    class="discount-info"
                    style="color: #388e3c; font-size: 12px; font-weight: 500"
                  >
                    Tiết kiệm: ₫{{
                      (
                        (item.variant.price - item.productId.priceSale) *
                        item.variant.quantity
                      ).toLocaleString()
                    }}
                  </div>
                </template>
                <template v-else>
                  <span class="price-sale"
                    >₫{{ item.variant.price.toLocaleString() }}</span
                  >
                </template>
              </div>
            </div>
          </div>
        </div>
        <button class="view-cart-btn" @click="$emit('view-cart')">
          Xem Giỏ Hàng
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, computed } from "vue";
const props = defineProps({
  visible: Boolean,
  cart: {
    type: Array,
    default: () => [],
  },
});

const flattenedCart = computed(() => {
  return props.cart.flatMap((item) =>
    item.variants.map((variant) => ({
      ...item,
      variant,
      variantId: variant._id,
      productId: item.productId,
      _id: item._id,
    }))
  );
});
</script>

<style scoped>
.cart-popup {
  position: absolute;
  top: 60px; /* Adjust as needed */
  right: 80px;
  width: 350px; /* Or desired width */
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  border-radius: 8px;
  z-index: 1000;
  overflow: hidden; /* Ensures border radius is applied */
}

.cart-popup-content {
  padding: 16px;
}

h4 {
  margin-top: 0;
  margin-bottom: 15px;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.cart-item {
  display: flex;
  align-items: flex-start;
  padding-bottom: 12px;
  margin-bottom: 12px;
  border-bottom: 1px solid #eee; /* Subtle separator */
}

.cart-item:last-child {
  margin-bottom: 0;
  padding-bottom: 0;
  border-bottom: none; /* No border for the last item */
}

.item-img {
  width: 60px; /* Slightly larger image */
  height: 60px;
  object-fit: cover;
  border-radius: 4px;
  margin-right: 15px;
  flex-shrink: 0; /* Prevent image from shrinking */
}

.item-details {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.item-title {
  font-size: 14px; /* Slightly smaller title */
  font-weight: 500;
  margin-bottom: 8px; /* Space between title and variant */
  color: #222;
}

.variant-row {
  display: flex;
  justify-content: space-between; /* Push info and price apart */
  align-items: center;
  width: 100%;
  margin-bottom: 4px; /* Space between variants if multiple */
}

.variant-info {
  font-size: 12px; /* Smaller variant info */
  color: #666;
  flex-grow: 1;
}

.item-price-wrapper {
  flex-shrink: 0; /* Prevent price from shrinking */
  margin-left: 10px; /* Space between info and price */
}

.price-sale {
  color: #ff0000; /* Red color for sale price */
  font-weight: bold;
  font-size: 14px; /* Price font size */
  margin-right: 6px;
}

.price-old {
  color: #888; /* Gray for old price */
  text-decoration: line-through;
  font-size: 12px; /* Smaller old price */
}

.view-cart-btn {
  width: 100%;
  background: #ff5722; /* Orange button color */
  color: #fff;
  border: none;
  padding: 10px;
  border-radius: 5px;
  font-size: 16px;
  margin-top: 15px; /* Space above button */
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.view-cart-btn:hover {
  background-color: #e04a1c; /* Darker orange on hover */
}

.empty-cart {
  text-align: center;
  padding: 24px 0;
}
.empty-img {
  width: 80px;
  margin-bottom: 10px;
}
</style>
