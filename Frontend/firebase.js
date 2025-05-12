import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
const firebaseConfig = {
  apiKey: "AIzaSyBSETzBU0e6Mw-0cBTnXifT-QWqqz2X7hY",
  authDomain: "fashionshopweb.firebaseapp.com",
  projectId: "fashionshopweb",
  storageBucket: "fashionshopweb.firebasestorage.app",
  messagingSenderId: "235709015050",
  appId: "1:235709015050:web:eb73cc517693c2d73fabf3",
  measurementId: "G-TQ0BHEQWFQ",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth };
