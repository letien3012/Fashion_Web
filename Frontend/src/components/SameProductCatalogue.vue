<template>
  <div class="same-category-section">
    <div class="section-header">
      <h2 class="section-title">Sản phẩm cùng danh mục</h2>
      <p class="section-subtitle">Khám phá thêm các sản phẩm tương tự</p>
    </div>
    <div v-if="loading" class="loading-state">Đang tải sản phẩm...</div>
    <div v-else-if="error" class="error-state">
      {{ error }}
    </div>
    <div v-else-if="displayedProducts.length === 0" class="no-products">
      <i class="fas fa-box-open"></i>
      <p>Không có sản phẩm nào trong cùng danh mục</p>
    </div>
    <div v-else>
      <div class="product-grid">
        <ProductItem
          v-for="product in displayedProducts"
          :key="product._id"
          :product="product"
        />
      </div>
      <div class="load-more-container">
        <router-link
          :to="`/products?category=${currentProduct.catalogueId}`"
          class="load-more-btn"
        >
          Xem thêm
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
import { productService } from "../services/product.service";
import ProductItem from "./ProductItem.vue";

export default {
  name: "SameProductCatalogue",
  components: {
    ProductItem,
  },
  props: {
    currentProduct: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      products: [],
      loading: false,
      error: null,
      displayCount: 4,
      baseUrl: "http://localhost:3005",
    };
  },
  computed: {
    displayedProducts() {
      return this.products.slice(0, this.displayCount);
    },
    hasMoreProducts() {
      return this.displayCount < this.products.length;
    },
  },
  async created() {
    await this.loadSameCategoryProducts();
  },
  watch: {
    "currentProduct._id": {
      handler: "loadSameCategoryProducts",
      immediate: true,
    },
  },
  methods: {
    getImageUrl(path) {
      if (!path) return "";
      if (path.startsWith("http")) return path;
      return `${this.baseUrl}${path}`;
    },
    loadMore() {
      this.displayCount += 4;
    },
    async loadSameCategoryProducts() {
      if (!this.currentProduct?._id || !this.currentProduct?.catalogueId)
        return;

      this.loading = true;
      this.error = null;
      this.displayCount = 4;

      try {
        const response = await productService.getProductsByCategory(
          this.currentProduct.catalogueId,
          { exclude: this.currentProduct._id }
        );

        if (response?.data?.products) {
          // Duyệt từng sản phẩm để lấy promotion
          const productsWithPromotions = await Promise.all(
            response.data.products.map(async (product) => {
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
          this.products = productsWithPromotions;
        } else {
          this.products = [];
        }
      } catch (error) {
        console.error("Error loading same category products:", error);
        this.error = "Không thể tải sản phẩm cùng danh mục";
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>

<style scoped>
.same-category-section {
  padding: 4rem 2rem;
}

.section-header {
  text-align: center;
  margin-bottom: 3rem;
}

.section-title {
  text-align: center;
  font-size: 2rem;
  margin-bottom: 0.5rem;
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

.load-more-container {
  display: flex;
  justify-content: center;
  margin-top: 30px;
}

.load-more-btn {
  background: #ff6b6b;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 25px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(255, 107, 107, 0.3);
  text-decoration: none;
  display: inline-block;
}

.load-more-btn:hover {
  background: #ff5252;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 107, 107, 0.4);
  color: white;
}

.loading-state,
.error-state,
.no-products {
  text-align: center;
  padding: 40px 0;
  color: #666;
  font-style: italic;
}

.error-state {
  color: #e74c3c;
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
  .same-category-section {
    padding: 2rem 1rem;
  }

  .section-title {
    font-size: 1.8rem;
  }

  .section-subtitle {
    font-size: 1rem;
  }

  .product-grid {
    grid-template-columns: repeat(1, 1fr);
    gap: 1rem;
  }

  .load-more-btn {
    padding: 10px 20px;
    font-size: 0.9rem;
  }
}
</style>
