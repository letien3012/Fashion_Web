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
          <div class="filter-section" v-if="!currentCategory">
            <h3>Danh mục</h3>
            <div class="filter-options">
              <div
                v-for="category in categories"
                :key="category._id"
                class="filter-option parent-category"
              >
                <div class="category-wrapper">
                  <div class="parent-row">
                    <input
                      type="checkbox"
                      :id="'category-' + category._id"
                      :value="category._id"
                      v-model="selectedCategories"
                    />
                    <label :for="'category-' + category._id">
                      <span>{{ category.name }}</span>
                    </label>
                  </div>
                  <div
                    v-if="category.children && category.children.length > 0"
                    class="subcategories"
                  >
                    <div
                      v-for="child in category.children"
                      :key="child._id"
                      class="subcategory-item"
                    >
                      <input
                        type="checkbox"
                        :id="'category-' + child._id"
                        :value="child._id"
                        v-model="selectedCategories"
                      />
                      <label :for="'category-' + child._id">
                        <span>{{ child.name }}</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="filter-section">
            <div class="slider-range">
              <label>Khoảng giá:</label>
              <input
                type="range"
                v-model.number="priceRange[0]"
                :min="minPrice"
                :max="maxPrice"
                :step="10000"
                @input="handlePriceInput"
                :style="sliderMinStyle"
              />
              <input
                type="range"
                v-model.number="priceRange[1]"
                :min="minPrice"
                :max="maxPrice"
                :step="10000"
                @input="handlePriceInput"
                :style="sliderMaxStyle"
              />
              <p>
                Giá từ: {{ formatCurrency(priceRange[0]) }} -
                {{ formatCurrency(priceRange[1]) }}
              </p>
            </div>
          </div>

          <button class="clear-filters-btn" @click="clearFilters">
            Xóa bộ lọc
          </button>
        </div>

        <!-- Product Grid -->
        <div
          class="products-section"
          :class="{ 'full-width': currentCategory }"
        >
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
import { productCatalogueService } from "../services/productCatalogue.service";
import { attributeService } from "../services/attribute.service";
import { attributeCatalogueService } from "../services/attributeCatalogue.service";

export default {
  name: "ProductList",
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
      viewMode: "grid",
      currentPage: 1,
      itemsPerPage: 20,
      sortBy: "newest",
      selectedCategories: [],
      minPrice: 0,
      maxPrice: 10000000,
      priceRange: [0, 10000000],
      localPriceRange: [0, 10000000],
      categories: [],
      products: [],
      allProducts: [],
      baseUrl: "http://localhost:3005",
      currentCategory: null,
    };
  },
  computed: {
    filteredProducts() {
      let result = [...this.products];

      // Lọc sản phẩm đã duyệt
      result = result.filter((p) => p.publish === true);

      // Lọc theo danh mục được chọn từ URL
      if (this.currentCategory) {
        // Tìm danh mục hiện tại và lấy tất cả ID của danh mục con
        const categoryIds = this.getAllCategoryIds(this.currentCategory);
        result = result.filter((p) => {
          return categoryIds.includes(p.catalogueId);
        });
      }
      // Lọc theo danh mục được chọn từ filter
      else if (this.selectedCategories.length) {
        // Lấy tất cả ID của các danh mục được chọn và danh mục con của chúng
        const categoryIds = this.selectedCategories.reduce(
          (ids, categoryId) => {
            return [...ids, ...this.getAllCategoryIds(categoryId)];
          },
          []
        );
        result = result.filter((p) => {
          return categoryIds.includes(p.catalogueId);
        });
      }

      // Lọc theo giá
      if (this.priceRange && this.priceRange.length === 2) {
        result = result.filter((p) => {
          if (!p.variants || !Array.isArray(p.variants)) {
            return false;
          }

          const prices = p.variants
            .map((v) => v.price || 0)
            .filter((price) => price > 0);

          if (prices.length === 0) return false;

          const minProductPrice = Math.min(...prices);
          const maxProductPrice = Math.max(...prices);

          return (
            (minProductPrice >= this.priceRange[0] &&
              minProductPrice <= this.priceRange[1]) ||
            (maxProductPrice >= this.priceRange[0] &&
              maxProductPrice <= this.priceRange[1]) ||
            (minProductPrice <= this.priceRange[0] &&
              maxProductPrice >= this.priceRange[1])
          );
        });
      }

      // Sắp xếp
      switch (this.sortBy) {
        case "price-asc":
          result.sort((a, b) => {
            const aMinPrice = Math.min(
              ...(a.variants || []).map((v) => v.price || 0)
            );
            const bMinPrice = Math.min(
              ...(b.variants || []).map((v) => v.price || 0)
            );
            return aMinPrice - bMinPrice;
          });
          break;
        case "price-desc":
          result.sort((a, b) => {
            const aMaxPrice = Math.max(
              ...(a.variants || []).map((v) => v.price || 0)
            );
            const bMaxPrice = Math.max(
              ...(b.variants || []).map((v) => v.price || 0)
            );
            return bMaxPrice - aMaxPrice;
          });
          break;
        case "name-asc":
          result.sort((a, b) => a.name.localeCompare(b.name));
          break;
        case "name-desc":
          result.sort((a, b) => b.name.localeCompare(a.name));
          break;
        default: // newest
          result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
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
    sliderMinStyle() {
      const percent =
        ((this.priceRange[0] - this.minPrice) /
          (this.maxPrice - this.minPrice)) *
        100;
      return {
        background: `linear-gradient(to right, #ff6b6b ${percent}%, #f0f0f0 ${percent}%)`,
      };
    },
    sliderMaxStyle() {
      const percent =
        ((this.priceRange[1] - this.minPrice) /
          (this.maxPrice - this.minPrice)) *
        100;
      return {
        background: `linear-gradient(to right, #f0f0f0 ${percent}%, #ff6b6b ${percent}%)`,
      };
    },
    publishedCount() {
      return this.filteredProducts.filter((p) => p.publish === true).length;
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

    async fetchProducts() {
      this.loading = true;
      this.error = null;
      try {
        const response = await productService.getNewArrivals();
        if (response && response.data && Array.isArray(response.data)) {
          // Process each product to get promotions
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
          this.products = productsWithPromotions;
          this.allProducts = productsWithPromotions;
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

    async fetchCategories() {
      try {
        const response = await productCatalogueService.getTree();
        console.log("Raw categories response:", response);
        this.categories = response.data || [];
        console.log(
          "Categories with counts:",
          this.categories.map((cat) => ({
            name: cat.name,
            count: cat.productCount,
            id: cat._id,
          }))
        );
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    },

    formatPrice(price) {
      return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
        maximumFractionDigits: 0,
      }).format(price);
    },

    syncPriceRange() {
      this.localPriceRange = [this.minPrice, this.maxPrice];
      this.priceRange = [this.minPrice, this.maxPrice];
    },

    calculateDiscount(original, sale) {
      return Math.round(((original - sale) / original) * 100);
    },

    handlePriceInput() {
      let [min, max] = this.priceRange;
      if (min > max) [min, max] = [max, min];
      this.priceRange = [min, max];
    },

    clearFilters() {
      this.selectedCategories = [];
      this.localPriceRange = [0, 10000000];
      this.priceRange = [0, 10000000];
      this.sortBy = "newest";
      this.currentPage = 1;
    },

    async quickView(product) {
      try {
        const productDetails = await productService.getProductById(product._id);
        // Implement quick view logic here
        console.log("Quick view:", productDetails);
      } catch (error) {
        console.error("Error fetching product details:", error);
      }
    },

    async addToCart(product) {
      try {
        // Implement add to cart logic here
        console.log("Add to cart:", product);
      } catch (error) {
        console.error("Error adding to cart:", error);
      }
    },

    async toggleFavorite(product) {
      try {
        // Implement favorite logic here
        product.isFavorite = !product.isFavorite;
        console.log("Toggle favorite:", product);
      } catch (error) {
        console.error("Error toggling favorite:", error);
      }
    },

    formatCurrency(value) {
      return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }).format(value);
    },

    // Hàm lấy tất cả ID của danh mục và danh mục con
    getAllCategoryIds(categoryId) {
      const ids = [categoryId];
      const category = this.findCategoryById(categoryId);
      if (category && category.children) {
        category.children.forEach((child) => {
          ids.push(child._id);
          // Đệ quy để lấy ID của các danh mục con sâu hơn
          if (child.children && child.children.length > 0) {
            ids.push(...this.getAllCategoryIds(child._id));
          }
        });
      }
      return ids;
    },

    // Hàm tìm danh mục theo ID
    findCategoryById(categoryId) {
      const findInCategories = (categories) => {
        for (const category of categories) {
          if (category._id === categoryId) {
            return category;
          }
          if (category.children && category.children.length > 0) {
            const found = findInCategories(category.children);
            if (found) return found;
          }
        }
        return null;
      };
      return findInCategories(this.categories);
    },
  },
  watch: {
    sortBy() {
      this.currentPage = 1;
    },
    selectedCategories() {
      this.currentPage = 1;
    },
    "$route.query.category": {
      immediate: true,
      handler(newCategory) {
        this.currentCategory = newCategory;
        this.selectedCategories = newCategory ? [newCategory] : [];
      },
    },
  },
  mounted() {
    this.localPriceRange = [0, 10000000];
    this.priceRange = [0, 10000000];
  },
  async created() {
    await Promise.all([this.fetchProducts(), this.fetchCategories()]);
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
  padding: 25px;
  border-radius: 15px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  position: sticky;
  top: 20px;
  height: fit-content;
  transition: all 0.3s ease;
}

.filter-section {
  margin-bottom: 30px;
  border-bottom: 1px solid #f0f0f0;
  padding-bottom: 25px;
}

.filter-section:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

.filter-section h3 {
  font-size: 18px;
  margin-bottom: 20px;
  color: #333;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 10px;
}

.filter-section h3::before {
  content: "";
  width: 4px;
  height: 20px;
  background: #ff6b6b;
  border-radius: 2px;
  display: inline-block;
}

.filter-options {
  display: flex;
  flex-direction: column;
  gap: 5px;
  max-height: 400px;
  overflow-y: auto;
  padding-right: 10px;
}

.filter-options::-webkit-scrollbar {
  width: 4px;
}

.filter-options::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 2px;
}

.filter-options::-webkit-scrollbar-thumb {
  background: #ff6b6b;
  border-radius: 2px;
}

.filter-option {
  position: relative;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.category-wrapper {
  width: 100%;
}

.parent-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.subcategories {
  display: none;
  margin-left: 28px;
  margin-top: 2px;
  border-left: 2px solid #ff6b6b;
  padding-left: 10px;
}

.filter-option input[type="checkbox"] {
  width: 16px;
  height: 16px;
  cursor: pointer;
  accent-color: #ff6b6b;
  border-radius: 4px;
  margin: 0;
  position: relative;
  z-index: 2;
}

.filter-option input[type="checkbox"]:checked + label {
  color: #ff6b6b;
  font-weight: 500;
}

.filter-option label {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  flex: 1;
  font-size: 14px;
  color: #555;
  padding: 10px 12px;
  border-radius: 8px;
  transition: all 0.3s ease;
  user-select: none;
}

.filter-option:hover label {
  background: #fff5f5;
  color: #ff6b6b;
}

.subcategory-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 0;
  transition: all 0.3s ease;
}

.subcategory-item:hover {
  background: #fff5f5;
  padding-left: 8px;
}

.subcategory-item label {
  font-size: 13px;
  color: #666;
  padding: 8px 12px;
  cursor: pointer;
  user-select: none;
}

.subcategory-item input[type="checkbox"]:checked + label {
  color: #ff6b6b;
  font-weight: 500;
}

.subcategory-item:hover label {
  color: #ff6b6b;
}

.subcategory-item input[type="checkbox"] {
  width: 14px;
  height: 14px;
  position: relative;
  z-index: 2;
}

/* Active state for checked items */
.filter-option
  input[type="checkbox"]:checked
  ~ .subcategories
  .subcategory-item {
  background: #fff5f5;
}

.category-wrapper:hover .subcategories {
  display: block;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.slider-range {
  display: flex;
  flex-direction: column;
  gap: 15px;
  padding: 0 5px;
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.slider-range label {
  font-size: 15px;
  color: #333;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
}

.slider-range label::before {
  content: "";
  width: 4px;
  height: 16px;
  background: linear-gradient(to bottom, #ff6b6b, #ff8787);
  border-radius: 2px;
  display: inline-block;
}

.slider-range input[type="range"] {
  width: 100%;
  height: 6px;
  -webkit-appearance: none;
  background: linear-gradient(to right, #ff6b6b, #ff8787);
  border-radius: 3px;
  outline: none;
  margin: 15px 0;
}

.slider-range input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 22px;
  height: 22px;
  background: white;
  border-radius: 50%;
  cursor: pointer;
  border: 2px solid #ff6b6b;
  box-shadow: 0 2px 6px rgba(255, 107, 107, 0.3);
  transition: all 0.3s ease;
}

.slider-range input[type="range"]::-webkit-slider-thumb:hover {
  transform: scale(1.1);
  box-shadow: 0 3px 8px rgba(255, 107, 107, 0.4);
}

.slider-range p {
  text-align: right;
  font-size: 14px;
  color: #666;
  font-weight: 500;
  margin-top: 5px;
  background: #fff5f5;
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid #ffe0e0;
}

.price-range-values {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
  padding: 0 5px;
}

.price-range-value {
  font-size: 14px;
  color: #666;
  background: #fff5f5;
  padding: 6px 12px;
  border-radius: 6px;
  border: 1px solid #ffe0e0;
}

.price-range-value.active {
  color: #ff6b6b;
  font-weight: 600;
  background: white;
  border-color: #ff6b6b;
}

.clear-filters-btn {
  width: 100%;
  padding: 12px;
  background: #fff5f5;
  border: 1px solid #ff6b6b;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  color: #ff6b6b;
  font-weight: 500;
  margin-top: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.clear-filters-btn:hover {
  background: #ff6b6b;
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 107, 107, 0.2);
}

.clear-filters-btn i {
  font-size: 14px;
}

/* Products Section */
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

.view-toggle {
  display: flex;
  gap: 5px;
}

.view-btn {
  width: 35px;
  height: 35px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  color: #666;
}

.view-btn:hover {
  border-color: #ff6b6b;
  color: #ff6b6b;
}

.view-btn.active {
  background: #ff6b6b;
  color: white;
  border-color: #ff6b6b;
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

.page-btn i {
  font-size: 12px;
}

/* Responsive Design */
@media (max-width: 992px) {
  .product-list-container {
    grid-template-columns: 1fr;
  }

  .filters-sidebar {
    position: relative;
    top: 0;
    margin-bottom: 30px;
  }

  .container {
    padding: 15px;
  }

  .products-section {
    padding: 15px;
  }
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

  .slider-range {
    padding: 15px;
  }

  .filter-section h3 {
    font-size: 16px;
  }

  .filter-options {
    max-height: 300px;
  }

  .filter-option label {
    font-size: 13px;
    padding: 8px 10px;
  }

  .subcategory-item label {
    font-size: 12px;
    padding: 6px 10px;
  }

  .pagination {
    gap: 5px;
    margin-top: 20px;
    padding: 15px 0;
  }

  .page-btn {
    min-width: 35px;
    height: 35px;
    font-size: 13px;
    padding: 0 8px;
  }
}

@media (max-width: 576px) {
  .container {
    padding: 10px;
  }

  .products-grid.grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }

  .product-name {
    font-size: 14px;
  }

  .current-price {
    font-size: 16px;
  }

  .filters-sidebar {
    padding: 15px;
  }

  .filter-section {
    margin-bottom: 20px;
    padding-bottom: 20px;
  }

  .filter-options {
    max-height: 200px;
  }

  .attribute-option {
    padding: 6px 12px;
    font-size: 12px;
  }

  .breadcrumb {
    font-size: 12px;
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

  .view-btn {
    width: 30px;
    height: 30px;
  }

  .pagination {
    gap: 3px;
    margin-top: 15px;
    padding: 10px 0;
  }

  .page-btn {
    min-width: 30px;
    height: 30px;
    font-size: 12px;
    padding: 0 6px;
  }

  .slider-range input[type="range"]::-webkit-slider-thumb {
    width: 18px;
    height: 18px;
  }

  .slider-range p {
    font-size: 12px;
    padding: 6px 10px;
  }

  .clear-filters-btn {
    padding: 10px;
    font-size: 13px;
  }
}

@media (max-width: 375px) {
  .products-grid.grid {
    grid-template-columns: 1fr;
  }

  .container {
    padding: 8px;
  }

  .products-section {
    padding: 10px;
  }

  .filter-option label {
    font-size: 13px;
  }

  .attribute-option {
    padding: 5px 10px;
    font-size: 11px;
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

.parent-category label {
  background: none !important;
  color: #555 !important;
  font-weight: 400 !important;
}
.parent-category input[type="checkbox"]:checked + label {
  color: #ff6b6b !important;
  font-weight: 500 !important;
  background: none !important;
}
</style>
