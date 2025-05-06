// backend/app.js
const express = require("express");
const cors = require("cors");
const helloRoutes = require("./routes/hello.route");

const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // Cho phép đọc JSON trong body

// Routes
app.use("/api/hello", helloRoutes);

// Trang mặc định
app.get("/", (req, res) => {
  res.send("Backend is running!");
});

module.exports = app;
