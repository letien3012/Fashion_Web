const express = require("express");
const router = express.Router();
const vnpayController = require("../controllers/vnpay.controller");

router.post("/create-payment", vnpayController.createPayment);
router.get("/vnpay-return", vnpayController.vnpayReturn);

module.exports = router;
