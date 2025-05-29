// extract_features.js
const tf = require("@tensorflow/tfjs-node");
const fs = require("fs");
const sharp = require("sharp");

let model;

// Load model
async function loadModel() {
  model = await tf.loadGraphModel(
    "https://tfhub.dev/tensorflow/efficientnet/b0/feature-vector/1",
    { fromTFHub: true }
  );
  console.log("EfficientNetB0 loaded");
}

// Trích đặc trưng từ 1 ảnh
async function extractFeature(imagePath) {
  const imageBuffer = await sharp(imagePath)
    .resize(224, 224)
    .toFormat("png")
    .toBuffer();
  const tensor = tf.node.decodeImage(imageBuffer, 3).expandDims(0).div(255);
  const embedding = await model.executeAsync(tensor);
  return embedding.arraySync()[0];
}

// Ví dụ sử dụng
(async () => {
  await loadModel();
  const feature = await extractFeature("crops/shirt_0.jpg");
  console.log(feature.slice(0, 5)); // In 5 giá trị đầu
})();
