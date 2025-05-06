// backend/routes/hello.route.js
const express = require("express");
const router = express.Router();
const { db } = require("../firebase/firebase-admin");

// GET /api/hello
router.get("/", async (req, res) => {
  try {
    const snapshot = await db.collection("test").limit(1).get();
    if (snapshot.empty) {
      return res.json({ message: "🔥 Không có dữ liệu test." });
    }

    const doc = snapshot.docs[0].data();
    res.json({ message: `✅ Firebase OK: ${JSON.stringify(doc)}` });
  } catch (error) {
    console.error("❌ Firebase error:", error);
    res.status(500).json({ message: `Firebase Error: ${error.message}` });
  }
});

module.exports = router;
