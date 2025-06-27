const express = require("express");
const router = express.Router();
const payosController = require("../controllers/payos.controller");

router.post("/create-payment", payosController.createPayment);
router.post("/verify-payment", payosController.verifyPayment);
router.get("/payos-return", payosController.payosReturn);

module.exports = router;
