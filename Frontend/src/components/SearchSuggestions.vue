<template>
  <div
    v-if="visible && suggestions && suggestions.length > 0"
    class="search-suggestions"
  >
    <div
      v-for="product in suggestions"
      :key="product._id"
      class="suggestion-item"
      @click="selectProduct(product)"
    >
      <img
        :src="getImageUrl(product.image)"
        :alt="product.name || ''"
        class="suggestion-image"
        @error="handleImageError"
      />
      <div class="suggestion-info">
        <div class="suggestion-name">{{ product.name || "" }}</div>
      </div>
    </div>
  </div>
</template>

<script>
const backendUrl = "http://localhost:3005";

export default {
  name: "SearchSuggestions",
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    suggestions: {
      type: Array,
      default: () => [],
    },
  },
  methods: {
    selectProduct(product) {
      if (product && product._id) {
        this.$emit("select", product);
      }
    },
    getImageUrl(imagePath) {
      if (!imagePath) return "/images/placeholder.jpg";
      if (imagePath.startsWith("http")) return imagePath;
      return `${backendUrl}/${imagePath.replace(/^\/+|\/+$/g, "")}`;
    },
    handleImageError(e) {
      console.error("Image load error:", e);
      e.target.src = "/images/placeholder.jpg";
    },
  },
};
</script>

<style scoped>
.search-suggestions {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  margin-top: 8px;
  z-index: 1000;
  max-height: 400px;
  overflow-y: auto;
  animation: slideDown 0.2s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.suggestion-item {
  display: flex;
  align-items: center;
  padding: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  border-bottom: 1px solid #f0f0f0;
}

.suggestion-item:last-child {
  border-bottom: none;
}

.suggestion-item:hover {
  background-color: #f8f8f8;
  transform: translateX(5px);
}

.suggestion-image {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 8px;
  margin-right: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: transform 0.3s ease;
}

.suggestion-item:hover .suggestion-image {
  transform: scale(1.05);
}

.suggestion-info {
  flex: 1;
}

.suggestion-name {
  font-size: 15px;
  color: #2c3e50;
  margin-bottom: 6px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.suggestion-item:hover .suggestion-name {
  color: #e74c3c;
}

.suggestion-price {
  font-size: 14px;
  color: #e74c3c;
  font-weight: 600;
  letter-spacing: 0.5px;
}

/* Custom scrollbar */
.search-suggestions::-webkit-scrollbar {
  width: 6px;
}

.search-suggestions::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

.search-suggestions::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 10px;
}

.search-suggestions::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>