const express = require("express");
const router = express.Router();
const consignmentController = require("../controllers/consignment.controller");

router.post("/add", consignmentController.addConsignment);
router.put(
  "/:id/current-quantity",
  consignmentController.updateCurrentQuantity
);
router.get("/", consignmentController.getAllConsignments);
router.get("/:id", consignmentController.getConsignmentById);

module.exports = router;
