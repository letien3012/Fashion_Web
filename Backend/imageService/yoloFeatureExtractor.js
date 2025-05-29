const axios = require("axios");
const sharp = require("sharp");
const tf = require("@tensorflow/tfjs-node");

let model;

// Load EfficientNetB0 chỉ 1 lần
(async () => {
  model = await tf.loadGraphModel(
    "https://tfhub.dev/tensorflow/efficientnet/b0/feature-vector/1",
    { fromTFHub: true }
  );
  console.log("EfficientNetB0 model loaded");
})();

/**
 * Nhận ảnh buffer → gọi YOLO → trích đặc trưng từng object
 * @param {Buffer} imageBuffer
 * @returns {Promise<Array<{ label: string, vector: number[] }>>}
 */
async function extractFeatures(imageBuffer) {
  // Gửi ảnh đến YOLO (Python service)
  const yoloRes = await axios.post(
    "http://localhost:9000/detect",
    imageBuffer,
    {
      headers: { "Content-Type": "application/octet-stream" },
    }
  );

  const boxes = yoloRes.data.boxes;
  const results = [];

  for (const box of boxes) {
    const { x, y, width, height, label } = box;

    // Cắt vùng object
    const cropped = await sharp(imageBuffer)
      .extract({
        left: Math.floor(x),
        top: Math.floor(y),
        width: Math.floor(width),
        height: Math.floor(height),
      })
      .resize(224, 224)
      .toFormat("png")
      .toBuffer();

    // Chuyển sang tensor
    const tensor = tf.node
      .decodeImage(cropped, 3)
      .expandDims(0)
      .div(tf.scalar(255));

    // Dự đoán vector đặc trưng
    const prediction = await model.executeAsync(tensor);
    const vector = prediction.arraySync()[0];

    results.push({ label, vector });
  }

  return results;
}

module.exports = { extractFeatures };
