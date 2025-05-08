const express = require("express");
const router = express.Router();
const attributeCatalogueController = require("../controllers/attributeCatalogue.controller");

router.post("/add", attributeCatalogueController.add);
router.get("/", attributeCatalogueController.getAll);
router.get("/:id", attributeCatalogueController.getById);
router.put("/update/:id", attributeCatalogueController.update);
router.delete("/delete/:id", attributeCatalogueController.delete);

module.exports = router;
