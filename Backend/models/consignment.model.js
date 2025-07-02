const mongoose = require("mongoose");

const consignmentSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    variantId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    quantity: {
      type: Number,
      required: true,
      min: 0,
    },
    current_quantity: {
      type: Number,
      required: true,
      min: 0,
    },
    publish: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Static method to get consignment by ID
consignmentSchema.statics.getById = async function (id) {
  try {
    const consignment = await this.findById(id);
    if (!consignment) {
      throw new Error("Consignment not found");
    }
    return consignment;
  } catch (error) {
    throw new Error(`Error getting consignment: ${error.message}`);
  }
};

// Static method to get all consignments
consignmentSchema.statics.getAll = async function () {
  try {
    return await this.find();
  } catch (error) {
    throw new Error(`Error fetching consignments: ${error.message}`);
  }
};

// Static method to update current quantity
consignmentSchema.statics.updateCurrentQuantity = async function (
  id,
  current_quantity
) {
  try {
    const consignment = await this.findById(id);
    if (!consignment) {
      throw new Error("Consignment not found");
    }

    if (current_quantity < 0) {
      throw new Error("Current quantity cannot be negative");
    }

    if (current_quantity > consignment.quantity) {
      throw new Error("Current quantity cannot exceed total quantity");
    }

    consignment.current_quantity = current_quantity;
    await consignment.save();
    return consignment;
  } catch (error) {
    throw new Error(`Error updating current quantity: ${error.message}`);
  }
};

// Static method to check if consignment has enough quantity
consignmentSchema.statics.checkQuantity = async function (
  id,
  requiredQuantity
) {
  try {
    const consignment = await this.findById(id);
    if (!consignment) {
      throw new Error("Consignment not found");
    }

    return consignment.current_quantity >= requiredQuantity;
  } catch (error) {
    throw new Error(`Error checking quantity: ${error.message}`);
  }
};

// Static method to decrease current quantity
consignmentSchema.statics.decreaseQuantity = async function (id, amount) {
  try {
    const consignment = await this.findById(id);
    if (!consignment) {
      throw new Error("Consignment not found");
    }

    if (amount < 0) {
      throw new Error("Amount cannot be negative");
    }

    if (consignment.current_quantity < amount) {
      throw new Error("Insufficient quantity");
    }

    consignment.current_quantity -= amount;
    await consignment.save();
    return consignment;
  } catch (error) {
    throw new Error(`Error decreasing quantity: ${error.message}`);
  }
};

// Static method to increase current quantity
consignmentSchema.statics.increaseQuantity = async function (id, amount) {
  try {
    const consignment = await this.findById(id);
    if (!consignment) {
      throw new Error("Consignment not found");
    }

    if (amount < 0) {
      throw new Error("Amount cannot be negative");
    }

    if (consignment.current_quantity + amount > consignment.quantity) {
      throw new Error("Cannot increase quantity beyond total quantity");
    }

    consignment.current_quantity += amount;
    await consignment.save();
    return consignment;
  } catch (error) {
    throw new Error(`Error increasing quantity: ${error.message}`);
  }
};

// Static method to get consignment by product and variant
consignmentSchema.statics.getByProductAndVariant = async function (
  productId,
  variantId
) {
  try {
    const consignment = await this.findOne({
      productId,
      variantId,
      publish: true,
    });
    return consignment;
  } catch (error) {
    throw new Error(
      `Error getting consignment by product and variant: ${error.message}`
    );
  }
};

// Static method to get all consignments by product
consignmentSchema.statics.getByProduct = async function (productId) {
  try {
    const consignments = await this.find({
      productId,
      publish: true,
    });
    return consignments;
  } catch (error) {
    throw new Error(`Error getting consignments by product: ${error.message}`);
  }
};

// Static method to get stock quantity for a variant
consignmentSchema.statics.getVariantStock = async function (
  productId,
  variantId
) {
  try {
    const consignments = await this.find({
      productId,
      variantId,
      publish: true,
    }).select("current_quantity");

    // Tính tổng current_quantity cho đúng variant
    const totalStock = consignments.reduce(
      (sum, consignment) => sum + consignment.current_quantity,
      0
    );
    return totalStock;
  } catch (error) {
    throw new Error(`Error getting variant stock: ${error.message}`);
  }
};

module.exports = mongoose.model("Consignment", consignmentSchema);
