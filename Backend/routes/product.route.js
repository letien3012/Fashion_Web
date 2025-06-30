const express = require("express");
const router = express.Router();
const productController = require("../controllers/product.controller");
const multer = require("multer");
const upload = multer({ dest: "public/temp/" });

// Import Excel routes - phải đặt trước các routes có parameter
router.post(
  "/import-excel",
  upload.single("file"),
  productController.importFromExcel
);
router.get("/download-template", productController.downloadTemplate);

router.post("/add", productController.add);
router.get("/", productController.getAll);
router.get("/total", productController.getTotalProducts);
router.get("/search", productController.search);
router.get("/catalogue/:catalogueId", productController.getByCatalogue);
router.get("/category/:categoryId", productController.getByCategory);
router.get("/best-selling", productController.getBestSelling);
router.get("/:id", productController.getById);
router.put("/update/:id", productController.update);
router.put("/:id/toggle-publish", productController.togglePublish);
router.put("/bulk-toggle-publish", productController.bulkTogglePublish);
router.delete("/bulk-delete", productController.bulkDelete);
router.delete("/:id", productController.delete);
router.put("/:id/favorite/increment", productController.incrementFavorite);
router.put("/:id/favorite/decrement", productController.decrementFavorite);
router.post("/:productId/variants", productController.addVariant);
router.put(
  "/:productId/variants/:variantIndex",
  productController.updateVariant
);
router.delete(
  "/:productId/variants/:variantIndex",
  productController.deleteVariant
);
router.post(
  "/:productId/variants/:variantIndex/check-quantity",
  productController.checkVariantQuantity
);
router.post(
  "/:productId/variants/:variantIndex/update-quantity",
  productController.updateVariantQuantity
);
router.post(
  "/:productId/variants/:variantIndex/check-and-update-quantity",
  productController.checkAndUpdateVariantQuantity
);
router.post("/:productId/find-variant", productController.findVariantIndex);
router.get(
  "/variant-price/:productId/:variantId",
  productController.getVariantPrice
);

module.exports = router;
