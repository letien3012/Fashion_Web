const express = require("express");
const router = express.Router();
const attributeCatalogueController = require("../controllers/attributeCatalogue.controller");

router.post("/add", attributeCatalogueController.addCatalogue);
router.get("/", attributeCatalogueController.getAllCatalogues);
router.get("/:id", attributeCatalogueController.getCatalogueById);
router.put("/update/:id", attributeCatalogueController.updateCatalogue);
router.delete("/delete/:id", attributeCatalogueController.deleteCatalogue);

// DEBUG ROUTE - Add this new route
router.get(
  "/debug/list-all",
  attributeCatalogueController.debugGetAllCatalogues
);

module.exports = router;
