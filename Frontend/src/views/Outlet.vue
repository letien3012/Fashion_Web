<template>
  <Header />
  <div class="product-list-page">
    <div class="page-container">
      <!-- Breadcrumb -->
      <div class="breadcrumb">
        <router-link to="/">Trang chủ</router-link>
        <span class="separator">/</span>
        <span class="current">Outlet - Sản phẩm giảm giá</span>
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
        <button @click="fetchProducts" class="retry-btn">Thử lại</button>
      </div>

      <!-- Main Content -->
      <div v-else class="product-list-container">
        <!-- Products Section -->
        <div class="products-section full-width">
          <!-- Sort and View Options -->
          <div class="products-header">
            <div class="results-count">
              Hiển thị {{ filteredProducts.length }} sản phẩm giảm giá
            </div>
            <div class="view-options">
              <select v-model="sortBy" class="sort-select">
                <option value="discount-desc">Giảm giá nhiều nhất</option>
                <option value="price-asc">Giá tăng dần</option>
                <option value="price-desc">Giá giảm dần</option>
                <option value="name-asc">Tên A-Z</option>
                <option value="name-desc">Tên Z-A</option>
              </select>
            </div>
          </div>

          <!-- Products Grid -->
          <div class="products-grid">
            <ProductItem
              v-for="product in paginatedProducts"
              :key="product._id"
              :product="product"
            />
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
  <Chatbot />
</template>

<script>
import Header from "../components/Header.vue";
import Footer from "../components/Footer.vue";
import Chatbot from "../components/Chatbot.vue";
import ProductItem from "../components/ProductItem.vue";
import { productService } from "../services/product.service";
import { promotionService } from "../services/promotion.service";

export default {
  name: "Outlet",
  components: {
    Header,
    Footer,
    Chatbot,
    ProductItem,
  },
  data() {
    return {
      loading: false,
      error: null,
      currentPage: 1,
      itemsPerPage: 20,
      sortBy: "discount-desc",
      products: [],
      baseUrl: "http://localhost:3005",
    };
  },
  computed: {
    filteredProducts() {
      let result = [...this.products];

      // Sắp xếp
      switch (this.sortBy) {
        case "discount-desc":
          result.sort((a, b) => b.discountPercentage - a.discountPercentage);
          break;
        case "price-asc":
          result.sort((a, b) => a.salePrice - b.salePrice);
          break;
        case "price-desc":
          result.sort((a, b) => b.salePrice - a.salePrice);
          break;
        case "name-asc":
          result.sort((a, b) => a.name.localeCompare(b.name));
          break;
        case "name-desc":
          result.sort((a, b) => b.name.localeCompare(a.name));
          break;
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
    getImageUrl(path) {
      if (!path) return "";
      if (path.startsWith("http")) return path;
      return `${this.baseUrl}${path}`;
    },

    async fetchProducts() {
      this.loading = true;
      this.error = null;
      try {
        // Lấy danh sách sản phẩm đang được giảm giá
        const response = await promotionService.getDiscountedProducts();
        if (response && response.data) {
          this.products = response.data.map((product) => ({
            _id: product._id,
            name: product.name,
            image: this.getImageUrl(product.image),
            album: (product.album || []).map((img) => this.getImageUrl(img)),
            price: product.price,
            salePrice: product.salePrice,
            discountPercentage: product.discountPercentage,
            favorite_count: product.favorite_count || 0,
            variants: [product.variant],
            catalogueId: product.catalogueId || null,
            publish: product.publish || false,
            description: product.description || "",
            content: product.content || "",
            view_count: product.view_count || 0,
            promotion: product.promotion,
          }));
        } else {
          this.error = "Invalid data format received";
        }
      } catch (error) {
        console.error("Error fetching products:", error);
        this.error = "Không thể tải danh sách sản phẩm. Vui lòng thử lại sau.";
      } finally {
        this.loading = false;
      }
    },
  },
  watch: {
    sortBy() {
      this.currentPage = 1;
    },
  },
  async created() {
    await this.fetchProducts();
  },
};
</script>

<style scoped>
.product-list-page {
  background: #f8f9fa;
  width: 100%;
}
.page-container {
  width: 95%;
  margin: 0 auto;
  padding: 20px;
  box-sizing: border-box;
}

@media (max-width: 991px) {
  .page-container {
    width: 100%;
    padding: 10px;
    max-width: 100vw;
    overflow-x: hidden;
  }
}

.breadcrumb {
  margin-bottom: 20px;
  font-size: 14px;
}

@media (max-width: 991px) {
  .breadcrumb {
    font-size: 12px;
    margin-bottom: 15px;
    padding: 0 10px;
  }
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

.product-list-page {
  min-height: 100vh;
  background: #f8f9fa;
  width: 100%;
}

.product-list-container {
  display: grid;
  grid-template-columns: 1fr;
  gap: 30px;
}

.products-section {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.products-section.full-width {
  width: 100%;
}

.products-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 15px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.results-count {
  color: #666;
  font-size: 14px;
  font-weight: 500;
}

.view-options {
  display: flex;
  align-items: center;
  gap: 15px;
}

.sort-select {
  padding: 8px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  outline: none;
  font-size: 14px;
  color: #333;
  background: #fff;
  cursor: pointer;
  transition: all 0.3s ease;
}

.sort-select:hover {
  border-color: #ff6b6b;
}

.sort-select:focus {
  border-color: #ff6b6b;
  box-shadow: 0 0 0 2px rgba(255, 107, 107, 0.1);
}

.products-grid {
  display: grid;
  gap: 20px;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  margin-top: 30px;
  padding: 20px 0;
}

.page-btn {
  min-width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  color: #666;
  cursor: pointer;
  transition: all 0.3s ease;
  padding: 0 12px;
}

.page-btn:hover:not(:disabled) {
  border-color: #ff6b6b;
  color: #ff6b6b;
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(255, 107, 107, 0.1);
}

.page-btn.active {
  background: #ff6b6b;
  color: white;
  border-color: #ff6b6b;
  font-weight: 500;
}

.page-btn:disabled {
  background: #f5f5f5;
  color: #999;
  cursor: not-allowed;
  border-color: #e0e0e0;
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
  margin-bottom: 20px;
  color: #e63946;
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
  background: #b71c1c;
}

@media (max-width: 768px) {
  .products-header {
    flex-direction: column;
    gap: 15px;
    padding: 12px;
  }

  .view-options {
    width: 100%;
    justify-content: space-between;
  }

  .sort-select {
    flex: 1;
    max-width: 200px;
  }
}

@media (max-width: 576px) {
  .products-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }

  .products-header {
    gap: 10px;
  }

  .results-count {
    font-size: 13px;
  }

  .sort-select {
    font-size: 13px;
    padding: 6px 10px;
  }
}

@media (max-width: 375px) {
  .products-grid {
    grid-template-columns: 1fr;
  }
}
</style>
