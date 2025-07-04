const axios = require("axios");
const ProductEmbedding = require("../models/productEmbedding.model");
const ragController = {};

// POST /api/rag/embedding
ragController.embedding = async (req, res) => {
  try {
    const { question } = req.body;
    if (!question) return res.status(400).json({ message: "Missing question" });
    // Gọi YOLO service để lấy embedding thực tế
    const imageServiceUrl =
      process.env.IMAGE_SERVICE_URL || "http://localhost:9000";
    const response = await axios.post(`${imageServiceUrl}/vectorize-text`, {
      text: question,
    });
    if (response.data && response.data.embedding) {
      return res.json({ embedding: response.data.embedding });
    } else {
      return res
        .status(500)
        .json({ message: "Invalid response from YOLO service" });
    }
  } catch (error) {
    console.error(
      "Error calling YOLO service for text embedding:",
      error.message
    );
    return res
      .status(500)
      .json({ message: `Failed to create text embedding: ${error.message}` });
  }
};

// Hàm tính cosine similarity (giả lập)
function cosineSimilarity(a, b) {
  let dot = 0,
    normA = 0,
    normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

// POST /api/rag/retrieve
ragController.retrieve = async (req, res) => {
  try {
    const { embedding } = req.body;
    if (!embedding || !Array.isArray(embedding))
      return res.status(400).json({ message: "Missing or invalid embedding" });
    // Lấy embedding tất cả sản phẩm từ DB, chỉ lấy những sản phẩm có publish=true và chưa được xóa
    const allEmbeddings = await ProductEmbedding.find().populate({
      path: "product",
      match: {
        publish: true,
        deletedAt: null,
      },
    });

    // Lọc bỏ những embedding có product là null (do không match điều kiện)
    const validEmbeddings = allEmbeddings.filter((e) => e.product !== null);

    // Tính similarity và lấy top 5 sản phẩm liên quan
    const scored = validEmbeddings.map((e) => ({
      product: e.product,
      score: cosineSimilarity(embedding, e.embedding),
    }));
    // Lọc theo ngưỡng cosine >= 0.6
    const filtered = scored.filter((s) => s.score >= 0.5);
    filtered.sort((a, b) => b.score - a.score);
    const products = filtered.slice(0, 5).map((s) => s.product);
    console.log(products);
    return res.json({ products });
  } catch (error) {
    console.error("Retrieve error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = ragController;
