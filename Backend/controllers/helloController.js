const { db } = require("../firebase/firebase-admin");

// GET /api/hello
exports.getHelloMessage = async (req, res) => {
  try {
    // Truy vấn dữ liệu từ Firestore (hoặc cơ sở dữ liệu khác)
    const snapshot = await db.collection("test").limit(1).get();
    if (snapshot.empty) {
      return res.status(404).json({ message: "🔥 Không có dữ liệu test." });
    }

    const doc = snapshot.docs[0].data();
    res.json({ message: `✅ Firebase OK: ${JSON.stringify(doc)}` });
  } catch (error) {
    console.error("❌ Firebase error:", error);
    res.status(500).json({ message: `Firebase Error: ${error.message}` });
  }
};

// POST /api/hello
exports.createHelloMessage = async (req, res) => {
  try {
    const { message } = req.body;
    // Thêm mới dữ liệu vào Firestore
    await db.collection("test").add({ message });
    res.status(201).json({ message: "✅ Đã thêm mới message vào Firestore!" });
  } catch (error) {
    console.error("❌ Firebase error:", error);
    res.status(500).json({ message: `Firebase Error: ${error.message}` });
  }
};
