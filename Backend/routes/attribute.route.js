const express = require("express");
const router = express.Router();
const attributeController = require("../controllers/attribute.controller");

router.post("/add", attributeController.add);
router.get("/", attributeController.getAll);
router.get("/:id", attributeController.getById);
router.put("/update/:id", attributeController.update);
router.delete("/delete/:id", attributeController.delete);

module.exports = router;
