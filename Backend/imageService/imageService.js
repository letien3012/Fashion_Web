const axios = require("axios");
const fs = require("fs");
const FormData = require("form-data");
const mongoose = require("mongoose");

// Define Image Feature Schema
const imageFeatureSchema = new mongoose.Schema({
  imagePath: { type: String, required: true, unique: true },
  features: { type: [Number], required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const ImageFeature = mongoose.model("ImageFeature", imageFeatureSchema);

// Gọi FastAPI detect, trả về boxes
async function detectOnly(imagePath) {
  try {
    const form = new FormData();
    form.append("file", fs.createReadStream(imagePath));

    const response = await axios.post("http://localhost:9000/detect", form, {
      headers: form.getHeaders(),
      maxBodyLength: Infinity,
    });
    return response.data.boxes;
  } catch (err) {
    console.error("[detectOnly] error calling FastAPI detect:", err.message);
    throw err;
  }
}

// Gọi FastAPI crop, trả về crops
async function cropOnly(imagePath, boxes) {
  try {
    const form = new FormData();
    form.append("file", fs.createReadStream(imagePath));
    // Giả sử FastAPI crop nhận image + boxes dưới dạng JSON trong 1 field tên "boxes"
    form.append("boxes", JSON.stringify(boxes));

    const response = await axios.post("http://localhost:9000/crop", form, {
      headers: form.getHeaders(),
      maxBodyLength: Infinity,
    });
    return response.data.crops; // giả sử FastAPI trả { crops: [...] }
  } catch (err) {
    console.error("[cropOnly] error calling FastAPI crop:", err.message);
    throw err;
  }
}

// Gọi FastAPI để trích xuất đặc trưng từ ảnh
async function extractFeatures(imagePath) {
  try {
    const form = new FormData();
    form.append("file", fs.createReadStream(imagePath));

    const response = await axios.post("http://localhost:9000/extract-features", form, {
      headers: form.getHeaders(),
      maxBodyLength: Infinity,
    });

    return response.data.features; // giả sử FastAPI trả về { features: [...] }
  } catch (err) {
    console.error("[extractFeatures] error calling FastAPI extract-features:", err.message);
    throw err;
  }
}

// Lưu đặc trưng ảnh vào MongoDB
async function saveImageFeatures(imagePath, features) {
  try {
    // Kiểm tra xem ảnh đã có trong DB chưa
    const existingFeature = await ImageFeature.findOne({ imagePath });
    
    if (existingFeature) {
      // Cập nhật nếu đã tồn tại
      existingFeature.features = features;
      existingFeature.updatedAt = new Date();
      await existingFeature.save();
      return { message: "Features updated successfully", id: existingFeature._id };
    } else {
      // Thêm mới nếu chưa tồn tại
      const newFeature = new ImageFeature({
        imagePath,
        features
      });
      await newFeature.save();
      return { message: "Features saved successfully", id: newFeature._id };
    }
  } catch (err) {
    console.error("[saveImageFeatures] error saving to MongoDB:", err.message);
    throw err;
  }
}

// Hàm kết hợp trích xuất và lưu đặc trưng
async function extractAndSaveFeatures(imagePath) {
  try {
    // Trích xuất đặc trưng
    const features = await extractFeatures(imagePath);
    
    // Lưu vào MongoDB
    const result = await saveImageFeatures(imagePath, features);
    
    return {
      success: true,
      features,
      ...result
    };
  } catch (err) {
    console.error("[extractAndSaveFeatures] error:", err.message);
    throw err;
  }
}

// Hàm tìm kiếm ảnh tương tự dựa trên đặc trưng
async function findSimilarImages(imagePath, limit = 5) {
  try {
    // Trích xuất đặc trưng của ảnh đầu vào
    const queryFeatures = await extractFeatures(imagePath);
    
    // Lấy tất cả ảnh từ DB
    const allImages = await ImageFeature.find({});
    
    // Tính toán độ tương đồng cosine
    const similarities = allImages.map(img => {
      const similarity = cosineSimilarity(queryFeatures, img.features);
      return {
        imagePath: img.imagePath,
        similarity
      };
    });
    
    // Sắp xếp theo độ tương đồng giảm dần và lấy top k
    return similarities
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

module.exports = { 
  detectOnly, 
  cropOnly, 
  extractFeatures,
  saveImageFeatures,
  extractAndSaveFeatures,
  findSimilarImages
};
