const express = require("express");
const router = express.Router();
const productCatalogueController = require("../controllers/productCatalogue.controller");

router.post("/add", productCatalogueController.add);
router.get("/", productCatalogueController.getAll);
router.get("/tree", productCatalogueController.getTree);
router.get("/:id", productCatalogueController.getById);
router.get("/:id/children", productCatalogueController.getChildren);
router.put("/update/:id", productCatalogueController.update);
router.delete("/delete/:id", productCatalogueController.delete);

module.exports = router; 