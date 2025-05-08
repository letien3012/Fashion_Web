const express = require("express");
const router = express.Router();
const productController = require("../controllers/product.controller");

router.post("/add", productController.add);
router.get("/", productController.getAll);
router.get("/catalogue/:catalogueId", productController.getByCatalogue);
router.get("/:id", productController.getById);
router.put("/update/:id", productController.update);
router.delete("/delete/:id", productController.delete);
router.put("/:id/favorite/increment", productController.incrementFavorite);
router.put("/:id/favorite/decrement", productController.decrementFavorite);
router.post("/:productId/variants", productController.addVariant);
router.put("/:productId/variants/:variantIndex", productController.updateVariant);
router.delete("/:productId/variants/:variantIndex", productController.deleteVariant);

module.exports = router; 