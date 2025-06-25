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
  products: `${API_BASE_URL}/products`,
  productCatalogues: `${API_BASE_URL}/productCatalogues`,
  attributes: `${API_BASE_URL}/attributes`,
  attributeCatalogues: `${API_BASE_URL}/attributeCatalogues`,
  promotions: `${API_BASE_URL}/promotions`,
  debug: `${API_BASE_URL}/debug/log`,
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

2. Khi người dùng hỏi về giá cả:
   - Nếu hỏi "có áo nào 100k không?" → tìm sản phẩm có giá khoảng 100,000 VND
   - Nếu hỏi "áo dưới 200k" → tìm sản phẩm có giá dưới 200,000 VND
   - Nếu hỏi "áo từ 150k đến 300k" → tìm sản phẩm trong khoảng giá đó
   - Luôn trả lời bằng tiếng Việt, thân thiện và hữu ích

3. Khi người dùng hỏi về khuyến mãi:
   - Kiểm tra các chương trình khuyến mãi đang áp dụng
   - Thông báo điều kiện và thời gian áp dụng
   - Gợi ý sản phẩm phù hợp với khuyến mãi

4. Khi người dùng tìm kiếm:
   - Sử dụng từ khóa để tìm sản phẩm phù hợp
   - Hiển thị kết quả theo danh mục
   - Gợi ý thêm các tùy chọn lọc

Ví dụ trả lời:
Người dùng: "Có áo nào 100k không?"
Bạn trả lời: "Dạ, để em kiểm tra các sản phẩm có giá khoảng 100,000 VND cho anh/chị ạ. [Hiển thị danh sách sản phẩm phù hợp]"

Người dùng: "Áo dưới 200k có gì?"
Bạn trả lời: "Dạ, em có một số sản phẩm áo với giá dưới 200,000 VND, anh/chị xem qua nhé! [Hiển thị danh sách sản phẩm]"

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
      foundProductsHistory: [],
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

          // Kiểm tra xem có phải câu hỏi về giá không
          const priceInfo = this.extractPriceInfo(userMessage.toLowerCase());
          const foundProducts = this.checkProductMention(userMessage);

          // Kiểm tra xem có phải câu hỏi về thuộc tính (size, màu) không
          const attributeInfo = this.extractAttributeInfo(
            userMessage.toLowerCase()
          );

          // Debug log để kiểm tra
          this.debugLog("ChatBot Debug", {
            userMessage,
            isBestSellingQuery: false,
            priceInfo,
            attributeInfo,
            bestSellingData: this.chatbotData.bestSelling,
            productsData: this.chatbotData.products?.length || 0,
          });

          // Nếu là câu hỏi về sản phẩm bán chạy, xử lý trước
          if (false) {
            let bestSellingProducts = [];

            // Sử dụng dữ liệu best-selling nếu có
            if (
              this.chatbotData.bestSelling &&
              this.chatbotData.bestSelling.length > 0
            ) {
              bestSellingProducts = this.chatbotData.bestSelling.slice(0, 3);
            } else {
              // Fallback: sắp xếp theo view_count nếu không có dữ liệu best-selling
              bestSellingProducts = this.chatbotData.products
                .sort((a, b) => (b.view_count || 0) - (a.view_count || 0))
                .slice(0, 3);
            }

            if (bestSellingProducts.length > 0) {
              const smartResponse =
                this.generateBestSellingResponse(bestSellingProducts);

              this.messages.push({
                type: "bot",
                content: smartResponse,
                time: this.getCurrentTime(),
              });

              this.messages.push({
                type: "product-list",
                products: bestSellingProducts,
                query: userMessage,
                time: this.getCurrentTime(),
              });

              this.foundProductsHistory.push({
                products: bestSellingProducts,
                query: userMessage,
                time: this.getCurrentTime(),
              });

              this.isLoading = false;
              this.$nextTick(() => {
                const chatMessages = this.$refs.chatMessages;
                chatMessages.scrollTop = chatMessages.scrollHeight;
              });
              return;
            }
          }

          // Nếu có sản phẩm tìm thấy và có thông tin về thuộc tính, tạo câu trả lời thông minh
          if (foundProducts.length > 0 && attributeInfo.hasAttribute) {
            const smartResponse = this.generateAttributeResponse(
              userMessage,
              foundProducts,
              attributeInfo
            );

            this.messages.push({
              type: "bot",
              content: smartResponse,
              time: this.getCurrentTime(),
            });

            this.messages.push({
              type: "product-list",
              products: foundProducts,
              query: userMessage,
              time: this.getCurrentTime(),
            });

            this.foundProductsHistory.push({
              products: foundProducts,
              query: userMessage,
              time: this.getCurrentTime(),
            });

            this.isLoading = false;
            this.$nextTick(() => {
              const chatMessages = this.$refs.chatMessages;
              chatMessages.scrollTop = chatMessages.scrollHeight;
            });
            return;
          }

          // Nếu có sản phẩm tìm thấy và có thông tin về giá, tạo câu trả lời thông minh
          if (foundProducts.length > 0 && priceInfo.hasPriceInfo) {
            const smartResponse = this.generatePriceResponse(
              userMessage,
              foundProducts,
              priceInfo
            );

            this.messages.push({
              type: "bot",
              content: smartResponse,
              time: this.getCurrentTime(),
            });

            this.messages.push({
              type: "product-list",
              products: foundProducts,
              query: userMessage,
              time: this.getCurrentTime(),
            });

            this.foundProductsHistory.push({
              products: foundProducts,
              query: userMessage,
              time: this.getCurrentTime(),
            });

            this.isLoading = false;
            this.$nextTick(() => {
              const chatMessages = this.$refs.chatMessages;
              chatMessages.scrollTop = chatMessages.scrollHeight;
            });
            return;
          }

          // Nếu chỉ có sản phẩm tìm thấy (không có thông tin giá cụ thể)
          if (foundProducts.length > 0) {
            this.messages.push({
              type: "product-list",
              products: foundProducts,
              query: userMessage,
              time: this.getCurrentTime(),
            });
            this.foundProductsHistory.push({
              products: foundProducts,
              query: userMessage,
              time: this.getCurrentTime(),
            });
            this.isLoading = false;
            this.$nextTick(() => {
              const chatMessages = this.$refs.chatMessages;
              chatMessages.scrollTop = chatMessages.scrollHeight;
            });
            return;
          }

          // Nếu không có sản phẩm, sử dụng AI để trả lời
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
                        Sản phẩm bán chạy: ${JSON.stringify(
                          this.chatbotData.bestSelling
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

      // Tách từ khóa tìm kiếm thành các từ riêng lẻ
      const searchTerms = lowerMessage.split(/\s+/);

      // Kiểm tra xem có phải câu hỏi về giá không
      const priceInfo = this.extractPriceInfo(lowerMessage);

      // Kiểm tra xem có phải câu hỏi về thuộc tính (size, màu) không
      const attributeInfo = this.extractAttributeInfo(lowerMessage);

      // Debug log từ khóa tìm kiếm
      this.debugLog("Từ khóa tìm kiếm", {
        searchTerms,
        priceInfo,
        attributeInfo,
      });

      let results = this.chatbotData.products.map((product) => {
        let score = 0;
        const productName = product.name.toLowerCase();
        const productCode = product.code.toLowerCase();
        const productDesc = (product.description || "").toLowerCase();
        const productPrice = product.variants?.[0]?.price || 0;

        // Nếu có thông tin về giá, ưu tiên tìm theo giá
        if (priceInfo) {
          const { minPrice, maxPrice, targetPrice } = priceInfo;

          if (targetPrice) {
            // Tìm sản phẩm có giá gần với giá mục tiêu
            const priceDiff = Math.abs(productPrice - targetPrice);
            const priceScore = Math.max(0, 10 - Math.floor(priceDiff / 10000)); // Giảm điểm theo độ chênh lệch giá
            score += priceScore;
          } else if (minPrice !== null && maxPrice !== null) {
            // Tìm sản phẩm trong khoảng giá
            if (productPrice >= minPrice && productPrice <= maxPrice) {
              score += 8;
            }
          } else if (minPrice !== null) {
            // Tìm sản phẩm có giá >= minPrice
            if (productPrice >= minPrice) {
              score += 6;
            }
          } else if (maxPrice !== null) {
            // Tìm sản phẩm có giá <= maxPrice
            if (productPrice <= maxPrice) {
              score += 6;
            }
          }
        }

        // Nếu có thông tin về thuộc tính, ưu tiên tìm theo thuộc tính
        if (attributeInfo && attributeInfo.hasAttribute) {
          const attributeScore = this.calculateAttributeScore(
            product,
            attributeInfo
          );
          score += attributeScore;
        }

        // Tính điểm cho mỗi từ khóa
        searchTerms.forEach((term) => {
          if (productName.includes(term)) {
            score += 3;
            if (productName.startsWith(term)) score += 2;
          }
          if (productCode.includes(term)) score += 2;
          if (productDesc.includes(term)) score += 1;

          if (product.catalogueId && this.chatbotData.catalogues) {
            const catalogue = this.chatbotData.catalogues.find(
              (cat) => cat._id === product.catalogueId
            );
            if (catalogue && catalogue.name.toLowerCase().includes(term))
              score += 2;
          }
        });

        return { ...product, score };
      });

      // Debug log tất cả sản phẩm có điểm > 0 trước khi sắp xếp
      const productsWithScore = results.filter((p) => p.score > 0);
      this.debugLog(
        "Sản phẩm tìm thấy trước khi sắp xếp",
        productsWithScore.map((p) => ({
          name: p.name,
          score: p.score,
          price: p.variants?.[0]?.price || 0,
          sold: p.sold_count || 0,
          views: p.view_count || 0,
        }))
      );

      // Sắp xếp và lọc kết quả
      results = productsWithScore
        .sort((a, b) => {
          // Ưu tiên điểm thuộc tính trước
          if (b.score !== a.score) {
            return b.score - a.score;
          }

          // Nếu điểm bằng nhau, ưu tiên theo số lượng bán
          if ((b.sold_count || 0) !== (a.sold_count || 0)) {
            return (b.sold_count || 0) - (a.sold_count || 0);
          }

          // Cuối cùng ưu tiên theo lượt xem
          return (b.view_count || 0) - (a.view_count || 0);
        })
        .slice(0, 3);

      // Debug log kết quả cuối cùng
      this.debugLog(
        "Kết quả cuối cùng sau khi sắp xếp",
        results.map((p, i) => ({
          rank: i + 1,
          name: p.name,
          score: p.score,
          price: p.variants?.[0]?.price || 0,
          sold: p.sold_count || 0,
          views: p.view_count || 0,
        }))
      );

      return results;
    },
    extractPriceInfo(message) {
      // Các pattern để nhận diện giá
      const pricePatterns = [
        // "100k", "200k", "1tr", "2tr"
        {
          regex: /(\d+)(k|tr)/g,
          multiplier: (unit) => (unit === "k" ? 1000 : 1000000),
        },
        // "100 nghìn", "200 nghìn", "1 triệu", "2 triệu"
        {
          regex: /(\d+)\s*(nghìn|triệu)/g,
          multiplier: (unit) => (unit === "nghìn" ? 1000 : 1000000),
        },
        // "100.000", "200.000" (nếu có dấu chấm, không đơn vị, mặc định là nghìn)
        { regex: /(\d{1,3}(?:\.\d{3})*)/g, multiplier: 1 },
        // "100 000", "200 000" (nếu có khoảng trắng, không đơn vị, mặc định là nghìn)
        { regex: /(\d{1,3}(?:\s\d{3})*)/g, multiplier: 1 },
      ];

      let minPrice = null;
      let maxPrice = null;
      let targetPrice = null;

      // Tìm các từ khóa chỉ định khoảng giá
      const rangeKeywords = {
        dưới: "below",
        trên: "above",
        từ: "from",
        đến: "to",
        khoảng: "around",
        tầm: "around",
      };

      const words = message.split(/\s+/);
      let currentRange = null;

      for (let i = 0; i < words.length; i++) {
        const word = words[i];

        // Kiểm tra từ khóa khoảng giá
        if (rangeKeywords[word]) {
          currentRange = rangeKeywords[word];
          continue;
        }

        // Nếu là số không có đơn vị, mặc định là nghìn
        if (/^\d{2,6}$/.test(word)) {
          let price = parseInt(word);
          // Nếu số nhỏ hơn 10000, mặc định là nghìn
          if (price < 10000) price = price * 1000;
          if (price > 0) {
            if (
              currentRange === "around" ||
              currentRange === "khoảng" ||
              currentRange === "tầm"
            ) {
              targetPrice = price;
              minPrice = Math.floor(price * 0.8);
              maxPrice = Math.ceil(price * 1.2);
            } else if (currentRange === "below" || currentRange === "dưới") {
              maxPrice = price;
            } else if (currentRange === "above" || currentRange === "trên") {
              minPrice = price;
            } else if (currentRange === "from") {
              minPrice = price;
            } else if (currentRange === "to") {
              maxPrice = price;
            } else {
              targetPrice = price;
              minPrice = Math.floor(price * 0.8);
              maxPrice = Math.ceil(price * 1.2);
            }
          }
        }

        // Nếu là số có đơn vị vnd hoặc ₫ thì lấy đúng số đó
        if (/^\d+(vnd|₫)$/.test(word)) {
          let price = parseInt(word.replace(/(vnd|₫)/, ""));
          if (price > 0) {
            if (
              currentRange === "around" ||
              currentRange === "khoảng" ||
              currentRange === "tầm"
            ) {
              targetPrice = price;
              minPrice = Math.floor(price * 0.8);
              maxPrice = Math.ceil(price * 1.2);
            } else if (currentRange === "below" || currentRange === "dưới") {
              maxPrice = price;
            } else if (currentRange === "above" || currentRange === "trên") {
              minPrice = price;
            } else if (currentRange === "from") {
              minPrice = price;
            } else if (currentRange === "to") {
              maxPrice = price;
            } else {
              targetPrice = price;
              minPrice = Math.floor(price * 0.8);
              maxPrice = Math.ceil(price * 1.2);
            }
          }
        }

        // Tìm giá trong từ hiện tại với các pattern còn lại
        for (const pattern of pricePatterns) {
          const matches = word.match(pattern.regex);
          if (matches) {
            for (const match of matches) {
              let price = 0;
              if (pattern.multiplier === 1) {
                // Xử lý số có dấu chấm hoặc khoảng trắng
                price = parseInt(match.replace(/[.\s]/g, ""));
                // Nếu không có đơn vị, mặc định là nghìn
                if (price < 10000) price = price * 1000;
              } else {
                // Xử lý "100k", "1tr"
                const number = parseInt(
                  match.replace(/[k|tr|nghìn|triệu]/g, "")
                );
                const unit = match.replace(/\d+/g, "");
                price = number * pattern.multiplier(unit);
              }
              if (price > 0) {
                if (
                  currentRange === "around" ||
                  currentRange === "khoảng" ||
                  currentRange === "tầm"
                ) {
                  targetPrice = price;
                  minPrice = Math.floor(price * 0.8);
                  maxPrice = Math.ceil(price * 1.2);
                } else if (
                  currentRange === "below" ||
                  currentRange === "dưới"
                ) {
                  maxPrice = price;
                } else if (
                  currentRange === "above" ||
                  currentRange === "trên"
                ) {
                  minPrice = price;
                } else if (currentRange === "from") {
                  minPrice = price;
                } else if (currentRange === "to") {
                  maxPrice = price;
                } else {
                  targetPrice = price;
                  minPrice = Math.floor(price * 0.8);
                  maxPrice = Math.ceil(price * 1.2);
                }
              }
            }
          }
        }
      }

      // Nếu có cả min và max, tạo khoảng giá
      if (minPrice !== null && maxPrice !== null && minPrice > maxPrice) {
        [minPrice, maxPrice] = [maxPrice, minPrice];
      }

      return {
        minPrice,
        maxPrice,
        targetPrice,
        hasPriceInfo:
          minPrice !== null || maxPrice !== null || targetPrice !== null,
      };
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
    // Thêm method mới để tạo câu trả lời thông minh cho câu hỏi về giá
    generatePriceResponse(userMessage, products, priceInfo) {
      const { minPrice, maxPrice, targetPrice } = priceInfo;
      const productCount = products.length;

      let response = "Dạ, ";

      if (targetPrice) {
        // Câu hỏi về giá cụ thể (ví dụ: "có áo nào 100k không?")
        const formattedPrice = this.formatPrice(targetPrice);
        response += `em tìm thấy ${productCount} sản phẩm có giá khoảng ${formattedPrice} cho anh/chị ạ. `;
      } else if (minPrice !== null && maxPrice !== null) {
        // Câu hỏi về khoảng giá (ví dụ: "áo từ 150k đến 300k")
        const formattedMinPrice = this.formatPrice(minPrice);
        const formattedMaxPrice = this.formatPrice(maxPrice);
        response += `em có ${productCount} sản phẩm trong khoảng giá từ ${formattedMinPrice} đến ${formattedMaxPrice} ạ. `;
      } else if (minPrice !== null) {
        // Câu hỏi về giá tối thiểu (ví dụ: "áo trên 200k")
        const formattedMinPrice = this.formatPrice(minPrice);
        response += `em có ${productCount} sản phẩm có giá từ ${formattedMinPrice} trở lên ạ. `;
      } else if (maxPrice !== null) {
        // Câu hỏi về giá tối đa (ví dụ: "áo dưới 200k")
        const formattedMaxPrice = this.formatPrice(maxPrice);
        response += `em có ${productCount} sản phẩm có giá dưới ${formattedMaxPrice} ạ. `;
      }

      // Thêm thông tin về sản phẩm nổi bật
      if (products.length > 0) {
        const topProduct = products[0];
        const topProductPrice = this.formatPrice(
          topProduct.variants?.[0]?.price || 0
        );
        response += `Sản phẩm nổi bật nhất là "${topProduct.name}" với giá ${topProductPrice}. `;
      }

      response += "Anh/chị xem qua các sản phẩm bên dưới nhé!";

      return response;
    },
    // Thêm method mới để trích xuất thông tin thuộc tính từ câu hỏi
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

    // Thêm method để tính điểm thuộc tính
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
    // Thêm method mới để tạo câu trả lời thông minh cho câu hỏi về sản phẩm bán chạy
    generateBestSellingResponse(products) {
      const productCount = products.length;
      let response = "Dạ, ";

      if (productCount > 0) {
        const topProduct = products[0];

        // Kiểm tra xem có dữ liệu totalSold không (từ best-selling API)
        if (topProduct.totalSold !== undefined && topProduct.totalSold > 0) {
          response += `dựa trên số lượng đã bán thực tế, sản phẩm bán chạy nhất là "${topProduct.name}" với ${topProduct.totalSold} sản phẩm đã bán. `;
        } else if (
          topProduct.sold_count !== undefined &&
          topProduct.sold_count > 0
        ) {
          response += `dựa trên số lượng đã bán, sản phẩm bán chạy nhất là "${topProduct.name}" với ${topProduct.sold_count} sản phẩm đã bán. `;
        } else {
          // Fallback: sử dụng view_count nếu không có dữ liệu bán hàng
          const viewCount = topProduct.view_count || 0;
          response += `dựa trên lượt xem, sản phẩm phổ biến nhất là "${topProduct.name}" với ${viewCount} lượt xem. `;
        }

        // Thêm thông tin về giá của sản phẩm bán chạy nhất
        const topProductPrice = this.formatPrice(
          topProduct.variants?.[0]?.price || 0
        );
        response += `Giá của sản phẩm này là ${topProductPrice}. `;
      }

      response += "Anh/chị xem qua các sản phẩm bên dưới nhé!";

      return response;
    },

    // Thêm method mới để tạo câu trả lời thông minh cho câu hỏi về thuộc tính
    generateAttributeResponse(userMessage, products, attributeInfo) {
      const { sizes, colors } = attributeInfo;
      const productCount = products.length;

      let response = "Dạ, ";

      // Tạo câu trả lời dựa trên thuộc tính tìm kiếm
      if (sizes.length > 0 && colors.length > 0) {
        // Có cả size và màu
        const sizeText = sizes.join(", ");
        const colorText = colors.join(", ");
        response += `em tìm thấy ${productCount} sản phẩm có size ${sizeText} màu ${colorText} cho anh/chị ạ. `;
      } else if (sizes.length > 0) {
        // Chỉ có size
        const sizeText = sizes.join(", ");
        response += `em tìm thấy ${productCount} sản phẩm có size ${sizeText} cho anh/chị ạ. `;
      } else if (colors.length > 0) {
        // Chỉ có màu
        const colorText = colors.join(", ");
        response += `em tìm thấy ${productCount} sản phẩm có màu ${colorText} cho anh/chị ạ. `;
      }

      // Thêm thông tin về sản phẩm nổi bật
      if (products.length > 0) {
        const topProduct = products[0];
        const topProductPrice = this.formatPrice(
          topProduct.variants?.[0]?.price || 0
        );

        // Lấy thông tin thuộc tính của sản phẩm
        let attributeDetails = "";
        if (topProduct.variants && topProduct.variants.length > 0) {
          const variant = topProduct.variants[0];
          const attributes = [];

          if (variant.attributeId1 && this.chatbotData.attributes) {
            const attr1 = this.chatbotData.attributes.find(
              (attr) => attr._id === variant.attributeId1
            );
            if (attr1) attributes.push(attr1.name);
          }

          if (variant.attributeId2 && this.chatbotData.attributes) {
            const attr2 = this.chatbotData.attributes.find(
              (attr) => attr._id === variant.attributeId2
            );
            if (attr2) attributes.push(attr2.name);
          }

          if (attributes.length > 0) {
            attributeDetails = ` (${attributes.join(", ")})`;
          }
        }

        response += `Sản phẩm nổi bật nhất là "${topProduct.name}"${attributeDetails} với giá ${topProductPrice}. `;
      }

      response += "Anh/chị xem qua các sản phẩm bên dưới nhé!";

      return response;
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
