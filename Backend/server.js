// server.js
const app = require("./app");
const express = require("express");
// Route imports
const routes = {
  employee: require("./routes/employee.route"),
  attributeCatalogue: require("./routes/attributeCatalogue.route"),
  attribute: require("./routes/attribute.route"),
  customer: require("./routes/customer.route"),
  productCatalogue: require("./routes/productCatalogue.route"),
  product: require("./routes/product.route"),
  supplier: require("./routes/supplier.route"),
  importReceipt: require("./routes/importReceipt.route"),
  cart: require("./routes/cart.route"),
  order: require("./routes/order.route"),
  auth: require("./routes/auth.route"),
};

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
const mailRoutes = require("./routes/mail.route");
const verifyRoutes = require("./routes/verify.route");

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
app.use("/api/mail", mailRoutes);
app.use("/api/verify", verifyRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: "Something went wrong!",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// Start the server
const PORT = process.env.PORT || 3005;
app.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
});
