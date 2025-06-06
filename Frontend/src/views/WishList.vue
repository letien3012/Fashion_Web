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
                v-for="product in wishlist"
                :key="product._id"
                :product="product"
                @quick-view="handleQuickView"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <Footer />
</template>

<script setup>
import { ref, onMounted } from "vue";
import Header from "../components/Header.vue";
import Footer from "../components/Footer.vue";
import SidebarProfile from "../components/SidebarProfile.vue";
import ProductItem from "../components/ProductItem.vue";
import { productService } from "../services/product.service";
import { toast } from "vue3-toastify";
import { useRouter } from "vue-router";

const router = useRouter();
const wishlist = ref([]);
const loading = ref(false);
const error = ref(null);
const baseUrl = "http://localhost:3005";

const getImageUrl = (path) => {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  const fullUrl = `${baseUrl}${path}`;
  return fullUrl;
};

const loadWishlist = async () => {
  loading.value = true;
  error.value = null;
  wishlist.value = [];

  try {
    const response = await productService.getWishlist();

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
    error.value = "Không thể tải danh sách yêu thích";
    toast.error("Không thể tải danh sách yêu thích");
  } finally {
    loading.value = false;
  }
};

const handleQuickView = (product) => {
  router.push(`/product-detail/${product._id}`);
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
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
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
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 15px;
  }
}

@media (max-width: 576px) {
  .wishlist-grid {
    grid-template-columns: 1fr;
  }
}
</style>
