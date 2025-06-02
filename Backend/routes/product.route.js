const express = require("express");
const router = express.Router();
const productController = require("../controllers/product.controller");

router.post("/add", productController.add);
router.get("/", productController.getAll);
router.get("/catalogue/:catalogueId", productController.getByCatalogue);
router.get("/best-selling", productController.getBestSelling);
router.get("/:id", productController.getById);
router.put("/update/:id", productController.update);
router.delete("/delete/:id", productController.delete);
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
