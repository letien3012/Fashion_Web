const express = require("express");
const cors = require("cors");
require("dotenv").config();
require("./firebase/firebase-admin");

const app = express();

// Middleware
app.use(cors());
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

app.use("/api/employees", employeeRoutes);
app.use("/api/attributeCatalogues", attributeCatalogueRoutes);
app.use("/api/attributes", attributeRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/productCatalogues", productCatalogueRoutes);
app.use("/api/products", productRoutes);
app.use("/api/suppliers", supplierRoutes);
app.use("/api/import-receipts", importReceiptRoutes);

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
