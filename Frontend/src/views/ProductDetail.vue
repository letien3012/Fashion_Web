<template>
  <div>
    <Header />
    <div v-if="loading" class="loading-state">
      Đang tải thông tin sản phẩm...
    </div>
    <div v-else-if="error" class="error-state">
      {{ error }}
    </div>
    <div v-else class="product-detail-container">
      <div class="product-gallery">
        <img :src="displayImages[activeImage]" class="main-image" />
        <div class="thumbnail-list">
          <img
            v-for="(img, idx) in displayImages"
            :key="idx"
            :src="img"
            :class="{ active: idx === activeImage }"
            @click="activeImage = idx"
          />
        </div>
      </div>
      <div class="product-info">
        <h1 class="product-title">{{ product.name }}</h1>
        <div class="product-rating">
          <i
            class="fas fa-star"
            v-for="n in 5"
            :key="n"
            :class="{ active: n <= product.rating }"
          ></i>
          <span class="rating-number">({{ product.rating }})</span>
        </div>
        <div class="product-price-container">
          <div class="product-price" :class="{ 'has-sale': salePrice }">
            ${{ displayPrice.toFixed(2) }}
          </div>
          <div v-if="salePrice" class="product-sale-price">
            ${{ salePrice.toFixed(2) }}
          </div>
          <div v-if="activePromotion" class="promotion-info">
            <div class="discount-badge">-{{ discountPercentage }}%</div>
            <div class="promotion-details">
              <div class="promotion-period" v-if="activePromotion.end_date">
                Áp dụng đến: {{ formatDate(activePromotion.end_date) }}
              </div>
            </div>
          </div>
        </div>

        <!-- Kích thước -->
        <div class="product-options">
          <label>Kích thước:</label>
          <div class="option-list">
            <button
              v-for="size in product.sizes"
              :key="size"
              :class="{ active: selectedSize === size }"
              @click="selectedSize = size"
            >
              {{ size }}
            </button>
          </div>
        </div>

        <!-- Màu sắc -->
        <div class="product-options">
          <label>Màu sắc:</label>
          <div class="option-list">
            <button
              v-for="color in product.colors"
              :key="color"
              :class="{ active: selectedColor === color }"
              @click="selectedColor = color"
              :style="{
                background: color,
                border:
                  selectedColor === color
                    ? '2px solid #ff6b6b'
                    : '1px solid #ccc',
              }"
            ></button>
          </div>
        </div>

        <!-- Số lượng còn lại -->
        <div class="stock-info">
          Số lượng còn lại: <b>{{ currentVariant.stock }}</b>
        </div>

        <!-- Chọn số lượng -->
        <div class="product-actions">
          <input
            type="number"
            v-model.number="quantity"
            min="1"
            :max="currentVariant.stock"
            class="quantity-input"
          />
          <button
            class="add-to-cart-btn"
            @click="addToCart"
            :disabled="!canBuy"
          >
            Thêm vào giỏ hàng
          </button>
          <button class="buy-now-btn" @click="buyNow" :disabled="!canBuy">
            Mua ngay
          </button>
        </div>
      </div>
    </div>

    <!-- Mô tả sản phẩm -->
    <div class="product-desc-section">
      <h2>Mô tả sản phẩm</h2>
      <div
        v-if="product.content"
        class="product-content"
        v-html="product.content"
      ></div>
      <div v-if="product.description" class="product-description">
        <p>{{ product.description }}</p>
      </div>
      <div
        v-if="!product.content && !product.description"
        class="no-description"
      >
        <p>Chưa có mô tả cho sản phẩm này.</p>
      </div>
    </div>

    <!-- Đánh giá sản phẩm -->
    <div class="product-review-section">
      <h2>Đánh giá sản phẩm</h2>
      <div v-if="product.reviews.length">
        <div
          class="review-item"
          v-for="(review, idx) in product.reviews"
          :key="idx"
        >
          <img :src="userAvatar" alt="User Avatar" class="user-avatar" />
          <div class="review-header">
            <b>{{ review.user }}</b>
            <span class="review-rating">
              <i
                class="fas fa-star"
                v-for="n in 5"
                :key="n"
                :class="{ active: n <= review.rating }"
              ></i>
            </span>
          </div>
          <div class="review-content">{{ review.content }}</div>
          <img
            v-if="review.image"
            :src="review.image"
            alt="Review Image"
            class="review-image"
          />
          <div v-if="idx === 0" class="admin-reply">
            <b>Admin:</b> {{ adminReply }}
          </div>
        </div>
      </div>
      <div v-else>
        <i>Chưa có đánh giá nào cho sản phẩm này.</i>
      </div>
      <!-- New review form -->
      <div class="new-review-form">
        <h3>Gửi đánh giá của bạn</h3>
        <div class="new-review-rating">
          <label>Đánh giá của bạn:</label>
          <div class="option-list">
            <button
              v-for="n in 5"
              :key="n"
              :class="{ active: newReview.rating >= n }"
              @click="newReview.rating = n"
            >
              ★
            </button>
          </div>
        </div>
        <textarea
          v-model="newReview.content"
          placeholder="Nhập nội dung đánh giá của bạn"
          rows="3"
          class="new-review-content"
        ></textarea>
        <div class="new-review-image-upload">
          <label>Chọn ảnh (nếu có):</label>
          <input type="file" accept="image/*" @change="handleNewReviewImage" />
        </div>
        <button @click="submitNewReview" class="submit-review-btn">
          Gửi đánh giá
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import Header from "../components/Header.vue";
import { productService } from "../services/product.service";

export default {
  name: "ProductDetail",
  components: { Header },
  data() {
    return {
      activeImage: 0,
      quantity: 1,
      selectedSize: "",
      selectedColor: "",
      product: {
        name: "",
        price: 0,
        rating: 0,
        stock: 0,
        sizes: [],
        colors: [],
        description: "",
        images: [],
        reviews: [],
        variants: [],
      },
      currentVariant: {
        price: 0,
        stock: 0,
        images: [],
        _id: null,
      },
      activePromotion: null,
      loading: false,
      error: null,
      newReview: { rating: 0, content: "", image: null },
    };
  },
  async created() {
    try {
      this.loading = true;
      const productId = this.$route.params.id;
      console.log("Fetching product with ID:", productId);

      const response = await productService.getProductById(productId);
      console.log("Product response in component:", response);

      if (response && response.data) {
        const productData = response.data;
        // Xử lý ảnh chính và album
        const mainImage = productData.image.startsWith("http")
          ? productData.image
          : `http://localhost:3005${productData.image}`;

        const albumImages = (productData.album || []).map((img) =>
          img.startsWith("http") ? img : `http://localhost:3005${img}`
        );

        this.product = {
          ...productData,
          image: mainImage,
          images: [mainImage, ...albumImages],
          sizes: this.extractSizes(productData.variants),
          colors: this.extractColors(productData.variants),
          reviews: [],
        };

        // Set initial size and color if available
        if (this.product.sizes.length > 0) {
          this.selectedSize = this.product.sizes[0];
        }
        if (this.product.colors.length > 0) {
          this.selectedColor = this.product.colors[0];
        }

        // Load initial variant data
        if (this.selectedSize && this.selectedColor) {
          await this.loadVariantData();
        }
      } else {
        this.error = "Không tìm thấy thông tin sản phẩm";
      }
    } catch (error) {
      console.error("Error in created hook:", error);
      if (error.response) {
        if (error.response.status === 404) {
          this.error = "Không tìm thấy sản phẩm với ID này";
        } else {
          this.error = `Lỗi server: ${error.response.status}`;
        }
      } else if (error.request) {
        this.error = "Không thể kết nối đến server";
      } else {
        this.error = "Có lỗi xảy ra khi tải thông tin sản phẩm";
      }
    } finally {
      this.loading = false;
    }
  },
  watch: {
    selectedSize: {
      handler: "loadVariantData",
      immediate: false,
    },
    selectedColor: {
      handler: "loadVariantData",
      immediate: false,
    },
  },
  computed: {
    canBuy() {
      return (
        this.quantity > 0 &&
        this.quantity <= this.currentVariant.stock &&
        this.selectedSize &&
        this.selectedColor
      );
    },
    displayPrice() {
      return this.currentVariant.price || this.product.price;
    },
    salePrice() {
      if (this.activePromotion) {
        console.log(
          "Calculating sale price with promotion:",
          this.activePromotion
        );
        console.log("Original price:", this.displayPrice);
        const discount =
          this.displayPrice * (this.activePromotion.discount / 100);
        console.log("Discount amount:", discount);
        const finalPrice =
          Math.round((this.displayPrice - discount) * 100) / 100;
        console.log("Final price after discount:", finalPrice);
        return finalPrice;
      }
      return null;
    },
    discountPercentage() {
      return this.activePromotion ? this.activePromotion.discount : 0;
    },
    displayImages() {
      return this.currentVariant.images.length > 0
        ? this.currentVariant.images
        : this.product.images;
    },
    adminReply() {
      return "Cảm ơn bạn đã đánh giá. Chúng tôi rất vui khi sản phẩm đáp ứng nhu cầu của bạn. Nếu bạn cần hỗ trợ thêm, hãy liên hệ với chúng tôi nhé!";
    },
    userAvatar() {
      return "https://via.placeholder.com/40";
    },
  },
  methods: {
    extractSizes(variants) {
      if (!variants) return [];
      const sizes = new Set();
      variants.forEach((variant) => {
        const size = variant.sku.split("-")[1]; // Assuming format: COUNTRY-SIZE-COLOR
        if (size) sizes.add(size);
      });
      return Array.from(sizes);
    },

    extractColors(variants) {
      if (!variants) return [];
      const colors = new Set();
      variants.forEach((variant) => {
        const color = variant.sku.split("-")[2]; // Assuming format: COUNTRY-SIZE-COLOR
        if (color) colors.add(color);
      });
      return Array.from(colors);
    },

    findVariant(size, color) {
      if (!this.product.variants) return null;
      return this.product.variants.find((variant) => {
        const [_, variantSize, variantColor] = variant.sku.split("-");
        return variantSize === size && variantColor === color;
      });
    },

    async loadVariantData() {
      if (!this.selectedSize || !this.selectedColor) return;

      try {
        console.log("Loading variant data for:", {
          size: this.selectedSize,
          color: this.selectedColor,
        });

        const variant = this.findVariant(this.selectedSize, this.selectedColor);
        console.log("Found variant:", variant);

        if (variant) {
          // Xử lý ảnh variant
          const variantImage = variant.image.startsWith("http")
            ? variant.image
            : `http://localhost:3005${variant.image}`;

          this.currentVariant = {
            price: variant.price,
            stock: variant.stock || 0,
            images: [variantImage, ...this.product.images.slice(1)],
            _id: variant._id,
          };
          this.activeImage = 0; // Reset to first image when variant changes

          // Load promotions for this variant
          await this.loadPromotions();
        } else {
          // Fallback to base product data if variant not found
          this.currentVariant = {
            price: this.product.price,
            stock: 0,
            images: this.product.images,
            _id: null,
          };
          this.activePromotion = null;
        }
      } catch (error) {
        console.error("Error loading variant data:", error);
        // Keep the current variant data if there's an error
        this.currentVariant = {
          price: this.product.price,
          stock: 0,
          images: this.product.images,
          _id: null,
        };
        this.activePromotion = null;
      }
    },

    async loadPromotions() {
      if (!this.currentVariant._id) return;

      try {
        const promotions = await productService.getProductPromotions(
          this.$route.params.id,
          this.currentVariant._id
        );

        // Lấy promotion có discount cao nhất
        this.activePromotion =
          promotions.length > 0
            ? promotions.reduce((max, p) =>
                p.discount > max.discount ? p : max
              )
            : null;
      } catch (error) {
        console.error("Error loading promotions:", error);
        this.activePromotion = null;
      }
    },
    addToCart() {
      const cartItem = {
        productId: this.$route.params.id,
        size: this.selectedSize,
        color: this.selectedColor,
        quantity: this.quantity,
        price: this.displayPrice,
      };
      // TODO: Implement cart functionality
      alert(`Đã thêm ${this.quantity} sản phẩm vào giỏ hàng!`);
    },
    buyNow() {
      const orderItem = {
        productId: this.$route.params.id,
        size: this.selectedSize,
        color: this.selectedColor,
        quantity: this.quantity,
        price: this.displayPrice,
      };
      // TODO: Implement buy now functionality
      alert(`Bạn đã chọn mua ngay ${this.quantity} sản phẩm!`);
    },
    handleNewReviewImage(e) {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          this.newReview.image = e.target.result;
        };
        reader.readAsDataURL(file);
      }
    },
    submitNewReview() {
      if (this.newReview.rating > 0 && this.newReview.content.trim()) {
        const review = {
          user: "Người dùng",
          rating: this.newReview.rating,
          content: this.newReview.content,
          image: this.newReview.image,
        };
        this.product.reviews.push(review);
        this.newReview = { rating: 0, content: "", image: null };
      } else {
        alert("Vui lòng nhập nội dung và chọn số sao.");
      }
    },
    formatDate(dateString) {
      const date = new Date(dateString);
      return date.toLocaleDateString("vi-VN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
    },
  },
};
</script>

<style scoped>
.loading-state,
.error-state {
  text-align: center;
  padding: 40px;
  font-size: 1.2rem;
  color: #666;
}

.error-state {
  color: #ff6b6b;
}

.product-detail-container {
  display: flex;
  gap: 40px;
  max-width: 1100px;
  margin: 40px auto 0 auto;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
  padding: 32px;
}
.product-gallery {
  flex: 1.2;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.main-image {
  width: 100%;
  max-width: 400px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  margin-bottom: 16px;
}
.thumbnail-list {
  display: flex;
  gap: 10px;
}
.thumbnail-list img {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 8px;
  cursor: pointer;
  border: 2px solid transparent;
  transition: border 0.2s;
}
.thumbnail-list img.active,
.thumbnail-list img:hover {
  border: 2px solid #ff6b6b;
}
.product-info {
  flex: 1.5;
  display: flex;
  flex-direction: column;
  gap: 18px;
}
.product-title {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 0;
}
.product-rating {
  color: #ffd700;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  gap: 6px;
}
.product-rating i {
  color: #ccc;
}
.product-rating i.active {
  color: #ffd700;
}
.product-price-container {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 10px 0;
}
.product-price {
  font-size: 1.5rem;
  font-weight: 700;
  color: #ff6b6b;
}
.product-price.has-sale {
  text-decoration: line-through;
  color: #999;
  font-size: 1.2rem;
}
.product-sale-price {
  font-size: 1.5rem;
  font-weight: 700;
  color: #ff6b6b;
}
.promotion-info {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-top: 8px;
}
.promotion-details {
  flex: 1;
}
.promotion-name {
  font-weight: 600;
  color: #ff6b6b;
  margin-bottom: 4px;
}
.promotion-description {
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 4px;
}
.promotion-period {
  font-size: 0.85rem;
  color: #888;
  font-style: italic;
}
.discount-badge {
  background: #ff6b6b;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.9rem;
  font-weight: 600;
  white-space: nowrap;
}
.product-options {
  margin: 10px 0;
}
.product-options label {
  font-weight: 600;
  margin-right: 10px;
}
.option-list {
  display: flex;
  gap: 10px;
  margin-top: 6px;
}
.option-list button {
  min-width: 36px;
  min-height: 36px;
  border-radius: 8px;
  border: 1px solid #ccc;
  background: #fff;
  cursor: pointer;
  font-weight: 600;
  font-size: 1rem;
  transition: border 0.2s, background 0.2s;
}
.option-list button.active {
  border: 2px solid #ff6b6b;
  background: #ffeaea;
}
.option-list button[style*="#fff"] {
  border: 1px solid #ccc;
}
.stock-info {
  color: #333;
  font-size: 1.1rem;
  margin-bottom: 8px;
}
.product-actions {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-top: 12px;
}
.quantity-input {
  width: 60px;
  padding: 6px 10px;
  border-radius: 6px;
  border: 1px solid #ccc;
  font-size: 1.1rem;
}
.add-to-cart-btn,
.buy-now-btn {
  background: #ff6b6b;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 10px 28px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}
.add-to-cart-btn:disabled,
.buy-now-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}
.add-to-cart-btn:hover,
.buy-now-btn:hover {
  background: #ff3b3b;
}
.product-desc-section {
  max-width: 1100px;
  margin: 32px auto 0 auto;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  padding: 24px 32px;
}
.product-desc-section h2 {
  font-size: 1.3rem;
  margin-bottom: 20px;
  color: #333;
  font-weight: 600;
}
.product-content {
  margin-bottom: 20px;
  line-height: 1.6;
  color: #444;
}
.product-content :deep(img) {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  margin: 10px 0;
}
.product-content :deep(p) {
  margin-bottom: 15px;
}
.product-description {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}
.product-description p {
  line-height: 1.6;
  color: #444;
}
.no-description {
  color: #666;
  font-style: italic;
  text-align: center;
  padding: 20px 0;
}
.product-review-section {
  max-width: 1100px;
  margin: 32px auto 40px auto;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  padding: 24px 32px;
}
.product-review-section h2 {
  font-size: 1.3rem;
  margin-bottom: 10px;
}
.review-item {
  border-bottom: 1px solid #eee;
  padding: 12px 0;
  display: flex;
  flex-direction: column;
}
.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 10px;
}
.review-header {
  display: flex;
  align-items: center;
  gap: 12px;
  font-weight: 600;
}
.review-rating i {
  color: #ffd700;
  font-size: 1rem;
}
.review-content {
  margin-top: 4px;
  color: #444;
}
.admin-reply {
  margin-top: 8px;
  padding: 8px;
  background: #f9f9f9;
  border-radius: 4px;
}
/* (Optional) Style for the review image (if any) */
.review-image {
  max-width: 150px;
  max-height: 150px;
  border-radius: 4px;
  margin-top: 8px;
}
/* (Optional) Style for the new review form */
.new-review-form {
  margin-top: 24px;
  padding: 16px;
  border: 1px solid #eee;
  border-radius: 8px;
}
.new-review-form h3 {
  font-size: 1.2rem;
  margin-bottom: 12px;
}
.new-review-rating {
  margin-bottom: 12px;
}
.new-review-content {
  width: 100%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-family: inherit;
}
.new-review-image-upload {
  margin-top: 12px;
}
.submit-review-btn {
  margin-top: 12px;
  background: #ff6b6b;
  color: #fff;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  font-weight: 600;
  cursor: pointer;
}
</style>
