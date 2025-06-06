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
            <h3 class="results-title">Sản phẩm tương tự</h3>
            <div v-if="searchResults.length > 0" class="results-grid">
              <div v-for="(result, idx) in searchResults" :key="idx" class="result-item">
                <div class="result-image-wrapper">
                  <div v-if="!result.loaded && !result.error" class="image-loading">
                    <div class="loading-spinner"></div>
                  </div>
                  <img 
                    v-show="!result.error"
                    :src="result.displayUrl" 
                    :alt="'Kết quả ' + (idx + 1)" 
                    class="result-image"
                    @error="handleImageError($event, result, idx)"
                    @load="handleImageLoad($event, result, idx)"
                  />
                  <div v-if="result.error" class="image-error-state">
                    <i class="fas fa-exclamation-circle"></i>
                    <span>Không thể tải ảnh</span>
                  </div>
                  <div class="result-rank">{{ idx + 1 }}</div>
                  <button 
                    v-if="result.loaded && !result.error"
                    @click="openOriginalImage(result.originalUrl)"
                    class="view-original-button"
                    title="Xem ảnh gốc"
                  >
                    <i class="fas fa-external-link-alt"></i>
                  </button>
                </div>
                <div class="result-info">
                  <div class="similarity-badge">
                    <span class="similarity">{{ result.similarityPercentage }}</span>
                  </div>
                  <div class="result-details">
                    <button 
                      v-if="!result.error"
                      @click="openOriginalImage(result.originalUrl)"
                      class="image-link-button"
                    >
                      {{ result.displayUrl.split('/').pop() }}
                    </button>
                    <span v-else class="error-filename">{{ result.displayUrl.split('/').pop() }}</span>
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="no-results">
              <p>Không tìm thấy sản phẩm tương tự</p>
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
import { ref, nextTick, defineProps, defineEmits } from "vue";
import axios from "axios";
import { computed } from "vue";

const props = defineProps({
  visible: {
    type: Boolean,
    required: true,
  },
});

const emit = defineEmits(["close"]);

const boxes = ref([]);
const imageUrl = ref(null);
const imagePath = ref("");
const croppedImage = ref(null);
const searchResults = ref([]);
const isSearching = ref(false);
const showResults = ref(false);
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
      await axios.post("/api/imageService/delete", { imagePath: imagePath.value });
    } catch (err) {
      console.error("Không thể xóa file ảnh trên server:", err);
    }
  }
  imageUrl.value = null;
  boxes.value = [];
  imagePath.value = "";
  selectedBoxIndex.value = null;
  searchResults.value = [];
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
  imgTest.onload = () => {
    console.log(
      "[DEBUG] Ảnh gốc:",
      imgTest.naturalWidth,
      imgTest.naturalHeight
    );
  };
  imgTest.src = URL.createObjectURL(file);

  const formData = new FormData();
  formData.append("image", file);

  try {
    const res = await axios.post(
      "/api/imageService/detect",
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    console.log("[DEBUG] Box backend trả về:", res.data.boxes);
    const tempBoxes = res.data.boxes;
    imageUrl.value = URL.createObjectURL(file);
    imagePath.value = res.data.imagePath;

    await nextTick();
    await new Promise((resolve) => {
      imgRef.value.onload = () => {
        onImageLoad();
        boxes.value = tempBoxes;
        resolve();
      };
    });
  } catch (error) {
    console.error("Error in onFileChange:", error);
    alert("Không thể tải ảnh hoặc xử lý detection.");
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
    pointerEvents: "none"
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
    transition: "box-shadow 0.2s, transform 0.15s"
  };
};

const onDotClick = async (box, index) => {
  selectedBoxIndex.value = index;
  isSearching.value = true;
  searchResults.value = [];
  showResults.value = false;
  
  try {
    // Step 1: Crop the image
    const cropPayload = {
      x: Math.round(box.x),
      y: Math.round(box.y),
      width: Math.round(box.width),
      height: Math.round(box.height),
      imagePath: imagePath.value,
    };

    const cropRes = await axios.post(
      "/api/imageService/crop",
      cropPayload
    );
    croppedImage.value = cropRes.data.image_base64;

    // Step 2: Convert base64 to file for upload
    const base64Data = cropRes.data.image_base64.replace(/^data:image\/\w+;base64,/, '');
    const blob = await fetch(`data:image/jpeg;base64,${base64Data}`).then(res => res.blob());
    const file = new File([blob], 'cropped.jpg', { type: 'image/jpeg' });

    // Step 3: Create form data for upload
    const formData = new FormData();
    formData.append('image', file);
    formData.append('limit', '10'); // Get top 10 similar images

    // Step 4: Find similar images without saving features
    const searchRes = await axios.post(
      "/api/imageService/find-similar",
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' }
      }
    );
    
    // Transform results to include both display and original URLs
    searchResults.value = searchRes.data.similarImages.map(img => {
      const filename = img.imagePath.split(/[\\/]/).pop();
      const displayUrl = `/uploads/${filename}`;
      const originalUrl = `http://localhost:3005/uploads/${filename}`;

      const imgPreload = new Image();
      imgPreload.src = displayUrl;

      return {
        displayUrl,
        originalUrl,
        similarity: img.similarity,
        similarityPercentage: img.similarityPercentage,
        originalPath: img.imagePath,
        loaded: false,
        error: false
      };
    });

    // Show results in the same modal
    showResults.value = true;
  } catch (err) {
    console.error("Error in onDotClick:", err);
    alert("Không thể xử lý ảnh hoặc tìm kiếm. Hãy thử lại.");
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
  event.target.classList.add('image-loaded');
};

const handleImageError = (event, result, index) => {
  result.loaded = false;
  result.error = true;
  console.error("Image load error:", {
    url: result.displayUrl,
    originalPath: result.originalPath
  });
  event.target.classList.add('image-error');
};

// Update the openOriginalImage method
const openOriginalImage = (url) => {
  console.log('Opening original image:', url);
  
  // Create a temporary link element
  const link = document.createElement('a');
  link.href = url;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  
  // Add a click event listener to handle the response
  link.onclick = (e) => {
    e.preventDefault();
    
    // Try to fetch the image first to check if it's accessible
    fetch(url)
      .then(response => {
        if (!response.ok) throw new Error('Network response was not ok');
        // Get content type from response
        const contentType = response.headers.get('content-type');
        console.log('Image content type:', contentType);
        return response.blob();
      })
      .then(blob => {
        // Create object URL from the blob with the correct type
        const objectUrl = URL.createObjectURL(blob);
        
        // Open in new tab
        const newWindow = window.open(objectUrl, '_blank');
        if (!newWindow) {
          // If popup blocked, try to open in same window
          window.location.href = objectUrl;
        }
        
        // Clean up the object URL after a delay
        setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
      })
      .catch(error => {
        console.error('Error fetching image:', error);
        // Fallback: try to open the original URL directly
        window.open(url, '_blank');
      });
  };
  
  // Trigger the click
  link.click();
};
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
  height: 400px; /* Fixed height for image container */
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 32px rgba(0,0,0,0.18);
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
  box-shadow: 0 0 0 8px #4ea1ff99, 0 2px 12px rgba(0,0,0,0.18);
}

.mt-4 {
  margin-top: 1.5rem;
}
.mb-2 {
  margin-bottom: 0.5rem;
}
.font-bold {
  font-weight: bold;
}
.border {
  border: 1.5px solid #e0e0e0;
}
.rounded {
  border-radius: 8px;
}
.shadow {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.modal-header h2 {
  font-size: 1.15rem;
  font-weight: 700;
  color: #ff0000;
  margin: 0;
  letter-spacing: 1.5px;
  flex: 1;
  text-align: left;
  background: linear-gradient(90deg, #ff0000 60%, #ff7e5f 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-transform: uppercase;
}

.cropped-title {
  margin-bottom: 0.5rem;
  font-weight: 700;
  color: #ff0000;
  text-align: center;
  text-transform: uppercase;
  font-size: 1.05rem;
  letter-spacing: 1px;
}

.cropped-result {
  margin-bottom: 2rem;
  text-align: center;
}
.cropped-img {
  display: inline-block;
  margin: 0 auto;
  max-width: 100%;
  max-height: 260px;
  margin-bottom: 40px;
}

.search-similar-btn {
  display: inline-block;
  margin: 0 auto 24px auto;
  padding: 10px 28px;
  background: linear-gradient(90deg, #ff7e5f 0%, #ff0000 100%);
  color: #fff;
  font-weight: 700;
  font-size: 1rem;
  border: none;
  border-radius: 24px;
  box-shadow: 0 2px 8px rgba(255, 0, 0, 0.08);
  cursor: pointer;
  transition: background 0.2s, transform 0.15s;
  letter-spacing: 1px;
}
.search-similar-btn:hover {
  background: linear-gradient(90deg, #ff0000 0%, #ff7e5f 100%);
  transform: translateY(-2px) scale(1.04);
}

.search-results-section {
  width: 100%;
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.08);
}

.results-title {
  color: #ff0000;
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 20px;
  text-align: center;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.results-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  width: 100%;
}

.result-item {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0,0,0,0.1);
  transition: transform 0.2s, box-shadow 0.2s;
  width: 100%;
  aspect-ratio: 1;
}

.result-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 20px rgba(0,0,0,0.15);
}

.result-image-wrapper {
  position: relative;
  width: 100%;
  padding-top: 100%;
  background: #f8f9fa;
}

.result-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: opacity 0.3s ease;
}

.result-info {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(255, 255, 255, 0.95);
  padding: 12px;
  border-top: 1px solid #eee;
}

.similarity-badge {
  display: inline-block;
  background: linear-gradient(90deg, #ff7e5f 0%, #ff0000 100%);
  color: white;
  padding: 4px 10px;
  border-radius: 20px;
  font-weight: 600;
  font-size: 0.85rem;
  margin-bottom: 6px;
}

.result-details {
  font-size: 0.75rem;
  color: #666;
  word-break: break-all;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.image-link-button {
  background: none;
  border: none;
  color: #666;
  text-decoration: none;
  font-family: monospace;
  font-size: 0.7rem;
  width: 100%;
  text-align: left;
  padding: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.view-original-button {
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgba(255, 255, 255, 0.9);
  color: #666;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  padding: 0;
  z-index: 2;
}

.result-rank {
  position: absolute;
  top: 8px;
  left: 8px;
  background: rgba(255, 0, 0, 0.9);
  color: white;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 0.8rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  z-index: 2;
}

/* Responsive adjustments */
@media (max-width: 1200px) {
  .results-grid {
    grid-template-columns: repeat(4, 1fr);
    gap: 15px;
  }
}

@media (max-width: 992px) {
  .results-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 15px;
  }
  
  .image-container {
    height: 350px;
  }
}

@media (max-width: 576px) {
  .results-grid {
    grid-template-columns: 1fr;
    gap: 15px;
  }
  
  .image-container {
    height: 300px;
  }
}

.searching-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255,255,255,0.95);
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
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.result-image.image-error {
  opacity: 0.5;
  background-color: #f8f9fa;
}

.result-image.image-loaded {
  opacity: 1;
}

.image-error::after {
  content: '⚠️';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 24px;
  color: #ff0000;
}

.image-error-message {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(255, 0, 0, 0.1);
  color: #ff0000;
  padding: 8px;
  font-size: 0.8rem;
  text-align: center;
}

.error-filename {
  font-family: monospace;
  font-size: 0.7rem;
  margin-top: 4px;
  word-break: break-all;
}

.image-loading {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #f8f9fa;
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #ff0000;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.image-error-state {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #fff5f5;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #ff0000;
  padding: 16px;
  text-align: center;
}

.image-error-state i {
  font-size: 24px;
  margin-bottom: 8px;
}

.result-image {
  opacity: 0;
  transition: opacity 0.3s ease;
}

.result-image.image-loaded {
  opacity: 1;
}
</style>
