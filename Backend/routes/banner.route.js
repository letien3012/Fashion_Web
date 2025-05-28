const express = require("express");
const router = express.Router();
const bannerController = require("../controllers/banner.controller");

// Admin routes
router.post("/add", bannerController.add);
router.get("/", bannerController.getAll);
router.get("/:id", bannerController.getById);
router.put("/update/:id", bannerController.update);
router.delete("/delete/:id", bannerController.delete);

// Public routes
router.get("/type/:type", bannerController.getByType);

module.exports = router;
