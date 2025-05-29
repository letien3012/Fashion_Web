const axios = require("axios");
const fs = require("fs");
const FormData = require("form-data");

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

module.exports = { detectOnly, cropOnly };
