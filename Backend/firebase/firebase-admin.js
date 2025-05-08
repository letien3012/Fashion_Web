const admin = require("firebase-admin");

const serviceAccount = require("../firebase.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),

  storageBucket: "fashionshopweb.firebasestorage.app",
});

const db = admin.firestore();

const auth = admin.auth();

const bucket = admin.storage().bucket();

module.exports = { admin, db, auth, bucket };
