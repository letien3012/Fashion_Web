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
          <div class="wishlist-button" @click="toggleWishlist">
            <i
              class="fas fa-heart"
              :class="{ 'in-wishlist': isInWishlist }"
            ></i>
          </div>
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
            <div class="stars">
              <i
                class="fas fa-star"
                v-for="n in 5"
                :key="n"
                :class="{
                  active: n <= Math.floor(product.rating),
                  half:
                    n === Math.ceil(product.rating) && product.rating % 1 !== 0,
                }"
              ></i>
            </div>
            <span
              class="rating-text"
              v-if="
                !loading &&
                attributesLoaded &&
                !error &&
                product.totalReviews > 0
              "
            >
              {{ Number(product.rating).toFixed(1) }} ({{
                product.totalReviews
              }}
              đánh giá)
            </span>
            <span
              class="rating-text"
              v-else-if="!loading && attributesLoaded && !error"
            >
              Chưa có đánh giá
            </span>
          </div>
          <div class="product-price-container">
            <div class="price-row">
              <div class="product-price h3" :class="{ 'has-sale': salePrice }">
                {{ formatPrice(displayPrice) }}
              </div>
              <div v-if="salePrice" class="product-sale-price h4">
                {{ formatPrice(salePrice) }}
              </div>
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
            <div
              v-if="product.attributes1 && product.attributes1.length > 0"
              class="product-options mb-3"
            >
              <label class="form-label">
                {{
                  attributes.attribute1[product.attributes1?.[0]]
                    ?.attributeCatalogueId?.name || "Thuộc tính 1"
                }}:
              </label>
              <div class="option-list">
                <button
                  v-for="attributeId in publishedAttributes1"
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
            <div
              v-if="product.attributes2 && product.attributes2.length > 0"
              class="product-options mb-3"
            >
              <label class="form-label">
                {{
                  attributes.attribute2[product.attributes2?.[0]]
                    ?.attributeCatalogueId?.name || "Thuộc tính 2"
                }}:
              </label>
              <div class="option-list">
                <button
                  v-for="attributeId in filteredAttributes2"
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
      <div class="description-container">
        <div class="description-content">
          <div v-if="product.description" class="product-description mb-4">
            <p>{{ product.description }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Chi tiết sản phẩm -->
    <div class="product-detail-section mt-4">
      <h2 class="h3 mb-4">Chi tiết sản phẩm</h2>
      <div class="detail-container">
        <div class="detail-content">
          <div v-if="product.content" class="product-content">
            <div
              :class="{ 'content-preview': !showFullContent }"
              v-html="product.content"
            ></div>
            <div class="text-center mt-3">
              <button
                v-if="hasLongContent"
                @click="toggleContent"
                class="btn btn-link"
              >
                {{ showFullContent ? "THU GỌN" : "XEM THÊM" }}
              </button>
            </div>
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
        :reviews="reviews"
        :average-rating="product.rating"
        :total-reviews="product.totalReviews"
        @submit-review="handleReviewSubmit"
      />
    </div>
    <div class="mt-5">
      <SameProductCatalogue :current-product="product" />
    </div>
  </div>
  <Footer />
  <Chatbot />
</template>

<script>
import Header from "../components/Header.vue";
import Footer from "../components/Footer.vue";
import Chatbot from "../components/Chatbot.vue";
import Review_ProductDetail from "../components/Review_ProductDetail.vue";
import SameProductCatalogue from "../components/SameProductCatalogue.vue";
import { productService } from "../services/product.service";
import { cartService } from "../services/cart.service";
import { reviewService } from "../services/review.service";
import { toast } from "vue3-toastify";

export default {
  name: "ProductDetail",
  components: {
    Header,
    Footer,
    Chatbot,
    Review_ProductDetail,
    SameProductCatalogue,
  },
  data() {
    return {
      isInWishlist: false,
      activeImage: 0,
      thumbnailStartIndex: 0,
      quantity: 1,
      selectedAttribute1: "",
      selectedAttribute2: "",
      showFullContent: false,
      hasLongContent: false,
      product: {
        name: "",
        price: 0,
        rating: 0,
        totalReviews: 0,
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
      reviews: [],
    };
  },
  async created() {
    await this.fetchAndInitProduct(this.$route.params.id);
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
    "product.content": {
      handler() {
        this.$nextTick(() => {
          this.checkContentLength();
        });
      },
      immediate: true,
    },
    "$route.params.id": {
      immediate: false,
      handler(newId, oldId) {
        if (newId && newId !== oldId) {
          this.reloadProduct();
        }
      },
    },
  },
  computed: {
    canBuy() {
      // Nếu chỉ có một thuộc tính, chỉ cần kiểm tra selectedAttribute1
      if (!this.product.attributes2 || this.product.attributes2.length === 0) {
        return (
          this.quantity > 0 &&
          this.quantity <= this.currentVariant.stock &&
          this.selectedAttribute1
        );
      }
      // Nếu có hai thuộc tính, kiểm tra cả hai
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
    publishedAttributes1() {
      // Chỉ lấy attributeId1 từ variant publish
      return Array.from(
        new Set(
          (this.product.variants || [])
            .filter((v) => v.publish !== false && v.attributeId1)
            .map((v) => v.attributeId1)
        )
      );
    },
    publishedAttributes2() {
      return Array.from(
        new Set(
          (this.product.variants || [])
            .filter((v) => v.publish !== false && v.attributeId2)
            .map((v) => v.attributeId2)
        )
      );
    },
    filteredAttributes2() {
      // Nếu chưa chọn thuộc tính 1 hoặc không có thuộc tính 2 thì trả về tất cả publishedAttributes2
      if (
        !this.selectedAttribute1 ||
        !this.product.attributes2 ||
        this.product.attributes2.length === 0
      ) {
        return this.publishedAttributes2;
      }
      // Lọc các attribute2 có tồn tại variant publish với selectedAttribute1
      return Array.from(
        new Set(
          (this.product.variants || [])
            .filter(
              (v) =>
                v.publish !== false &&
                v.attributeId1 === this.selectedAttribute1 &&
                v.attributeId2
            )
            .map((v) => v.attributeId2)
        )
      );
    },
    hasReviews() {
      return this.product.totalReviews > 0;
    },
  },
  methods: {
    async fetchAndInitProduct(productId) {
      try {
        this.loading = true;
        this.error = null;
        // Check wishlist status only if user is logged in
        const token = localStorage.getItem("token");
        if (token) {
          await this.checkWishlistStatus();
        }

        const response = await productService.getProductById(productId);

        if (response && response.data) {
          const productData = response.data;
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
          // Chỉ lấy từ các variant publish
          (productData.variants || []).forEach((variant) => {
            if (variant.publish !== false) {
              if (variant.attributeId1) attribute1Ids.add(variant.attributeId1);
              if (variant.attributeId2) attribute2Ids.add(variant.attributeId2);
            }
          });

          // Fetch attribute details
          await this.fetchAttributeDetails(
            Array.from(attribute1Ids),
            Array.from(attribute2Ids)
          );

          // Gán product trước, KHÔNG gán lại sau khi load review
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

          // Set initial attributes if available
          // Chỉ chọn variant publish làm mặc định
          const firstPublishedVariant = this.product.variants.find(
            (v) => v.publish !== false
          );
          if (firstPublishedVariant) {
            this.selectedAttribute1 = firstPublishedVariant.attributeId1;
            this.selectedAttribute2 = firstPublishedVariant.attributeId2;
          } else {
            this.selectedAttribute1 = "";
            this.selectedAttribute2 = "";
          }
          this.quantity = 1;

          // Load initial variant data
          if (this.selectedAttribute1 && this.selectedAttribute2) {
            await this.loadVariantData();
          }

          // Sau khi đã gán product, mới load review để cập nhật rating/reactive
          await this.loadProductReviews(productId);
        } else {
          this.error = "Không tìm thấy thông tin sản phẩm";
        }
      } catch (error) {
        console.error("Error loading product:", error);
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
      }
    },
    async reloadProduct() {
      await this.fetchAndInitProduct(this.$route.params.id);
    },
    async checkWishlistStatus() {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          this.isInWishlist = false;
          return;
        }
        const wishlist = await productService.getWishlist();
        this.isInWishlist = wishlist.wishlist.some(
          (item) => item._id === this.$route.params.id
        );
      } catch (error) {
        // Only log error if user is authenticated
        if (localStorage.getItem("token")) {
          console.error("Error checking wishlist status:", error);
        }
        this.isInWishlist = false;
      }
    },
    async toggleWishlist() {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          toast.warning("Vui lòng đăng nhập để thêm vào danh sách yêu thích!", {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: true,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            draggablePercent: 0.6,
            showCloseButtonOnHover: false,
            closeButton: "button",
            icon: true,
            rtl: false,
            style: {
              color: "#333",
              fontSize: "14px",
              fontWeight: "500",
            },
            onClick: () => {
              this.$router.push("/login");
            },
          });
          return;
        }

        if (this.isInWishlist) {
          await productService.removeFromWishlist(this.$route.params.id);
          toast.success("Đã xóa khỏi danh sách yêu thích!", {
            position: "top-right",
            autoClose: 2000,
            hideProgressBar: true,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            draggablePercent: 0.6,
            showCloseButtonOnHover: false,
            closeButton: "button",
            icon: true,
            rtl: false,
            style: {
              color: "#333",
              fontSize: "14px",
              fontWeight: "500",
            },
          });
        } else {
          await productService.addToWishlist(this.$route.params.id);
          toast.success("Đã thêm vào danh sách yêu thích!", {
            position: "top-right",
            autoClose: 2000,
            hideProgressBar: true,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            draggablePercent: 0.6,
            showCloseButtonOnHover: false,
            closeButton: "button",
            icon: true,
            rtl: false,
            style: {
              color: "#333",
              fontSize: "14px",
              fontWeight: "500",
            },
          });
        }
        this.isInWishlist = !this.isInWishlist;
      } catch (error) {
        console.error("Error toggling wishlist:", error);
        toast.error("Có lỗi xảy ra, vui lòng thử lại!", {
          position: "top-right",
          autoClose: 2000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          draggablePercent: 0.6,
          showCloseButtonOnHover: false,
          closeButton: "button",
          icon: true,
          rtl: false,
          style: {
            color: "#333",
            fontSize: "14px",
            fontWeight: "500",
          },
        });
      }
    },
    async fetchAttributeDetails(attribute1Ids, attribute2Ids) {
      try {
        console.log("Starting fetchAttributeDetails with IDs:", {
          attribute1Ids,
          attribute2Ids,
        });

        // Fetch attribute1 details
        const attribute1Promises = attribute1Ids.map((id) =>
          productService.getAttributeById(id)
        );
        const fetchedAttributes1 = await Promise.all(attribute1Promises);
        console.log("Raw Attributes 1 Response:", fetchedAttributes1);

        // Process valid responses and populate attributes.attribute1
        const attribute1Data = {};
        let firstAttribute1 = null;
        fetchedAttributes1.forEach((attribute) => {
          console.log("Processing Attribute 1:", attribute);
          if (attribute && attribute.data) {
            attribute1Data[attribute.data._id] = attribute.data;
            if (!firstAttribute1) {
              firstAttribute1 = attribute.data;
            }
          }
        });
        this.attributes.attribute1 = attribute1Data;
        console.log("Processed Attributes 1:", this.attributes.attribute1);
        console.log("First Attribute 1:", firstAttribute1);

        // Lấy catalogue ID từ attribute đầu tiên
        if (firstAttribute1 && firstAttribute1.attributeCatalogue) {
          console.log(
            "First Attribute 1 Catalogue:",
            firstAttribute1.attributeCatalogue
          );
          const catalogueId = firstAttribute1.attributeCatalogue._id
            ? firstAttribute1.attributeCatalogue._id.toString()
            : null;

          if (catalogueId) {
            console.log("Fetching Catalogue 1 with ID:", catalogueId);
            const catalogueResponse =
              await productService.getAttributeCatalogueById(catalogueId);
            console.log("Catalogue 1 Response:", catalogueResponse);
            if (catalogueResponse?.data) {
              this.attributeCatalogues.attribute1 = catalogueResponse.data;
              console.log(
                "Set Catalogue 1 Data:",
                this.attributeCatalogues.attribute1
              );
            }
          }
        }

        // Fetch attribute2 details
        const attribute2Promises = attribute2Ids.map((id) =>
          productService.getAttributeById(id)
        );
        const fetchedAttributes2 = await Promise.all(attribute2Promises);
        console.log("Raw Attributes 2 Response:", fetchedAttributes2);

        // Process valid responses and populate attributes.attribute2
        const attribute2Data = {};
        let firstAttribute2 = null;
        fetchedAttributes2.forEach((attribute) => {
          console.log("Processing Attribute 2:", attribute);
          if (attribute && attribute.data) {
            attribute2Data[attribute.data._id] = attribute.data;
            if (!firstAttribute2) {
              firstAttribute2 = attribute.data;
            }
          }
        });
        this.attributes.attribute2 = attribute2Data;
        console.log("Processed Attributes 2:", this.attributes.attribute2);
        console.log("First Attribute 2:", firstAttribute2);

        // Lấy catalogue ID từ attribute đầu tiên
        if (firstAttribute2 && firstAttribute2.attributeCatalogue) {
          console.log(
            "First Attribute 2 Catalogue:",
            firstAttribute2.attributeCatalogue
          );
          const catalogueId = firstAttribute2.attributeCatalogue._id
            ? firstAttribute2.attributeCatalogue._id.toString()
            : null;

          if (catalogueId) {
            console.log("Fetching Catalogue 2 with ID:", catalogueId);
            const catalogueResponse =
              await productService.getAttributeCatalogueById(catalogueId);
            console.log("Catalogue 2 Response:", catalogueResponse);
            if (catalogueResponse?.data) {
              this.attributeCatalogues.attribute2 = catalogueResponse.data;
              console.log(
                "Set Catalogue 2 Data:",
                this.attributeCatalogues.attribute2
              );
            }
          }
        }

        // Log final state
        console.log("Final Attributes State:", this.attributes);
        console.log("Final Catalogues State:", this.attributeCatalogues);
      } catch (error) {
        console.error("Error fetching attribute details:", error);
      }
    },

    findVariant(attribute1Id, attribute2Id) {
      if (!this.product.variants) return null;
      // Nếu chỉ có 1 thuộc tính
      if (!this.product.attributes2 || this.product.attributes2.length === 0) {
        return this.product.variants.find(
          (variant) =>
            variant.attributeId1 === attribute1Id && variant.publish !== false
        );
      }
      // Nếu có 2 thuộc tính
      return this.product.variants.find(
        (variant) =>
          variant.attributeId1 === attribute1Id &&
          variant.attributeId2 === attribute2Id &&
          variant.publish !== false
      );
    },

    async loadVariantData() {
      if (!this.selectedAttribute1) return;
      // Nếu có thuộc tính thứ 2 thì yêu cầu chọn
      if (
        this.product.attributes2 &&
        this.product.attributes2.length > 0 &&
        !this.selectedAttribute2
      ) {
        return;
      }
      try {
        const variant = this.findVariant(
          this.selectedAttribute1,
          this.selectedAttribute2
        );
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
            price: variant.price || 0,
            stock: stockQuantity,
            images: variantImages,
            _id: variant._id,
            attributeId1: variant.attributeId1,
            attributeId2: variant.attributeId2,
            sku: variant.sku,
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
            sku: "",
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
          sku: "",
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

        if (!this.selectedAttribute1) {
          toast.error("Vui lòng chọn thuộc tính sản phẩm");
          return;
        }

        // Nếu có thuộc tính thứ 2 thì yêu cầu chọn
        if (
          this.product.attributes2 &&
          this.product.attributes2.length > 0 &&
          !this.selectedAttribute2
        ) {
          toast.error("Vui lòng chọn đầy đủ thuộc tính sản phẩm");
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
            this.product.attributes2 && this.product.attributes2.length > 0
              ? this.attributes.attribute2[this.selectedAttribute2]?.name || ""
              : "",
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

        if (!this.selectedAttribute1) {
          toast.error("Vui lòng chọn thuộc tính sản phẩm");
          return;
        }

        // Nếu có thuộc tính thứ 2 thì yêu cầu chọn
        if (
          this.product.attributes2 &&
          this.product.attributes2.length > 0 &&
          !this.selectedAttribute2
        ) {
          toast.error("Vui lòng chọn đầy đủ thuộc tính sản phẩm");
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
            sku:
              this.product.attributes2 && this.product.attributes2.length > 0
                ? `${
                    this.attributes.attribute1[this.selectedAttribute1]?.name ||
                    ""
                  } - ${
                    this.attributes.attribute2[this.selectedAttribute2]?.name ||
                    ""
                  }`
                : `${
                    this.attributes.attribute1[this.selectedAttribute1]?.name ||
                    ""
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
    async loadProductReviews(productId) {
      try {
        const response = await reviewService.getReviewsByProduct(
          productId,
          1,
          10000
        );
        const reviews = response?.data?.reviews || [];
        const totalReviews =
          response?.data?.pagination?.total || reviews.length;
        const activeReviews = reviews.filter(
          (review) => !review.deletedAt && review.star >= 1 && review.star <= 5
        );
        this.reviews = activeReviews;
        if (activeReviews.length > 0) {
          const totalStars = activeReviews.reduce(
            (sum, review) => sum + Number(review.star),
            0
          );
          const averageRating = totalStars / activeReviews.length;
          // CHỈ cập nhật field, KHÔNG gán lại this.product
          this.product.rating = Number(averageRating.toFixed(1));
          this.product.totalReviews = totalReviews;
        } else {
          this.product.rating = 0;
          this.product.totalReviews = 0;
          this.reviews = [];
        }
      } catch (error) {
        this.product.rating = 0;
        this.product.totalReviews = 0;
        this.reviews = [];
      }
    },
    toggleContent() {
      this.showFullContent = !this.showFullContent;
    },
    checkContentLength() {
      if (this.product.content) {
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = this.product.content;
        this.hasLongContent = tempDiv.textContent.length > 500;
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
  height: 500px;
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
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.stars {
  display: flex;
  align-items: center;
  gap: 2px;
}

.stars i {
  color: #ddd;
  font-size: 0.9rem;
  transition: color 0.2s ease;
}

.stars i.active {
  color: #ffd700;
}

.stars i.half {
  position: relative;
  color: #ddd;
}

.stars i.half::before {
  content: "\f089";
  position: absolute;
  left: 0;
  color: #ffd700;
  width: 50%;
  overflow: hidden;
}

.stars i.inactive {
  color: #ddd;
}

.rating-text {
  color: #666;
  font-size: 0.85rem;
}

.product-price-container {
  margin: 1.5rem 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.price-row {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.product-price {
  color: #ff0000;
  font-weight: 600;
  margin: 0;
}

.product-price.has-sale {
  text-decoration: line-through;
  color: #666;
  font-size: 1.2rem;
}

.product-sale-price {
  color: #ff0000;
  font-weight: 600;
  margin: 0;
}

.promotion-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
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

.promotion-details {
  display: flex;
  align-items: center;
}

.promotion-period {
  color: #666;
  font-size: 0.9rem;
  margin: 0;
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

.product-desc-section h2,
.product-detail-section h2 {
  color: #333;
  margin-bottom: 1.5rem;
  font-weight: 600;
}

.description-container {
  background-color: #f8f9fa;
  border-radius: 12px;
  padding: 2rem;
}

.detail-container {
  background-color: #f8f9fa;
  border-radius: 12px;
  padding: 2rem;
}

.description-content,
.detail-content {
  color: #444;
  line-height: 1.8;
}

.product-description p {
  font-size: 1.1rem;
  margin-bottom: 1.5rem;
}

.product-content {
  font-size: 1rem;
}

.content-preview {
  max-height: 200px;
  overflow: hidden;
  position: relative;
}

.content-preview::after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 100px;
  background: linear-gradient(transparent, #fff);
}

.btn-link {
  color: #ee4d2d;
  text-decoration: none;
  font-weight: 600;
  font-size: 0.95rem;
  padding: 0.5rem 1.5rem;
  display: inline-block;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border: 1px solid #ee4d2d;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.btn-link:hover {
  color: #fff;
  background-color: #ee4d2d;
  text-decoration: none;
  transform: translateY(-1px);
}

.no-description {
  color: #666;
  font-style: italic;
  text-align: center;
  padding: 2rem 0;
}

@media (max-width: 768px) {
  .description-container,
  .detail-container {
    padding: 1.5rem;
  }

  .product-description p {
    font-size: 1rem;
  }

  .product-content {
    font-size: 0.95rem;
  }
}

.wishlist-button {
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 10;
  background: rgba(255, 255, 255, 0.9);
  width: 45px;
  height: 45px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(5px);
  border: 2px solid transparent;
}

.wishlist-button:hover {
  transform: scale(1.15);
  background: white;
  box-shadow: 0 6px 20px rgba(255, 107, 107, 0.2);
  border-color: #ff6b6b;
}

.wishlist-button i {
  font-size: 1.4rem;
  color: #666;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.wishlist-button i.in-wishlist {
  color: #ff6b6b;
  animation: heartBeat 0.3s ease-in-out;
}

.wishlist-button:hover i {
  color: #ff6b6b;
  transform: scale(1.1);
}

@keyframes heartBeat {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
  }
}
</style>
