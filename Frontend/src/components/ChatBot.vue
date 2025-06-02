<template>
  <div class="chatbot-container">
    <!-- Chat Icon Button -->
    <button class="chat-icon" @click="toggleChat">
      <i class="fas fa-comments"></i>
      <span class="notification-badge" v-if="hasNewMessage">1</span>
    </button>

    <!-- Chat Window -->
    <div class="chat-window" :class="{ 'chat-open': isOpen }">
      <div class="chat-header">
        <div class="chat-title">
          <i class="fas fa-robot"></i>
          <span>Chat Assistant</span>
        </div>
        <button class="close-btn" @click="toggleChat">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <div class="chat-messages" ref="chatMessages">
        <div class="message bot">
          <div class="message-content">
            <p>Xin chào! Tôi có thể giúp gì cho bạn?</p>
          </div>
          <div class="message-time">{{ getCurrentTime() }}</div>
        </div>

        <!-- Kết quả tìm kiếm giả lập -->
        <div v-if="showSearchResults" class="message bot">
          <div class="message-content">
            <p>Tôi đã tìm thấy một số sản phẩm tương tự:</p>
            <div class="search-results">
              <div
                class="result-item"
                v-for="(product, index) in mockSearchResults"
                :key="index"
              >
                <img :src="product.image" :alt="product.name" />
                <div class="result-info">
                  <h4>{{ product.name }}</h4>
                  <p class="price">{{ formatPrice(product.price) }}</p>
                </div>
              </div>
            </div>
          </div>
          <div class="message-time">{{ getCurrentTime() }}</div>
        </div>
      </div>

      <div class="chat-input">
        <div class="input-actions">
          <input
            type="file"
            ref="fileInput"
            accept="image/*"
            @change="handleImageSelect"
            style="display: none"
          />
          <button
            class="action-btn"
            @click="triggerFileInput"
            title="Tìm kiếm bằng hình ảnh"
          >
            <i class="fas fa-camera"></i>
          </button>
        </div>
        <input
          type="text"
          placeholder="Nhập tin nhắn của bạn..."
          v-model="message"
          @keyup.enter="sendMessage"
        />
        <button class="send-btn" @click="sendMessage">
          <i class="fas fa-paper-plane"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "ChatBot",
  data() {
    return {
      isOpen: false,
      message: "",
      hasNewMessage: false,
      showSearchResults: false,
      mockSearchResults: [
        {
          name: "Áo thun nam basic",
          price: 299000,
          image: "https://example.com/ao-thun-1.jpg",
        },
        {
          name: "Áo polo nam cổ trụ",
          price: 399000,
          image: "https://example.com/ao-polo-1.jpg",
        },
        {
          name: "Áo sơ mi nam trắng",
          price: 499000,
          image: "https://example.com/ao-somi-1.jpg",
        },
      ],
    };
  },
  methods: {
    toggleChat() {
      this.isOpen = !this.isOpen;
      if (this.isOpen) {
        this.hasNewMessage = false;
      }
    },
    sendMessage() {
      if (this.message.trim()) {
        // Xử lý gửi tin nhắn ở đây
        this.message = "";
      }
    },
    getCurrentTime() {
      const now = new Date();
      return now.toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      });
    },
    triggerFileInput() {
      this.$refs.fileInput.click();
    },
    handleImageSelect(event) {
      const file = event.target.files[0];
      if (file) {
        // Xử lý tìm kiếm bằng hình ảnh ở đây
        this.showSearchResults = true;
        // Cuộn xuống kết quả tìm kiếm
        this.$nextTick(() => {
          const chatMessages = this.$refs.chatMessages;
          chatMessages.scrollTop = chatMessages.scrollHeight;
        });
      }
    },
    formatPrice(price) {
      return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }).format(price);
    },
  },
};
</script>

<style scoped>
.chatbot-container {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 1000;
}

.chat-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, #e63946, #ff4d5a);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 15px rgba(230, 57, 70, 0.4);
  transition: all 0.3s ease;
  position: relative;
}

.chat-icon i {
  font-size: 24px;
  color: white;
}

.chat-icon:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 20px rgba(255, 107, 107, 0.4);
}

.notification-badge {
  position: absolute;
  top: -5px;
  right: -5px;
  background: #ff4757;
  color: white;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
}

.chat-window {
  position: fixed;
  bottom: 90px;
  right: 20px;
  width: 350px;
  height: 500px;
  background: white;
  border-radius: 15px;
  box-shadow: 0 5px 25px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  transform: translateY(20px);
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;
}

.chat-window.chat-open {
  transform: translateY(0);
  opacity: 1;
  visibility: visible;
}

.chat-header {
  padding: 15px 20px;
  background: linear-gradient(135deg, #e63946, #ff4d5a);
  border-radius: 15px 15px 0 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chat-title {
  display: flex;
  align-items: center;
  gap: 10px;
  color: white;
  font-weight: 600;
}

.chat-title i {
  font-size: 20px;
}

.close-btn {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  font-size: 18px;
  padding: 5px;
  transition: transform 0.3s ease;
}

.close-btn:hover {
  transform: rotate(90deg);
}

.chat-messages {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.message {
  display: flex;
  flex-direction: column;
  max-width: 80%;
}

.message.bot {
  align-self: flex-start;
}

.message.user {
  align-self: flex-end;
}

.message-content {
  padding: 12px 15px;
  border-radius: 15px;
  background: #f1f1f1;
  color: #333;
}

.message.bot .message-content {
  background: #f1f1f1;
  border-bottom-left-radius: 5px;
}

.message.user .message-content {
  background: #e63946;
  color: white;
  border-bottom-right-radius: 5px;
}

.message-time {
  font-size: 12px;
  color: #999;
  margin-top: 5px;
  align-self: flex-end;
}

.chat-input {
  padding: 15px;
  border-top: 1px solid #eee;
  display: flex;
  gap: 10px;
}

.chat-input input {
  flex: 1;
  padding: 12px 15px;
  border: 1px solid #ddd;
  border-radius: 25px;
  outline: none;
  font-size: 14px;
  transition: border-color 0.3s ease;
}

.chat-input input:focus {
  border-color: #ff6b6b;
}

.send-btn {
  width: 45px;
  height: 45px;
  border-radius: 50%;
  background: linear-gradient(135deg, #e63946, #ff4d5a);
  border: none;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.send-btn:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 15px rgba(230, 57, 70, 0.4);
}

/* Scrollbar Styles */
.chat-messages::-webkit-scrollbar {
  width: 6px;
}

.chat-messages::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.chat-messages::-webkit-scrollbar-thumb {
  background: #e63946;
  border-radius: 3px;
}

.chat-messages::-webkit-scrollbar-thumb:hover {
  background: #d62828;
}

/* Responsive Design */
@media (max-width: 576px) {
  .chat-window {
    width: calc(100% - 40px);
    height: calc(100% - 100px);
    bottom: 90px;
    right: 20px;
  }
}

.input-actions {
  display: flex;
  gap: 8px;
  padding: 0 10px;
}

.action-btn {
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}

.action-btn:hover {
  background: rgba(230, 57, 70, 0.1);
  color: #e63946;
}

.action-btn i {
  font-size: 18px;
}

.search-results {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 15px;
  margin-top: 10px;
}

.result-item {
  border: 1px solid #eee;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.result-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.result-item img {
  width: 100%;
  height: 150px;
  object-fit: cover;
}

.result-info {
  padding: 10px;
}

.result-info h4 {
  margin: 0;
  font-size: 14px;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.result-info .price {
  margin: 5px 0 0;
  font-size: 14px;
  color: #e63946;
  font-weight: bold;
}

/* Responsive adjustments */
@media (max-width: 576px) {
  .search-results {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
