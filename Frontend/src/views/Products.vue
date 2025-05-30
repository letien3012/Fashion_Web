<template>
  <Header />
  <div class="product-list-page">
    <div class="container">
      <!-- Breadcrumb -->
      <div class="breadcrumb">
        <router-link to="/">Trang chủ</router-link>
        <span class="separator">/</span>
        <span class="current">Danh sách sản phẩm</span>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>Đang tải dữ liệu...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="error-state">
        <i class="fas fa-exclamation-circle"></i>
        <p>{{ error }}</p>
        <button @click="created" class="retry-btn">Thử lại</button>
      </div>

      <!-- Main Content -->
      <div v-else class="product-list-container">
        <!-- Sidebar Filters -->
        <div class="filters-sidebar">
          <div class="filter-section">
            <h3>Danh mục</h3>
            <div class="filter-options">
              <label
                v-for="category in categories"
                :key="category.id"
                class="filter-option"
              >
                <input
                  type="checkbox"
                  :value="category.id"
                  v-model="selectedCategories"
                />
                <span>{{ category.name }}</span>
                <span class="count">({{ category.count }})</span>
              </label>
            </div>
          </div>

          <div class="filter-section">
            <h3>Khoảng giá</h3>
            <div class="price-range">
              <div class="price-inputs">
                <input
                  type="number"
                  v-model="priceRange.min"
                  placeholder="Từ"
                  min="0"
                />
                <span>-</span>
                <input
                  type="number"
                  v-model="priceRange.max"
                  placeholder="Đến"
                  min="0"
                />
              </div>
              <button class="apply-price-btn" @click="applyPriceFilter">
                Áp dụng
              </button>
            </div>
          </div>

          <div class="filter-section">
            <h3>Màu sắc</h3>
            <div class="color-options">
              <button
                v-for="color in colors"
                :key="color.value"
                class="color-option"
                :class="{ active: selectedColors.includes(color.value) }"
                :style="{ backgroundColor: color.value }"
                @click="toggleColor(color.value)"
                :title="color.name"
              ></button>
            </div>
          </div>

          <div class="filter-section">
            <h3>Kích thước</h3>
            <div class="size-options">
              <button
                v-for="size in sizes"
                :key="size"
                class="size-option"
                :class="{ active: selectedSizes.includes(size) }"
                @click="toggleSize(size)"
              >
                {{ size }}
              </button>
            </div>
          </div>

          <button class="clear-filters-btn" @click="clearFilters">
            Xóa bộ lọc
          </button>
        </div>

        <!-- Product Grid -->
        <div class="products-section">
          <!-- Sort and View Options -->
          <div class="products-header">
            <div class="results-count">
              Hiển thị {{ filteredProducts.length }} sản phẩm
            </div>
            <div class="view-options">
              <select v-model="sortBy" class="sort-select">
                <option value="newest">Mới nhất</option>
                <option value="price-asc">Giá tăng dần</option>
                <option value="price-desc">Giá giảm dần</option>
                <option value="name-asc">Tên A-Z</option>
                <option value="name-desc">Tên Z-A</option>
              </select>
              <div class="view-toggle">
                <button
                  class="view-btn"
                  :class="{ active: viewMode === 'grid' }"
                  @click="viewMode = 'grid'"
                >
                  <i class="fas fa-th"></i>
                </button>
                <button
                  class="view-btn"
                  :class="{ active: viewMode === 'list' }"
                  @click="viewMode = 'list'"
                >
                  <i class="fas fa-list"></i>
                </button>
              </div>
            </div>
          </div>

          <!-- Products Grid/List -->
          <div class="products-grid" :class="viewMode">
            <div
              v-for="product in paginatedProducts"
              :key="product.id"
              class="product-card"
            >
              <div class="product-image">
                <img :src="product.image" :alt="product.name" />
                <div class="product-actions">
                  <button class="action-btn" @click="quickView(product)">
                    <i class="fas fa-eye"></i>
                  </button>
                  <button class="action-btn" @click="addToCart(product)">
                    <i class="fas fa-shopping-cart"></i>
                  </button>
                  <button class="action-btn" @click="toggleFavorite(product)">
                    <i
                      class="fas"
                      :class="product.isFavorite ? 'fa-heart' : 'fa-heart-o'"
                    ></i>
                  </button>
                </div>
                <div v-if="product.salePrice" class="sale-badge">
                  -{{ calculateDiscount(product.price, product.salePrice) }}%
                </div>
              </div>
              <div class="product-info">
                <h3 class="product-name">{{ product.name }}</h3>
                <div class="product-meta">
                  <div class="product-rating">
                    <i
                      v-for="n in 5"
                      :key="n"
                      class="fas fa-star"
                      :class="{ active: n <= product.rating }"
                    ></i>
                    <span class="rating-count"
                      >({{ product.reviewCount }})</span
                    >
                  </div>
                  <div class="product-price">
                    <span
                      class="current-price"
                      :class="{ 'has-sale': product.salePrice }"
                    >
                      {{ formatPrice(product.salePrice || product.price) }}
                    </span>
                    <span v-if="product.salePrice" class="old-price">
                      {{ formatPrice(product.price) }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Pagination -->
          <div class="pagination">
            <button
              class="page-btn"
              :disabled="currentPage === 1"
              @click="currentPage--"
            >
              <i class="fas fa-chevron-left"></i>
            </button>
            <button
              v-for="page in totalPages"
              :key="page"
              class="page-btn"
              :class="{ active: currentPage === page }"
              @click="currentPage = page"
            >
              {{ page }}
            </button>
            <button
              class="page-btn"
              :disabled="currentPage === totalPages"
              @click="currentPage++"
            >
              <i class="fas fa-chevron-right"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
  <Footer />
</template>

<script>
import Header from "../components/Header.vue";
import Footer from "../components/Footer.vue";

export default {
  name: "ProductList",
  components: {
    Header,
    Footer,
  },
  data() {
    return {
      loading: false,
      error: null,
      viewMode: "grid",
      currentPage: 1,
      itemsPerPage: 12,
      sortBy: "newest",
      selectedCategories: [],
      selectedColors: [],
      selectedSizes: [],
      priceRange: {
        min: null,
        max: null,
      },
      categories: [
        { id: 1, name: "Áo thun", count: 45 },
        { id: 2, name: "Áo sơ mi", count: 32 },
        { id: 3, name: "Quần jean", count: 28 },
        { id: 4, name: "Quần shorts", count: 15 },
        { id: 5, name: "Váy", count: 23 },
      ],
      colors: [
        { name: "Đỏ", value: "#ff0000" },
        { name: "Xanh dương", value: "#0000ff" },
        { name: "Đen", value: "#000000" },
        { name: "Trắng", value: "#ffffff" },
        { name: "Xanh lá", value: "#00ff00" },
      ],
      sizes: ["S", "M", "L", "XL", "XXL"],
      products: [
        {
          id: 1,
          name: "Áo thun nam basic",
          price: 299000,
          salePrice: 199000,
          image:
            "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
          rating: 4.5,
          reviewCount: 128,
          isFavorite: false,
          category: 1,
          colors: ["#000000", "#ffffff"],
          sizes: ["S", "M", "L", "XL"],
        },
        {
          id: 2,
          name: "Áo sơ mi trắng công sở",
          price: 450000,
          salePrice: 350000,
          image:
            "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
          rating: 4.2,
          reviewCount: 95,
          isFavorite: false,
          category: 2,
          colors: ["#ffffff"],
          sizes: ["M", "L", "XL", "XXL"],
        },
        {
          id: 3,
          name: "Quần jean slim fit",
          price: 599000,
          salePrice: null,
          image:
            "https://images.unsplash.com/photo-1542272604-787c3835535d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
          rating: 4.8,
          reviewCount: 156,
          isFavorite: false,
          category: 3,
          colors: ["#0000ff", "#000000"],
          sizes: ["S", "M", "L"],
        },
        {
          id: 4,
          name: "Quần shorts kaki nam",
          price: 399000,
          salePrice: 299000,
          image:
            "https://images.unsplash.com/photo-1565084888279-aca607ecce0c?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
          rating: 4.0,
          reviewCount: 82,
          isFavorite: false,
          category: 4,
          colors: ["#000000", "#00ff00"],
          sizes: ["M", "L", "XL"],
        },
        {
          id: 5,
          name: "Váy liền thân công sở",
          price: 699000,
          salePrice: 499000,
          image:
            "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
          rating: 4.6,
          reviewCount: 112,
          isFavorite: false,
          category: 5,
          colors: ["#000000", "#ff0000"],
          sizes: ["S", "M", "L"],
        },
        {
          id: 6,
          name: "Áo thun nữ phối màu",
          price: 249000,
          salePrice: 199000,
          image:
            "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
          rating: 4.3,
          reviewCount: 76,
          isFavorite: false,
          category: 1,
          colors: ["#ff0000", "#00ff00"],
          sizes: ["S", "M", "L", "XL"],
        },
        {
          id: 7,
          name: "Áo sơ mi kẻ sọc",
          price: 399000,
          salePrice: null,
          image:
            "https://images.unsplash.com/photo-1598032895397-b9472444bf93?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
          rating: 4.4,
          reviewCount: 89,
          isFavorite: false,
          category: 2,
          colors: ["#0000ff", "#ffffff"],
          sizes: ["M", "L", "XL"],
        },
        {
          id: 8,
          name: "Quần jean rách gối",
          price: 549000,
          salePrice: 449000,
          image:
            "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
          rating: 4.7,
          reviewCount: 134,
          isFavorite: false,
          category: 3,
          colors: ["#0000ff"],
          sizes: ["S", "M", "L", "XL"],
        },
      ],
    };
  },
  computed: {
    filteredProducts() {
      let result = [...this.products];

      // Lọc theo danh mục
      if (this.selectedCategories.length) {
        result = result.filter((p) =>
          this.selectedCategories.includes(p.category)
        );
      }

      // Lọc theo màu sắc
      if (this.selectedColors.length) {
        result = result.filter((p) =>
          p.colors.some((c) => this.selectedColors.includes(c))
        );
      }

      // Lọc theo kích thước
      if (this.selectedSizes.length) {
        result = result.filter((p) =>
          p.sizes.some((s) => this.selectedSizes.includes(s))
        );
      }

      // Lọc theo giá
      if (this.priceRange.min !== null) {
        result = result.filter(
          (p) => (p.salePrice || p.price) >= this.priceRange.min
        );
      }
      if (this.priceRange.max !== null) {
        result = result.filter(
          (p) => (p.salePrice || p.price) <= this.priceRange.max
        );
      }

      // Sắp xếp
      switch (this.sortBy) {
        case "price-asc":
          result.sort(
            (a, b) => (a.salePrice || a.price) - (b.salePrice || b.price)
          );
          break;
        case "price-desc":
          result.sort(
            (a, b) => (b.salePrice || b.price) - (a.salePrice || a.price)
          );
          break;
        case "name-asc":
          result.sort((a, b) => a.name.localeCompare(b.name));
          break;
        case "name-desc":
          result.sort((a, b) => b.name.localeCompare(a.name));
          break;
        default: // newest
          result.sort((a, b) => b.id - a.id);
      }

      return result;
    },
    totalPages() {
      return Math.ceil(this.filteredProducts.length / this.itemsPerPage);
    },
    paginatedProducts() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.filteredProducts.slice(start, end);
    },
  },
  methods: {
    formatPrice(price) {
      return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }).format(price);
    },
    calculateDiscount(original, sale) {
      return Math.round(((original - sale) / original) * 100);
    },
    toggleColor(color) {
      const index = this.selectedColors.indexOf(color);
      if (index === -1) {
        this.selectedColors.push(color);
      } else {
        this.selectedColors.splice(index, 1);
      }
    },
    toggleSize(size) {
      const index = this.selectedSizes.indexOf(size);
      if (index === -1) {
        this.selectedSizes.push(size);
      } else {
        this.selectedSizes.splice(index, 1);
      }
    },
    applyPriceFilter() {
      if (this.priceRange.min && this.priceRange.max) {
        if (this.priceRange.min > this.priceRange.max) {
          const temp = this.priceRange.min;
          this.priceRange.min = this.priceRange.max;
          this.priceRange.max = temp;
        }
      }
    },
    clearFilters() {
      this.selectedCategories = [];
      this.selectedColors = [];
      this.selectedSizes = [];
      this.priceRange = { min: null, max: null };
      this.sortBy = "newest";
      this.currentPage = 1;
    },
    quickView(product) {
      console.log("Quick view:", product);
    },
    addToCart(product) {
      console.log("Add to cart:", product);
    },
    toggleFavorite(product) {
      product.isFavorite = !product.isFavorite;
      console.log("Toggle favorite:", product);
    },
  },
  watch: {
    sortBy() {
      this.currentPage = 1;
    },
    selectedCategories() {
      this.currentPage = 1;
    },
    selectedColors() {
      this.currentPage = 1;
    },
    selectedSizes() {
      this.currentPage = 1;
    },
    priceRange: {
      deep: true,
      handler() {
        this.currentPage = 1;
      },
    },
  },
};
</script>

<style scoped>
.product-list-page {
  min-height: 100vh;
  background: #f8f9fa;
  width: 100%;
}

.container {
  max-width: 95%;
  margin: 0 auto;
  padding: 20px;
}

.breadcrumb {
  margin-bottom: 20px;
  font-size: 14px;
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

.product-list-container {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 30px;
}

/* Filters Sidebar */
.filters-sidebar {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.filter-section {
  margin-bottom: 25px;
}

.filter-section h3 {
  font-size: 16px;
  margin-bottom: 15px;
  color: #333;
}

.filter-options {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.filter-option {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.filter-option input[type="checkbox"] {
  width: 16px;
  height: 16px;
}

.filter-option .count {
  color: #999;
  font-size: 13px;
}

.price-range {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.price-inputs {
  display: flex;
  align-items: center;
  gap: 10px;
}

.price-inputs input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.apply-price-btn {
  padding: 8px;
  background: #e63946;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.apply-price-btn:hover {
  background: #d62828;
}

.color-options {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.color-option {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: 2px solid #ddd;
  cursor: pointer;
  transition: all 0.3s ease;
}

.color-option.active {
  border-color: #e63946;
  transform: scale(1.1);
}

.size-options {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.size-option {
  padding: 6px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
  cursor: pointer;
  transition: all 0.3s ease;
}

.size-option.active {
  background: #e63946;
  color: white;
  border-color: #e63946;
}

.clear-filters-btn {
  width: 100%;
  padding: 10px;
  background: #f8f9fa;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.clear-filters-btn:hover {
  background: #e9ecef;
}

/* Products Section */
.products-section {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.products-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.results-count {
  color: #666;
}

.view-options {
  display: flex;
  align-items: center;
  gap: 15px;
}

.sort-select {
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  outline: none;
}

.view-toggle {
  display: flex;
  gap: 5px;
}

.view-btn {
  padding: 8px;
  background: none;
  border: 1px solid #ddd;
  cursor: pointer;
  transition: all 0.3s ease;
}

.view-btn.active {
  background: #e63946;
  color: white;
  border-color: #e63946;
}

/* Products Grid/List */
.products-grid {
  display: grid;
  gap: 20px;
}

.products-grid.grid {
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
}

.products-grid.list {
  grid-template-columns: 1fr;
}

.product-card {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.products-grid.grid .product-card {
  border: 1px solid #eee;
}

.products-grid.list .product-card {
  display: grid;
  grid-template-columns: 200px 1fr;
  gap: 20px;
  padding: 15px;
  border: 1px solid #eee;
}

.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.product-image {
  position: relative;
  padding-top: 100%;
}

.products-grid.list .product-image {
  padding-top: 0;
  height: 200px;
}

.product-image img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.products-grid.list .product-image img {
  position: relative;
}

.product-actions {
  position: absolute;
  top: 10px;
  right: 10px;
  display: flex;
  flex-direction: column;
  gap: 5px;
  opacity: 0;
  transition: all 0.3s ease;
}

.product-card:hover .product-actions {
  opacity: 1;
}

.action-btn {
  width: 35px;
  height: 35px;
  border-radius: 50%;
  background: white;
  border: none;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.3s ease;
}

.action-btn:hover {
  background: #e63946;
  color: white;
}

.sale-badge {
  position: absolute;
  top: 10px;
  left: 10px;
  padding: 5px 10px;
  background: #e63946;
  color: white;
  border-radius: 4px;
  font-size: 12px;
  font-weight: bold;
}

.product-info {
  padding: 15px;
}

.products-grid.list .product-info {
  padding: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.product-name {
  margin: 0 0 10px;
  font-size: 16px;
  color: #333;
}

.product-meta {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.product-rating {
  display: flex;
  align-items: center;
  gap: 5px;
}

.product-rating i {
  color: #ddd;
  font-size: 14px;
}

.product-rating i.active {
  color: #ffc107;
}

.rating-count {
  color: #666;
  font-size: 13px;
}

.product-price {
  display: flex;
  align-items: center;
  gap: 10px;
}

.current-price {
  font-size: 18px;
  font-weight: bold;
  color: #e63946;
}

.current-price.has-sale {
  color: #e63946;
}

.old-price {
  font-size: 14px;
  color: #999;
  text-decoration: line-through;
}

/* Pagination */
.pagination {
  display: flex;
  justify-content: center;
  gap: 5px;
  margin-top: 30px;
}

.page-btn {
  width: 35px;
  height: 35px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #ddd;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.page-btn:disabled {
  background: #f8f9fa;
  cursor: not-allowed;
  color: #999;
}

.page-btn.active {
  background: #e63946;
  color: white;
  border-color: #e63946;
}

/* Responsive Design */
@media (max-width: 992px) {
  .product-list-container {
    grid-template-columns: 1fr;
  }

  .filters-sidebar {
    margin-bottom: 20px;
  }
}

@media (max-width: 768px) {
  .products-header {
    flex-direction: column;
    gap: 15px;
  }

  .products-grid.list .product-card {
    grid-template-columns: 1fr;
  }

  .products-grid.list .product-image {
    height: 250px;
  }
}

@media (max-width: 576px) {
  .products-grid.grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .product-name {
    font-size: 14px;
  }

  .current-price {
    font-size: 16px;
  }
}

.loading-state,
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  text-align: center;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 5px solid #f3f3f3;
  border-top: 5px solid #e63946;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.error-state i {
  font-size: 48px;
  color: #e63946;
  margin-bottom: 20px;
}

.retry-btn {
  padding: 10px 20px;
  background: #e63946;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 20px;
  transition: background 0.3s ease;
}

.retry-btn:hover {
  background: #d62828;
}
</style>
