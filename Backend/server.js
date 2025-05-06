const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/hello", (req, res) => {
  res.json({ message: "Hello from backend!" });
});

const PORT = 3005;
app.listen(PORT, () => {
  console.log(`Backend server running at http://localhost:${PORT}`);
});
