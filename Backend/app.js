const express = require("express");
const cors = require("cors");
const helloRoutes = require("./routes/hello.route");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/hello", helloRoutes);

app.get("/", (req, res) => {
  res.send("✅ Backend is running!");
});

module.exports = app;
