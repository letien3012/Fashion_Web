const admin = require("firebase-admin");

// Khởi tạo Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.applicationDefault(),
});

const db = admin.firestore();

module.exports = { admin, db };
