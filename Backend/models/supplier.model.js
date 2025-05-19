const mongoose = require('mongoose');

const supplierSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  address: {
    type: String,
    default: ""
  },
  phone: {
    type: String,
    default: ""
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: null
  },
  deletedAt: {
    type: Date,
    default: null
  }
});

// Static method to get supplier by ID
supplierSchema.statics.getById = async function(id) {
  try {
    const supplier = await this.findById(id);
    if (!supplier) {
      throw new Error("Supplier not found");
    }
    if (supplier.deletedAt) {
      throw new Error("Supplier has been deleted");
    }
    return supplier;
  } catch (error) {
    throw new Error(`Error getting supplier by ID: ${error.message}`);
  }
};

// Static method to get all suppliers
supplierSchema.statics.getAll = async function() {
  try {
    return await this.find({ deletedAt: null });
  } catch (error) {
    throw new Error(`Error fetching suppliers: ${error.message}`);
  }
};

// Static method to create new supplier
supplierSchema.statics.create = async function(data) {
  try {
    const supplier = new this(data);
    await supplier.save();
    return supplier;
  } catch (error) {
    throw new Error(`Error creating supplier: ${error.message}`);
  }
};

// Static method to update supplier
supplierSchema.statics.update = async function(id, data) {
  try {
    const supplier = await this.findById(id);
    if (!supplier) {
      throw new Error("Supplier not found");
    }
    if (supplier.deletedAt) {
      throw new Error("Supplier has been deleted");
    }
    
    Object.assign(supplier, data);
    supplier.updatedAt = new Date();
    await supplier.save();
    return supplier;
  } catch (error) {
    throw new Error(`Error updating supplier: ${error.message}`);
  }
};

// Static method to delete supplier (soft delete)
supplierSchema.statics.delete = async function(id) {
  try {
    const supplier = await this.findById(id);
    if (!supplier) {
      throw new Error("Supplier not found");
    }
    if (supplier.deletedAt) {
      throw new Error("Supplier has already been deleted");
    }
    
    supplier.deletedAt = new Date();
    await supplier.save();
    return true;
  } catch (error) {
    throw new Error(`Error deleting supplier: ${error.message}`);
  }
};

const Supplier = mongoose.model('Supplier', supplierSchema);

module.exports = Supplier; 