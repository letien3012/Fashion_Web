const express = require("express");
const router = express.Router();
const cartController = require("../controllers/cart.controller");

router.get("/customer/:customerId", cartController.getCart);
router.post("/create", cartController.createCart);
router.post("/:cartId/add", cartController.addToCart);
router.put("/:cartId/items/:productId/:variantSku", cartController.updateCartItemQuantity);
router.delete("/:cartId/items/:productId/:variantSku", cartController.removeFromCart);
router.delete("/:cartId", cartController.deleteCart);

module.exports = router; 