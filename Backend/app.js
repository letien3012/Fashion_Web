require("dotenv").config();
const express = require("express");
const cors = require("cors");
const session = require("express-session");
const passport = require("passport");
const path = require("path");

require("./config/passport");

const app = express();

// CORS options
const corsOptions = {
  origin: "http://localhost:5173", // Frontend Vite
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

// Session options
// const sessionConfig = {
//   secret: process.env.JWT_SECRET || "your-secret-key",
//   resave: false,
//   saveUninitialized: false,
//   cookie: {
//     secure: process.env.NODE_ENV === "production",
//     maxAge: 24 * 60 * 60 * 1000, // 24 hours
//   },
// };
// app.use(session(sessionConfig));

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);
// Middleware setup
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());
app.use(passport.session());

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, "public")));

// Firebase Admin
require("./firebase/firebase-admin");

module.exports = app;
