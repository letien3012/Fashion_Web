<template>
  <router-link :to="getProductDetailLink(product)" class="product-card">
    <div class="product-image">
      <img :src="product.image" :alt="product.name" @error="handleImageError" />
      <div class="discount-badge" v-if="product.discountPercentage">
        <span class="discount-text">-{{ product.discountPercentage }}%</span>
      </div>
      <div class="product-overlay">
        <div class="overlay-buttons">
          <button class="overlay-btn quick-view-btn">
            <i class="fas fa-eye"></i>
          </button>
        </div>
      </div>
    </div>
    <div class="product-info">
      <h3 class="product-name" :title="product.name">
        {{ product.name }}
      </h3>
      <div class="product-meta">
        <span class="product-rating">
          <i
            class="fas fa-star"
            v-for="n in 5"
            :key="n"
            :class="{ active: n <= (product.favorite_count || 0) }"
          ></i>
        </span>
        <div class="product-price-container">
          <span
            class="product-price"
            :class="{ 'has-sale': product.salePrice }"
          >
            {{ formatVND(product.salePrice || product.price) }}
          </span>
          <span v-if="product.salePrice" class="product-sale-price">
            {{ formatVND(product.price) }}
          </span>
        </div>
      </div>
    </div>
  </router-link>
</template>

<script>
export default {
  name: "ProductItem",
  props: {
    product: {
      type: Object,
      required: true,
    },
  },
  methods: {
    getProductDetailLink(product) {
      return `/product-detail/${product._id || ""}`;
    },
    formatVND(value) {
      if (typeof value !== "number") return "";
      return value.toLocaleString("vi-VN") + "đ";
    },
    handleImageError(e) {
      console.error("Image load error:", e);
      this.product.image = "/images/placeholder.jpg";
    },
  },
};
</script>

<style scoped>
.product-card {
  background: #fff;
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  position: relative;
  text-decoration: none;
}

.product-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.15);
}

.product-image {
  position: relative;
  width: 100%;
  padding-top: 100%;
  overflow: hidden;
  background: #f7f7f7;
}

.product-image img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.product-card:hover .product-image img {
  transform: scale(1.1);
}

.discount-badge {
  position: absolute;
  top: 12px;
  left: 12px;
  background: linear-gradient(45deg, #ff6b6b, #ff8787);
  color: white;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
  z-index: 2;
  box-shadow: 0 2px 8px rgba(255, 107, 107, 0.3);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
}

.product-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: all 0.4s ease;
}

.product-card:hover .product-overlay {
  opacity: 1;
}

.overlay-buttons {
  display: flex;
  justify-content: center;
  gap: 1rem;
  transform: translateY(0);
  transition: transform 0.4s ease;
}

.overlay-btn {
  background: white;
  border: none;
  width: 45px;
  height: 45px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #333;
  font-size: 1.2rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.overlay-btn:hover {
  background: #ff6b6b;
  color: white;
  transform: scale(1.1);
}

.product-info {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  background: white;
  min-height: 120px;
}

.product-name {
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
  margin: 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: color 0.3s ease;
}

.product-card:hover .product-name {
  color: #ff6b6b;
}

.product-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.5rem;
}

.product-price-container {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.product-price {
  color: #ff6b6b !important;
  font-size: 1.3rem;
  font-weight: 700;
  white-space: nowrap;
  letter-spacing: 0.5px;
}

.product-sale-price {
  color: #999;
  text-decoration: line-through;
  font-size: 1.05rem;
  white-space: nowrap;
  margin-left: 0.5rem;
}

.product-rating {
  color: #ffd700;
  font-size: 0.9rem;
  text-align: left;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 2px;
  flex-shrink: 0;
}

.product-rating i {
  margin-right: 2px;
}

.product-rating i.active {
  color: #ffd700;
}

@media (max-width: 576px) {
  .overlay-buttons {
    gap: 0.5rem;
  }

  .overlay-btn {
    width: 40px;
    height: 40px;
    font-size: 1rem;
  }

  .product-rating {
    font-size: 0.8rem;
  }
}
</style>
