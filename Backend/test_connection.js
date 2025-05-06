// testConnection.js
const { db } = require("./firebase_admin");

async function testConnection() {
  try {
    const snapshot = await db.collection("test").limit(1).get();
    console.log("✅ Kết nối Firebase Firestore thành công!");
  } catch (error) {
    console.error("❌ Lỗi kết nối Firebase:", error);
  }
}

testConnection();
