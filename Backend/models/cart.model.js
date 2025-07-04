const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Customer",
    required: true,
  },
  items: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },
      variants: [
        {
          _id: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
          },
          sku: String,
          quantity: Number,
          price: Number,
        },
      ],
      quantity: {
        type: Number,
        required: true,
        min: 1,
      },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: null,
  },
  deletedAt: {
    type: Date,
    default: null,
  },
});

// Validate cart item
cartSchema.statics.validateCartItem = function (item) {
  if (!item.productId) {
    throw new Error("Product ID is required in cart item");
  }
  if (!item.variants || item.variants.length === 0) {
    throw new Error("Variant information is required in cart item");
  }
  if (typeof item.quantity !== "number" || item.quantity <= 0) {
    throw new Error("Quantity must be a positive number");
  }
  return true;
};

// Get cart by customer ID
cartSchema.statics.getByCustomerId = async function (customerId) {
  try {
    const cart = await this.findOne({ customerId }).populate({
      path: "items.productId",
      select: "name image price publish deletedAt",
      match: {
        deletedAt: null,
      },
    });

    if (!cart) {
      return null;
    }

    const originalItemsCount = cart.items.length;

    // Filter out items with deleted/unpublished products
    cart.items = cart.items.filter((item) => item.productId !== null);

    // For each remaining item, validate variants exist in the product
    for (let i = cart.items.length - 1; i >= 0; i--) {
      const item = cart.items[i];
      const product = item.productId;

      // Get current product variants to check if cart variants still exist
      const currentProduct = await mongoose
        .model("Product")
        .findById(product._id);
      if (!currentProduct) {
        // Product was deleted, remove this item
        cart.items.splice(i, 1);
        continue;
      }

      // Filter out variants that no longer exist in the product
      const validVariants = item.variants.filter((cartVariant) => {
        const variantExists = currentProduct.variants.some(
          (productVariant) =>
            productVariant._id.toString() === cartVariant._id.toString() &&
            productVariant.publish !== false
        );
        return variantExists;
      });

      if (validVariants.length === 0) {
        // No valid variants left, remove the entire item
        cart.items.splice(i, 1);
      } else {
        // Update item with only valid variants
        item.variants = validVariants;
        item.quantity = validVariants.reduce(
          (total, variant) => total + variant.quantity,
          0
        );
      }
    }

    // Save the cleaned cart if items were removed
    if (cart.items.length !== originalItemsCount) {
      cart.updatedAt = new Date();
      await cart.save();
    }

    return cart;
  } catch (error) {
    throw new Error(`Error getting cart: ${error.message}`);
  }
};

// Add item to cart
cartSchema.statics.addToCart = async function (cartId, item) {
  try {
    this.validateCartItem(item);

    const cart = await this.findById(cartId);
    if (!cart) {
      throw new Error("Cart not found");
    }

    // Check if product already exists in cart
    const existingItemIndex = cart.items.findIndex(
      (cartItem) => cartItem.productId.toString() === item.productId.toString()
    );

    if (existingItemIndex !== -1) {
      // Update existing item
      const existingItem = cart.items[existingItemIndex];

      // Update variants
      item.variants.forEach((newVariant) => {
        const existingVariantIndex = existingItem.variants.findIndex(
          (v) => v.sku === newVariant.sku
        );

        if (existingVariantIndex !== -1) {
          existingItem.variants[existingVariantIndex].quantity +=
            newVariant.quantity;
        } else {
          existingItem.variants.push(newVariant);
        }
      });

      existingItem.quantity += item.quantity;
    } else {
      // Add new item
      cart.items.push(item);
    }

    cart.updatedAt = new Date();
    await cart.save();
    return cart;
  } catch (error) {
    throw new Error(`Error adding to cart: ${error.message}`);
  }
};

// Update cart item quantity
cartSchema.statics.updateCartItemQuantity = async function (
  cartId,
  productId,
  variantSku,
  quantity
) {
  try {
    const cart = await this.findById(cartId);
    if (!cart) {
      throw new Error("Cart not found");
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId.toString()
    );

    if (itemIndex === -1) {
      throw new Error("Item not found in cart");
    }

    const item = cart.items[itemIndex];
    const variantIndex = item.variants.findIndex((v) => v.sku === variantSku);

    if (variantIndex === -1) {
      throw new Error("Variant not found in cart item");
    }

    if (quantity <= 0) {
      // Remove variant if quantity is 0 or negative
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
    return cart;
  } catch (error) {
    throw new Error(`Error updating cart item quantity: ${error.message}`);
  }
};

// Remove item from cart
cartSchema.statics.removeFromCart = async function (
  cartId,
  productId,
  variantId
) {
  try {
    const cart = await this.findById(cartId);
    if (!cart) {
      throw new Error("Cart not found");
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId.toString()
    );

    if (itemIndex === -1) {
      throw new Error("Item not found in cart");
    }

    const item = cart.items[itemIndex];

    // Find the specific variant by _id
    const variantToRemove = item.variants.find(
      (v) => v._id.toString() === variantId.toString()
    );

    if (!variantToRemove) {
      throw new Error("Variant not found in cart item");
    }

    // Remove only the specific variant by filtering out the one we want to remove
    item.variants = item.variants.filter(
      (v) => v._id.toString() !== variantId.toString()
    );

    // Update the total quantity of the product
    item.quantity = item.variants.reduce(
      (total, variant) => total + variant.quantity,
      0
    );

    cart.updatedAt = new Date();
    await cart.save();
    return cart;
  } catch (error) {
    throw new Error(`Error removing from cart: ${error.message}`);
  }
};

// Clean cart items for deleted/unpublished products
cartSchema.statics.cleanInvalidItems = async function (customerId) {
  try {
    const cart = await this.findOne({ customerId });
    if (!cart) {
      return null;
    }

    const originalItemsCount = cart.items.length;
    let hasChanges = false;

    // Filter out items with deleted/unpublished products
    for (let i = cart.items.length - 1; i >= 0; i--) {
      const item = cart.items[i];

      // Check if product exists and is published
      const product = await mongoose.model("Product").findById(item.productId);
      if (!product || product.deletedAt || !product.publish) {
        cart.items.splice(i, 1);
        hasChanges = true;
        continue;
      }

      // Filter out invalid variants
      const validVariants = item.variants.filter((cartVariant) => {
        const variantExists = product.variants.some(
          (productVariant) =>
            productVariant._id.toString() === cartVariant._id.toString() &&
            productVariant.publish !== false
        );
        return variantExists;
      });

      if (validVariants.length === 0) {
        // No valid variants left, remove the entire item
        cart.items.splice(i, 1);
        hasChanges = true;
      } else if (validVariants.length !== item.variants.length) {
        // Some variants were removed
        item.variants = validVariants;
        item.quantity = validVariants.reduce(
          (total, variant) => total + variant.quantity,
          0
        );
        hasChanges = true;
      }
    }

    // Save the cleaned cart if there were changes
    if (hasChanges) {
      cart.updatedAt = new Date();
      await cart.save();
    }

    return cart;
  } catch (error) {
    throw new Error(`Error cleaning cart: ${error.message}`);
  }
};

const Cart = mongoose.model("Cart", cartSchema);

module.exports = Cart;
