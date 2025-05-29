// search.js
function cosineSim(v1, v2) {
  const dot = v1.reduce((sum, val, i) => sum + val * v2[i], 0);
  const norm1 = Math.sqrt(v1.reduce((sum, val) => sum + val * val, 0));
  const norm2 = Math.sqrt(v2.reduce((sum, val) => sum + val * val, 0));
  return dot / (norm1 * norm2);
}

/**
 * Tìm ảnh tương tự nhất
 * @param {number[]} queryVector - Vector ảnh query
 * @param {{ label: string, vector: number[], file: string }[]} database
 */
function findSimilar(queryVector, database, topK = 3) {
  const results = database.map((entry) => ({
    ...entry,
    score: cosineSim(queryVector, entry.vector),
  }));

  return results.sort((a, b) => b.score - a.score).slice(0, topK);
}

// Ví dụ:
const fs = require("fs");
const db = JSON.parse(fs.readFileSync("features_db.json")); // [{ label, vector, file }]
const query = db[0].vector;

const similar = findSimilar(query, db);
console.log(similar);
