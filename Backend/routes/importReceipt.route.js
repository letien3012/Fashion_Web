const express = require("express");
const router = express.Router();
const importReceiptController = require("../controllers/importReceipt.controller");

router.post("/add", importReceiptController.add);
router.get("/", importReceiptController.getAll);
router.get("/:id", importReceiptController.getById);
router.put("/update/:id", importReceiptController.update);
router.delete("/delete/:id", importReceiptController.delete);
router.post("/:id/details", importReceiptController.addDetail);
router.put("/:id/details/:detailIndex", importReceiptController.updateDetail);
router.delete("/:id/details/:detailIndex", importReceiptController.deleteDetail);
router.put("/:id/publish", importReceiptController.publish);
router.put("/:id/publish-status", importReceiptController.updatePublishStatus);

module.exports = router; 