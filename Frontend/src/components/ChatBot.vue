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
          <template v-if="msg.type === 'user' || msg.type === 'bot'">
            <div class="message-content">
              <p>{{ msg.content }}</p>
            </div>
            <div class="message-time">{{ msg.time }}</div>
          </template>
          <template v-else-if="msg.type === 'product-list'">
            <div class="related-products">
              <h5 class="related-title">
                <i class="fas fa-box-open"></i>
                Kết quả cho:
                <span style="font-weight: normal">{{ msg.query }}</span>
                <span style="font-size: 12px; color: #888; margin-left: 8px">{{
                  msg.time
                }}</span>
              </h5>
              <div class="related-products-list">
                <div
                  v-for="product in msg.products"
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
          </template>
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
  const promotions = await fetchData(ENDPOINTS.promotions);
  return {
    promotions: promotions?.data || [],
  };
}

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
      foundProductsHistory: [],
      userQuestionEmbedding: null,
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
        await this.handleUserMessage();
      }
    },
    async handleUserMessage() {
      const userMessage = this.message.trim();
      if (!userMessage) return;
      this.message = "";
      this.messages.push({
        type: "user",
        content: userMessage,
        time: this.getCurrentTime(),
      });
      this.isLoading = true;
      try {
        // Lấy embedding cho câu hỏi từ backend
        const embeddingRes = await fetch("http://localhost:3005/api/rag/embedding", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question: userMessage })
        });
        const embeddingData = await embeddingRes.json();
        if (embeddingData.embedding) {
          this.userQuestionEmbedding = embeddingData.embedding;
        }
        // Lấy sản phẩm liên quan nhất từ backend (tối đa 5)
        let relatedProducts = [];
        try {
          const retrieveRes = await fetch("http://localhost:3005/api/rag/retrieve", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ embedding: this.userQuestionEmbedding })
          });
          const retrieveData = await retrieveRes.json();
          if (Array.isArray(retrieveData.products)) {
            relatedProducts = retrieveData.products.slice(0, 5);
          }
        } catch (err) {
          console.error("Error retrieving related products:", err);
        }
        // 1. Phân tích intent
        const { intent, entity } = this.analyzeIntent(userMessage);
        // 2. Truy xuất dữ liệu thực tế (giữ lại logic cũ cho khuyến mãi, thuộc tính...)
        let retrievedData = await this.retrieveData(intent, entity);
        // Gộp sản phẩm liên quan từ RAG nếu có
        if (relatedProducts.length > 0) {
          retrievedData.products = relatedProducts;
        }
        // 3. Tạo prompt RAG
        const ragPrompt = this.generateRAGPrompt(userMessage, retrievedData);
        console.log(ragPrompt)
        // 4. Gọi LLM sinh câu trả lời
        const botResponse = await this.callLLM(ragPrompt);
        // 5. Hiển thị kết quả
        this.messages.push({
          type: "bot",
          content: botResponse,
          time: this.getCurrentTime(),
        });
        // Nếu có sản phẩm, show danh sách
        if (retrievedData.products?.length) {
          this.messages.push({
            type: "product-list",
            products: retrievedData.products,
            query: userMessage,
            time: this.getCurrentTime(),
          });
        }
      } catch (error) {
        console.error("RAG ChatBot error:", error);
        this.messages.push({
          type: "bot",
          content: "Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại sau.",
          time: this.getCurrentTime(),
        });
      }
      this.isLoading = false;
      this.$nextTick(() => {
        const chatMessages = this.$refs.chatMessages;
        chatMessages.scrollTop = chatMessages.scrollHeight;
      });
    },
    analyzeIntent(message) {
      // Đơn giản: kiểm tra từ khóa để xác định intent
      const msg = message.toLowerCase();
      if (msg.includes("khuyến mãi") || msg.includes("voucher")) {
        return { intent: "promotion", entity: {} };
      }
      if (msg.match(/\d+(k|tr|nghìn|triệu|vnd|₫)/) || msg.includes("giá")) {
        // Có giá trị giá
        return { intent: "search_product_by_price", entity: { priceInfo: this.extractPriceInfo(msg) } };
      }
      if (msg.includes("size") || msg.includes("màu") || msg.includes("màu sắc")) {
        return { intent: "search_product_by_attribute", entity: { attributeInfo: this.extractAttributeInfo(msg) } };
      }
      // Mặc định: tìm sản phẩm theo từ khóa
      return { intent: "search_product", entity: { keyword: msg } };
    },
    async retrieveData(intent, entity) {
      // Lấy lại dữ liệu mới nhất
      this.chatbotData = await getChatbotData();
      if (intent === "promotion") {
        return { promotions: this.chatbotData.promotions };
      }
      // Các intent còn lại không trả về products nữa, chỉ dùng sản phẩm từ retrieve
      return {};
    },
    generateRAGPrompt(userMessage, retrievedData) {
      let context = "";
      // Thông tin sản phẩm liên quan
      if (retrievedData.products && retrievedData.products.length > 0) {
        context += retrievedData.products.map(product => {
          let desc = product.name ? `Sản phẩm: ${product.name}. ` : "";
          if (product.description) desc += `Mô tả: ${product.description}. `;
          if (product.content) desc += `Thông tin chi tiết: ${product.content}. `;
          if (product.catalogueId && product.catalogueId.name) desc += `Danh mục: ${product.catalogueId.name}. `;
          if (product.variants && product.variants.length > 0) {
            desc += `Các biến thể sản phẩm: `;
            desc += product.variants.map(variant => {
              let variantInfo = "";
              if (variant.attributeId1 && variant.attributeId1.name) variantInfo += variant.attributeId1.name;
              if (variant.attributeId2 && variant.attributeId2.name) variantInfo += ` ${variant.attributeId2.name}`;
              if (variant.price) variantInfo += ` giá ${variant.price.toLocaleString('vi-VN')} VNĐ`;
              return variantInfo.trim();
            }).filter(Boolean).join('; ') + ". ";
          }
          return desc.trim();
        }).join('\n');
      }
      // Thông tin khuyến mãi
      if (retrievedData.promotions && retrievedData.promotions.length > 0) {
        if (context) context += '\n';
        context += retrievedData.promotions.map(promo => {
          let promoDesc = promo.name ? `Khuyến mãi: ${promo.name}. ` : "";
          if (promo.description) promoDesc += `Mô tả: ${promo.description}. `;
          if (promo.discount) promoDesc += `Giảm giá: ${promo.discount}. `;
          if (promo.voucher_condition) {
            if (promo.voucher_condition.min_order_value) promoDesc += `Đơn tối thiểu: ${promo.voucher_condition.min_order_value}. `;
            if (promo.voucher_condition.max_discount) promoDesc += `Giảm tối đa: ${promo.voucher_condition.max_discount}. `;
          }
          if (promo.start_date) promoDesc += `Bắt đầu: ${promo.start_date}. `;
          if (promo.end_date) promoDesc += `Kết thúc: ${promo.end_date}. `;
          return promoDesc.trim();
        }).join('\n');
      }
      return `Bạn là một trợ lý bán hàng chuyên nghiệp, thân thiện và nhiệt tình.\nDưới đây là danh sách sản phẩm và khuyến mãi có thể liên quan đến câu hỏi của khách hàng:\n${context}\n\nCâu hỏi của khách hàng: "${userMessage}"\n\nHãy làm theo hướng dẫn sau:\n- Nếu không có thông tin sản phẩm và khuyến mãi thì trả lời là không có thông tin.\n- Nếu câu hỏi liên quan đến sản phẩm, khuyến mãi hãy trả lời tự nhiên và thân thiện trước, giống như đang nói chuyện với khách.\n- Nếu câu hỏi không liên quan đến sản phẩm, khuyến mãi hãy trả lời hợp lý và tự nhiên nhất có thể.\nLuôn ưu tiên trải nghiệm thân thiện và dễ hiểu cho khách hàng.`;
    },
    async callLLM(prompt) {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
        }
      );
      const data = await response.json();
      if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
        return this.cleanBotResponse(data.candidates[0].content.parts[0].text);
      }
      return "Xin lỗi, tôi chưa có dữ liệu phù hợp để trả lời.";
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
      // Không còn dùng nữa, trả về []
      return [];
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
    async debugLog(message, data) {
      try {
        await fetch(ENDPOINTS.debug, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ message, data }),
        });
      } catch (error) {
        console.error("Error sending debug log:", error);
      }
    },
    extractAttributeInfo(message) {
      // Các từ khóa về size
      const sizeKeywords = {
        xs: "XS",
        s: "S",
        m: "M",
        l: "L",
        xl: "XL",
        xxl: "XXL",
        xxxl: "XXXL",
        "size xs": "XS",
        "size s": "S",
        "size m": "M",
        "size l": "L",
        "size xl": "XL",
        "size xxl": "XXL",
        "size xxxl": "XXXL",
      };

      // Các từ khóa về màu sắc
      const colorKeywords = {
        đen: "Đen",
        trắng: "Trắng",
        xanh: "Xanh",
        "xanh dương": "Xanh dương",
        "xanh lá": "Xanh lá",
        đỏ: "Đỏ",
        vàng: "Vàng",
        hồng: "Hồng",
        tím: "Tím",
        cam: "Cam",
        nâu: "Nâu",
        xám: "Xám",
        "xanh navy": "Xanh navy",
        "xanh đen": "Xanh đen",
      };

      const words = message.split(/\s+/);
      const foundSizes = [];
      const foundColors = [];

      // Tìm size và màu trong câu
      for (let i = 0; i < words.length; i++) {
        const word = words[i];

        // Kiểm tra size
        if (sizeKeywords[word]) {
          foundSizes.push(sizeKeywords[word]);
        }

        // Kiểm tra màu
        if (colorKeywords[word]) {
          foundColors.push(colorKeywords[word]);
        }

        // Kiểm tra cụm từ 2 từ (ví dụ: "size s", "xanh dương")
        if (i < words.length - 1) {
          const twoWordPhrase = `${word} ${words[i + 1]}`;
          if (sizeKeywords[twoWordPhrase]) {
            foundSizes.push(sizeKeywords[twoWordPhrase]);
            i++; // Bỏ qua từ tiếp theo vì đã xử lý
          }
          if (colorKeywords[twoWordPhrase]) {
            foundColors.push(colorKeywords[twoWordPhrase]);
            i++; // Bỏ qua từ tiếp theo vì đã xử lý
          }
        }
      }

      return {
        sizes: foundSizes,
        colors: foundColors,
        hasAttribute: foundSizes.length > 0 || foundColors.length > 0,
      };
    },
    calculateAttributeScore(product, attributeInfo) {
      let score = 0;
      const { sizes, colors } = attributeInfo;

      // Debug log để kiểm tra
      this.debugLog("Attribute Search Debug", {
        productName: product.name,
        sizes,
        colors,
        variants: product.variants?.length || 0,
      });

      // Kiểm tra các variant của sản phẩm
      if (product.variants && product.variants.length > 0) {
        for (const variant of product.variants) {
          let variantScore = 0;

          // Kiểm tra tất cả thuộc tính của variant
          const variantAttributes = [];

          if (variant.attributeId1 && this.chatbotData.attributes) {
            const attribute1 = this.chatbotData.attributes.find(
              (attr) => attr._id === variant.attributeId1
            );
            if (attribute1) {
              variantAttributes.push(attribute1);
            }
          }

          if (variant.attributeId2 && this.chatbotData.attributes) {
            const attribute2 = this.chatbotData.attributes.find(
              (attr) => attr._id === variant.attributeId2
            );
            if (attribute2) {
              variantAttributes.push(attribute2);
            }
          }

          // Debug log thuộc tính của variant
          this.debugLog("Variant Attributes", {
            productName: product.name,
            variantSku: variant.sku,
            attributes: variantAttributes.map((attr) => ({
              id: attr._id,
              name: attr.name,
              catalogueId: attr.attributeCatalogueId,
            })),
          });

          // Kiểm tra từng thuộc tính
          for (const attr of variantAttributes) {
            const attrValue = attr.name.toLowerCase();

            // Kiểm tra size
            if (sizes.length > 0) {
              const sizeMatch = sizes.some((size) => {
                const sizeLower = size.toLowerCase();
                // Kiểm tra chính xác hoặc chứa từ khóa
                return attrValue === sizeLower || attrValue.includes(sizeLower);
              });
              if (sizeMatch) {
                variantScore += 10; // Tăng điểm cho size chính xác
                this.debugLog("Size Match Found", {
                  productName: product.name,
                  requestedSize: sizes,
                  foundAttribute: attr.name,
                });
              }
            }

            // Kiểm tra màu
            if (colors.length > 0) {
              const colorMatch = colors.some((color) => {
                const colorLower = color.toLowerCase();
                // Kiểm tra chính xác hoặc chứa từ khóa
                return (
                  attrValue === colorLower || attrValue.includes(colorLower)
                );
              });
              if (colorMatch) {
                variantScore += 10; // Tăng điểm cho màu chính xác
                this.debugLog("Color Match Found", {
                  productName: product.name,
                  requestedColor: colors,
                  foundAttribute: attr.name,
                });
              }
            }
          }

          // Lấy điểm cao nhất từ các variant
          score = Math.max(score, variantScore);
        }
      }

      this.debugLog("Final Attribute Score", {
        productName: product.name,
        finalScore: score,
      });

      return score;
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
    transform: translateY(30px) scale(0.94);
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
