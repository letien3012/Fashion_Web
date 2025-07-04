<template>
  <div v-if="visible" class="modal-overlay" @click="onOverlayClick">
    <div class="modal-content large-modal" @click.stop>
      <div class="modal-header">
        <h2>Tìm kiếm bằng hình ảnh</h2>
        <button class="close-button" @click="onClose">&times;</button>
      </div>
      <div class="modal-body">
        <div
          v-if="!imageUrl"
          class="drop-area"
          @dragover.prevent
          @drop.prevent="onDrop"
        >
          <img src="../assets/images/clipart.png" class="drop-icon" />
          <span
            >Kéo hình ảnh vào đây hoặc
            <label for="file-upload" class="upload-link"
              >tải tệp lên</label
            ></span
          >
          <input
            id="file-upload"
            type="file"
            @change="onFileChange"
            accept="image/*"
            style="display: none"
          />
        </div>
        <div v-if="imageUrl" class="main-content">
          <div
            class="relative mt-4 image-container"
            style="position: relative"
            ref="imageContainerRef"
          >
            <img
              :src="imageUrl"
              ref="imgRef"
              @load="onImageLoad"
              alt="uploaded image"
              class="resized-image"
            />
            <div
              v-if="!selectedBox"
              class="highlight-mask"
              :style="highlightMaskStyle"
            ></div>
            <div v-for="(box, i) in boxes" :key="i">
              <div
                class="dot"
                :style="dotStyle(box)"
                @click="onDotClick(box, i)"
              ></div>
              <div
                v-if="selectedBoxIndex === i"
                class="highlight-box"
                :style="boxStyle(box)"
              ></div>
            </div>
          </div>
          <div v-if="showResults" class="search-results-section">
            <div v-if="!isSearching && !searchError" class="search-results">
              <div class="results-header">
                <p>Tìm thấy {{ similarProducts.length }} sản phẩm tương tự</p>
              </div>
              <div
                v-if="similarProducts && similarProducts.length > 0"
                class="products-grid"
              >
                <ProductItem
                  v-for="product in similarProducts"
                  :key="product._id"
                  :product="product"
                />
              </div>
              <div v-else class="no-results">
                <i class="fas fa-search"></i>
                <p>Không tìm thấy sản phẩm tương tự</p>
                <p class="suggestion">Gợi ý:</p>
                <ul>
                  <li>Thử chọn vùng ảnh khác</li>
                  <li>Thử ảnh khác</li>
                  <li>Đảm bảo ảnh rõ nét</li>
                </ul>
              </div>
            </div>
            <div v-else-if="isSearching" class="loading">
              <i class="fas fa-spinner fa-spin"></i>
              Đang tìm kiếm sản phẩm tương tự...
            </div>
            <div v-else-if="searchError" class="error">
              <i class="fas fa-exclamation-circle"></i>
              {{ searchError }}
            </div>
          </div>
        </div>
        <div v-if="isSearching" class="searching-overlay">
          <div class="searching-spinner"></div>
          <span>Đang tìm kiếm sản phẩm tương tự...</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {
  ref,
  nextTick,
  defineProps,
  defineEmits,
  onMounted,
  onBeforeUnmount,
} from "vue";
import { imageSearchService } from "../services/imageSearch.service";
import { productService } from "../services/product.service";
import ProductItem from "./ProductItem.vue";

const props = defineProps({
  visible: {
    type: Boolean,
    required: true,
  },
});

const emit = defineEmits(["close"]);

const baseUrl = import.meta.env.VITE_API_BASE_URL;

const boxes = ref([]);
const imageUrl = ref(null);
const imagePath = ref("");
const croppedImage = ref(null);
const similarProducts = ref([]);
const isSearching = ref(false);
const showResults = ref(false);
const searchError = ref(null);
const imgRef = ref(null);
const scaleX = ref(1);
const scaleY = ref(1);
const offsetX = ref(0);
const offsetY = ref(0);
const selectedBoxIndex = ref(null);
const imageContainerRef = ref(null);

const onClose = async () => {
  emit("close");
  if (imagePath.value) {
    try {
      await imageSearchService.deleteImage(imagePath.value);
    } catch (err) {
      console.error("Không thể xóa file ảnh trên server:", err);
    }
  }
  imageUrl.value = null;
  boxes.value = [];
  imagePath.value = "";
  selectedBoxIndex.value = null;
  similarProducts.value = [];
  showResults.value = false;
};

const onOverlayClick = (event) => {
  if (event.target.classList.contains("modal-overlay")) {
    onClose();
  }
};

const onFileChange = async (e) => {
  const file = e.target.files[0];
  if (!file || !file.type.startsWith("image/")) {
    alert("Vui lòng chọn file ảnh.");
    return;
  }

  const imgTest = new window.Image();
  imgTest.onload = () => {};
  imgTest.src = URL.createObjectURL(file);

  try {
    // Convert file to base64
    const base64Image = await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.readAsDataURL(file);
    });

    // Step 1: Upload image
    const uploadRes = await imageSearchService.uploadImage(base64Image);
    const uploadedImagePath = uploadRes.imagePath;

    // Step 2: Detect objects in uploaded image
    const detectRes = await imageSearchService.detectObjects(uploadedImagePath);

    const tempBoxes = detectRes.boxes;
    imageUrl.value = `${baseUrl}${uploadedImagePath}`;
    imagePath.value = uploadedImagePath;

    await nextTick();
    await new Promise((resolve) => {
      imgRef.value.onload = () => {
        onImageLoad();
        if (!tempBoxes || tempBoxes.length === 0) {
          showResults.value = true;
          similarProducts.value = [];
          searchError.value = null;
          isSearching.value = false;
        } else {
          boxes.value = tempBoxes;
          // Sắp xếp boxes theo diện tích từ lớn đến nhỏ
          const sortedBoxes = [...tempBoxes].sort((a, b) => {
            const areaA = a.width * a.height;
            const areaB = b.width * b.height;
            return areaB - areaA;
          });

          // Tìm sản phẩm tương tự từ box lớn nhất
          searchFromBox(sortedBoxes[0], 0);
        }
        resolve();
      };
    });
  } catch (error) {
    console.error("Error in onFileChange:", error);
    alert("Không thể tải ảnh hoặc xử lý detection.");
  }
};

const searchFromBox = async (box, index) => {
  isSearching.value = true;
  similarProducts.value = [];
  showResults.value = false;
  searchError.value = null;
  selectedBoxIndex.value = index;

  try {
    // Step 1: Crop the image
    const cropPayload = {
      x: Math.round(box.x),
      y: Math.round(box.y),
      width: Math.round(box.width),
      height: Math.round(box.height),
      imagePath: imagePath.value,
    };

    const cropRes = await imageSearchService.cropImage(cropPayload);

    // Step 2: Find similar images using base64 directly
    const searchRes = await imageSearchService.findSimilarImages(
      cropRes.image_base64,
      8
    );

    if (
      searchRes.success &&
      searchRes.products &&
      searchRes.products.length > 0
    ) {
      // Xử lý thông tin sản phẩm và khuyến mãi
      const processedProducts = await Promise.all(
        searchRes.products.map(async (product) => {
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
            image: `${baseUrl}${product.similarImagePath}`,
            album: (product.album || []).map((img) => getImageUrl(img)),
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
            similarity: product.similarity || 0,
            similarityPercentage: product.similarityPercentage || "0%",
          };
        })
      );

      similarProducts.value = processedProducts;
      showResults.value = true;
    } else {
      // Nếu không tìm thấy sản phẩm tương tự, thử với box tiếp theo
      const nextIndex = index + 1;
      if (nextIndex < boxes.value.length) {
        searchFromBox(boxes.value[nextIndex], nextIndex);
      } else {
        showResults.value = true;
        similarProducts.value = [];
        searchError.value = null;
        isSearching.value = false;
      }
    }
  } catch (err) {
    console.error("Error in searchFromBox:", err);
    showResults.value = true;
    similarProducts.value = [];
    searchError.value = null;
    isSearching.value = false;
  } finally {
    isSearching.value = false;
  }
};

const onImageLoad = () => {
  const img = imgRef.value;
  if (img && img.naturalWidth && img.naturalHeight) {
    const container = img.parentElement;
    const containerRect = container.getBoundingClientRect();
    const imgRect = img.getBoundingClientRect();
    scaleX.value = imgRect.width / img.naturalWidth;
    scaleY.value = imgRect.height / img.naturalHeight;
    offsetX.value = (containerRect.width - imgRect.width) / 2;
    offsetY.value = (containerRect.height - imgRect.height) / 2;
    if (imageContainerRef.value) {
      const ratio = img.naturalWidth / img.naturalHeight;
      imageContainerRef.value.style.setProperty("--img-aspect", ratio);
    }
  }
};

const getImageFitContainInfo = () => {
  const img = imgRef.value;
  const container = imageContainerRef.value;
  if (!img || !container) return null;
  const containerW = container.clientWidth;
  const containerH = container.clientHeight;
  const imgW = img.naturalWidth;
  const imgH = img.naturalHeight;
  const scale = Math.min(containerW / imgW, containerH / imgH);
  const displayW = imgW * scale;
  const displayH = imgH * scale;
  const offsetLeft = (containerW - displayW) / 2;
  const offsetTop = (containerH - displayH) / 2;
  return { scale, displayW, displayH, offsetLeft, offsetTop };
};

const boxStyle = (box) => {
  const info = getImageFitContainInfo();
  if (!info) return {};
  return {
    position: "absolute",
    left: `${box.x * info.scale + info.offsetLeft}px`,
    top: `${box.y * info.scale + info.offsetTop}px`,
    width: `${box.width * info.scale}px`,
    height: `${box.height * info.scale}px`,
    outline: "2.5px solid #fff",
    boxSizing: "border-box",
    zIndex: 11,
    pointerEvents: "none",
  };
};

const dotStyle = (box) => {
  const info = getImageFitContainInfo();
  if (!info) return {};
  const cx = (box.x + box.width / 2) * info.scale + info.offsetLeft;
  const cy = (box.y + box.height / 2) * info.scale + info.offsetTop;
  const size = 6;
  return {
    position: "absolute",
    left: `${cx - size / 2}px`,
    top: `${cy - size / 2}px`,
    width: `${size}px`,
    height: `${size}px`,
    borderRadius: "50%",
    backgroundColor: "#fff",
    border: "none",
    zIndex: 20,
    pointerEvents: "auto",
    cursor: "pointer",
    boxShadow: "0 0 0 4px #4ea1ff55, 0 2px 8px rgba(0,0,0,0.10)",
    transition: "box-shadow 0.2s, transform 0.15s",
  };
};

const getImageUrl = (image) => {
  if (!image) return "/images/placeholder.jpg";
  if (image.startsWith("http")) return image;
  return `${baseUrl}${image}`;
};

const processProducts = async (products) => {
  try {
    // Lọc sản phẩm chưa publish
    const publishedProducts = products.filter(
      (product) => product.publish === true
    );

    // Duyệt từng sản phẩm để lấy promotion
    const productsWithPromotions = await Promise.all(
      publishedProducts.map(async (product) => {
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
          image: product.similarImagePath
            ? `${baseUrl}${product.similarImagePath}`
            : getImageUrl(product.image),
          album: (product.album || []).map((img) => getImageUrl(img)),
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
          similarity: product.similarity || 0,
          similarityPercentage: product.similarityPercentage || "0%",
        };
      })
    );
    return productsWithPromotions;
  } catch (error) {
    console.error("Error processing products:", error);
    throw error;
  }
};

const onDotClick = async (box, index) => {
  selectedBoxIndex.value = index;
  isSearching.value = true;
  similarProducts.value = [];
  showResults.value = false;
  searchError.value = null;

  try {
    // Step 1: Crop the image
    const cropPayload = {
      x: Math.round(box.x),
      y: Math.round(box.y),
      width: Math.round(box.width),
      height: Math.round(box.height),
      imagePath: imagePath.value,
    };

    const cropRes = await imageSearchService.cropImage(cropPayload);
    croppedImage.value = cropRes.image_base64;

    // Step 2: Find similar images using base64 directly
    const searchRes = await imageSearchService.findSimilarImages(
      cropRes.image_base64,
      8
    );

    if (searchRes.success) {
      // Xử lý thông tin sản phẩm và khuyến mãi
      const processedProducts = await Promise.all(
        searchRes.products.map(async (product) => {
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
            image: `${baseUrl}${product.similarImagePath}`,
            album: (product.album || []).map((img) => getImageUrl(img)),
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
            similarity: product.similarity || 0,
            similarityPercentage: product.similarityPercentage || "0%",
          };
        })
      );

      similarProducts.value = processedProducts;
      showResults.value = true;
    } else {
      searchError.value = "Không tìm thấy sản phẩm tương tự";
    }
  } catch (err) {
    console.error("Error in onDotClick:", err);
    searchError.value = "Không thể xử lý ảnh hoặc tìm kiếm. Hãy thử lại.";
  } finally {
    isSearching.value = false;
  }
};

const onDrop = (e) => {
  const file = e.dataTransfer.files[0];
  if (file) onFileChange({ target: { files: [file] } });
};

const handleImageLoad = (event, result, index) => {
  result.loaded = true;
  result.error = false;
  event.target.classList.add("image-loaded");
};

const handleImageError = (event, result, index) => {
  result.loaded = false;
  result.error = true;
  console.error("Image load error:", {
    url: result.displayUrl,
    originalPath: result.originalPath,
  });
  event.target.classList.add("image-error");
};

// Update the openOriginalImage method
const openOriginalImage = (url) => {
  // Create a temporary link element
  const link = document.createElement("a");
  link.href = url;
  link.target = "_blank";
  link.rel = "noopener noreferrer";

  // Add a click event listener to handle the response
  link.onclick = (e) => {
    e.preventDefault();

    // Try to fetch the image first to check if it's accessible
    fetch(url)
      .then((response) => {
        if (!response.ok) throw new Error("Network response was not ok");
        // Get content type from response
        const contentType = response.headers.get("content-type");
        return response.blob();
      })
      .then((blob) => {
        // Create object URL from the blob with the correct type
        const objectUrl = URL.createObjectURL(blob);

        // Open in new tab
        const newWindow = window.open(objectUrl, "_blank");
        if (!newWindow) {
          // If popup blocked, try to open in same window
          window.location.href = objectUrl;
        }

        // Clean up the object URL after a delay
        setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
      })
      .catch((error) => {
        console.error("Error fetching image:", error);
        // Fallback: try to open the original URL directly
        window.open(url, "_blank");
      });
  };

  // Trigger the click
  link.click();
};

const handleBeforeUnload = async (e) => {
  if (imagePath.value) {
    try {
      await imageSearchService.deleteImage(imagePath.value);
    } catch (err) {
      console.error("Không thể xóa file ảnh trên server:", err);
    }
  }
};

onMounted(() => {
  window.addEventListener("beforeunload", handleBeforeUnload);
});

onBeforeUnmount(() => {
  window.removeEventListener("beforeunload", handleBeforeUnload);
});
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 20px;
  border-radius: 12px;
  width: 95%;
  max-width: 950px;
  max-height: 95vh;
  overflow-y: auto;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.18);
  animation: modalIn 0.2s;
}

.large-modal {
  min-height: 450px;
}

@keyframes modalIn {
  from {
    transform: scale(0.95);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  border-bottom: 2px solid #ffeaea;
  padding-bottom: 10px;
}

.close-button {
  background: none;
  border: none;
  font-size: 28px;
  cursor: pointer;
  color: #666;
  transition: color 0.2s;
}

.close-button:hover {
  color: #ff0000;
}

.modal-body {
  background: #f8f9fa;
  border-radius: 10px;
  padding: 20px;
  max-height: 90vh;
  overflow-y: auto;
}

.main-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
  width: 100%;
}

.drop-area {
  border: 2px dashed #4ea1ff;
  border-radius: 12px;
  padding: 40px 16px 32px 16px;
  text-align: center;
  background: #f8f9fa;
  color: #6c757d;
  margin-bottom: 18px;
  cursor: pointer;
  transition: border-color 0.2s, background 0.2s;
  position: relative;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.drop-area:hover {
  border-color: #ff0000;
  background: #e9ecef;
}

.drop-icon {
  width: 56px;
  margin-bottom: 10px;
  display: block;
  margin-left: auto;
  margin-right: auto;
  opacity: 0.85;
}

.upload-link {
  color: #4ea1ff;
  text-decoration: underline;
  cursor: pointer;
  font-weight: 500;
}

.upload-link:hover {
  color: #ff0000;
}

.image-container {
  width: 100%;
  height: 400px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 32px rgba(0, 0, 0, 0.18);
  border: 8px solid #fff;
  position: relative;
  overflow: hidden;
}

.resized-image {
  width: 100%;
  height: 100%;
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  border-radius: 0;
  background: #fff;
  display: block;
  margin: 0 auto;
  box-shadow: none;
}

.highlight-mask {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  pointer-events: none;
}

.highlight-box {
  position: absolute;
  background-color: transparent;
  pointer-events: none;
}

.dot {
  position: absolute;
  cursor: pointer;
  transition: transform 0.2s;
}

.dot:hover {
  transform: scale(1.3);
  box-shadow: 0 0 0 8px #4ea1ff99, 0 2px 12px rgba(0, 0, 0, 0.18);
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
  grid-template-columns: repeat(3, 1fr);
  gap: 25px;
  padding: 20px 0;
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

.searching-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.95);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 100;
  backdrop-filter: blur(4px);
}

.searching-spinner {
  width: 48px;
  height: 48px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #ff0000;
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

@media (max-width: 768px) {
  .products-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 15px;
  }

  .no-results {
    padding: 20px;
  }

  .products-grid :deep(.product-item) {
    .product-image {
      height: 220px;
    }

    .product-name {
      font-size: 13px;
      line-height: 1.2;
      margin: 6px 0;
    }

    .product-price {
      font-size: 13px;
    }

    .product-sale-price {
      font-size: 12px;
    }

    .product-discount {
      font-size: 11px;
      padding: 2px 6px;
    }

    .product-rating {
      font-size: 12px;
    }

    .product-rating i {
      font-size: 11px;
    }
  }
}

@media (max-width: 480px) {
  .products-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }

  .products-grid :deep(.product-item) {
    .product-image {
      height: 180px;
    }

    .product-name {
      font-size: 12px;
      line-height: 1.1;
      margin: 5px 0;
    }

    .product-price {
      font-size: 12px;
    }

    .product-sale-price {
      font-size: 11px;
    }

    .product-discount {
      font-size: 10px;
      padding: 2px 5px;
    }

    .product-rating {
      font-size: 11px;
    }

    .product-rating i {
      font-size: 10px;
    }
  }
}
</style>
