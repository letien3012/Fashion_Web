<template>
  <div class="collection-page">
    <div class="collection-header">
      <h1>New Arrivals</h1>
      <p>Be the first to discover our latest additions</p>
    </div>

    <div class="collection-filters">
      <div class="filter-group">
        <label>Sort by:</label>
        <select v-model="sortBy">
          <option value="newest">Newest</option>
          <option value="price-low">Price: Low to High</option>
          <option value="price-high">Price: High to Low</option>
          <option value="popular">Most Popular</option>
        </select>
      </div>
      <div class="filter-group">
        <label>Filter by:</label>
        <div class="filter-options">
          <button
            v-for="category in categories"
            :key="category.id"
            :class="{ active: selectedCategory === category.id }"
            @click="selectedCategory = category.id"
          >
            {{ category.name }}
          </button>
        </div>
      </div>
    </div>

    <div v-if="loading" class="loading">
      Loading products...
    </div>

    <div v-else-if="error" class="error">
      {{ error }}
    </div>

    <div v-else class="products-grid">
      <div
        class="product-card"
        v-for="product in filteredProducts"
        :key="product._id"
      >
        <div class="product-image">
          <img :src="product.image" :alt="product.name" />
          <div class="product-overlay">
            <button class="quick-view-btn">Quick View</button>
            <button class="add-to-cart-btn">Add to Cart</button>
          </div>
        </div>
        <div class="product-info">
          <h3 class="product-name">{{ product.name }}</h3>
          <div class="product-price-container">
            <p class="product-price">${{ product.variants[0]?.price || 0 }}</p>
            <p v-if="product.variants[0]?.salePrice" class="product-sale-price">
              ${{ product.variants[0].salePrice }}
            </p>
          </div>
          <div class="product-rating">
            <i
              class="fas fa-star"
              v-for="n in 5"
              :key="n"
              :class="{ active: n <= (product.rating || 0) }"
            ></i>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { productService } from '@/services/product.service';

export default {
  name: "NewArrivals",
  data() {
    return {
      sortBy: "newest",
      selectedCategory: null,
      categories: [
        { id: 1, name: "All" },
        { id: 2, name: "Dresses" },
        { id: 3, name: "Tops" },
        { id: 4, name: "Bottoms" },
        { id: 5, name: "Accessories" },
      ],
      products: [],
      loading: false,
      error: null
    };
  },
  async created() {
    await this.fetchProducts();
  },
  methods: {
    async fetchProducts() {
      this.loading = true;
      try {
        if (this.selectedCategory && this.selectedCategory !== 1) {
          this.products = await productService.getProductsByCategory(this.selectedCategory);
        } else {
          this.products = await productService.getNewArrivals();
        }
      } catch (error) {
        this.error = 'Failed to load products';
        console.error('Error:', error);
      } finally {
        this.loading = false;
      }
    },
    async handleCategoryChange() {
      await this.fetchProducts();
    }
  },
  computed: {
    filteredProducts() {
      let filtered = [...this.products];

      // Sort products
      switch (this.sortBy) {
        case "price-low":
          filtered.sort((a, b) => {
            const priceA = a.variants[0]?.price || 0;
            const priceB = b.variants[0]?.price || 0;
            return priceA - priceB;
          });
          break;
        case "price-high":
          filtered.sort((a, b) => {
            const priceA = a.variants[0]?.price || 0;
            const priceB = b.variants[0]?.price || 0;
            return priceB - priceA;
          });
          break;
        case "popular":
          filtered.sort((a, b) => b.favorite_count - a.favorite_count);
          break;
        default: // newest
          filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      }

      return filtered;
    },
  },
  watch: {
    selectedCategory: {
      handler: 'handleCategoryChange',
      immediate: true
    }
  }
};
</script>

<style scoped>
.collection-page {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.collection-header {
  text-align: center;
  margin-bottom: 3rem;
}

.collection-header h1 {
  font-size: 2.5rem;
  color: #333;
  margin-bottom: 1rem;
}

.collection-header p {
  font-size: 1.2rem;
  color: #666;
}

.collection-filters {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding: 1rem;
  background: #f9f9f9;
  border-radius: 8px;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.filter-group label {
  font-weight: 600;
  color: #333;
}

.filter-group select {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
}

.filter-options {
  display: flex;
  gap: 0.5rem;
}

.filter-options button {
  padding: 0.5rem 1rem;
  border: 1px solid #ddd;
  border-radius: 20px;
  background: white;
  cursor: pointer;
  transition: all 0.3s ease;
}

.filter-options button.active {
  background: #ff6b6b;
  color: white;
  border-color: #ff6b6b;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 2rem;
}

.product-card {
  background: white;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
}

.product-card:hover {
  transform: translateY(-5px);
}

.product-image {
  height: 350px;
  position: relative;
  overflow: hidden;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.product-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.product-card:hover .product-overlay {
  opacity: 1;
}

.quick-view-btn,
.add-to-cart-btn {
  padding: 0.8rem 1.5rem;
  background: white;
  color: #333;
  border: none;
  border-radius: 25px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.quick-view-btn:hover,
.add-to-cart-btn:hover {
  background: #ff6b6b;
  color: white;
}

.product-info {
  padding: 1.5rem;
}

.product-name {
  font-size: 1.2rem;
  margin-bottom: 0.5rem;
  color: #333;
}

.product-price-container {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.product-price {
  font-size: 1.3rem;
  color: #ff6b6b;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.product-sale-price {
  color: #ff6b6b;
  text-decoration: line-through;
  font-size: 1rem;
  opacity: 0.8;
}

.product-rating {
  color: #ffd700;
}

.product-rating i {
  margin-right: 2px;
}

.product-rating i.active {
  color: #ffd700;
}

.loading, .error {
  text-align: center;
  padding: 2rem;
  font-size: 1.2rem;
}

.error {
  color: #ff6b6b;
}

@media (max-width: 768px) {
  .collection-filters {
    flex-direction: column;
    gap: 1rem;
  }

  .filter-group {
    width: 100%;
  }

  .filter-options {
    flex-wrap: wrap;
  }

  .products-grid {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  }
}

@media (max-width: 480px) {
  .collection-page {
    padding: 1rem;
  }

  .collection-header h1 {
    font-size: 2rem;
  }

  .products-grid {
    grid-template-columns: 1fr;
  }
}
</style>
