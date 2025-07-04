<template>
  <div class="p-4">
    <input type="file" @change="onFileChange" accept="image/*" />
    <div
      class="relative mt-4 image-container"
      v-if="imageUrl"
      style="position: relative"
    >
      <img
        :src="imageUrl"
        ref="imgRef"
        @load="onImageLoad"
        alt="uploaded image"
        class="resized-image"
      />

      <!-- Lớp phủ mờ ảnh trừ vùng được chọn -->
      <div
        v-if="!selectedBox"
        class="highlight-mask"
        :style="highlightMaskStyle"
      ></div>

      <!-- Vòng lặp dot và box -->
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
        >
          <!-- highlight-box-overlay đã bị xóa để không làm mờ vùng selectedBox -->
        </div>
      </div>
    </div>

    <div class="mt-4" v-if="croppedImage">
      <h3 class="mb-2 font-bold">Cropped Object:</h3>
      <img
        :src="'data:image/jpeg;base64,' + croppedImage"
        class="border rounded shadow"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick } from "vue";
import axios from "axios";
import { computed } from "vue";
const boxes = ref([]);
const imageUrl = ref(null);
const imagePath = ref("");
const croppedImage = ref(null);
const imgRef = ref(null);
const scaleX = ref(1);
const scaleY = ref(1);
const offsetX = ref(0);
const offsetY = ref(0);

const onFileChange = async (e) => {
  const file = e.target.files[0];
  if (!file || !file.type.startsWith("image/")) {
    alert("Vui lòng chọn file ảnh.");
    return;
  }

  // Log kích thước ảnh gốc
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
      `${import.meta.env.VITE_API_BASE_URL}/api/imageService/detect`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    // Log box backend trả về
    console.log("[DEBUG] Box backend trả về:", res.data.boxes);
    // Lưu tạm dữ liệu boxes nhưng chưa gán ngay
    const tempBoxes = res.data.boxes;
    imageUrl.value = URL.createObjectURL(file);
    imagePath.value = res.data.imagePath;

    // Đợi hình ảnh tải xong trước khi gán boxes
    await nextTick(); // Đảm bảo DOM được cập nhật
    await new Promise((resolve) => {
      imgRef.value.onload = () => {
        onImageLoad();
        boxes.value = tempBoxes; // Gán boxes sau khi hình ảnh đã tải
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
    // Tính scale dựa trên vùng ảnh thực sự hiển thị (object-fit: contain)
    scaleX.value = imgRect.width / img.naturalWidth;
    scaleY.value = imgRect.height / img.naturalHeight;
    // Tính offset do object-fit: contain tạo ra
    offsetX.value = (containerRect.width - imgRect.width) / 2;
    offsetY.value = (containerRect.height - imgRect.height) / 2;
    console.log("[DEBUG] Image loaded:", {
      width: imgRect.width,
      naturalWidth: img.naturalWidth,
      height: imgRect.height,
      naturalHeight: img.naturalHeight,
      scaleX: scaleX.value,
      scaleY: scaleY.value,
      offsetX: offsetX.value,
      offsetY: offsetY.value,
    });
  } else {
    console.warn("Image dimensions not available");
  }
};

const boxStyle = (box) => {
  const img = imgRef.value;
  if (!img || !img.naturalWidth || !img.naturalHeight) {
    console.warn("Invalid image dimensions in boxStyle");
    return {};
  }
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

const onBoxClick = async (box) => {
  try {
    const img = imgRef.value;
    const payload = {
      x: Math.round(box.x),
      y: Math.round(box.y),
      width: Math.round(box.width),
      height: Math.round(box.height),
      imagePath: imagePath.value,
    };
    console.log(payload);

    const res = await axios.post(
      `${import.meta.env.VITE_API_BASE_URL}/api/imageService/crop`,
      payload
    );
    croppedImage.value = res.data.image_base64;
  } catch (err) {
    console.error("Error in onBoxClick:", err);
    alert("Không thể cắt ảnh. Hãy thử lại.");
  }
};

const onImageClick = async (event) => {
  if (!boxes.value.length) return;

  const img = imgRef.value;
  const rect = img.getBoundingClientRect();

  // Tính tọa độ click tương ứng trong ảnh gốc
  const offsetX = event.clientX - rect.left;
  const offsetY = event.clientY - rect.top;

  const x = offsetX / scaleX.value;
  const y = offsetY / scaleY.value;

  // Tìm bounding box chứa điểm (x, y)
  const clickedBox = boxes.value.find(
    (box) =>
      x >= box.x &&
      x <= box.x + box.width &&
      y >= box.y &&
      y <= box.y + box.height
  );

  if (!clickedBox) {
    alert("Không tìm thấy vật thể tại điểm này.");
    return;
  }

  try {
    const payload = {
      x: Math.round(clickedBox.x),
      y: Math.round(clickedBox.y),
      width: Math.round(clickedBox.width),
      height: Math.round(clickedBox.height),
      imagePath: imagePath.value,
    };

    const res = await axios.post(
      `${import.meta.env.VITE_API_BASE_URL}/api/imageService/crop`,
      payload
    );

    croppedImage.value = res.data.image_base64;
  } catch (err) {
    console.error("Error in onImageClick:", err);
    alert("Không thể cắt ảnh.");
  }
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
    transition: "all 0.2s ease",
    boxShadow: "0 0 4px rgba(0,0,0,0.3)",
  };
};

const selectedBox = ref(null); // vẫn giữ để dùng nếu cần
const selectedBoxIndex = ref(null); // index của box được chọn

const onDotClick = async (box, index) => {
  selectedBox.value = box;
  selectedBoxIndex.value = index; // lưu index của box được chọn

  try {
    const payload = {
      x: Math.round(box.x),
      y: Math.round(box.y),
      width: Math.round(box.width),
      height: Math.round(box.height),
      imagePath: imagePath.value,
    };
    console.log(payload);
    const res = await axios.post(
      `${import.meta.env.VITE_API_BASE_URL}/api/imageService/crop`,
      payload
    );
    console.log(res.data);
    croppedImage.value = res.data.image_base64;
    console.log(croppedImage.value);
  } catch (err) {
    console.error("Error in onDotClick:", err);
    alert("Không thể cắt ảnh.");
  }
};

const highlightMaskStyle = computed(() => {
  const box = selectedBox.value;
  const img = imgRef.value;
  if (!box || !img) return {};

  const left = box.x * scaleX.value;
  const top = box.y * scaleY.value;
  const width = box.width * scaleX.value;
  const height = box.height * scaleY.value;

  const maskSvg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${img.width}" height="${img.height}">
      <rect x="0" y="0" width="100%" height="100%" fill="black" />
      <rect x="${left}" y="${top}" width="${width}" height="${height}" fill="white" />
    </svg>
  `.trim();

  const maskDataUrl = `url('data:image/svg+xml;utf8,${encodeURIComponent(
    maskSvg
  )}')`;

  return {
    position: "absolute",
    top: "0",
    left: "0",
    width: `${img.width}px`,
    height: `${img.height}px`,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    maskImage: maskDataUrl,
    WebkitMaskImage: maskDataUrl,
    maskRepeat: "no-repeat",
    WebkitMaskRepeat: "no-repeat",
    maskSize: "contain",
    WebkitMaskSize: "contain",
    zIndex: 9,
    pointerEvents: "none",
  };
});
</script>

<style scoped>
.image-container {
  width: 500px;
  height: 500px;
  position: relative;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #eee;
  padding: 0;
  box-sizing: border-box;
}

.resized-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
  padding: 0;
  margin: 0;
}

img {
  display: block;
  max-width: 100%;
  height: auto;
}

.absolute {
  border: 2px solid red;
  background: rgba(255, 0, 0, 0.1);
}
.absolute:hover {
  border-color: #00ff00;
  background: rgba(0, 255, 0, 0.2);
}
.dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: #fff;
  border: 2px solid #000;
  z-index: 10;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.dot:hover {
  transform: scale(1.2);
  box-shadow: 0 0 8px rgba(0, 0, 0, 0.5);
}

.highlight-box {
  border: 2px solid white;
  position: absolute;
  z-index: 11;
  background: none;
  box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.5);
  transition: all 0.2s ease;
}

.highlight-box:hover {
  border-color: #00ff00;
  box-shadow: 0 0 0 2px rgba(0, 255, 0, 0.5);
}

.highlight-mask {
  pointer-events: none;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 9;
}

.highlight-box-overlay {
  /* Đã xóa class này vì không còn sử dụng */
}
</style>
