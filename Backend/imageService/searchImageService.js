const express = require("express");
const multer = require("multer");
const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// Lưu ảnh vào thư mục /uploads
const upload = multer({ dest: path.join(__dirname, "uploads/") });

/**
 * POST /detect
 * Nhận ảnh, chạy YOLO để phát hiện bounding boxes
 */
app.post("/detect", upload.single("image"), (req, res) => {
  const imagePath = req.file.path;

  const python = spawn("python3", [
    path.join(__dirname, "detect.py"),
    imagePath,
  ]);

  let result = "";
  python.stdout.on("data", (data) => {
    result += data.toString();
  });

  python.stderr.on("data", (data) => {
    console.error("Detect error:", data.toString());
  });

  python.on("close", () => {
    fs.unlinkSync(imagePath); // Xoá ảnh sau khi xử lý nếu không cần dùng tiếp
    try {
      res.json(JSON.parse(result));
    } catch (err) {
      res.status(500).json({ error: "Invalid JSON from detect.py" });
    }
  });
});

/**
 * POST /crop
 * Crop ảnh theo toạ độ box truyền vào (sau khi người dùng chọn box)
 */
app.post("/crop", (req, res) => {
  const { x, y, width, height, imagePath } = req.body;

  if (!fs.existsSync(imagePath)) {
    return res.status(400).json({ error: "Image path not found" });
  }

  const python = spawn("python3", [
    path.join(__dirname, "crop.py"),
    imagePath,
    String(x),
    String(y),
    String(width),
    String(height),
  ]);

  let result = "";
  python.stdout.on("data", (data) => {
    result += data.toString();
  });

  python.stderr.on("data", (data) => {
    console.error("Crop error:", data.toString());
  });

  python.on("close", () => {
    res.json({ image_base64: result.trim() });
  });
});

/**
 * Start server
 */
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🔎 searchImageService is running at http://localhost:${PORT}`);
});
