<template>
  <div>
    <Header />
    <div class="home">
      <!-- Banner Slider -->
      <div class="banner-slider">
        <div class="slider-container">
          <div
            class="slide"
            v-for="(slide, index) in slides"
            :key="index"
            :class="{ active: currentSlide === index }"
          >
            <img :src="slide.image" :alt="slide.title" />
            <div class="slide-content">
              <h2>{{ slide.title }}</h2>
              <p>{{ slide.description }}</p>
              <router-link :to="slide.link" class="slide-btn"
                >Shop Now</router-link
              >
            </div>
          </div>
          <button class="slider-btn prev" @click="prevSlide">
            <i class="fas fa-chevron-left"></i>
          </button>
          <button class="slider-btn next" @click="nextSlide">
            <i class="fas fa-chevron-right"></i>
          </button>
          <div class="slider-dots">
            <span
              v-for="(slide, index) in slides"
              :key="index"
              :class="{ active: currentSlide === index }"
              @click="currentSlide = index"
            ></span>
          </div>
        </div>
      </div>

      <!-- Featured Categories -->
      <section class="categories">
        <h2 class="section-title">Shop by Category</h2>
        <div class="category-grid">
          <div
            class="category-card"
            v-for="category in categories"
            :key="category.id"
          >
            <div class="category-image">
              <img :src="category.image" :alt="category.name" />
              <div class="category-overlay">
                <router-link :to="category.link" class="category-btn"
                  >View Collection</router-link
                >
              </div>
            </div>
            <h3 class="category-name">{{ category.name }}</h3>
            <p class="category-count">{{ category.count }} Products</p>
          </div>
        </div>
      </section>

      <!-- Featured Products -->
      <section class="featured-products">
        <h2 class="section-title">Featured Products</h2>
        <div class="slide-controls">
          <button @click="prevFeatured" :disabled="featuredStart === 0">
            Prev
          </button>
          <button
            @click="nextFeatured"
            :disabled="
              featuredStart + featuredPerPage >= featuredProducts.length
            "
          >
            Next
          </button>
        </div>
        <div class="product-grid">
          <router-link
            v-for="product in featuredProducts.slice(
              featuredStart,
              featuredStart + featuredPerPage
            )"
            :key="product.id"
            :to="getProductDetailLink(product)"
            class="product-card"
          >
            <div class="product-image">
              <img :src="product.image" :alt="product.name" />
              <div class="product-badge" v-if="product.badge">
                {{ product.badge }}
              </div>
              <div class="product-overlay">
                <button class="add-to-cart-btn" @click.prevent>
                  <i class="fas fa-cart-plus"></i>
                </button>
              </div>
            </div>
            <div class="product-info">
              <h3 class="product-name" :title="product.name">
                {{ product.name }}
              </h3>
              <div class="product-meta">
                <span class="product-price">${{ product.price }}</span>
                <span class="product-rating">
                  <i
                    class="fas fa-star"
                    v-for="n in 5"
                    :key="n"
                    :class="{ active: n <= product.rating }"
                  ></i>
                </span>
              </div>
            </div>
          </router-link>
        </div>
      </section>

      <!-- New Arrivals -->
      <section class="new-arrivals" v-if="!loading && !error">
        <h2 class="section-title">New Arrivals</h2>
        <div v-if="newArrivals && newArrivals.length > 0" class="product-grid">
          <router-link
            v-for="product in newArrivals"
            :key="product._id"
            :to="getProductDetailLink(product)"
            class="product-card"
          >
            <div class="product-image">
              <img
                :src="product.image"
                :alt="product.name"
                @error="
                  (e) => {
                    console.error('Image load error:', e);
                    product.image = '/images/placeholder.jpg';
                  }
                "
              />
              <div class="discount-badge" v-if="product.discountPercentage">
                -{{ product.discountPercentage }}%
              </div>
              <div class="product-overlay">
                <button class="add-to-cart-btn" @click.prevent>
                  <i class="fas fa-cart-plus"></i>
                </button>
              </div>
            </div>
            <div class="product-info">
              <h3 class="product-name" :title="product.name">
                {{ product.name }}
              </h3>
              <div class="product-meta">
                <div class="product-price-container">
                  <span
                    class="product-price"
                    :class="{ 'has-sale': product.salePrice }"
                  >
                    ${{ (product.salePrice || product.price).toFixed(2) }}
                  </span>
                  <span v-if="product.salePrice" class="product-sale-price">
                    ${{ product.price.toFixed(2) }}
                  </span>
                </div>
                <span class="product-rating">
                  <i
                    class="fas fa-star"
                    v-for="n in 5"
                    :key="n"
                    :class="{ active: n <= (product.favorite_count || 0) }"
                  ></i>
                </span>
              </div>
            </div>
          </router-link>
        </div>
        <div v-else class="no-products">No new arrivals available</div>
      </section>
      <div v-else-if="loading" class="loading-section">
        <div class="loading">Loading new arrivals...</div>
      </div>
      <div v-else-if="error" class="error-section">
        <div class="error">{{ error }}</div>
      </div>
    </div>
  </div>
</template>

<script>
import Header from "../components/Header.vue";
import { productService } from "../services/product.service";

export default {
  name: "Home",
  components: { Header },
  data() {
    return {
      currentSlide: 0,
      baseUrl: "http://localhost:3005",
      slides: [
        {
          title: "Summer Collection 2024",
          description: "Discover the latest trends in summer fashion",
          image: "/images/slider1.jpg",
          link: "/collections/summer",
        },
        {
          title: "New Arrivals",
          description: "Check out our newest additions",
          image: "/images/slider2.jpg",
          link: "/collections/new-arrivals",
        },
        {
          title: "Special Offers",
          description: "Limited time deals on selected items",
          image: "/images/slider3.jpg",
          link: "/collections/special-offers",
        },
      ],
      categories: [
        {
          id: 1,
          name: "Men's Fashion",
          image: "/images/mens.jpg",
          count: 120,
          link: "/category/mens",
        },
        {
          id: 2,
          name: "Women's Fashion",
          image: "/images/womens.jpg",
          count: 150,
          link: "/category/womens",
        },
        {
          id: 3,
          name: "Accessories",
          image: "/images/accessories.jpg",
          count: 80,
          link: "/category/accessories",
        },
        {
          id: 4,
          name: "Footwear",
          image: "/images/footwear.jpg",
          count: 90,
          link: "/category/footwear",
        },
      ],
      featuredProducts: [
        {
          id: 1,
          name: "Classic White Shirt",
          price: 49.99,
          image:
            "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT37KQ_M5eqlIz_XkF7t0hFjDjDXs-TcZXirQ&s",
          rating: 4,
        },
        {
          id: 2,
          name: "Denim Jacket",
          price: 89.99,
          image: "/images/product2.jpg",
          rating: 5,
        },
        {
          id: 3,
          name: "Summer Dress",
          price: 59.99,
          image: "/images/product3.jpg",
          rating: 4,
        },
        {
          id: 4,
          name: "Leather Boots",
          price: 129.99,
          image: "/images/product4.jpg",
          rating: 5,
        },
      ],
      newArrivals: [],
      loading: true,
      error: null,
      featuredStart: 0,
      featuredPerPage: 4,
    };
  },
  async created() {
    await this.fetchNewArrivals();
  },
  computed: {
    getProductDetailLink() {
      return (product) => `/product-detail/${product._id || ""}`;
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
    nextSlide() {
      this.currentSlide = (this.currentSlide + 1) % this.slides.length;
    },
    prevSlide() {
      this.currentSlide =
        (this.currentSlide - 1 + this.slides.length) % this.slides.length;
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
  height: 80vh;
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
  padding: 4rem 2rem;
  background: #f9f9f9;
}

.section-title {
  text-align: center;
  font-size: 2.5rem;
  margin-bottom: 3rem;
  color: #333;
  position: relative;
}

.section-title::after {
  content: "";
  position: absolute;
  bottom: -10px;
  left: 50%;
  transform: translateX(-50%);
  width: 60px;
  height: 3px;
  background: #ff6b6b;
}

.category-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.category-card {
  background: white;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
}

.category-card:hover {
  transform: translateY(-5px);
}

.category-image {
  height: 300px;
  position: relative;
  overflow: hidden;
}

.category-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.category-card:hover .category-image img {
  transform: scale(1.1);
}

.category-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.category-card:hover .category-overlay {
  opacity: 1;
}

.category-btn {
  padding: 0.8rem 1.5rem;
  background: white;
  color: #333;
  border-radius: 25px;
  transition: all 0.3s ease;
}

.category-btn:hover {
  background: #ff6b6b;
  color: white;
}

.category-name {
  padding: 1rem;
  font-size: 1.2rem;
  color: #333;
}

.category-count {
  padding: 0 1rem 1rem;
  color: #666;
}

/* Product Grid Styles */
.featured-products,
.new-arrivals {
  padding: 4rem 2rem;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
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
  gap: 0.5rem;
}

.product-name {
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.product-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.product-price-container {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.product-price {
  color: #ff6b6b;
  font-size: 1.2rem;
  font-weight: 700;
}

.product-sale-price {
  color: #999;
  text-decoration: line-through;
  font-size: 1rem;
}

.product-rating {
  color: #ffd700;
  font-size: 0.9rem;
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
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 992px) {
  .product-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 576px) {
  .banner-slider {
    height: 50vh;
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
    grid-template-columns: 1fr;
  }

  .new-arrivals {
    padding: 2rem 1rem;
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
</style>
