const axios = require("axios");
const fs = require("fs");
const FormData = require("form-data");
const mongoose = require("mongoose");

// Define Image Feature Schema
const imageFeatureSchema = new mongoose.Schema(
  {
    features: { type: [Number], required: true },
    originalImage: { type: String, required: true },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    label: { type: String },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const ImageFeature = mongoose.model("ImageFeature", imageFeatureSchema);

// ImageFeature.collection.dropIndexes();

// Gọi FastAPI detect, trả về boxes
async function detectOnly(imageUrl) {
  try {
    const imageServiceUrl =
      process.env.IMAGE_SERVICE_URL || "http://10.18.226.131:9000";
    const response = await axios.post(`${imageServiceUrl}/detect`, {
      image_url: imageUrl,
    });

    return response.data.boxes;
  } catch (err) {
    console.error("[detectOnly] Mở YOLO và detect:", err.message);
    throw err;
  }
}

// Gọi FastAPI crop, trả về crops
async function cropOnly(imageUrl, boxes) {
  try {
    const imageServiceUrl =
      process.env.IMAGE_SERVICE_URL || "http://10.18.226.131:9000";
    const response = await axios.post(`${imageServiceUrl}/crop`, {
      image_url: imageUrl,
      boxes: boxes,
    });
    return response.data.crops;
  } catch (err) {
    console.error("[cropOnly] error calling FastAPI crop:", err.message);
    throw err;
  }
}

// Gọi FastAPI để trích xuất đặc trưng từ ảnh
async function extractFeatures(imageData) {
  try {
    // Kiểm tra nếu là base64
    if (imageData.startsWith("data:image") || imageData.includes(",")) {
      const response = await axios.post(
        "http://localhost:9000/extract-features",
        {
          image_url: imageData,
        }
      );
      return response.data.features;
    } else {
      // Xử lý URL hoặc file path
      const response = await axios.post(
        "http://localhost:9000/extract-features",
        {
          image_url: imageData,
        }
      );
      return response.data.features;
    }
  } catch (err) {
    console.error(
      "[extractFeatures] error calling FastAPI extract-features:",
      err.message
    );
    throw err;
  }
}

// Lưu đặc trưng ảnh vào MongoDB
async function saveImageFeatures(features, originalImage, productId, label) {
  try {
    // Bỏ localhost:3005 nếu có trong originalImage
    const cleanOriginalImage = originalImage.replace(
      process.env.BACKEND_URL || "http://10.18.226.131:3005",
      ""
    );

    const newFeature = new ImageFeature({
      features,
      originalImage: cleanOriginalImage,
      productId,
      label,
    });
    await newFeature.save();
    return { message: "Features saved successfully", id: newFeature._id };
  } catch (err) {
    console.error("[saveImageFeatures] error saving to MongoDB:", err.message);
    throw err;
  }
}

// Hàm kết hợp trích xuất và lưu đặc trưng
async function extractAndSaveFeatures(
  imageData,
  originalImage,
  productId,
  label
) {
  try {
    // Trích xuất đặc trưng
    const features = await extractFeatures(imageData);

    // Lưu vào MongoDB
    const result = await saveImageFeatures(
      features,
      originalImage,
      productId,
      label
    );

    return {
      success: true,
      features,
      ...result,
    };
  } catch (err) {
    console.error("[extractAndSaveFeatures] error:", err.message);
    throw err;
  }
}

// Hàm tìm kiếm ảnh tương tự dựa trên đặc trưng
async function findSimilarImages(base64Image, limit = 5) {
  try {
    // Trích xuất đặc trưng của ảnh đầu vào
    const queryFeatures = await extractFeatures(base64Image);

    // Lấy tất cả ảnh từ DB
    const allImages = await ImageFeature.find({}).populate("productId");

    // Tính toán độ tương đồng cosine
    const similarities = allImages
      .map((img) => {
        // Kiểm tra nếu img hoặc img.productId là undefined
        if (!img || !img.productId) {
          console.log("Skipping image with missing productId:", img);
          return null;
        }

        const similarity = cosineSimilarity(queryFeatures, img.features);
        return {
          imagePath: img.originalImage || img.imagePath,
          similarity,
          productId: img.productId._id || img.productId, // Handle both populated and unpopulated cases
        };
      })
      .filter((item) => item !== null); // Lọc bỏ các item null

    // Lọc: chỉ giữ bản similarity cao nhất cho mỗi productId và có similarity > 0.6
    const bestByProduct = {};
    similarities.forEach((sim) => {
      if (sim.similarity > 0.65) {
        const productId = sim.productId.toString(); // Convert ObjectId to string for consistent comparison
        if (
          !bestByProduct[productId] ||
          sim.similarity > bestByProduct[productId].similarity
        ) {
          bestByProduct[productId] = sim;
        }
      }
    });
    const uniqueSimilarities = Object.values(bestByProduct);

    // Sắp xếp theo độ tương đồng giảm dần và lấy top k
    return uniqueSimilarities
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);
  } catch (err) {
    console.error("[findSimilarImages] error:", err.message);
    throw err;
  }
}

// Hàm tính cosine similarity
function cosineSimilarity(vec1, vec2) {
  const dotProduct = vec1.reduce((sum, val, i) => sum + val * vec2[i], 0);
  const norm1 = Math.sqrt(vec1.reduce((sum, val) => sum + val * val, 0));
  const norm2 = Math.sqrt(vec2.reduce((sum, val) => sum + val * val, 0));
  return dotProduct / (norm1 * norm2);
}

// Xóa đặc trưng ảnh theo mảng đường dẫn ảnh
async function deleteImageFeaturesByPaths(imagePaths) {
  try {
    // Bỏ tiền tố localhost:3005 nếu có trong từng path
    const cleanPaths = imagePaths.map((p) =>
      p.replace(process.env.BACKEND_URL || "http://10.18.226.131:3005", "")
    );
    const result = await ImageFeature.deleteMany({
      originalImage: { $in: cleanPaths },
    });
    return { success: true, deletedCount: result.deletedCount };
  } catch (err) {
    console.error("[deleteImageFeaturesByPaths] error:", err.message);
    throw err;
  }
}

module.exports = {
  detectOnly,
  cropOnly,
  extractFeatures,
  saveImageFeatures,
  extractAndSaveFeatures,
  findSimilarImages,
  deleteImageFeaturesByPaths,
};
