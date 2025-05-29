const Cart = require("../models/cart.model");

// Lấy giỏ hàng của khách hàng
exports.getCart = async (req, res) => {
  try {
    const { customerId } = req.params;
    const cart = await Cart.getByCustomerId(customerId);

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    res.status(200).json(cart);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Tạo giỏ hàng mới
exports.createCart = async (req, res) => {
  try {
    const { customerId, cart_detail } = req.body;

    if (!customerId) {
      return res.status(400).json({
        message: "Customer ID is required",
        required: {
          customerId: "Customer ID is required",
        },
      });
    }

    const cart = new Cart({ customerId, cart_detail });
    const id = await cart.save();

    res.status(201).json({
      message: "Cart created successfully",
      id,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Thêm sản phẩm vào giỏ hàng
exports.addToCart = async (req, res) => {
  try {
    const { cartId } = req.params;
    const detail = req.body;

    await Cart.addToCart(cartId, detail);
    res.status(200).json({ message: "Item added to cart successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Cập nhật số lượng sản phẩm trong giỏ hàng
exports.updateCartItemQuantity = async (req, res) => {
  try {
    const { cartId } = req.params;
    const { productId, variantId, quantity } = req.body;

    console.log("Update cart request:", {
      cartId,
      productId,
      variantId,
      quantity,
    });

    if (!productId || !variantId) {
      return res.status(400).json({
        message: "Missing required fields",
        required: {
          productId: "Product ID is required",
          variantId: "Variant ID is required",
        },
      });
    }

    if (!quantity || quantity < 0) {
      return res.status(400).json({
        message: "Invalid quantity",
        required: {
          quantity: "Quantity must be a non-negative number",
        },
      });
    }

    const cart = await Cart.findById(cartId);
    if (!cart) {
      console.log("Cart not found:", cartId);
      return res.status(404).json({ message: "Cart not found" });
    }

    console.log("Found cart:", cart);

    const itemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId.toString()
    );

    if (itemIndex === -1) {
      console.log("Item not found in cart:", productId);
      return res.status(404).json({ message: "Item not found in cart" });
    }

    const item = cart.items[itemIndex];
    console.log("Found item:", item);

    const variantIndex = item.variants.findIndex(
      (v) => v._id.toString() === variantId.toString()
    );

    if (variantIndex === -1) {
      console.log("Variant not found in item:", variantId);
      return res
        .status(404)
        .json({ message: "Variant not found in cart item" });
    }

    console.log("Found variant at index:", variantIndex);

    if (quantity === 0) {
      // Remove variant if quantity is 0
      item.variants.splice(variantIndex, 1);

      // Remove item if no variants left
      if (item.variants.length === 0) {
        cart.items.splice(itemIndex, 1);
      }
    } else {
      // Update quantity
      item.variants[variantIndex].quantity = quantity;
    }

    cart.updatedAt = new Date();
    await cart.save();

    console.log("Updated cart:", cart);

    res.status(200).json({
      success: true,
      message: "Cart item quantity updated successfully",
      data: cart,
    });
  } catch (error) {
    console.error("Error updating cart item quantity:", error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Xóa sản phẩm khỏi giỏ hàng
exports.removeFromCart = async (req, res) => {
  try {
    const { cartId, productId, variantId } = req.params;

    console.log("Remove from cart request:", {
      cartId,
      productId,
      variantId,
    });

    const cart = await Cart.findById(cartId);
    if (!cart) {
      console.log("Cart not found:", cartId);
      return res.status(404).json({ message: "Cart not found" });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId.toString()
    );

    if (itemIndex === -1) {
      console.log("Item not found in cart:", productId);
      return res.status(404).json({ message: "Item not found in cart" });
    }

    const item = cart.items[itemIndex];
    const variantIndex = item.variants.findIndex(
      (v) => v._id.toString() === variantId.toString()
    );

    if (variantIndex === -1) {
      console.log("Variant not found in item:", variantId);
      return res
        .status(404)
        .json({ message: "Variant not found in cart item" });
    }

    // Remove only the specific variant
    item.variants.splice(variantIndex, 1);

    // Update the total quantity of the product
    item.quantity = item.variants.reduce(
      (total, variant) => total + variant.quantity,
      0
    );

    cart.updatedAt = new Date();
    await cart.save();

    res.status(200).json({
      success: true,
      message: "Variant removed from cart successfully",
      data: cart,
    });
  } catch (error) {
    console.error("Error removing from cart:", error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Xóa giỏ hàng
exports.deleteCart = async (req, res) => {
  try {
    const { cartId } = req.params;

    await Cart.delete(cartId);
    res.status(200).json({ message: "Cart deleted successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
