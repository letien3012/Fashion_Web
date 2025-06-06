const mongoose = require("mongoose");

const attributeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    attributeCatalogueId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AttributeCatalogue",
      required: true,
    },
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
  },
  {
    timestamps: true,
  }
);

// Static method to get all attributes
attributeSchema.statics.getAll = async function () {
  try {
    return await this.find({ deletedAt: null }).populate(
      "attributeCatalogueId",
      "name"
    );
  } catch (error) {
    throw new Error(`Error fetching attribute list: ${error.message}`);
  }
};

// Static method to get attribute by ID
attributeSchema.statics.getById = async function (id) {
  try {
    const attribute = await this.findById(id).populate(
      "attributeCatalogueId",
      "name"
    );
    if (!attribute) {
      throw new Error("Attribute not found");
    }
    if (attribute.deletedAt) {
      throw new Error("Attribute has been deleted");
    }
    return attribute;
  } catch (error) {
    throw new Error(`Error getting attribute by ID: ${error.message}`);
  }
};

// Static method to get attributes by catalogue ID
attributeSchema.statics.getByCatalogueId = async function (catalogueId) {
  try {
    return await this.find({
      attributeCatalogueId: catalogueId,
      deletedAt: null,
    }).populate("attributeCatalogueId", "name");
  } catch (error) {
    throw new Error(
      `Error fetching attributes by catalogue ID: ${error.message}`
    );
  }
};

// Static method to create new attribute
attributeSchema.statics.create = async function (data) {
  try {
    const attribute = new this(data);
    await attribute.save();
    return attribute;
  } catch (error) {
    throw new Error(`Error creating attribute: ${error.message}`);
  }
};

// Static method to update attribute
attributeSchema.statics.update = async function (id, data) {
  try {
    const attribute = await this.findById(id);
    if (!attribute) {
      throw new Error("Attribute not found");
    }
    if (attribute.deletedAt) {
      throw new Error("Attribute has been deleted");
    }

    Object.assign(attribute, data);
    attribute.updatedAt = new Date();
    await attribute.save();
    return attribute;
  } catch (error) {
    throw new Error(`Error updating attribute: ${error.message}`);
  }
};

// Static method to delete attribute (soft delete)
attributeSchema.statics.delete = async function (id) {
  try {
    const attribute = await this.findById(id);
    if (!attribute) {
      throw new Error("Attribute not found");
    }
    if (attribute.deletedAt) {
      throw new Error("Attribute has already been deleted");
    }

    attribute.deletedAt = new Date();
    await attribute.save();
    return true;
  } catch (error) {
    throw new Error(`Error deleting attribute: ${error.message}`);
  }
};

// Static method to add new attribute
attributeSchema.statics.add = async function (attributeData) {
  const attribute = new this(attributeData);
  return await attribute.save();
};

const Attribute = mongoose.model("Attribute", attributeSchema);

module.exports = Attribute;
