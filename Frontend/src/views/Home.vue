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
      <section class="new-arrivals">
        <h2 class="section-title">New Arrivals</h2>
        <div class="product-grid">
          <router-link
            v-for="product in newArrivals"
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
    </div>
  </div>
</template>

<script>
import Header from "../components/Header.vue";

export default {
  name: "Home",
  components: { Header },
  data() {
    return {
      currentSlide: 0,
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
      newArrivals: [
        {
          id: 5,
          name: "Casual T-Shirt",
          price: 29.99,
          image: "/images/product5.jpg",
          rating: 4,
        },
        {
          id: 6,
          name: "Slim Fit Jeans",
          price: 79.99,
          image: "/images/product6.jpg",
          rating: 5,
        },
        {
          id: 7,
          name: "Summer Hat",
          price: 24.99,
          image: "/images/product7.jpg",
          rating: 4,
        },
        {
          id: 8,
          name: "Running Shoes",
          price: 99.99,
          image: "/images/product8.jpg",
          rating: 5,
        },
      ],
      featuredStart: 0,
      featuredPerPage: 4,
    };
  },
  computed: {
    getProductDetailLink() {
      return (product) => `/product-detail/${product.id}`;
    },
  },
  methods: {
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
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

/* Product Card Modern Styles */
.product-card {
  background: #fff;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
  transition: transform 0.2s, box-shadow 0.2s;
  display: flex;
  flex-direction: column;
  position: relative;
  cursor: pointer;
}
.product-card:hover {
  transform: translateY(-6px) scale(1.03);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
}
.product-image {
  position: relative;
  width: 100%;
  aspect-ratio: 1/1;
  overflow: hidden;
  background: #f7f7f7;
}
.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}
.product-card:hover .product-image img {
  transform: scale(1.08);
}
.product-badge {
  position: absolute;
  top: 12px;
  left: 12px;
  background: #ff6b6b;
  color: #fff;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.9rem;
  font-weight: 600;
  z-index: 2;
}
.product-overlay {
  position: absolute;
  bottom: 12px;
  right: 12px;
  display: flex;
  gap: 10px;
  opacity: 0;
  transition: opacity 0.2s;
}
.product-card:hover .product-overlay {
  opacity: 1;
}
.quick-view-btn,
.add-to-cart-btn {
  background: #fff;
  border: none;
  border-radius: 50%;
  width: 38px;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ff6b6b;
  font-size: 1.2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: background 0.2s, color 0.2s;
  cursor: pointer;
}
.quick-view-btn:hover,
.add-to-cart-btn:hover {
  background: #ff6b6b;
  color: #fff;
}
.product-info {
  padding: 1.2rem 1.5rem 1.5rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.product-name {
  font-size: 1.1rem;
  font-weight: 600;
  color: #222;
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
.product-price {
  color: #ff6b6b;
  font-size: 1.1rem;
  font-weight: 700;
}
.product-rating {
  color: #ffd700;
  font-size: 1rem;
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
}

@media (max-width: 768px) {
  .banner-slider {
    height: 60vh;
  }
  .slide-content h2 {
    font-size: 2.5rem;
  }
  .slide-content p {
    font-size: 1.1rem;
  }
  .slider-btn {
    width: 40px;
    height: 40px;
  }
  .section-title {
    font-size: 2rem;
  }
  .category-grid,
  .product-grid {
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  }
}

@media (max-width: 480px) {
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
    font-size: 1.8rem;
  }
  .category-grid,
  .product-grid {
    grid-template-columns: 1fr;
  }
}
</style>
