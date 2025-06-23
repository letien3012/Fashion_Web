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
            <p>
              Xin chào! Tôi là trợ lý AI của bạn. Tôi có thể giúp gì cho bạn?
            </p>
          </div>
          <div class="message-time">{{ getCurrentTime() }}</div>
        </div>

        <div
          v-for="(msg, index) in messages"
          :key="index"
          :class="['message', msg.type]"
        >
          <div class="message-content">
            <p>{{ msg.content }}</p>
          </div>
          <div class="message-time">{{ msg.time }}</div>
        </div>

        <div v-if="isLoading" class="message bot">
          <div class="message-content">
            <p>Đang xử lý...</p>
          </div>
          <div class="message-time">{{ getCurrentTime() }}</div>
        </div>

        <!-- Add product display section -->
        <div v-if="currentProduct" class="product-preview">
          <div class="product-image">
            <img
              :src="getImageUrl(currentProduct.image)"
              :alt="currentProduct.name"
              @error="handleImageError"
              @load="handleImageLoad"
            />
            <div v-if="imageError" class="image-error">
              <i class="fas fa-image"></i>
              <span>Không thể tải ảnh</span>
            </div>
          </div>
          <div class="product-info">
            <h4>{{ currentProduct.name }}</h4>
            <p class="price">
              {{ formatPrice(currentProduct.variants[0].price) }}
            </p>
            <router-link
              :to="'/product-detail/' + currentProduct._id"
              class="view-details"
            >
              Xem chi tiết
            </router-link>
          </div>
        </div>

        <div v-if="foundProducts.length > 0" class="related-products">
          <h5 class="related-title">
            <i class="fas fa-box-open"></i>
            Sản phẩm tìm được
          </h5>
          <div class="related-products-list">
            <div
              v-for="product in foundProducts"
              :key="product._id"
              class="related-product-item"
            >
              <div class="related-product-image">
                <img
                  :src="getImageUrl(product.image)"
                  :alt="product.name"
                  @error="handleImageError"
                  @load="handleImageLoad"
                />
              </div>
              <div class="related-product-info">
                <h6>{{ product.name }}</h6>
                <p class="related-price">
                  {{ formatPrice(product.variants[0].price) }}
                </p>
                <router-link
                  :to="'/product-detail/' + product._id"
                  class="related-view-details"
                >
                  Xem chi tiết
                </router-link>
              </div>
            </div>
          </div>
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
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// API endpoints
const API_BASE_URL = "http://localhost:3005/api";
const ENDPOINTS = {
  products: `${API_BASE_URL}/products`,
  productCatalogues: `${API_BASE_URL}/productCatalogues`,
  attributes: `${API_BASE_URL}/attributes`,
  attributeCatalogues: `${API_BASE_URL}/attributeCatalogues`,
  promotions: `${API_BASE_URL}/promotions`,
};

// Fetch data from backend
async function fetchData(endpoint) {
  try {
    const response = await fetch(endpoint);
    if (!response.ok) throw new Error("Network response was not ok");
    return await response.json();
  } catch (error) {
    console.error("Error fetching data:", error);
    return null;
  }
}

// Get all necessary data for the chatbot
async function getChatbotData() {
  const [products, catalogues, attributes, attributeCatalogues, promotions] =
    await Promise.all([
      fetchData(ENDPOINTS.products),
      fetchData(ENDPOINTS.productCatalogues),
      fetchData(ENDPOINTS.attributes),
      fetchData(ENDPOINTS.attributeCatalogues),
      fetchData(ENDPOINTS.promotions),
    ]);

  return {
    products: products?.data || [],
    catalogues: catalogues?.data || [],
    attributes: attributes?.data || [],
    attributeCatalogues: attributeCatalogues?.data || [],
    promotions: promotions?.data || [],
  };
}

// Product categories and attributes structure
const productStructure = {
  categories: {
    name: "Danh mục sản phẩm",
    description: "Các danh mục sản phẩm chính của cửa hàng",
    attributes: {
      name: "Thuộc tính sản phẩm",
      description: "Các thuộc tính như màu sắc, kích thước, form dáng",
    },
  },
  products: {
    fields: [
      "code",
      "name",
      "content",
      "description",
      "image",
      "album",
      "variants.sku",
      "variants.price",
      "variants.image",
      "variants.attributeId1",
      "variants.attributeId2",
    ],
  },
  promotions: {
    types: ["product", "voucher"],
    fields: [
      "code",
      "name",
      "description",
      "discount",
      "voucher_condition.min_order_value",
      "voucher_condition.max_discount",
      "start_date",
      "end_date",
    ],
  },
};

const prompt = `
Bạn là một trợ lý bán hàng online thân thiện và chuyên nghiệp của cửa hàng thời trang ABC Fashion. Nhiệm vụ của bạn là giới thiệu sản phẩm, tư vấn theo nhu cầu, và thông báo giá, biến thể, khuyến mãi nếu có.

Cấu trúc dữ liệu sản phẩm:
- Mỗi sản phẩm có: mã sản phẩm, tên, mô tả, hình ảnh chính và album ảnh
- Các biến thể (variants) bao gồm: mã SKU, giá, hình ảnh và 2 thuộc tính tùy chỉnh
- Thuộc tính sản phẩm được phân loại theo danh mục thuộc tính

Chương trình khuyến mãi:
- Khuyến mãi sản phẩm: áp dụng cho sản phẩm cụ thể
- Khuyến mãi voucher: có điều kiện giá trị đơn hàng tối thiểu và giảm giá tối đa
- Thời gian áp dụng: có ngày bắt đầu và kết thúc

Cách bạn cần trả lời:

1. Khi người dùng hỏi về sản phẩm:
   - Kiểm tra thông tin sản phẩm từ database
   - Hiển thị giá, biến thể và khuyến mãi nếu có
   - Gợi ý sản phẩm liên quan

2. Khi người dùng hỏi về khuyến mãi:
   - Kiểm tra các chương trình khuyến mãi đang áp dụng
   - Thông báo điều kiện và thời gian áp dụng
   - Gợi ý sản phẩm phù hợp với khuyến mãi

3. Khi người dùng tìm kiếm:
   - Sử dụng từ khóa để tìm sản phẩm phù hợp
   - Hiển thị kết quả theo danh mục
   - Gợi ý thêm các tùy chọn lọc

Ví dụ trả lời:
Người dùng: Mình đang tìm áo thun nam màu trắng size L có khuyến mãi gì không?
Bạn trả lời: Dạ, để em kiểm tra thông tin sản phẩm và khuyến mãi cho anh/chị ạ. [Kiểm tra database và trả lời dựa trên thông tin thực tế]

Từ giờ, hãy trả lời như một nhân viên bán hàng thực thụ của cửa hàng ABC Fashion, sử dụng dữ liệu thực tế từ hệ thống.
`;

export default {
  name: "ChatBot",
  data() {
    return {
      isOpen: false,
      message: "",
      hasNewMessage: false,
      showSearchResults: false,
      messages: [],
      isLoading: false,
      chatbotData: null,
      currentProduct: null,
      imageError: false,
      foundProducts: [],
    };
  },
  async created() {
    // Fetch initial data when component is created
    this.chatbotData = await getChatbotData();
  },
  methods: {
    toggleChat() {
      this.isOpen = !this.isOpen;
      if (this.isOpen) {
        this.hasNewMessage = false;
      }
    },
    async sendMessage() {
      if (this.message.trim()) {
        const userMessage = this.message.trim();
        this.message = "";
        this.messages.push({
          type: "user",
          content: userMessage,
          time: this.getCurrentTime(),
        });

        this.isLoading = true;
        try {
          // Refresh data before sending to ensure latest information
          this.chatbotData = await getChatbotData();

          const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                contents: [
                  {
                    parts: [
                      {
                        text: `Dữ liệu hiện tại của cửa hàng:
                        Sản phẩm: ${JSON.stringify(this.chatbotData.products)}
                        Danh mục: ${JSON.stringify(this.chatbotData.catalogues)}
                        Thuộc tính: ${JSON.stringify(
                          this.chatbotData.attributes
                        )}
                        Danh mục thuộc tính: ${JSON.stringify(
                          this.chatbotData.attributeCatalogues
                        )}
                        Khuyến mãi: ${JSON.stringify(
                          this.chatbotData.promotions
                        )}

                        Người dùng: ${userMessage}`,
                      },
                    ],
                  },
                ],
              }),
            }
          );

          const data = await response.json();

          if (
            data.candidates &&
            data.candidates[0]?.content?.parts?.[0]?.text
          ) {
            let botResponse = data.candidates[0].content.parts[0].text;
            botResponse = this.cleanBotResponse(botResponse);
            const foundProducts = this.checkProductMention(userMessage);
            this.foundProducts = foundProducts;

            if (foundProducts.length > 0) {
              // Không push message bot, chỉ hiển thị danh sách sản phẩm
              this.isLoading = false;
              this.message = "";
              this.$nextTick(() => {
                const chatMessages = this.$refs.chatMessages;
                chatMessages.scrollTop = chatMessages.scrollHeight;
              });
              return;
            }

            // Nếu không có sản phẩm, vẫn push message bot như cũ
            this.messages.push({
              type: "bot",
              content: botResponse,
              time: this.getCurrentTime(),
            });
          } else {
            throw new Error("Invalid response format");
          }
        } catch (error) {
          console.error("Error getting response from Gemini:", error);
          this.messages.push({
            type: "bot",
            content: "Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại sau.",
            time: this.getCurrentTime(),
          });
        }

        this.isLoading = false;
        this.message = "";

        // Scroll to bottom
        this.$nextTick(() => {
          const chatMessages = this.$refs.chatMessages;
          chatMessages.scrollTop = chatMessages.scrollHeight;
        });
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
    checkProductMention(message) {
      if (!this.chatbotData?.products) {
        return [];
      }
      const lowerMessage = message.toLowerCase().trim();
      if (!lowerMessage) {
        return [];
      }
      return this.chatbotData.products.filter((product) => {
        const productName = product.name.toLowerCase();
        const productCode = product.code.toLowerCase();
        return (
          productName.includes(lowerMessage) ||
          productCode.includes(lowerMessage)
        );
      });
    },
    getImageUrl(imagePath) {
      console.log("Original image path:", imagePath);
      if (!imagePath) {
        console.log("No image path provided");
        return "";
      }
      if (imagePath.startsWith("http")) {
        console.log("Using full URL:", imagePath);
        return imagePath;
      }
      const fullUrl = `http://localhost:3005${imagePath}`;
      return fullUrl;
    },
    handleImageError(e) {
      console.error("Image failed to load:", e);
      this.imageError = true;
      // Set a fallback image
      e.target.src = "https://via.placeholder.com/100x100?text=No+Image";
    },
    handleImageLoad(e) {
      this.imageError = false;
    },
    cleanBotResponse(text) {
      // Xóa dấu *, **, và khoảng trắng đầu dòng
      return text
        .replace(/\*\*/g, "") // bỏ **
        .replace(/^\s*\*\s?/gm, "") // bỏ * đầu dòng và khoảng trắng
        .replace(/\n{2,}/g, "\n"); // bỏ dòng trống thừa
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

.message-content p {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
}

.message.bot .message-content.loading {
  background: #f1f1f1;
}

.product-preview {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  margin: 15px 0;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  display: flex;
  gap: 20px;
  align-items: center;
  animation: productFadeIn 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes productFadeIn {
  from {
    opacity: 0;
    transform: translateY(30px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.product-image {
  width: 150px;
  height: 150px;
  position: relative;
  overflow: hidden;
  border-radius: 10px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.13);
  flex-shrink: 0;
  background: #f8f8f8;
  display: flex;
  align-items: center;
  justify-content: center;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.product-image img:hover {
  transform: scale(1.07);
}

.product-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 6px;
}

.product-info h4 {
  margin: 0 0 4px 0;
  font-size: 15px;
  color: #333;
  font-weight: 500;
  line-height: 1.2;
  letter-spacing: 0.01em;
}

.price {
  color: #e63946;
  font-weight: 600;
  font-size: 14px;
  margin: 2px 0 6px 0;
}

.view-details {
  display: inline-block;
  padding: 5px 12px;
  background: linear-gradient(135deg, #e63946, #ff4d5a);
  color: white;
  text-decoration: none;
  border-radius: 5px;
  font-size: 12px;
  font-weight: 500;
  border: none;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(230, 57, 70, 0.13);
  transition: background 0.2s, transform 0.2s;
}

.view-details:hover {
  background: linear-gradient(135deg, #ff4d5a, #e63946);
  transform: translateY(-2px) scale(1.05);
}

.image-error {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #f8f9fa;
  color: #666;
  font-size: 12px;
}

.image-error i {
  font-size: 28px;
  margin-bottom: 8px;
  color: #e63946;
}

.related-products {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  margin: 15px 0;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  animation: productFadeIn 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes productFadeIn {
  from {
    opacity: 0;
    transform: translateY(30px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.related-title {
  margin: 0 0 10px 0;
  font-size: 18px;
  color: #333;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 10px;
}

.related-title i {
  font-size: 20px;
}

.related-products-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 15px;
}

.related-product-item {
  border: 1px solid #eee;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.related-product-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.related-product-image {
  width: 100%;
  height: 150px;
  position: relative;
  overflow: hidden;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.13);
  flex-shrink: 0;
  background: #f8f8f8;
  display: flex;
  align-items: center;
  justify-content: center;
}

.related-product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.related-product-image img:hover {
  transform: scale(1.07);
}

.related-product-info {
  padding: 10px;
}

.related-product-info h6 {
  margin: 0 0 4px 0;
  font-size: 14px;
  color: #333;
  font-weight: 500;
  line-height: 1.2;
  letter-spacing: 0.01em;
}

.related-price {
  color: #e63946;
  font-weight: 600;
  font-size: 14px;
  margin: 2px 0 6px 0;
}

.related-view-details {
  display: inline-block;
  padding: 5px 12px;
  background: linear-gradient(135deg, #e63946, #ff4d5a);
  color: white;
  text-decoration: none;
  border-radius: 5px;
  font-size: 12px;
  font-weight: 500;
  border: none;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(230, 57, 70, 0.13);
  transition: background 0.2s, transform 0.2s;
}

.related-view-details:hover {
  background: linear-gradient(135deg, #ff4d5a, #e63946);
  transform: translateY(-2px) scale(1.05);
}
</style>
