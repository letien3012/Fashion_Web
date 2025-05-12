const express = require("express");
const cors = require("cors");
require("dotenv").config();
require("./firebase/firebase-admin");

const app = express();

// Middleware
// app.use(cors());
const corsOptions = {
  origin: "http://localhost:5173", // Frontend Vite
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true, // Chỉ bật nếu dùng cookies hoặc session
};

app.use(cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
const employeeRoutes = require("./routes/employee.route");
const attributeCatalogueRoutes = require("./routes/attributeCatalogue.route");
const attributeRoutes = require("./routes/attribute.route");
const customerRoutes = require("./routes/customer.route");
const productCatalogueRoutes = require("./routes/productCatalogue.route");
const productRoutes = require("./routes/product.route");
const supplierRoutes = require("./routes/supplier.route");
const importReceiptRoutes = require("./routes/importReceipt.route");
const cartRoutes = require("./routes/cart.route");
const orderRoutes = require("./routes/order.route");
const authRoutes = require("./routes/auth.route");

app.use("/api/employees", employeeRoutes);
app.use("/api/attributeCatalogues", attributeCatalogueRoutes);
app.use("/api/attributes", attributeRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/productCatalogues", productCatalogueRoutes);
app.use("/api/products", productRoutes);
app.use("/api/suppliers", supplierRoutes);
app.use("/api/import-receipts", importReceiptRoutes);
app.use("/api/carts", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/auth", authRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: "Something went wrong!",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
