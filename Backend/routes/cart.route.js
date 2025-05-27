const express = require("express");
const router = express.Router();
const cartController = require("../controllers/cart.controller");

// Get cart by customer ID
router.get("/customer/:customerId", cartController.getCart);

// Create new cart
router.post("/create", cartController.createCart);

// Add item to cart
router.post("/:cartId/add", cartController.addToCart);

// Update cart item quantity
router.put("/:cartId/update", cartController.updateCartItemQuantity);

// Remove item from cart
router.delete(
  "/:cartId/items/:productId/:variantId",
  cartController.removeFromCart
);

// Delete cart
router.delete("/:cartId", cartController.deleteCart);

module.exports = router;
