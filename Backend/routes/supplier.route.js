const express = require("express");
const router = express.Router();
const supplierController = require("../controllers/supplier.controller");

router.post("/add", supplierController.add);
router.get("/", supplierController.getAll);
router.get("/:id", supplierController.getById);
router.put("/update/:id", supplierController.update);
router.delete("/delete/:id", supplierController.delete);

module.exports = router; 