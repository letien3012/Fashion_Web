const express = require("express");
const router = express.Router();
const paypalController = require("../controllers/paypal.controller");

router.post("/create-paypal", paypalController.createOrder);
router.post("/capture-order", paypalController.captureOrder);

module.exports = router;
