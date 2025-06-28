const mongoose = require("mongoose");
const ImageModel = require("./image.model");
const Product = require("./product.model");

const productCatalogueSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: "",
  },
  icon: {
    type: String,
    default: null,
  },
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ProductCatalogue",
    default: null,
    set: function (v) {
      return v === "" || v === null || v === undefined ? null : v;
    },
    get: function (v) {
      return v === "" ? null : v;
    },
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
});

// Pre-save middleware to handle icon and parentId
productCatalogueSchema.pre("save", async function (next) {
  // Handle icon
  if (
    this.isModified("icon") &&
    this.icon &&
    this.icon.startsWith("data:image")
  ) {
    const tempId = this._id || Date.now().toString();
    const iconPath = await ImageModel.saveImage(this.icon, "icon");
    this.icon = iconPath;
  }

  // Ensure parentId is null if empty
  if (this.isModified("parentId")) {
    this.parentId =
      this.parentId === "" || this.parentId === undefined
        ? null
        : this.parentId;
  }

  next();
});

// Static method to get catalogue by ID
productCatalogueSchema.statics.getById = async function (id) {
  try {
    const catalogue = await this.findById(id);
    if (!catalogue) {
      throw new Error("ProductCatalogue not found");
    }
    if (catalogue.deletedAt) {
      throw new Error("ProductCatalogue has been deleted");
    }
    return catalogue;
  } catch (error) {
    throw new Error(`Error getting productCatalogue by ID: ${error.message}`);
  }
};

// Static method to get children catalogues
productCatalogueSchema.statics.getChildren = async function (parentId) {
  try {
    return await this.find({
      parentId,
      deletedAt: null,
    });
  } catch (error) {
    throw new Error(`Error fetching child catalogues: ${error.message}`);
  }
};

// Static method to get catalogue tree
productCatalogueSchema.statics.getTree = async function () {
  try {
    const allCatalogues = await this.find({ deletedAt: null });

    const catalogueMap = new Map();
    allCatalogues.forEach((cat) => {
      catalogueMap.set(cat._id.toString(), {
        ...cat.toObject(),
        children: [],
      });
    });

    const tree = [];
    allCatalogues.forEach((cat) => {
      const catObj = catalogueMap.get(cat._id.toString());
      if (cat.parentId) {
        const parent = catalogueMap.get(cat.parentId.toString());
        if (parent) {
          parent.children.push(catObj);
        }
      } else {
        tree.push(catObj);
      }
    });

    return tree;
  } catch (error) {
    throw new Error(`Error fetching catalogue tree: ${error.message}`);
  }
};

// Static method to get all catalogues
productCatalogueSchema.statics.getAll = async function () {
  try {
    return await this.find({ deletedAt: null });
  } catch (error) {
    throw new Error(`Error fetching all catalogues: ${error.message}`);
  }
};

// Static method to get product count for a catalogue
productCatalogueSchema.statics.getProductCount = async function (catalogueId) {
  try {
    const count = await Product.countDocuments({
      catalogueId,
      deletedAt: null,
      publish: true,
    });
    return count;
  } catch (error) {
    throw new Error(`Error counting products in catalogue: ${error.message}`);
  }
};

// Static method to get all catalogues with product count
productCatalogueSchema.statics.getAllWithProductCount = async function () {
  try {
    const catalogues = await this.find({ deletedAt: null });
    const cataloguesWithCount = await Promise.all(
      catalogues.map(async (catalogue) => {
        const count = await this.getProductCount(catalogue._id);
        return {
          ...catalogue.toObject(),
          productCount: count,
        };
      })
    );
    return cataloguesWithCount;
  } catch (error) {
    throw new Error(
      `Error getting catalogues with product count: ${error.message}`
    );
  }
};

// Static method to soft delete catalogue
productCatalogueSchema.statics.softDelete = async function (id) {
  try {
    const catalogue = await this.findById(id);
    if (!catalogue) {
      throw new Error("ProductCatalogue not found");
    }
    if (catalogue.deletedAt) {
      throw new Error("ProductCatalogue has already been deleted");
    }

    // Check if catalogue has children (other catalogues using this as parentId)
    const childrenCount = await this.countDocuments({
      parentId: id,
      deletedAt: null,
    });
    if (childrenCount > 0) {
      throw new Error("Cannot delete catalogue that has child catalogues");
    }

    // Check if catalogue has products
    const Product = mongoose.model("Product");
    const productCount = await Product.countDocuments({
      catalogueId: id,
      deletedAt: null,
    });
    if (productCount > 0) {
      throw new Error("Cannot delete catalogue that has products");
    }

    catalogue.deletedAt = new Date();
    catalogue.updatedAt = new Date();
    await catalogue.save();
    return catalogue;
  } catch (error) {
    throw new Error(`Error soft deleting productCatalogue: ${error.message}`);
  }
};

// Static method to check if catalogue can be deleted
productCatalogueSchema.statics.canDelete = async function (id) {
  try {
    const catalogue = await this.findById(id);
    if (!catalogue) {
      throw new Error("ProductCatalogue not found");
    }
    if (catalogue.deletedAt) {
      return {
        canDelete: false,
        reason: "Danh mục đã được xóa trước đó",
      };
    }

    // Check if catalogue has children
    const childrenCount = await this.countDocuments({
      parentId: id,
      deletedAt: null,
    });

    // Check if catalogue has products
    const Product = mongoose.model("Product");
    const productCount = await Product.countDocuments({
      catalogueId: id,
      deletedAt: null,
    });

    if (childrenCount > 0) {
      return {
        canDelete: false,
        reason: `Danh mục có ${childrenCount} danh mục con. Vui lòng xóa các danh mục con trước.`,
        childrenCount,
      };
    }

    if (productCount > 0) {
      return {
        canDelete: false,
        reason: `Danh mục có ${productCount} sản phẩm. Vui lòng xóa hoặc di chuyển các sản phẩm trước.`,
        productCount,
      };
    }

    return {
      canDelete: true,
      reason: "Có thể xóa danh mục",
    };
  } catch (error) {
    throw new Error(
      `Error checking if catalogue can be deleted: ${error.message}`
    );
  }
};

const ProductCatalogue = mongoose.model(
  "ProductCatalogue",
  productCatalogueSchema
);

module.exports = ProductCatalogue;
