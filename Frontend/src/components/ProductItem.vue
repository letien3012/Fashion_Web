<template>
  <router-link :to="getProductDetailLink(product)" class="product-card">
    <div class="product-image">
      <img :src="product.image" :alt="product.name" @error="handleImageError" />
      <div class="discount-badge" v-if="product.discountPercentage">
        <span class="discount-text">-{{ product.discountPercentage }}%</span>
      </div>
      <div class="product-overlay">
        <div class="overlay-buttons">
          <router-link
            :to="getProductDetailLink(product)"
            class="overlay-btn quick-view-btn"
          >
            <i class="fas fa-eye"></i>
          </router-link>
          <button
            v-if="isLoggedIn"
            class="overlay-btn wishlist-btn"
            @click.prevent="toggleWishlist"
            :class="{ 'in-wishlist': isInWishlist }"
          >
            <i class="fas fa-heart"></i>
          </button>
        </div>
      </div>
    </div>
    <div class="product-info">
      <h3 class="product-name" :title="product.name">
        {{ product.name }}
      </h3>
      <div class="product-meta">
        <div class="product-rating">
          <div class="stars">
            <i
              class="fas fa-star"
              v-for="n in 5"
              :key="n"
              :class="{
                active: n <= Math.floor(averageRating),
                half: n === Math.ceil(averageRating) && averageRating % 1 !== 0,
              }"
            ></i>
          </div>
          <span class="rating-text" v-if="totalReviews > 0">
            {{ averageRating.toFixed(1) }} ({{ totalReviews }})
          </span>
        </div>
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
import { productService } from "../services/product.service";
import { reviewService } from "../services/review.service";
import { toast } from "vue3-toastify";
import "vue3-toastify/dist/index.css";

export default {
  name: "ProductItem",
  props: {
    product: {
      type: Object,
      required: true,
    },
  },
  emits: ["product-click"],
  data() {
    return {
      isInWishlist: false,
      averageRating: 0,
      totalReviews: 0,
      isLoggedIn: false,
    };
  },
  async created() {
    this.isLoggedIn = !!localStorage.getItem("token");
    if (this.isLoggedIn) {
      await this.checkWishlistStatus();
    }
    await this.loadProductReviews();
  },
  methods: {
    getProductDetailLink(product) {
      this.$emit("product-click");
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
    async checkWishlistStatus() {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          this.isInWishlist = false;
          return;
        }
        const wishlist = await productService.getWishlist();
        this.isInWishlist = wishlist.wishlist.some(
          (item) => item._id === this.product._id
        );
      } catch (error) {
        // Only log error if user is authenticated and it's not an unauthorized error
        if (localStorage.getItem("token") && error.response?.status !== 401) {
          console.error("Error checking wishlist status:", error);
        }
        this.isInWishlist = false;
      }
    },
    async toggleWishlist() {
      try {
        // Check if user is logged in by checking if there's a token in localStorage
        const token = localStorage.getItem("token");
        if (!token) {
          toast.warning(
            "Vui lòng đăng nhập để thêm sản phẩm vào danh sách yêu thích!",
            {
              position: "top-right",
              autoClose: 2000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              draggablePercent: 0.6,
              showCloseButtonOnHover: false,
              closeButton: "button",
              icon: true,
              rtl: false,
            }
          );
          return;
        }

        if (this.isInWishlist) {
          await productService.removeFromWishlist(this.product._id);
          toast.success("Đã xóa khỏi danh sách yêu thích!", {
            position: "top-right",
            autoClose: 2000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            draggablePercent: 0.6,
            showCloseButtonOnHover: false,
            closeButton: "button",
            icon: true,
            rtl: false,
          });
        } else {
          await productService.addToWishlist(this.product._id);
          toast.success("Đã thêm vào danh sách yêu thích!", {
            position: "top-right",
            autoClose: 2000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            draggablePercent: 0.6,
            showCloseButtonOnHover: false,
            closeButton: "button",
            icon: true,
            rtl: false,
          });
        }
        this.isInWishlist = !this.isInWishlist;
      } catch (error) {
        console.error("Error toggling wishlist:", error);
        toast.error("Có lỗi xảy ra, vui lòng thử lại!", {
          position: "top-right",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          draggablePercent: 0.6,
          showCloseButtonOnHover: false,
          closeButton: "button",
          icon: true,
          rtl: false,
        });
      }
    },
    handleQuickView() {
      this.$emit("quick-view", this.product);
    },
    async loadProductReviews() {
      try {
        const response = await reviewService.getReviewsByProduct(
          this.product._id
        );
        console.log("Reviews response:", response);

        if (response && response.success && response.data) {
          const { reviews } = response.data;

          if (reviews && reviews.length > 0) {
            // Tính tổng số sao từ các đánh giá
            const totalStars = reviews.reduce(
              (sum, review) => sum + review.star,
              0
            );
            // Tính điểm trung bình
            this.averageRating = totalStars / reviews.length;
            // Lưu số lượng đánh giá
            this.totalReviews = reviews.length;

            console.log("Rating calculation:", {
              totalStars,
              averageRating: this.averageRating,
              totalReviews: this.totalReviews,
              reviews,
            });
          }
        }
      } catch (error) {
        console.error("Error loading product reviews:", error);
      }
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
  background: linear-gradient(45deg, #ff0000, #ff0000);
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
  background: #ff0000;
  color: white;
  transform: scale(1.1);
}

.product-info {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  background: white;
  min-height: 110px;
}

.product-name {
  font-size: 0.95rem;
  font-weight: 600;
  color: #333;
  margin: 0;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: color 0.3s ease;
}

.product-card:hover .product-name {
  color: #ff0000;
}

.product-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.4rem;
}

.product-price-container {
  display: flex;
  align-items: baseline;
  gap: 0.4rem;
  flex-wrap: wrap;
}

.product-price {
  color: #ff0000 !important;
  font-size: 1.1rem;
  font-weight: 700;
  white-space: nowrap;
  letter-spacing: 0.5px;
}

.product-sale-price {
  color: #999;
  text-decoration: line-through;
  font-size: 0.9rem;
  white-space: nowrap;
  margin-left: 0.4rem;
}

.product-rating {
  display: flex;
  align-items: center;
  gap: 6px;
}

.stars {
  display: flex;
  align-items: center;
  gap: 2px;
}

.stars i {
  color: #ddd;
  font-size: 0.8rem;
  transition: color 0.2s ease;
}

.stars i.active {
  color: #ffd700;
}

.stars i.half {
  position: relative;
  color: #ddd;
}

.stars i.half::before {
  content: "\f089";
  position: absolute;
  left: 0;
  color: #ffd700;
  width: 50%;
  overflow: hidden;
}

.rating-text {
  color: #666;
  font-size: 0.8rem;
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

.wishlist-btn {
  background: white;
  color: #333;
}

.wishlist-btn.in-wishlist {
  background: #ff0000;
  color: white;
}

.wishlist-btn:hover {
  background: #ff0000;
  color: white;
  transform: scale(1.1);
}

.wishlist-btn.in-wishlist:hover {
  background: #ff4757;
}
</style>
