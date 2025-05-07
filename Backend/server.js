const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();

// Khởi tạo Firebase Admin SDK
require("./firebase/firebase-admin");

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
const productRoutes = require("./routes/product.routes");
const employeeRoutes = require("./routes/employee.routes");
const orderRoutes = require("./routes/order.routes");

app.use("/api/products", productRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/orders", orderRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
