const express = require("express");
const router = express.Router();
const reviewController = require("../controllers/review.controller");

// Admin routes
router.post("/add", reviewController.add);
router.get("/", reviewController.getAll);
router.get("/:id", reviewController.getById);
router.put("/update/:id", reviewController.update);
router.delete("/delete/:id", reviewController.delete);
router.post("/:id/reply", reviewController.addReply);

// Public routes
router.get("/product/:productId", reviewController.getByProduct);
router.get("/customer/:customerId", reviewController.getByCustomer);

module.exports = router;
