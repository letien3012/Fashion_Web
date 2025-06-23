const express = require("express");
const fs = require("fs");
const path = require("path");
const { 
  detectOnly, 
  cropOnly, 
  extractAndSaveFeatures,
  findSimilarImages,
  deleteImageFeaturesByPaths
} = require("../imageService/imageService");
const ImageModel = require("../models/image.model");
const Product = require("../models/product.model");

const router = express.Router();

// Route: POST /upload
router.post("/upload", async (req, res) => {
  try {
    const { base64Image, folder } = req.body;
    if (!base64Image) {
      return res.status(400).json({ error: "No image data provided" });
    }

    // Lưu ảnh lên server
    const imagePath = await ImageModel.saveImage(base64Image, folder || "product");
    
    res.json({
      success: true,
      message: "Image uploaded successfully",
      imagePath: imagePath
    });
  } catch (err) {
    console.error("[upload] error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// Route: POST /upload-multiple
router.post("/upload-multiple", async (req, res) => {
  try {
    const { base64Images, folder } = req.body;
    
    if (!base64Images || !Array.isArray(base64Images)) {
      return res.status(400).json({ error: "No images data provided" });
    }

    // Lưu nhiều ảnh lên server
    const imagePaths = await ImageModel.saveMultipleImages(base64Images, folder || "product");
    
    res.json({
      success: true,
      message: "Images uploaded successfully",
      imagePaths: imagePaths
    });
  } catch (err) {
    console.error("[upload-multiple] error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// Route: POST /detect
router.post("/detect", async (req, res) => {
  const { imagePath } = req.body;
  if (!imagePath) {
    return res.status(400).json({ error: "Image not found or path invalid" });
  }
  try {
    const boxes = await detectOnly(`http://localhost:3005${imagePath}`);
    res.json({ boxes, imagePath });
  } catch (err) {
    fs.unlink(imagePath, () => {}); // chỉ xóa file tạm nếu có lỗi
    res.status(500).json({ error: err.toString() });
  }
});

// Route: POST /crop
router.post("/crop", async (req, res) => {
  const { imagePath, x, y, width, height } = req.body;
  if (!imagePath) {
    return res.status(400).json({ error: "Image not found or path invalid" });
  }

  const box = {
    label: "selected",
    box: [x, y, x + width, y + height],
  };
 
  try {
    const result = await cropOnly(`http://localhost:3005${imagePath}`, [box]);
    res.json(result[0] || {}); 
    // Trả về crop đầu tiên
  } catch (err) {
    fs.unlink(imagePath, () => {}); // chỉ xóa file tạm nếu có lỗi
    res.status(500).json({ error: err.toString() });
  }
});

// Route: POST /extract-features
router.post("/extract-features", async (req, res) => {
  const { imagePath, productId } = req.body;
  if (!imagePath) {
    return res.status(400).json({ error: "No image path provided" });
  }
  
  try {
    // 1. Detect các vật thể trong ảnh
    const boxes = await detectOnly(imagePath);
    let features = [];
    if (!boxes || boxes.length === 0) {
      // Nếu không phát hiện vật thể, trích xuất đặc trưng toàn bộ ảnh
      const result = await extractAndSaveFeatures(
        imagePath,
        imagePath,
        productId,
        'whole_image'
      );
      features.push({
        label: 'whole_image',
        featureId: result.id,
        message: result.message,
        originalImage: imagePath,
        productId: productId
      });
    } else {
      // 2. Crop từng box nếu có vật thể
      const cropBoxes = boxes.map((box, idx) => ({
        label: box.label || `object_${idx}`,
        box: [box.x, box.y, box.x + box.width, box.y + box.height],
      }));
      const croppedResults = await cropOnly(imagePath, cropBoxes);
      
      // 3. Trích xuất đặc trưng và lưu vào DB cho từng crop
      for (let i = 0; i < croppedResults.length; i++) {
        const crop = croppedResults[i];
        try {
          // Thêm tiền tố cho base64 nếu chưa có
          const formattedBase64 = crop.image_base64.startsWith('data:image') 
            ? crop.image_base64 
            : `data:image/jpeg;base64,${crop.image_base64}`;

          const result = await extractAndSaveFeatures(
            formattedBase64,
            imagePath,
            productId,
            crop.label
          );

          features.push({
            label: crop.label,
            featureId: result.id,
            message: result.message,
            originalImage: imagePath,
            productId: productId
          });
        } catch (err) {
          console.error(`Error processing crop ${i}:`, err);
          continue;
        }
      }
    }

    res.json({
      success: true,
      originalImage: imagePath,
      features,
      productId
    });
  } catch (err) {
    res.status(500).json({ error: err.toString() });
  }
});

// Route: POST /find-similar
router.post("/find-similar", async (req, res) => {
  const { base64Image, limit } = req.body;
  if (!base64Image) {
    return res.status(400).json({ error: "No image provided" });
  }

  try {
    // Thêm tiền tố cho base64 nếu chưa có
    const formattedBase64 = base64Image.startsWith('data:image') 
      ? base64Image 
      : `data:image/jpeg;base64,${base64Image}`;

    // Tìm ảnh tương tự
    const similarImages = await findSimilarImages(formattedBase64, limit || 5);
    
    if (!similarImages || similarImages.length === 0) {
      return res.json({
        success: true,
        similarImages: [],
        products: []
      });
    }

    // Lấy danh sách productId từ similarImages
    const productIds = similarImages.map(img => img.productId);
    
    // Lấy thông tin sản phẩm từ database
    const products = await Product.find({ 
      _id: { $in: productIds },
      publish: true 
    })
      .populate('catalogueId')
      .lean();

    // Map thông tin sản phẩm với similarity và ảnh tương tự
    const productsWithSimilarity = products.map(product => {
      const similarImage = similarImages.find(img => img.productId.toString() === product._id.toString());
      return {
        ...product,
        similarity: similarImage.similarity,
        similarityPercentage: (similarImage.similarity * 100).toFixed(2) + '%',
        similarImagePath: similarImage.imagePath
      };
    });
   
    res.json({
      success: true,
      products: productsWithSimilarity
    });
  } catch (err) {
    console.error("[find-similar] error:", err);
    res.status(500).json({ error: err.toString() });
  }
});

// Route: POST /extract-and-compare
router.post("/extract-and-compare", async (req, res) => {
  const { imagePath } = req.body;
  if (!imagePath) {
    return res.status(400).json({ error: "No image path provided" });
  }

  try {
    // Trích xuất và lưu đặc trưng
    const extractResult = await extractAndSaveFeatures(imagePath);
    
    // Tìm ảnh tương tự
    const similarImages = await findSimilarImages(imagePath, 5);
    
    res.json({
      success: true,
      message: extractResult.message,
      queryImage: imagePath,
      featureId: extractResult.id,
      similarImages: similarImages.map(img => ({
        imagePath: img.imagePath,
        similarity: img.similarity,
        similarityPercentage: (img.similarity * 100).toFixed(2) + '%'
      }))
    });
  } catch (err) {
    fs.unlink(imagePath, () => {}); // chỉ xóa file tạm nếu có lỗi
    res.status(500).json({ error: err.toString() });
  }
});

// Route: POST /delete
router.post("/delete", async (req, res) => {
  const { imagePath } = req.body;

  if (!imagePath) {
    return res.status(400).json({ error: "No image path provided" });
  }
  try {
    await ImageModel.deleteImage(imagePath);
    res.json({ success: true, message: "Image deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.toString() });
  }
});

// Route: POST /delete-features
router.post("/delete-features", async (req, res) => {
  const { imagePaths } = req.body;
  if (!imagePaths || !Array.isArray(imagePaths) || imagePaths.length === 0) {
    return res.status(400).json({ error: "No image paths provided" });
  }
  try {
    const result = await deleteImageFeaturesByPaths(imagePaths);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.toString() });
  }
});

module.exports = router;
