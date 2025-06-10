// server.js
const app = require("./app");
const express = require("express");
const path = require("path");
// Middleware xử lý dữ liệu từ client
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Add static file serving for uploads directory
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

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
  consignment: require("./routes/consignment.route"),
  promotion: require("./routes/promotion.route"),
  mail: require("./routes/mail.route"),
  verify: require("./routes/verify.route"),
  imageService: require("./routes/imageService"),
  banner: require("./routes/banner.route"),
  review: require("./routes/review.route"),
  location: require("./routes/location.routes"),
};

// Đăng ký các route API
app.use("/api/employees", routes.employee);
app.use("/api/attributeCatalogues", routes.attributeCatalogue);
app.use("/api/attributes", routes.attribute);
app.use("/api/customers", routes.customer);
app.use("/api/productCatalogues", routes.productCatalogue);
app.use("/api/products", routes.product);
app.use("/api/suppliers", routes.supplier);
app.use("/api/import-receipts", routes.importReceipt);
app.use("/api/carts", routes.cart);
app.use("/api/orders", routes.order);
app.use("/api/auth", routes.auth);
app.use("/api/consignments", routes.consignment);
app.use("/api/promotions", routes.promotion);
app.use("/api/mail", routes.mail);
app.use("/api/verify", routes.verify);
app.use("/api/imageService", routes.imageService);
app.use("/api/banners", routes.banner);
app.use("/api/reviews", routes.review);
app.use("/api/location", routes.location);

// Middleware xử lý lỗi
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: "Something went wrong!",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// Start server
const PORT = process.env.PORT || 3005;
app.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
});
