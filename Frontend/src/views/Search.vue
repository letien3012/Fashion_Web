<template>
  <Header />
  <div class="page-container">
    <div class="breadcrumb">
      <router-link to="/">Trang chủ</router-link>
      <span class="separator">/</span>
      <span class="current">Tìm kiếm</span>
    </div>

    <div class="search-container">
      <div v-if="loading" class="loading">
        <i class="fas fa-spinner fa-spin"></i>
        Đang tìm kiếm...
      </div>

      <div v-else-if="error" class="error">
        <i class="fas fa-exclamation-circle"></i>
        {{ error }}
      </div>

      <div v-else-if="products.length === 0" class="no-results">
        <i class="fas fa-search"></i>
        <p>Không tìm thấy sản phẩm nào phù hợp với từ khóa "{{ keyword }}"</p>
        <p class="suggestion">Gợi ý:</p>
        <ul>
          <li>Kiểm tra lại chính tả</li>
          <li>Thử từ khóa khác</li>
          <li>Thử tìm kiếm với từ khóa ngắn hơn</li>
        </ul>
      </div>

      <div v-else class="search-results">
        <div class="results-header">
          <p>
            Tìm thấy {{ products.length }} sản phẩm cho từ khóa "{{ keyword }}"
          </p>
        </div>
        <div class="products-grid">
          <ProductItem
            v-for="product in products"
            :key="product._id"
            :product="product"
          />
        </div>
      </div>
    </div>
  </div>
  <Footer />
</template>

<script>
import Header from "../components/Header.vue";
import Footer from "../components/Footer.vue";
import ProductItem from "../components/ProductItem.vue";
import { productService } from "../services/product.service";

export default {
  name: "Search",
  components: {
    Header,
    Footer,
    ProductItem,
  },
  data() {
    return {
      keyword: "",
      products: [],
      loading: false,
      error: null,
    };
  },
  watch: {
    "$route.query.keyword": {
      immediate: true,
      handler(newKeyword) {
        if (newKeyword) {
          this.keyword = newKeyword;
          this.searchProducts();
        }
      },
    },
  },
  methods: {
    getImageUrl(image) {
      if (!image) return "/images/placeholder.jpg";
      if (image.startsWith("http")) return image;
      return `http://localhost:3005/${image}`;
    },
    async searchProducts() {
      if (!this.keyword.trim()) {
        this.error = "Vui lòng nhập từ khóa tìm kiếm";
        return;
      }

      this.loading = true;
      this.error = null;
      this.products = [];

      try {
        const response = await productService.searchProducts(this.keyword);
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
          this.products = productsWithPromotions;
        } else {
          this.error = "Không tìm thấy sản phẩm phù hợp";
        }
      } catch (error) {
        this.error = "Có lỗi xảy ra khi tìm kiếm sản phẩm";
        console.error("Search error:", error);
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>

<style scoped>
.page-container {
  width: 95%;
  margin: 0 auto;
  padding: 20px;
}

.breadcrumb {
  margin-bottom: 20px;
  font-size: 14px;
  color: #666;
  padding: 10px 0;
}

.breadcrumb a {
  color: #666;
  text-decoration: none;
}

.breadcrumb a:hover {
  color: #ff0000;
}

.separator {
  margin: 0 8px;
  color: #999;
}

.current {
  color: #ff0000;
}

.search-container {
  width: 100%;
  margin: 0 auto;
}

.loading,
.error,
.no-results {
  text-align: center;
  padding: 40px 20px;
  font-size: 18px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.loading i,
.error i,
.no-results i {
  font-size: 48px;
  margin-bottom: 20px;
  color: #666;
}

.error {
  color: #dc3545;
}

.no-results {
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 40px;
  margin: 20px 0;
}

.no-results .suggestion {
  margin-top: 20px;
  font-weight: bold;
  color: #333;
}

.no-results ul {
  list-style: none;
  padding: 0;
  margin: 10px 0;
}

.no-results li {
  margin: 5px 0;
  color: #666;
}

.search-results {
  margin-top: 20px;
}

.results-header {
  margin-bottom: 20px;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.results-header p {
  margin: 0;
  color: #333;
  font-size: 16px;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 25px;
  padding: 20px 0;
}

@media (max-width: 1200px) {
  .products-grid {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 20px;
  }
}

@media (max-width: 768px) {
  .page-container {
    padding: 10px;
  }

  .products-grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 15px;
  }

  .no-results {
    padding: 20px;
  }
}

@media (max-width: 480px) {
  .products-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 10px;
  }
}
</style>
