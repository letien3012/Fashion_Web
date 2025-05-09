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
          customerId: "Customer ID is required"
        }
      });
    }

    const cart = new Cart({ customerId, cart_detail });
    const id = await cart.save();

    res.status(201).json({
      message: "Cart created successfully",
      id
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
    const { cartId, productId, variantSku } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity < 0) {
      return res.status(400).json({ 
        message: "Invalid quantity",
        required: {
          quantity: "Quantity must be a non-negative number"
        }
      });
    }

    await Cart.updateCartItemQuantity(cartId, productId, variantSku, quantity);
    res.status(200).json({ message: "Cart item quantity updated successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Xóa sản phẩm khỏi giỏ hàng
exports.removeFromCart = async (req, res) => {
  try {
    const { cartId, productId, variantSku } = req.params;

    await Cart.removeFromCart(cartId, productId, variantSku);
    res.status(200).json({ message: "Item removed from cart successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
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