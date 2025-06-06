const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const { 
  detectOnly, 
  cropOnly, 
  extractAndSaveFeatures,
  findSimilarImages 
} = require("../imageService/imageService");

const router = express.Router();

// Cấu hình multer
const upload = multer({
  dest: "uploads/", // thư mục tạm lưu ảnh
  limits: { fileSize: 5 * 1024 * 1024 }, // giới hạn 5MB
});

// Route: POST /detect
router.post("/detect", upload.single("image"), async (req, res) => {
  // Kiểm tra file có tồn tại không
  if (!req.file) {
    console.log("a");
    return res.status(400).json({ error: "No image uploaded" });
  }

  const filePath = req.file.path;
  try {
    const boxes = await detectOnly(filePath);
    res.json({ boxes, imagePath: filePath });
  } catch (err) {
    fs.unlink(filePath, () => {}); // chỉ xóa file tạm nếu có lỗi
    res.status(500).json({ error: err.toString() });
  }
});

// Route: POST /crop
router.post("/crop", async (req, res) => {
  const { imagePath, x, y, width, height } = req.body;
  if (!imagePath || !fs.existsSync(imagePath)) {
    return res.status(400).json({ error: "Image not found or path invalid" });
  }

  const box = {
    label: "selected",
    box: [x, y, x + width, y + height],
  };
 
  try {
    const result = await cropOnly(imagePath, [box]);
    res.json(result[0] || {}); // Trả về crop đầu tiên
  } catch (err) {
    fs.unlink(imagePath, () => {}); // chỉ xóa file tạm nếu có lỗi
    res.status(500).json({ error: err.toString() });
  }
});

// Route: POST /extract-features
router.post("/extract-features", upload.single("image"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No image uploaded" });
  }

  const filePath = req.file.path;
  try {
    // Trích xuất và lưu đặc trưng
    const result = await extractAndSaveFeatures(filePath);
    res.json({
      success: true,
      message: result.message,
      imagePath: filePath,
      featureId: result.id
    });
  } catch (err) {
    fs.unlink(filePath, () => {}); // chỉ xóa file tạm nếu có lỗi
    res.status(500).json({ error: err.toString() });
  }
});

// Route: POST /find-similar
router.post("/find-similar", upload.single("image"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No image uploaded" });
  }

  const filePath = req.file.path;
  const limit = parseInt(req.body.limit) || 5; // Số lượng ảnh tương tự muốn lấy

  try {
    // Tìm ảnh tương tự
    const similarImages = await findSimilarImages(filePath, limit);
    res.json({
      success: true,
      queryImage: filePath,
      similarImages: similarImages.map(img => ({
        imagePath: img.imagePath,
        similarity: img.similarity,
        similarityPercentage: (img.similarity * 100).toFixed(2) + '%'
      }))
    });
  } catch (err) {
    fs.unlink(filePath, () => {}); // chỉ xóa file tạm nếu có lỗi
    res.status(500).json({ error: err.toString() });
  }
});

// Route: POST /extract-and-compare
router.post("/extract-and-compare", upload.single("image"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No image uploaded" });
  }

  const filePath = req.file.path;
  const limit = parseInt(req.body.limit) || 5;

  try {
    // Trích xuất và lưu đặc trưng
    const extractResult = await extractAndSaveFeatures(filePath);
    
    // Tìm ảnh tương tự
    const similarImages = await findSimilarImages(filePath, limit);
    
    res.json({
      success: true,
      message: extractResult.message,
      queryImage: filePath,
      featureId: extractResult.id,
      similarImages: similarImages.map(img => ({
        imagePath: img.imagePath,
        similarity: img.similarity,
        similarityPercentage: (img.similarity * 100).toFixed(2) + '%'
      }))
    });
  } catch (err) {
    fs.unlink(filePath, () => {}); // chỉ xóa file tạm nếu có lỗi
    res.status(500).json({ error: err.toString() });
  }
});

module.exports = router;
