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
        <div
          class="relative mt-4 image-container"
          v-if="imageUrl"
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
        <div class="mt-4 cropped-result" v-if="croppedImage">
          <h3 class="cropped-title">Kết quả cắt vật thể</h3>
          <img
            :src="'data:image/jpeg;base64,' + croppedImage"
            class="border rounded shadow cropped-img"
          />
          <button class="search-similar-btn">Tìm kiếm sản phẩm tương tự</button>
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
const imgRef = ref(null);
const scaleX = ref(1);
const scaleY = ref(1);
const offsetX = ref(0);
const offsetY = ref(0);
const selectedBoxIndex = ref(null);
const imageContainerRef = ref(null);

const onClose = () => {
  emit("close");
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
      "http://localhost:3005/api/imageService/detect",
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

const boxStyle = (box) => {
  const img = imgRef.value;
  if (!img || !img.naturalWidth || !img.naturalHeight) return {};
  return {
    position: "absolute",
    left: `${box.x * scaleX.value + offsetX.value}px`,
    top: `${box.y * scaleY.value + offsetY.value}px`,
    width: `${box.width * scaleX.value}px`,
    height: `${box.height * scaleY.value}px`,
    border: "2px solid white",
    boxShadow: "0 0 0 2px rgba(255,255,255,0.5)",
    zIndex: 11,
    boxSizing: "border-box",
  };
};

const dotStyle = (box) => {
  const img = imgRef.value;
  if (!img) return {};
  const cx = (box.x + box.width / 2) * scaleX.value + offsetX.value;
  const cy = (box.y + box.height / 2) * scaleY.value + offsetY.value;
  const size = 12;
  return {
    position: "absolute",
    left: `${cx - size / 2}px`,
    top: `${cy - size / 2}px`,
    width: `${size}px`,
    height: `${size}px`,
    borderRadius: "50%",
    backgroundColor: "#fff",
    border: "2px solid #000",
    zIndex: 20,
    pointerEvents: "auto",
    cursor: "pointer",
  };
};

const onDotClick = async (box, index) => {
  selectedBoxIndex.value = index;
  try {
    const payload = {
      x: Math.round(box.x),
      y: Math.round(box.y),
      width: Math.round(box.width),
      height: Math.round(box.height),
      imagePath: imagePath.value,
    };

    const res = await axios.post(
      "http://localhost:3005/api/imageService/crop",
      payload
    );
    croppedImage.value = res.data.image_base64;
  } catch (err) {
    console.error("Error in onDotClick:", err);
    alert("Không thể cắt ảnh. Hãy thử lại.");
  }
};

const onDrop = (e) => {
  const file = e.dataTransfer.files[0];
  if (file) onFileChange({ target: { files: [file] } });
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
  padding: 24px 12px 18px 12px;
  min-height: 320px;
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
  aspect-ratio: var(--img-aspect, 1/1);
  overflow: hidden;
  position: relative;
  background: #fff;
  border-radius: 12px;
  margin-top: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  border: 1.5px solid #e0e0e0;
  padding: 16px 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.resized-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: 8px;
  background: #f8f9fa;
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
  transform: scale(1.2);
  box-shadow: 0 0 0 4px #4ea1ff44;
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
</style>
