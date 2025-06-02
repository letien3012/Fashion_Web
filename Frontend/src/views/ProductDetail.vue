<template>
  <Header />
  <div class="page-container">
    <div class="breadcrumb">
      <router-link to="/">Trang chủ</router-link>
      <span class="separator">/</span>
      <router-link to="/products">Sản phẩm</router-link>
      <span class="separator">/</span>
      <span class="current">{{ product.name }}</span>
    </div>

    <div v-if="loading" class="loading-state">
      Đang tải thông tin sản phẩm...
    </div>
    <div v-else-if="error" class="error-state">
      {{ error }}
    </div>
    <div v-else class="row">
      <div class="col-lg-6 mb-4">
        <div class="product-gallery">
          <img
            :src="displayImages[activeImage]"
            class="main-image img-fluid rounded"
          />
          <div class="thumbnail-container mt-3">
            <button
              v-if="displayImages.length > 5"
              class="nav-btn prev-btn"
              @click="scrollThumbnails('prev')"
              :disabled="thumbnailStartIndex === 0"
            >
              <i class="fas fa-chevron-left"></i>
            </button>
            <div class="thumbnail-list" ref="thumbnailList">
              <img
                v-for="(img, idx) in visibleThumbnails"
                :key="idx"
                :src="img"
                :class="{ active: idx + thumbnailStartIndex === activeImage }"
                @click="activeImage = idx + thumbnailStartIndex"
                class="img-thumbnail"
              />
            </div>
            <button
              v-if="displayImages.length > 5"
              class="nav-btn next-btn"
              @click="scrollThumbnails('next')"
              :disabled="thumbnailStartIndex + 5 >= displayImages.length"
            >
              <i class="fas fa-chevron-right"></i>
            </button>
          </div>
        </div>
      </div>
      <div class="col-lg-6">
        <div class="product-info">
          <h1 class="product-title h2 mb-3">{{ product.name }}</h1>
          <div class="product-rating mb-3">
            <i
              class="fas fa-star"
              v-for="n in 5"
              :key="n"
              :class="{ active: n <= product.rating }"
            ></i>
            <span class="rating-number">({{ product.rating }})</span>
          </div>
          <div class="product-price-container mb-4">
            <div class="product-price h3" :class="{ 'has-sale': salePrice }">
              {{ formatPrice(displayPrice) }}
            </div>
            <div v-if="salePrice" class="product-sale-price h4">
              {{ formatPrice(salePrice) }}
            </div>
            <div v-if="activePromotion" class="promotion-info">
              <div class="discount-badge">-{{ discountPercentage }}%</div>
              <div class="promotion-details">
                <div class="promotion-period" v-if="activePromotion.end_date">
                  Áp dụng đến: {{ formatDate(activePromotion.end_date) }}
                </div>
              </div>
            </div>
          </div>

          <!-- Thuộc tính và Số lượng -->
          <div v-if="attributesLoaded" class="mb-4">
            <!-- Thuộc tính 1 -->
            <div class="product-options mb-3">
              <label class="form-label">
                {{
                  attributes.attribute1[product.attributes1?.[0]]
                    ?.attributeCatalogueId?.name || "Thuộc tính 1"
                }}:
              </label>
              <div class="option-list">
                <button
                  v-for="attributeId in product.attributes1"
                  :key="attributeId"
                  :class="{ active: selectedAttribute1 === attributeId }"
                  @click="selectedAttribute1 = attributeId"
                  class="btn btn-outline-secondary me-2 mb-2"
                >
                  {{ attributes.attribute1[attributeId]?.name || attributeId }}
                </button>
              </div>
            </div>

            <!-- Thuộc tính 2 -->
            <div class="product-options mb-3">
              <label class="form-label">
                {{
                  attributes.attribute2[product.attributes2?.[0]]
                    ?.attributeCatalogueId?.name || "Thuộc tính 2"
                }}:
              </label>
              <div class="option-list">
                <button
                  v-for="attributeId in product.attributes2"
                  :key="attributeId"
                  :class="{ active: selectedAttribute2 === attributeId }"
                  @click="selectedAttribute2 = attributeId"
                  class="btn btn-outline-secondary me-2 mb-2"
                  :style="{
                    background:
                      attributes.attribute2[attributeId]?.value || '#fff',
                    border:
                      selectedAttribute2 === attributeId
                        ? '2px solid #ff6b6b'
                        : '1px solid #ccc',
                  }"
                >
                  {{ attributes.attribute2[attributeId]?.name || attributeId }}
                </button>
              </div>
            </div>

            <!-- Số lượng còn lại -->
            <div class="stock-info mb-3">
              Số lượng còn lại: <b>{{ currentVariant.stock }}</b>
            </div>

            <!-- Chọn số lượng -->
            <div class="product-actions">
              <div class="quantity-control d-flex align-items-center mb-3">
                <button
                  class="btn btn-outline-secondary"
                  @click="decreaseQuantity"
                  :disabled="quantity <= 1"
                >
                  -
                </button>
                <input
                  type="number"
                  v-model.number="quantity"
                  min="1"
                  :max="currentVariant.stock"
                  class="form-control mx-2 text-center"
                  style="width: 70px"
                  @input="validateQuantity"
                />
                <button
                  class="btn btn-outline-secondary"
                  @click="increaseQuantity"
                  :disabled="quantity >= currentVariant.stock"
                >
                  +
                </button>
              </div>
              <div class="d-grid gap-2">
                <button
                  class="btn btn-primary"
                  @click="addToCart"
                  :disabled="!canBuy"
                >
                  Thêm vào giỏ hàng
                </button>
                <button
                  class="btn btn-danger"
                  @click="buyNow"
                  :disabled="!canBuy"
                >
                  Mua ngay
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Mô tả sản phẩm -->
    <div class="product-desc-section mt-5">
      <h2 class="h3 mb-4">Mô tả sản phẩm</h2>
      <div class="card">
        <div class="card-body">
          <div
            v-if="product.content"
            class="product-content"
            v-html="product.content"
          ></div>
          <div v-if="product.description" class="product-description">
            <p>{{ product.description }}</p>
          </div>
          <div
            v-if="!product.content && !product.description"
            class="no-description"
          >
            <p>Chưa có mô tả cho sản phẩm này.</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Đánh giá sản phẩm -->
    <div class="mt-5">
      <Review_ProductDetail
        :product="product"
        @submit-review="handleReviewSubmit"
      />
    </div>
  </div>
  <Footer />
</template>

<script>
import Header from "../components/Header.vue";
import Footer from "../components/Footer.vue";
import Review_ProductDetail from "../components/Review_ProductDetail.vue";
import { productService } from "../services/product.service";
import { cartService } from "../services/cart.service";
import { toast } from "vue3-toastify";

export default {
  name: "ProductDetail",
  components: {
    Header,
    Review_ProductDetail,
    Footer,
  },
  data() {
    return {
      activeImage: 0,
      thumbnailStartIndex: 0,
      quantity: 1,
      selectedAttribute1: "",
      selectedAttribute2: "",
      product: {
        name: "",
        price: 0,
        rating: 0,
        stock: 0,
        description: "",
        images: [],
        variants: [],
        content: "",
      },
      attributes: {
        attribute1: {},
        attribute2: {},
      },
      attributeCatalogues: {
        attribute1: {},
        attribute2: {},
      },
      currentVariant: {
        price: 0,
        stock: 0,
        images: [],
        _id: null,
        attributeId1: "",
        attributeId2: "",
      },
      activePromotion: null,
      loading: false,
      error: null,
      attributesLoaded: false,
    };
  },
  async created() {
    console.log("ProductDetail created hook running.");
    try {
      this.loading = true;
      const productId = this.$route.params.id;
      console.log("Fetching product with ID:", productId);

      const response = await productService.getProductById(productId);
      console.log("Product response in component:", response);

      if (response && response.data) {
        const productData = response.data;
        console.log("Product data received:", productData);
        // Xử lý ảnh chính và album
        const mainImage = productData.image.startsWith("http")
          ? productData.image
          : `http://localhost:3005${productData.image}`;

        const albumImages = (productData.album || []).map((img) =>
          img.startsWith("http") ? img : `http://localhost:3005${img}`
        );

        // Lấy danh sách attribute IDs từ variants
        const attribute1Ids = new Set();
        const attribute2Ids = new Set();
        productData.variants.forEach((variant) => {
          if (variant.attributeId1) attribute1Ids.add(variant.attributeId1);
          if (variant.attributeId2) attribute2Ids.add(variant.attributeId2);
        });

        // Fetch attribute details
        await this.fetchAttributeDetails(
          Array.from(attribute1Ids),
          Array.from(attribute2Ids)
        );

        this.product = {
          ...productData,
          image: mainImage,
          images: [mainImage, ...albumImages],
          variants: productData.variants.map((variant) => ({
            ...variant,
            image: variant.image.startsWith("http")
              ? variant.image
              : `http://localhost:3005${variant.image}`,
          })),
          attributes1: Array.from(attribute1Ids),
          attributes2: Array.from(attribute2Ids),
        };
        console.log("Product data assigned to this.product:", this.product);

        // Set initial attributes if available
        if (this.product.variants.length > 0) {
          const firstVariant = this.product.variants[0];
          this.selectedAttribute1 = firstVariant.attributeId1;
          this.selectedAttribute2 = firstVariant.attributeId2;
        }

        // Load initial variant data
        if (this.selectedAttribute1 && this.selectedAttribute2) {
          await this.loadVariantData();
        }
      } else {
        this.error = "Không tìm thấy thông tin sản phẩm";
        console.log("Product fetch successful but no data received.", response);
      }
    } catch (error) {
      console.error("Error in created hook:", error);
      if (error.response) {
        if (error.response.status === 404) {
          this.error = "Không tìm thấy sản phẩm với ID này";
        } else {
          this.error = `Lỗi server: ${error.response.status}`;
        }
      } else if (error.request) {
        this.error = "Không thể kết nối đến server";
      } else {
        this.error = "Có lỗi xảy ra khi tải thông tin sản phẩm";
      }
    } finally {
      this.loading = false;
      this.attributesLoaded = true;
      console.log("ProductDetail created hook finished.");
    }
  },
  watch: {
    selectedAttribute1: {
      handler: "loadVariantData",
      immediate: false,
    },
    selectedAttribute2: {
      handler: "loadVariantData",
      immediate: false,
    },
  },
  computed: {
    canBuy() {
      return (
        this.quantity > 0 &&
        this.quantity <= this.currentVariant.stock &&
        this.selectedAttribute1 &&
        this.selectedAttribute2
      );
    },
    displayPrice() {
      return this.currentVariant?.price || this.product?.price || 0;
    },
    salePrice() {
      if (this.activePromotion) {
        const discount =
          this.displayPrice * (this.activePromotion.discount / 100);
        return Math.round((this.displayPrice - discount) * 100) / 100;
      }
      return null;
    },
    discountPercentage() {
      return this.activePromotion ? this.activePromotion.discount : 0;
    },
    displayImages() {
      return this.currentVariant.images.length > 0
        ? this.currentVariant.images
        : this.product.images;
    },
    visibleThumbnails() {
      return this.displayImages.slice(
        this.thumbnailStartIndex,
        this.thumbnailStartIndex + 5
      );
    },
  },
  methods: {
    async fetchAttributeDetails(attribute1Ids, attribute2Ids) {
      try {
        // Fetch attribute1 details
        const attribute1Promises = attribute1Ids.map((id) =>
          productService.getAttributeById(id)
        );
        const fetchedAttributes1 = await Promise.all(attribute1Promises);
        console.log("Fetched Attributes 1:", fetchedAttributes1); // Debug log

        // Process valid responses and populate attributes.attribute1
        const attribute1Data = {};
        let firstAttribute1 = null; // To get catalogue ID from the first valid attribute
        fetchedAttributes1.forEach((attribute) => {
          // API trả về trực tiếp object thuộc tính, kiểm tra attribute và _id
          if (attribute && attribute._id) {
            // Assuming API returns attribute object directly
            attribute1Data[attribute._id] = attribute;
            if (!firstAttribute1) {
              // Keep the first valid attribute to find catalogue ID
              firstAttribute1 = attribute;
            }
          } else {
            console.warn("Skipping invalid attribute 1 response:", attribute); // Log invalid responses
          }
        });
        // Gán dữ liệu thuộc tính 1
        this.attributes.attribute1 = attribute1Data; // Gán object đầy đủ
        console.log("Final attributes 1 state:", this.attributes.attribute1); // Debug log: Show final state

        // Lấy catalogue ID từ attribute đầu tiên (nếu có dữ liệu thuộc tính)
        if (firstAttribute1 && firstAttribute1.attributeCatalogueId) {
          // attributeCatalogueId là một object { _id, name }, cần lấy _id
          const catalogueId = firstAttribute1.attributeCatalogueId._id
            ? firstAttribute1.attributeCatalogueId._id.toString()
            : null;

          if (catalogueId) {
            console.log("Fetching catalogue 1 with ID:", catalogueId); // Debug log
            const catalogueResponse =
              await productService.getAttributeCatalogueById(catalogueId);
            console.log(
              "Response for Attribute 1 catalogue:",
              catalogueResponse
            ); // Debug log: Check catalogue response
            if (catalogueResponse?.data) {
              this.attributeCatalogues.attribute1 = catalogueResponse.data; // Gán object catalogue đầy đủ từ response.data
              console.log(
                "Attribute 1 catalogue data assigned:",
                this.attributeCatalogues.attribute1
              ); // Debug log
            }
          }
        }

        // Fetch attribute2 details
        const attribute2Promises = attribute2Ids.map((id) =>
          productService.getAttributeById(id)
        );
        const fetchedAttributes2 = await Promise.all(attribute2Promises);
        console.log("Fetched Attributes 2:", fetchedAttributes2); // Debug log

        // Process valid responses and populate attributes.attribute2
        const attribute2Data = {};
        let firstAttribute2 = null; // To get catalogue ID from the first valid attribute
        fetchedAttributes2.forEach((attribute) => {
          // API trả về trực tiếp object thuộc tính, kiểm tra attribute và _id
          if (attribute && attribute._id) {
            // Assuming API returns attribute object directly
            attribute2Data[attribute._id] = attribute;
            if (!firstAttribute2) {
              // Keep the first valid attribute to find catalogue ID
              firstAttribute2 = attribute;
            }
          } else {
            console.warn("Skipping invalid attribute 2 response:", attribute); // Log invalid responses
          }
        });
        // Gán dữ liệu thuộc tính 2
        this.attributes.attribute2 = attribute2Data; // Gán object đầy đủ
        console.log("Final attributes 2 state:", this.attributes.attribute2); // Debug log: Show final state

        // Lấy catalogue ID từ attribute đầu tiên (nếu có dữ liệu thuộc tính)
        if (firstAttribute2 && firstAttribute2.attributeCatalogueId) {
          // attributeCatalogueId là một object { _id, name }, cần lấy _id
          const catalogueId = firstAttribute2.attributeCatalogueId._id
            ? firstAttribute2.attributeCatalogueId._id.toString()
            : null;

          if (catalogueId) {
            console.log("Fetching catalogue 2 with ID:", catalogueId); // Debug log
            const catalogueResponse =
              await productService.getAttributeCatalogueById(catalogueId);
            console.log(
              "Response for Attribute 2 catalogue:",
              catalogueResponse
            ); // Debug log: Check catalogue response
            if (catalogueResponse?.data) {
              this.attributeCatalogues.attribute2 = catalogueResponse.data; // Gán object catalogue đầy đủ từ response.data
              console.log(
                "Attribute 2 catalogue data assigned:",
                this.attributeCatalogues.attribute2
              ); // Debug log
            }
          }
        }
      } catch (error) {
        console.error("Error fetching attribute details:", error);
      }
    },

    findVariant(attribute1Id, attribute2Id) {
      if (!this.product.variants) return null;
      return this.product.variants.find(
        (variant) =>
          variant.attributeId1 === attribute1Id &&
          variant.attributeId2 === attribute2Id
      );
    },

    async loadVariantData() {
      if (!this.selectedAttribute1 || !this.selectedAttribute2) return;

      try {
        console.log("Loading variant data for:", {
          attribute1: this.selectedAttribute1,
          attribute2: this.selectedAttribute2,
        });

        const variant = this.findVariant(
          this.selectedAttribute1,
          this.selectedAttribute2
        );
        console.log("Found variant:", variant);

        if (variant) {
          // Xử lý ảnh variant
          const variantImage = variant.image.startsWith("http")
            ? variant.image
            : `http://localhost:3005${variant.image}`;

          // Kết hợp ảnh variant với album ảnh
          const variantImages = [
            variantImage,
            ...this.product.images.filter((img) => img !== variantImage),
          ];

          // Lấy số lượng tồn kho từ consignment
          let stockQuantity = 0;
          try {
            const response = await productService.getVariantStock(
              this.product._id,
              variant._id
            );
            if (response && response.data) {
              stockQuantity = response.data.stockQuantity;
            }
          } catch (error) {
            console.error("Error fetching stock quantity:", error);
          }

          this.currentVariant = {
            price: variant.price,
            stock: stockQuantity,
            images: variantImages,
            _id: variant._id,
            attributeId1: variant.attributeId1,
            attributeId2: variant.attributeId2,
          };
          this.activeImage = 0; // Reset to first image when variant changes

          // Load promotions for this variant
          await this.loadPromotions();
        } else {
          // Fallback to base product data if variant not found
          this.currentVariant = {
            price: this.product.price || 0,
            stock: 0,
            images: this.product.images || [],
            _id: null,
            attributeId1: "",
            attributeId2: "",
          };
          this.activePromotion = null;
        }
      } catch (error) {
        console.error("Error loading variant data:", error);
        // Keep the current variant data if there's an error
        this.currentVariant = {
          price: this.product.price || 0,
          stock: 0,
          images: this.product.images || [],
          _id: null,
          attributeId1: "",
          attributeId2: "",
        };
        this.activePromotion = null;
      }
    },

    async loadPromotions() {
      if (!this.currentVariant._id) return;

      try {
        const promotions = await productService.getProductPromotions(
          this.$route.params.id,
          this.currentVariant._id
        );

        // Lấy promotion có discount cao nhất
        this.activePromotion =
          promotions.length > 0
            ? promotions.reduce((max, p) =>
                p.discount > max.discount ? p : max
              )
            : null;
      } catch (error) {
        console.error("Error loading promotions:", error);
        this.activePromotion = null;
      }
    },
    async addToCart() {
      try {
        // Check if user is logged in using localStorage
        const token = localStorage.getItem("token");
        if (!token) {
          toast.error("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng");
          this.$router.push("/login");
          return;
        }

        if (!this.selectedAttribute1 || !this.selectedAttribute2) {
          toast.error("Vui lòng chọn kích thước và màu sắc");
          return;
        }

        const cartItem = {
          productId: this.$route.params.id,
          variantId: this.currentVariant._id,
          quantity: this.quantity,
          price: this.salePrice || this.displayPrice,
          attributeName1:
            this.attributes.attribute1[this.selectedAttribute1]?.name || "",
          attributeName2:
            this.attributes.attribute2[this.selectedAttribute2]?.name || "",
        };

        await cartService.addToCart(cartItem);
        toast.success(`Đã thêm ${this.quantity} sản phẩm vào giỏ hàng!`);
      } catch (error) {
        toast.error(error.message || "Có lỗi xảy ra khi thêm vào giỏ hàng");
      }
    },
    buyNow() {
      try {
        // Check if user is logged in using localStorage
        const token = localStorage.getItem("token");
        if (!token) {
          toast.error("Vui lòng đăng nhập để mua hàng");
          this.$router.push("/login");
          return;
        }

        if (!this.selectedAttribute1 || !this.selectedAttribute2) {
          toast.error("Vui lòng chọn kích thước và màu sắc");
          return;
        }

        const orderItem = {
          productId: {
            _id: this.$route.params.id,
            name: this.product.name,
            image: this.displayImages[0],
          },
          variant: {
            _id: this.currentVariant._id,
            sku: `${
              this.attributes.attribute1[this.selectedAttribute1]?.name || ""
            } - ${
              this.attributes.attribute2[this.selectedAttribute2]?.name || ""
            }`,
            quantity: this.quantity,
            price: this.salePrice || this.displayPrice,
            originPrice: this.displayPrice,
          },
          variantId: this.currentVariant._id,
          quantity: this.quantity,
          price: this.salePrice || this.displayPrice,
        };

        // Store order item in localStorage for checkout
        localStorage.setItem("checkoutItems", JSON.stringify([orderItem]));

        // Navigate to checkout page
        this.$router.push("/checkout");
      } catch (error) {
        toast.error(error.message || "Có lỗi xảy ra khi xử lý đơn hàng");
      }
    },
    formatDate(dateString) {
      const date = new Date(dateString);
      return date.toLocaleDateString("vi-VN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
    },
    validateQuantity() {
      if (this.quantity < 1) {
        this.quantity = 1;
      } else if (this.quantity > this.currentVariant.stock) {
        this.quantity = this.currentVariant.stock;
      }
    },

    increaseQuantity() {
      if (this.quantity < this.currentVariant.stock) {
        this.quantity++;
      }
    },

    decreaseQuantity() {
      if (this.quantity > 1) {
        this.quantity--;
      }
    },
    formatPrice(price) {
      if (!price) return "0 đ";
      return new Intl.NumberFormat("vi-VN").format(Math.round(price)) + " đ";
    },
    scrollThumbnails(direction) {
      if (
        direction === "next" &&
        this.thumbnailStartIndex + 5 < this.displayImages.length
      ) {
        this.thumbnailStartIndex += 5;
      } else if (direction === "prev" && this.thumbnailStartIndex > 0) {
        this.thumbnailStartIndex = Math.max(0, this.thumbnailStartIndex - 5);
      }
    },
    async handleReviewSubmit(review) {
      try {
        // Implement review submission logic here
        // You can call your API service to submit the review
        toast.success("Đánh giá của bạn đã được gửi thành công!");
      } catch (error) {
        toast.error("Có lỗi xảy ra khi gửi đánh giá");
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
  box-sizing: border-box;
}

@media (max-width: 991px) {
  .page-container {
    width: 100%;
    padding: 10px;
    max-width: 100vw;
    overflow-x: hidden;
  }
  .row {
    margin: 0 !important;
  }
  .col-lg-6 {
    padding: 0 !important;
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

.product-gallery {
  position: relative;
}

.main-image {
  width: 100%;
  height: auto;
  object-fit: cover;
  border-radius: 0.5rem;
}

.thumbnail-container {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 1rem;
}

.thumbnail-list {
  display: flex;
  gap: 10px;
  overflow-x: auto;
  scroll-behavior: smooth;
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.thumbnail-list::-webkit-scrollbar {
  display: none;
}

.thumbnail-list img {
  width: 80px;
  height: 80px;
  object-fit: cover;
  cursor: pointer;
  border: 2px solid transparent;
  transition: all 0.3s ease;
}

.thumbnail-list img.active {
  border-color: #ff0000;
}

.nav-btn {
  background: none;
  border: none;
  font-size: 1.2rem;
  color: #666;
  cursor: pointer;
  padding: 5px 10px;
}

.nav-btn:disabled {
  color: #ccc;
  cursor: not-allowed;
}

.product-title {
  font-size: 1.8rem;
  font-weight: 600;
  color: #333;
}

.product-rating {
  color: #ffc107;
}

.product-rating .fa-star {
  margin-right: 2px;
}

.product-rating .fa-star.active {
  color: #ffc107;
}

.rating-number {
  color: #666;
  margin-left: 5px;
}

.product-price-container {
  margin: 1.5rem 0;
}

.product-price {
  color: #ff0000;
  font-weight: 600;
}

.product-price.has-sale {
  text-decoration: line-through;
  color: #666;
  font-size: 1.2rem;
}

.product-sale-price {
  color: #ff0000;
  font-weight: 600;
}

.promotion-info {
  margin-top: 0.5rem;
}

.discount-badge {
  display: inline-block;
  background-color: #ff0000;
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-weight: 600;
}

.promotion-period {
  color: #666;
  font-size: 0.9rem;
  margin-top: 0.25rem;
}

.product-options {
  margin-bottom: 1.5rem;
}

.option-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.option-list button {
  padding: 0.5rem 1rem;
  border: 1px solid #dee2e6;
  border-radius: 0.25rem;
  background: white;
  cursor: pointer;
  transition: all 0.3s ease;
}

.option-list button:hover {
  border-color: #ff0000;
  color: #ff0000;
}

.option-list button.active {
  border-color: #ff0000;
  color: #ff0000;
  background-color: #fff5f5;
}

.stock-info {
  color: #666;
  margin: 1rem 0;
}

.quantity-control {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.quantity-btn {
  width: 40px;
  height: 40px;
  border: 1px solid #dee2e6;
  background: white;
  font-size: 1.2rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.quantity-btn:hover:not(:disabled) {
  border-color: #ff0000;
  color: #ff0000;
}

.quantity-btn:disabled {
  background-color: #f8f9fa;
  cursor: not-allowed;
}

.quantity-input {
  width: 60px;
  height: 40px;
  text-align: center;
  border: 1px solid #dee2e6;
}

.product-actions {
  margin-top: 2rem;
}

.product-actions .d-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.product-actions .btn {
  padding: 0.75rem;
  font-weight: 600;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.product-actions .btn-primary {
  background-color: #ee4d2d;
  border-color: #ee4d2d;
}

.product-actions .btn-primary:hover:not(:disabled) {
  background-color: #f05d40;
  border-color: #f05d40;
}

.product-actions .btn-danger {
  background-color: #dc3545;
  border-color: #dc3545;
}

.product-actions .btn-danger:hover:not(:disabled) {
  background-color: #c82333;
  border-color: #bd2130;
}

.product-actions .btn:disabled {
  background-color: #ccc;
  border-color: #ccc;
  cursor: not-allowed;
}

.product-desc-section {
  margin-top: 3rem;
}

.product-desc-section h2 {
  color: #333;
  margin-bottom: 1.5rem;
}

.product-content,
.product-description {
  color: #666;
  line-height: 1.6;
}

.no-description {
  color: #666;
  font-style: italic;
}

@media (max-width: 992px) {
  .product-gallery {
    margin-bottom: 2rem;
  }

  .thumbnail-list img {
    width: 60px;
    height: 60px;
  }

  .product-title {
    font-size: 1.5rem;
  }
}

@media (max-width: 576px) {
  .thumbnail-list img {
    width: 50px;
    height: 50px;
  }

  .product-title {
    font-size: 1.3rem;
  }

  .product-price {
    font-size: 1.5rem;
  }

  .product-sale-price {
    font-size: 1.2rem;
  }

  .product-actions .d-grid {
    grid-template-columns: 1fr;
  }
}
</style>
