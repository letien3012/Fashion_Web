const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const { detectOnly, cropOnly } = require("../imageService/imageService");

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
    fs.unlink(filePath, () => {}); // xóa file tạm nếu lỗi
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

    // Xoá ảnh tạm sau khi crop
    fs.unlink(imagePath, () => {});

    res.json(result.crops?.[0] || {}); // Trả về crop đầu tiên
  } catch (err) {
    fs.unlink(imagePath, () => {});
    res.status(500).json({ error: err.toString() });
  }
});

module.exports = router;
