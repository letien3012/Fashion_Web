<template>
  <Header />
  <div class="page-container">
    <div class="breadcrumb">
      <router-link to="/">Trang chủ</router-link>
      <span class="separator">/</span>
      <span class="current">Sản phẩm yêu thích</span>
    </div>
    <div class="row">
      <div class="col-md-3">
        <SidebarProfile />
      </div>
      <div class="col-md-9">
        <div class="main-content">
          <!-- Loading state -->
          <div v-if="loading" class="loading-container">
            <div class="loading-spinner"></div>
            <p>Đang tải danh sách yêu thích...</p>
          </div>

          <!-- Error state -->
          <div v-else-if="error" class="error-section">
            <div class="error">{{ error }}</div>
          </div>

          <!-- Empty state -->
          <div v-else-if="wishlist.length === 0" class="empty-state">
            <img
              src="../assets/images/empty-wishlist.png"
              alt="Không có sản phẩm yêu thích"
            />
            <p>Bạn chưa có sản phẩm yêu thích nào</p>
            <router-link to="/products" class="continue-shopping"
              >Tiếp tục mua sắm</router-link
            >
          </div>

          <!-- Wishlist items -->
          <div v-else class="wishlist-container">
            <div class="wishlist-header">
              <h2>Sản phẩm yêu thích ({{ wishlist.length }})</h2>
            </div>
            <div class="wishlist-grid">
              <ProductItem
                v-for="product in paginatedWishlist"
                :key="product._id"
                :product="product"
                @quick-view="handleQuickView"
              />
            </div>

            <!-- Pagination -->
            <div v-if="totalPages > 1" class="pagination-container">
              <div class="pagination-info">
                Hiển thị {{ (currentPage - 1) * itemsPerPage + 1 }} -
                {{ Math.min(currentPage * itemsPerPage, wishlist.length) }}
                trong tổng số {{ wishlist.length }} sản phẩm
              </div>
              <div class="pagination">
                <button
                  @click="goToPreviousPage"
                  :disabled="currentPage === 1"
                  class="pagination-btn prev-btn"
                >
                  <i class="fas fa-chevron-left"></i>
                </button>

                <button
                  v-for="page in pageNumbers"
                  :key="page"
                  @click="page === '...' ? null : goToPage(page)"
                  :class="[
                    'pagination-btn',
                    {
                      active: page === currentPage,
                      disabled: page === '...',
                    },
                  ]"
                  :disabled="page === '...'"
                >
                  {{ page }}
                </button>

                <button
                  @click="goToNextPage"
                  :disabled="currentPage === totalPages"
                  class="pagination-btn next-btn"
                >
                  <i class="fas fa-chevron-right"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <Footer />
  <Chatbot />
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import Header from "../components/Header.vue";
import Footer from "../components/Footer.vue";
import Chatbot from "../components/Chatbot.vue";
import SidebarProfile from "../components/SidebarProfile.vue";
import ProductItem from "../components/ProductItem.vue";
import { productService } from "../services/product.service";
import { customerService } from "../services/customer.service";
import { toast } from "vue3-toastify";
import { useRouter } from "vue-router";

const router = useRouter();
const wishlist = ref([]);
const loading = ref(false);
const error = ref(null);
const baseUrl = import.meta.env.VITE_API_BASE_URL;

// Pagination state
const currentPage = ref(1);
const itemsPerPage = ref(12); // 3 rows x 4 columns

const getImageUrl = (path) => {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  const fullUrl = `${baseUrl}${path}`;
  return fullUrl;
};

// Computed properties for pagination
const totalPages = computed(() => {
  return Math.ceil(wishlist.value.length / itemsPerPage.value);
});

const paginatedWishlist = computed(() => {
  const startIndex = (currentPage.value - 1) * itemsPerPage.value;
  const endIndex = startIndex + itemsPerPage.value;
  return wishlist.value.slice(startIndex, endIndex);
});

const pageNumbers = computed(() => {
  const pages = [];
  const maxVisiblePages = 5;

  if (totalPages.value <= maxVisiblePages) {
    for (let i = 1; i <= totalPages.value; i++) {
      pages.push(i);
    }
  } else {
    if (currentPage.value <= 3) {
      for (let i = 1; i <= 4; i++) {
        pages.push(i);
      }
      pages.push("...");
      pages.push(totalPages.value);
    } else if (currentPage.value >= totalPages.value - 2) {
      pages.push(1);
      pages.push("...");
      for (let i = totalPages.value - 3; i <= totalPages.value; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      pages.push("...");
      for (let i = currentPage.value - 1; i <= currentPage.value + 1; i++) {
        pages.push(i);
      }
      pages.push("...");
      pages.push(totalPages.value);
    }
  }

  return pages;
});

const loadWishlist = async () => {
  loading.value = true;
  error.value = null;
  wishlist.value = [];

  try {
    const response = await customerService.getWishlist();

    if (response && response.wishlist && Array.isArray(response.wishlist)) {
      // Duyệt từng sản phẩm để lấy thông tin chi tiết
      const productsWithPromotions = await Promise.all(
        response.wishlist.map(async (wishlistItem) => {
          try {
            // Lấy thông tin chi tiết sản phẩm từ CSDL
            const productResponse = await productService.getProductById(
              wishlistItem._id
            );

            if (!productResponse || !productResponse.data) {
              console.error("Product not found:", wishlistItem._id);
              return null;
            }

            const productDetail = productResponse.data;

            // Lấy variant đầu tiên làm mặc định
            const defaultVariant = productDetail.variants?.[0] || {};

            let salePrice = null;
            let discountPercentage = null;

            // Lấy thông tin khuyến mãi nếu có variant
            if (defaultVariant._id) {
              try {
                const promotions = await productService.getProductPromotions(
                  productDetail._id,
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
              } catch (promoError) {
                console.error("Error fetching promotions:", promoError);
              }
            }

            // Xử lý hình ảnh
            const imageUrl = productDetail.image
              ? getImageUrl(productDetail.image)
              : "";
            const albumUrls = (productDetail.album || []).map((img) =>
              getImageUrl(img)
            );

            return {
              _id: productDetail._id || "",
              name: productDetail.name || "",
              image: imageUrl,
              album: albumUrls,
              price: defaultVariant.price || 0,
              salePrice,
              discountPercentage,
              favorite_count: productDetail.favorite_count || 0,
              variants: productDetail.variants || [],
              catalogueId: productDetail.catalogueId || null,
              publish: productDetail.publish || false,
              description: productDetail.description || "",
              content: productDetail.content || "",
              view_count: productDetail.view_count || 0,
            };
          } catch (productError) {
            console.error("Error fetching product detail:", productError);
            return null;
          }
        })
      );

      // Lọc bỏ các sản phẩm null (không tìm thấy)
      const validProducts = productsWithPromotions.filter(
        (product) => product !== null
      );
      wishlist.value = validProducts;
    } else {
      console.error("Invalid wishlist data:", response);
      error.value = "Định dạng dữ liệu không hợp lệ";
    }
  } catch (error) {
    console.error("Error loading wishlist:", error);
    error.value = error.message || "Không thể tải danh sách yêu thích";
    toast.error(error.message || "Không thể tải danh sách yêu thích");
  } finally {
    loading.value = false;
  }
};

const handleQuickView = (product) => {
  router.push(`/product-detail/${product._id}`);
};

// Pagination methods
const goToPage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
};

const goToPreviousPage = () => {
  if (currentPage.value > 1) {
    goToPage(currentPage.value - 1);
  }
};

const goToNextPage = () => {
  if (currentPage.value < totalPages.value) {
    goToPage(currentPage.value + 1);
  }
};

onMounted(() => {
  loadWishlist();
});
</script>

<style scoped>
.page-container {
  width: 95%;
  margin: 0 auto;
  padding: 20px;
  box-sizing: border-box;
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

.main-content {
  padding: 30px;
  background: #f8f9fa;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.wishlist-header {
  margin-bottom: 20px;
}

.wishlist-header h2 {
  font-size: 1.5rem;
  color: #333;
  margin: 0;
}

.wishlist-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #e63946;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.error-section {
  text-align: center;
  padding: 40px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.error {
  color: #e63946;
  font-size: 1.1rem;
}

.empty-state {
  text-align: center;
  padding: 40px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.empty-state img {
  width: 200px;
  margin-bottom: 16px;
}

.empty-state p {
  color: #666;
  margin-bottom: 16px;
}

.continue-shopping {
  display: inline-block;
  padding: 12px 24px;
  background: #e63946;
  color: white;
  border-radius: 6px;
  text-decoration: none;
  transition: all 0.3s ease;
}

.continue-shopping:hover {
  background: #d62839;
}

@media (max-width: 991px) {
  .page-container {
    width: 100%;
    padding: 10px;
  }

  .main-content {
    padding: 15px;
  }

  .wishlist-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 15px;
  }
}

@media (max-width: 768px) {
  .wishlist-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 15px;
  }
}

@media (max-width: 576px) {
  .wishlist-grid {
    grid-template-columns: 1fr;
  }
}

/* Pagination Styles */
.pagination-container {
  margin-top: 30px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.pagination-info {
  color: #666;
  font-size: 0.9rem;
  text-align: center;
}

.pagination {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: center;
}

.pagination-btn {
  min-width: 40px;
  height: 40px;
  border: 1px solid #ddd;
  background: white;
  color: #333;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
  font-weight: 500;
}

.pagination-btn:hover:not(:disabled):not(.disabled) {
  background: #e63946;
  color: white;
  border-color: #e63946;
}

.pagination-btn.active {
  background: #e63946;
  color: white;
  border-color: #e63946;
  font-weight: 600;
}

.pagination-btn:disabled,
.pagination-btn.disabled {
  background: #f5f5f5;
  color: #ccc;
  cursor: not-allowed;
  border-color: #eee;
}

.pagination-btn.prev-btn,
.pagination-btn.next-btn {
  font-size: 0.8rem;
}

@media (max-width: 576px) {
  .pagination {
    gap: 5px;
  }

  .pagination-btn {
    min-width: 35px;
    height: 35px;
    font-size: 0.8rem;
  }

  .pagination-info {
    font-size: 0.8rem;
  }
}
</style>
