<template>
  <div class="collection-page">
    <div class="collection-header">
      <h1>Accessories Collection</h1>
      <p>Complete your look with our stylish accessories</p>
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

    <div class="products-grid">
      <div
        class="product-card"
        v-for="product in filteredProducts"
        :key="product.id"
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
          <p class="product-price">${{ product.price }}</p>
          <div class="product-rating">
            <i
              class="fas fa-star"
              v-for="n in 5"
              :key="n"
              :class="{ active: n <= product.rating }"
            ></i>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "AccessoriesCategory",
  data() {
    return {
      sortBy: "newest",
      selectedCategory: null,
      categories: [
        { id: 1, name: "All" },
        { id: 2, name: "Bags" },
        { id: 3, name: "Jewelry" },
        { id: 4, name: "Watches" },
        { id: 5, name: "Sunglasses" },
      ],
      products: [
        {
          id: 1,
          name: "Designer Handbag",
          price: 129.99,
          image:
            "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&auto=format&fit=crop&q=60",
          rating: 5,
          category: 2,
        },
        {
          id: 2,
          name: "Gold Necklace",
          price: 89.99,
          image:
            "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&auto=format&fit=crop&q=60",
          rating: 4,
          category: 3,
        },
        {
          id: 3,
          name: "Luxury Watch",
          price: 199.99,
          image:
            "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=800&auto=format&fit=crop&q=60",
          rating: 5,
          category: 4,
        },
        {
          id: 4,
          name: "Designer Sunglasses",
          price: 79.99,
          image:
            "https://images.unsplash.com/photo-1577803645773-f96470509666?w=800&auto=format&fit=crop&q=60",
          rating: 4,
          category: 5,
        },
        {
          id: 5,
          name: "Leather Wallet",
          price: 49.99,
          image:
            "https://images.unsplash.com/photo-1624222247344-550fb60583eb?w=800&auto=format&fit=crop&q=60",
          rating: 5,
          category: 2,
        },
        {
          id: 6,
          name: "Pearl Earrings",
          price: 59.99,
          image:
            "https://images.unsplash.com/photo-1630019852942-f89202989a59?w=800&auto=format&fit=crop&q=60",
          rating: 4,
          category: 3,
        },
      ],
    };
  },
  computed: {
    filteredProducts() {
      let filtered = [...this.products];

      // Filter by category
      if (this.selectedCategory && this.selectedCategory !== 1) {
        filtered = filtered.filter(
          (product) => product.category === this.selectedCategory
        );
      }

      // Sort products
      switch (this.sortBy) {
        case "price-low":
          filtered.sort((a, b) => a.price - b.price);
          break;
        case "price-high":
          filtered.sort((a, b) => b.price - a.price);
          break;
        case "popular":
          filtered.sort((a, b) => b.rating - a.rating);
          break;
        default: // newest
          filtered.sort((a, b) => b.id - a.id);
      }

      return filtered;
    },
  },
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

.product-price {
  font-size: 1.3rem;
  color: #ff6b6b;
  font-weight: 600;
  margin-bottom: 0.5rem;
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
