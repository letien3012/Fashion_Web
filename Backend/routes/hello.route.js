const express = require("express");
const router = express.Router();
const helloController = require("../controllers/helloController");

// Định nghĩa route cho API
router.get("/", helloController.getHelloMessage);
router.post("/", helloController.createHelloMessage);

module.exports = router;
