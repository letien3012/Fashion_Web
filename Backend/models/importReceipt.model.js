const mongoose = require("mongoose");

const importReceiptSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
  },
  supplierId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Supplier",
    required: true,
  },
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee",
    required: true,
  },
  total_price: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "processing", "completed", "cancelled"],
    default: "pending",
  },
  note: {
    type: String,
    default: "",
  },
  import_details: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },
      sku: {
        type: String,
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
      },
      price: {
        type: Number,
        required: true,
      },
      attributeId1: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Attribute",
      },
      attributeId2: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Attribute",
      },
      variant_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Variant",
        required: true,
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

// Static method to get import receipt by ID
importReceiptSchema.statics.getById = async function (id) {
  try {
    const importReceipt = await this.findById(id)
      .populate("supplierId", "name")
      .populate("employeeId", "email fullname")
      .populate("import_details.productId", "name image")
      .populate("import_details.attributeId1", "name")
      .populate("import_details.attributeId2", "name");

    if (!importReceipt) {
      throw new Error("Import receipt not found");
    }
    if (importReceipt.deletedAt) {
      throw new Error("Import receipt has been deleted");
    }
    return importReceipt;
  } catch (error) {
    throw new Error(`Error getting import receipt by ID: ${error.message}`);
  }
};

// Static method to create new import receipt
importReceiptSchema.statics.create = async function (data) {
  try {
    const importReceipt = new this(data);
    await importReceipt.save();
    return importReceipt;
  } catch (error) {
    throw new Error(`Error creating import receipt: ${error.message}`);
  }
};

// Static method to update import receipt
importReceiptSchema.statics.update = async function (id, data) {
  try {
    const importReceipt = await this.findById(id);
    if (!importReceipt) {
      throw new Error("Import receipt not found");
    }
    if (importReceipt.deletedAt) {
      throw new Error("Import receipt has been deleted");
    }

    Object.assign(importReceipt, data);
    importReceipt.updatedAt = new Date();
    await importReceipt.save();
    return importReceipt;
  } catch (error) {
    throw new Error(`Error updating import receipt: ${error.message}`);
  }
};

// Static method to delete import receipt (soft delete)
importReceiptSchema.statics.delete = async function (id) {
  try {
    const importReceipt = await this.findById(id);
    if (!importReceipt) {
      throw new Error("Import receipt not found");
    }
    if (importReceipt.deletedAt) {
      throw new Error("Import receipt has already been deleted");
    }

    importReceipt.deletedAt = new Date();
    await importReceipt.save();
    return true;
  } catch (error) {
    throw new Error(`Error deleting import receipt: ${error.message}`);
  }
};

// Static method to get all import receipts
importReceiptSchema.statics.getAll = async function () {
  try {
    return await this.find({ deletedAt: null })
      .populate("supplierId", "name")
      .populate("employeeId", "email fullname")
      .populate("import_details.productId", "name image");
  } catch (error) {
    throw new Error(`Error fetching import receipts: ${error.message}`);
  }
};

// Static method to update import receipt status
importReceiptSchema.statics.updateStatus = async function (id, status) {
  try {
    const importReceipt = await this.findById(id);
    if (!importReceipt) {
      throw new Error("Import receipt not found");
    }
    if (importReceipt.deletedAt) {
      throw new Error("Import receipt has been deleted");
    }

    importReceipt.status = status;
    importReceipt.updatedAt = new Date();
    await importReceipt.save();
    return importReceipt;
  } catch (error) {
    throw new Error(`Error updating import receipt status: ${error.message}`);
  }
};

// Static method to add consignment
importReceiptSchema.statics.addConsignment = async function (
  id,
  consignmentData
) {
  try {
    const importReceipt = await this.findById(id);
    if (!importReceipt) {
      throw new Error("Import receipt not found");
    }
    if (importReceipt.deletedAt) {
      throw new Error("Import receipt has been deleted");
    }

    // Add consignment to import receipt
    importReceipt.consignments = importReceipt.consignments || [];
    importReceipt.consignments.push(consignmentData);
    importReceipt.updatedAt = new Date();
    await importReceipt.save();
    return importReceipt;
  } catch (error) {
    throw new Error(`Error adding consignment: ${error.message}`);
  }
};

const ImportReceipt = mongoose.model("ImportReceipt", importReceiptSchema);

module.exports = ImportReceipt;
