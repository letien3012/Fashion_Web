const express = require("express");
const router = express.Router();
const consignmentController = require("../controllers/consignment.controller");

router.post("/add", consignmentController.addConsignment);
router.put(
  "/:id/current-quantity",
  consignmentController.updateCurrentQuantity
);
router.put("/:id/publish", consignmentController.updatePublishStatus);
router.get("/", consignmentController.getAllConsignments);
router.get("/:id", consignmentController.getConsignmentById);
router.get("/product/:productId", consignmentController.getByProduct);
router.get(
  "/product/:productId/variant/:variantId",
  consignmentController.getByProductAndVariant
);
router.get(
  "/product/:productId/variant/:variantId/stock",
  consignmentController.getVariantStock
);

module.exports = router;
