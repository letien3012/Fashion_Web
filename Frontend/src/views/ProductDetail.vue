<template>
  <Header />
  <div v-if="loading" class="loading-state">Đang tải thông tin sản phẩm...</div>
  <div v-else-if="error" class="error-state">
    {{ error }}
  </div>
  <div v-else class="product-detail-container">
    <div class="product-gallery">
      <img :src="displayImages[activeImage]" class="main-image" />
      <div class="thumbnail-container">
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
    <div class="product-info">
      <h1 class="product-title">{{ product.name }}</h1>
      <div class="product-rating">
        <i
          class="fas fa-star"
          v-for="n in 5"
          :key="n"
          :class="{ active: n <= product.rating }"
        ></i>
        <span class="rating-number">({{ product.rating }})</span>
      </div>
      <div class="product-price-container">
        <div class="product-price" :class="{ 'has-sale': salePrice }">
          {{ formatPrice(displayPrice) }}
        </div>
        <div v-if="salePrice" class="product-sale-price">
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

      <!-- Thuộc tính và Số lượng chỉ hiển thị khi dữ liệu thuộc tính đã tải -->
      <div v-if="attributesLoaded">
        <!-- Thuộc tính 1 -->
        <div class="product-options">
          <label
            >{{
              attributes.attribute1[product.attributes1?.[0]]
                ?.attributeCatalogueId?.name || "Thuộc tính 1"
            }}:</label
          >
          <div class="option-list">
            <button
              v-for="attributeId in product.attributes1"
              :key="attributeId"
              :class="{ active: selectedAttribute1 === attributeId }"
              @click="selectedAttribute1 = attributeId"
            >
              {{ attributes.attribute1[attributeId]?.name || attributeId }}
            </button>
          </div>
        </div>

        <!-- Thuộc tính 2 -->
        <div class="product-options">
          <label
            >{{
              attributes.attribute2[product.attributes2?.[0]]
                ?.attributeCatalogueId?.name || "Thuộc tính 2"
            }}:</label
          >
          <div class="option-list">
            <button
              v-for="attributeId in product.attributes2"
              :key="attributeId"
              :class="{ active: selectedAttribute2 === attributeId }"
              @click="selectedAttribute2 = attributeId"
              :style="{
                background: attributes.attribute2[attributeId]?.value || '#fff',
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
        <div class="stock-info">
          Số lượng còn lại: <b>{{ currentVariant.stock }}</b>
        </div>

        <!-- Chọn số lượng -->
        <div class="product-actions">
          <div class="quantity-control">
            <button
              class="quantity-btn"
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
              class="quantity-input"
              @input="validateQuantity"
            />
            <button
              class="quantity-btn"
              @click="increaseQuantity"
              :disabled="quantity >= currentVariant.stock"
            >
              +
            </button>
          </div>
          <button
            class="add-to-cart-btn"
            @click="addToCart"
            :disabled="!canBuy"
          >
            Thêm vào giỏ hàng
          </button>
          <button class="buy-now-btn" @click="buyNow" :disabled="!canBuy">
            Mua ngay
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Mô tả sản phẩm -->
  <div class="product-desc-section">
    <h2>Mô tả sản phẩm</h2>
    <div
      v-if="product.content"
      class="product-content"
      v-html="product.content"
    ></div>
    <div v-if="product.description" class="product-description">
      <p>{{ product.description }}</p>
    </div>
    <div v-if="!product.content && !product.description" class="no-description">
      <p>Chưa có mô tả cho sản phẩm này.</p>
    </div>
  </div>

  <!-- Đánh giá sản phẩm -->
  <Review_ProductDetail
    :product="product"
    @submit-review="handleReviewSubmit"
  />
</template>

<script>
import Header from "../components/Header.vue";
import Review_ProductDetail from "../components/Review_ProductDetail.vue";
import { productService } from "../services/product.service";
import { cartService } from "../services/cart.service";
import { toast } from "vue3-toastify";

export default {
  name: "ProductDetail",
  components: {
    Header,
    Review_ProductDetail,
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
.loading-state,
.error-state {
  text-align: center;
  padding: 40px;
  font-size: 1.2rem;
  color: #666;
}

.error-state {
  color: #ff6b6b;
}

.product-detail-container {
  display: flex;
  gap: 40px;
  max-width: 1100px;
  margin: 40px auto 0 auto;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
  padding: 32px;
}
.product-gallery {
  flex: 1.2;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.main-image {
  width: 100%;
  max-width: 400px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  margin-bottom: 16px;
}
.thumbnail-container {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  position: relative;
}
.thumbnail-list {
  display: flex;
  gap: 10px;
  overflow: hidden;
  width: calc(100% - 80px);
}
.nav-btn {
  width: 32px;
  height: 32px;
  border: 1px solid #ccc;
  background: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}
.nav-btn:hover:not(:disabled) {
  background: #f0f0f0;
  border-color: #999;
}
.nav-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.nav-btn i {
  font-size: 14px;
  color: #666;
}
.thumbnail-list img {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 8px;
  cursor: pointer;
  border: 2px solid transparent;
  transition: border 0.2s;
  flex-shrink: 0;
}
.thumbnail-list img.active,
.thumbnail-list img:hover {
  border: 2px solid #ff6b6b;
}
.product-info {
  flex: 1.5;
  display: flex;
  flex-direction: column;
  gap: 18px;
}
.product-title {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 0;
}
.product-rating {
  color: #ffd700;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  gap: 6px;
}
.product-rating i {
  color: #ccc;
}
.product-rating i.active {
  color: #ffd700;
}
.product-price-container {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 10px 0;
}
.product-price {
  font-size: 1.5rem;
  font-weight: 700;
  color: #ff6b6b;
}
.product-price.has-sale {
  text-decoration: line-through;
  color: #999;
  font-size: 1.2rem;
}
.product-sale-price {
  font-size: 1.5rem;
  font-weight: 700;
  color: #ff6b6b;
}
.promotion-info {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-top: 8px;
}
.promotion-details {
  flex: 1;
}
.promotion-name {
  font-weight: 600;
  color: #ff6b6b;
  margin-bottom: 4px;
}
.promotion-description {
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 4px;
}
.promotion-period {
  font-size: 0.85rem;
  color: #888;
  font-style: italic;
}
.discount-badge {
  background: #ff6b6b;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.9rem;
  font-weight: 600;
  white-space: nowrap;
}
.product-options {
  margin: 10px 0;
}
.product-options label {
  font-weight: 600;
  margin-right: 10px;
}
.option-list {
  display: flex;
  gap: 10px;
  margin-top: 6px;
}
.option-list button {
  min-width: 36px;
  min-height: 36px;
  border-radius: 8px;
  border: 1px solid #ccc;
  background: #fff;
  cursor: pointer;
  font-weight: 600;
  font-size: 1rem;
  transition: border 0.2s, background 0.2s;
}
.option-list button.active {
  border: 2px solid #ff6b6b;
  background: #ffeaea;
}
.option-list button[style*="#fff"] {
  border: 1px solid #ccc;
}
.stock-info {
  color: #333;
  font-size: 1.1rem;
  margin-bottom: 8px;
}
.product-actions {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-top: 12px;
}
.quantity-control {
  display: flex;
  align-items: center;
  gap: 8px;
}
.quantity-btn {
  width: 32px;
  height: 32px;
  border: 1px solid #ccc;
  background: #fff;
  border-radius: 4px;
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}
.quantity-btn:hover:not(:disabled) {
  background: #f0f0f0;
}
.quantity-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.quantity-input {
  width: 60px;
  height: 32px;
  text-align: center;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 16px;
}
.add-to-cart-btn,
.buy-now-btn {
  background: #ff6b6b;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 10px 28px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}
.add-to-cart-btn:disabled,
.buy-now-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}
.add-to-cart-btn:hover,
.buy-now-btn:hover {
  background: #ff3b3b;
}
.product-desc-section {
  max-width: 1100px;
  margin: 32px auto 0 auto;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  padding: 24px 32px;
}
.product-desc-section h2 {
  font-size: 1.3rem;
  margin-bottom: 20px;
  color: #333;
  font-weight: 600;
}
.product-content {
  margin-bottom: 20px;
  line-height: 1.6;
  color: #444;
}
.product-content :deep(img) {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  margin: 10px 0;
}
.product-content :deep(p) {
  margin-bottom: 15px;
}
.product-description {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}
.product-description p {
  line-height: 1.6;
  color: #444;
}
.no-description {
  color: #666;
  font-style: italic;
  text-align: center;
  padding: 20px 0;
}
</style>
