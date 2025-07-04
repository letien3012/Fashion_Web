<template>
  <Header />
  <div class="home">
    <!-- Banner Slider -->
    <div class="banner-slider">
      <div class="slider-container">
        <div
          class="slide"
          v-for="(slide, index) in banners"
          :key="index"
          :class="{ active: currentSlide === index }"
        >
          <img :src="getImageUrl(slide.image)" :alt="slide.name" />
        </div>
        <button class="slider-btn prev" @click="prevSlide">
          <i class="fas fa-chevron-left"></i>
        </button>
        <button class="slider-btn next" @click="nextSlide">
          <i class="fas fa-chevron-right"></i>
        </button>
        <div class="slider-dots">
          <span
            v-for="(slide, index) in banners"
            :key="index"
            :class="{ active: currentSlide === index }"
            @click="currentSlide = index"
          ></span>
        </div>
      </div>
    </div>

    <!-- Featured Categories -->
    <section class="categories">
      <div class="category-container">
        <button
          class="nav-btn prev"
          @click="prevCategories"
          :disabled="categoryStart === 0"
        >
          <i class="fas fa-chevron-left"></i>
        </button>
        <div class="category-grid highlight">
          <div
            class="category-highlight-card"
            v-for="category in displayedCategories.slice(0, 4)"
            :key="category.id"
            :style="{ backgroundImage: 'url(' + category.image + ')' }"
          >
            <div class="category-highlight-content">
              <h3 class="category-highlight-title">{{ category.name }}</h3>
              <p class="category-highlight-count">
                {{ category.count }} Sản phẩm
              </p>
              <router-link
                :to="`/products?category=${category.id}`"
                class="category-highlight-btn"
              >
                <i class="fas fa-arrow-right"></i>
              </router-link>
            </div>
          </div>
        </div>
        <button
          class="nav-btn next"
          @click="nextCategories"
          :disabled="categoryStart + categoriesPerPage >= categories.length"
        >
          <i class="fas fa-chevron-right"></i>
        </button>
      </div>
    </section>

    <!-- Featured Products -->
    <section class="featured-products" v-if="!loading && !error">
      <div class="section-header">
        <h2 class="section-title">Sản Phẩm Bán Chạy</h2>
        <p class="section-subtitle">
          Khám phá những sản phẩm được yêu thích nhất
        </p>
      </div>
      <div
        v-if="bestSellingProducts && bestSellingProducts.length > 0"
        class="product-grid"
      >
        <ProductItem
          v-for="product in bestSellingProducts.slice(0, 15)"
          :key="product._id"
          :product="product"
        />
      </div>
      <div v-else class="no-products">
        <i class="fas fa-box-open"></i>
        <p>Không có sản phẩm bán chạy</p>
      </div>
    </section>
    <div v-else-if="loading" class="loading-section">
      <div class="loading">Đang tải sản phẩm bán chạy...</div>
    </div>
    <div v-else-if="error" class="error-section">
      <div class="error">{{ error }}</div>
    </div>

    <!-- New Arrivals Banner -->
    <div class="new-arrivals-banner" v-if="subBanner">
      <img
        :src="getImageUrl(subBanner.image)"
        :alt="subBanner.name || 'Banner'"
      />
    </div>
    <!-- New Arrivals -->
    <section class="new-arrivals" v-if="!loading && !error">
      <div class="section-header">
        <h2 class="section-title">Sản Phẩm Mới</h2>
        <p class="section-subtitle">
          Khám phá bộ sưu tập mới nhất của chúng tôi
        </p>
      </div>
      <div v-if="newArrivals && newArrivals.length > 0" class="product-grid">
        <ProductItem
          v-for="product in newArrivals.slice(0, 15)"
          :key="product._id"
          :product="product"
        />
      </div>
      <div v-else class="no-products">
        <i class="fas fa-box-open"></i>
        <p>Không có sản phẩm mới</p>
      </div>
    </section>
    <div v-else-if="loading" class="loading-section">
      <div class="loading">Đang tải sản phẩm mới...</div>
    </div>
    <div v-else-if="error" class="error-section">
      <div class="error">{{ error }}</div>
    </div>
  </div>
  <ChatBot />
  <Footer />
</template>

<script>
import Header from "../components/Header.vue";
import Footer from "../components/Footer.vue";
import { productService } from "../services/product.service";
import ChatBot from "../components/ChatBot.vue";
import ProductItem from "../components/ProductItem.vue";
import { productCatalogueService } from "../services/productCatalogue.service";
import { bannerService } from "../services/banner.service";

export default {
  name: "Home",
  components: { Header, Footer, ChatBot, ProductItem },
  data() {
    return {
      currentSlide: 0,
      baseUrl: import.meta.env.VITE_API_BASE_URL,
      banners: [],
      categories: [],
      newArrivals: [],
      loading: true,
      error: null,
      featuredStart: 0,
      featuredPerPage: 4,
      categoryStart: 0,
      categoriesPerPage: 8,
      bestSellingProducts: [],
      subBanner: null,
    };
  },
  async created() {
    await Promise.all([
      this.fetchNewArrivals(),
      this.fetchCategories(),
      this.fetchBestSellingProducts(),
      this.fetchBanners(),
      this.fetchSubBanner(),
    ]);
  },
  computed: {
    getProductDetailLink() {
      return (product) => `/product-detail/${product._id || ""}`;
    },
    displayedCategories() {
      return this.categories.slice(
        this.categoryStart,
        this.categoryStart + this.categoriesPerPage
      );
    },
  },
  methods: {
    getImageUrl(path) {
      if (!path) return "";
      if (path.startsWith("http")) return path;
      console.log("Original image path:", path);
      const fullUrl = `${this.baseUrl}${path}`;
      console.log("Full image URL:", fullUrl);
      return fullUrl;
    },
    async fetchNewArrivals() {
      this.loading = true;
      this.error = null;
      this.newArrivals = [];
      try {
        const response = await productService.getNewArrivals();
        if (response && response.data && Array.isArray(response.data)) {
          // Duyệt từng sản phẩm để lấy promotion
          const productsWithPromotions = await Promise.all(
            response.data.map(async (product) => {
              const defaultVariant = product.variants?.[0] || {};
              let salePrice = null;
              let discountPercentage = null;
              if (defaultVariant._id) {
                const promotions = await productService.getProductPromotions(
                  product._id,
                  defaultVariant._id
                );
                if (promotions && promotions.length > 0) {
                  const bestPromotion = promotions.reduce((max, p) =>
                    p.discount > max.discount ? p : max
                  );
                  discountPercentage = bestPromotion.discount;
                  salePrice =
                    Math.round(
                      (defaultVariant.price -
                        (defaultVariant.price * bestPromotion.discount) / 100) *
                        100
                    ) / 100;
                }
              }
              return {
                _id: product._id || "",
                name: product.name || "",
                image: this.getImageUrl(product.image),
                album: (product.album || []).map((img) =>
                  this.getImageUrl(img)
                ),
                price: defaultVariant.price || 0,
                salePrice,
                discountPercentage,
                favorite_count: product.favorite_count || 0,
                variants: product.variants || [],
                catalogueId: product.catalogueId || null,
                publish: product.publish || false,
                description: product.description || "",
                content: product.content || "",
                view_count: product.view_count || 0,
              };
            })
          );
          this.newArrivals = productsWithPromotions;
        } else {
          this.error = "Invalid data format received";
        }
      } catch (error) {
        this.error = "Failed to load new arrivals";
      } finally {
        this.loading = false;
      }
    },
    async fetchCategories() {
      try {
        this.loading = true;
        const response = await productCatalogueService.getAll();
        if (response && response.data) {
          this.categories = response.data.map((category) => ({
            id: category._id,
            name: category.name,
            image: category.icon
              ? `${this.baseUrl}${category.icon}`
              : "/images/default-category.jpg",
            count: category.productCount || 0,
            link: `/category/${category._id}`,
          }));
        }
      } catch (error) {
        this.error = "Không thể tải danh mục sản phẩm";
        console.error("Error fetching categories:", error);
      } finally {
        this.loading = false;
      }
    },
    async fetchBestSellingProducts() {
      try {
        this.loading = true;
        const response = await productService.getBestSelling();
        if (response && response.data) {
          // Duyệt từng sản phẩm để lấy promotion
          const productsWithPromotions = await Promise.all(
            response.data.map(async (product) => {
              const defaultVariant = product.variants?.[0] || {};
              let salePrice = null;
              let discountPercentage = null;
              if (defaultVariant._id) {
                const promotions = await productService.getProductPromotions(
                  product._id,
                  defaultVariant._id
                );
                if (promotions && promotions.length > 0) {
                  const bestPromotion = promotions.reduce((max, p) =>
                    p.discount > max.discount ? p : max
                  );
                  discountPercentage = bestPromotion.discount;
                  salePrice =
                    Math.round(
                      (defaultVariant.price -
                        (defaultVariant.price * bestPromotion.discount) / 100) *
                        100
                    ) / 100;
                }
              }
              return {
                _id: product._id,
                name: product.name,
                image: this.getImageUrl(product.image),
                album: (product.album || []).map((img) =>
                  this.getImageUrl(img)
                ),
                price: defaultVariant.price || 0,
                salePrice,
                discountPercentage,
                favorite_count: product.favorite_count || 0,
                variants: product.variants || [],
                catalogueId: product.catalogueId,
                publish: product.publish,
                description: product.description,
                content: product.content,
                view_count: product.view_count || 0,
                totalSold: product.totalSold || 0,
              };
            })
          );
          this.bestSellingProducts = productsWithPromotions;
        }
      } catch (error) {
        this.error = "Không thể tải sản phẩm bán chạy";
        console.error("Error fetching best selling products:", error);
      } finally {
        this.loading = false;
      }
    },
    async fetchBanners() {
      try {
        const response = await bannerService.getByType("main");
        if (response && response.data) {
          this.banners = response.data;
        }
      } catch (error) {
        console.error("Error fetching banners:", error);
      }
    },
    async fetchSubBanner() {
      try {
        const response = await bannerService.getByType("sub");
        if (response && response.data && response.data.length > 0) {
          this.subBanner = response.data[0];
        } else {
          this.subBanner = null;
        }
      } catch (error) {
        this.subBanner = null;
      }
    },
    nextSlide() {
      this.currentSlide = (this.currentSlide + 1) % this.banners.length;
    },
    prevSlide() {
      this.currentSlide =
        (this.currentSlide - 1 + this.banners.length) % this.banners.length;
    },
    nextFeatured() {
      this.featuredStart += this.featuredPerPage;
    },
    prevFeatured() {
      this.featuredStart = Math.max(
        0,
        this.featuredStart - this.featuredPerPage
      );
    },
    formatVND(value) {
      if (typeof value !== "number") return "";
      return value.toLocaleString("vi-VN") + "đ";
    },
    nextCategories() {
      if (
        this.categoryStart + this.categoriesPerPage <
        this.categories.length
      ) {
        this.categoryStart += this.categoriesPerPage;
      }
    },
    prevCategories() {
      if (this.categoryStart > 0) {
        this.categoryStart = Math.max(
          0,
          this.categoryStart - this.categoriesPerPage
        );
      }
    },
  },
  mounted() {
    setInterval(this.nextSlide, 5000);
  },
};
</script>

<style scoped>
a,
router-link {
  text-decoration: none;
}
.home {
  width: 100%;
}

/* Banner Slider Styles */
.banner-slider {
  position: relative;
  height: 500px;
  overflow: hidden;
}

.slider-container {
  position: relative;
  height: 100%;
}

.slide {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  transition: opacity 0.5s ease-in-out;
}

.slide.active {
  opacity: 1;
}

.slide img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
}

.slide-content {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  color: white;
  z-index: 1;
  width: 80%;
  max-width: 800px;
}

.slide-content h2 {
  font-size: 3.5rem;
  margin-bottom: 1rem;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.slide-content p {
  font-size: 1.5rem;
  margin-bottom: 2rem;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
}

.slide-btn {
  display: inline-block;
  padding: 1rem 2rem;
  background: #ff6b6b;
  color: white;
  border-radius: 25px;
  transition: all 0.3s ease;
}

.slide-btn:hover {
  background: #ff5252;
  transform: translateY(-2px);
}

.slider-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(255, 255, 255, 0.3);
  border: none;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  cursor: pointer;
  color: white;
  font-size: 1.2rem;
  transition: all 0.3s ease;
  z-index: 2;
}

.slider-btn:hover {
  background: rgba(255, 255, 255, 0.5);
}

.slider-btn.prev {
  left: 20px;
}

.slider-btn.next {
  right: 20px;
}

.slider-dots {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 10px;
  z-index: 2;
}

.slider-dots span {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  transition: all 0.3s ease;
}

.slider-dots span.active {
  background: white;
  transform: scale(1.2);
}

/* Categories Styles */
.categories {
  padding: 3rem 2rem;
  background: #f9f9f9;
  position: relative;
}

.section-title {
  text-align: center;
  font-size: 2rem;
  margin-bottom: 2rem;
  color: #333;
  position: relative;
}

.section-title::after {
  content: "";
  position: absolute;
  bottom: -8px;
  left: 50%;
  transform: translateX(-50%);
  width: 50px;
  height: 3px;
  background: #ff6b6b;
}

.category-container {
  position: relative;
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.nav-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #fff;
  border: 1.5px solid #eee;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.3rem;
  color: #333;
  transition: all 0.2s;
  z-index: 2;
}

.nav-btn:hover:not(:disabled) {
  background: #ff6b6b;
  color: #fff;
  border-color: #ff6b6b;
  box-shadow: 0 4px 16px rgba(255, 107, 107, 0.15);
}

.nav-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.nav-btn.prev {
  margin-right: -10px;
}

.nav-btn.next {
  margin-left: -10px;
}

.category-grid.highlight {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 2rem;
  width: 100%;
  margin: 0 auto;
  padding: 0;
}

.category-highlight-card {
  position: relative;
  height: 200px;
  border-radius: 18px;
  overflow: hidden;
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: flex-end;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s, box-shadow 0.3s;
}

.category-highlight-card::before {
  content: "";
  position: absolute;
  inset: 0;
  background: rgba(20, 30, 50, 0.35);
  z-index: 1;
}

.category-highlight-content {
  position: relative;
  z-index: 2;
  color: #fff;
  padding: 1.2rem 1rem 1rem 1rem;
  width: 100%;
}

.category-highlight-title {
  font-size: 1.2rem;
  font-weight: 700;
  margin-bottom: 0.3rem;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
}

.category-highlight-count {
  font-size: 0.95rem;
  margin-bottom: 1rem;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.18);
}

.category-highlight-btn {
  position: absolute;
  right: 1rem;
  bottom: 1rem;
  background: #fff;
  color: #222;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
  transition: background 0.2s, color 0.2s;
}

.category-highlight-btn:hover {
  background: #ff6b6b;
  color: #fff;
}

/* Product Grid Styles */
.featured-products,
.new-arrivals {
  padding: 4rem 2rem;
  width: 95%;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 2rem;
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 1rem;
}

.product-card {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  position: relative;
}

.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.product-image {
  position: relative;
  width: 100%;
  padding-top: 100%; /* Tạo tỷ lệ khung hình 1:1 */
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
  transition: transform 0.3s ease;
}

.product-card:hover .product-image img {
  transform: scale(1.1);
}

.discount-badge {
  position: absolute;
  top: 12px;
  left: 12px;
  background: #ff6b6b;
  color: white;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
  z-index: 2;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
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
  transition: opacity 0.3s ease;
}

.product-card:hover .product-overlay {
  opacity: 1;
}

.add-to-cart-btn {
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

.add-to-cart-btn:hover {
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

/* Responsive Design */
@media (max-width: 1200px) {
  .slide-content h2 {
    font-size: 3rem;
  }
  .slide-content p {
    font-size: 1.3rem;
  }
  .product-grid {
    grid-template-columns: repeat(4, 1fr);
  }
  .banner-slider {
    height: 450px;
  }
  .category-grid.highlight {
    grid-template-columns: repeat(3, 1fr);
    gap: 1.5rem;
  }
}

@media (max-width: 992px) {
  .product-grid {
    grid-template-columns: repeat(3, 1fr);
  }
  .banner-slider {
    height: 400px;
  }
  .category-grid.highlight {
    grid-template-columns: repeat(2, 1fr);
    gap: 1.2rem;
  }

  .category-highlight-card {
    height: 180px;
  }
}

@media (max-width: 768px) {
  .product-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .slide-content h2 {
    font-size: 2rem;
  }
  .slide-content p {
    font-size: 1rem;
  }
  .banner-slider {
    height: 350px;
  }
  .category-grid.highlight {
    grid-template-columns: repeat(1, 1fr);
    gap: 1rem;
  }

  .category-highlight-card {
    height: 160px;
  }

  .category-highlight-title {
    font-size: 1.1rem;
  }

  .category-highlight-count {
    font-size: 0.85rem;
  }
}

@media (max-width: 576px) {
  .banner-slider {
    height: 300px;
  }
  .slide-content h2 {
    font-size: 2rem;
  }
  .slide-content p {
    font-size: 1rem;
  }
  .slider-btn {
    width: 35px;
    height: 35px;
  }
  .section-title {
    font-size: 2rem;
  }
  .product-grid {
    grid-template-columns: repeat(1, 1fr);
  }

  .new-arrivals {
    padding: 2rem 1rem;
  }

  .product-info {
    gap: 0.2rem;
  }

  .product-name {
    font-size: 1rem;
    line-height: 1.3;
    margin: 0;
  }

  .product-rating {
    font-size: 0.8rem;
    text-align: left;
    justify-content: flex-start;
  }

  .product-price {
    font-size: 1.2rem;
  }

  .product-sale-price {
    font-size: 0.9rem;
  }
}

.loading-section,
.error-section {
  padding: 2rem;
  text-align: center;
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading {
  font-size: 1.2rem;
  color: #666;
}

.error {
  font-size: 1.2rem;
  color: #ff6b6b;
}

.no-products {
  text-align: center;
  padding: 2rem;
  font-size: 1.2rem;
  color: #666;
  grid-column: 1 / -1;
}

.section-header {
  text-align: center;
  margin-bottom: 3rem;
}

.section-subtitle {
  color: #666;
  font-size: 1.1rem;
  margin-top: 0.5rem;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 2rem;
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 1rem;
}

.product-card {
  background: #fff;
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  position: relative;
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

.product-card:hover .overlay-buttons {
  transform: translateY(0);
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

.no-products {
  text-align: center;
  padding: 3rem;
  font-size: 1.2rem;
  color: #666;
  grid-column: 1 / -1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.no-products i {
  font-size: 3rem;
  color: #ddd;
}

@media (max-width: 1200px) {
  .product-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media (max-width: 992px) {
  .product-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 768px) {
  .product-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 576px) {
  .product-grid {
    grid-template-columns: repeat(1, 1fr);
  }

  .section-title {
    font-size: 1.8rem;
  }

  .section-subtitle {
    font-size: 1rem;
  }

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

@media (max-width: 768px) {
  .categories {
    padding: 2rem 1rem;
  }

  .category-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }

  .nav-btn {
    width: 35px;
    height: 35px;
  }
}

@media (max-width: 480px) {
  .category-grid {
    grid-template-columns: repeat(1, 1fr);
  }
}

.new-arrivals-banner {
  width: 95%;
  margin: 0 auto 2rem auto;
  display: flex;
  justify-content: center;
  align-items: center;
}
.new-arrivals-banner img {
  width: 100%;
  max-width: 100%;
  border-radius: 18px;
  object-fit: cover;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
  max-height: 400px;
}
@media (max-width: 1200px) {
  .new-arrivals-banner img {
    max-height: 350px;
  }
}

@media (max-width: 992px) {
  .new-arrivals-banner img {
    max-height: 300px;
  }
}

@media (max-width: 768px) {
  .new-arrivals-banner {
    width: 90%;
  }

  .new-arrivals-banner img {
    max-height: 250px;
    border-radius: 12px;
  }
}

@media (max-width: 576px) {
  .new-arrivals-banner {
    width: 85%;
    margin-bottom: 1.5rem;
  }

  .new-arrivals-banner img {
    max-height: 200px;
    border-radius: 8px;
  }
}
</style>
