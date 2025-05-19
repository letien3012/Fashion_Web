const mongoose = require('mongoose');
const ImageModel = require('./image.model');

const productCatalogueSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ""
  },
  icon: {
    type: String,
    default: null
  },
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ProductCatalogue',
    default: null
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

// Pre-save middleware to handle icon
productCatalogueSchema.pre('save', async function(next) {
  if (this.isModified('icon') && this.icon && this.icon.startsWith('data:image')) {
    const tempId = this._id || Date.now().toString();
    const iconPath = await ImageModel.saveImage(this.icon, 'icon');
    this.icon = iconPath;
  }
  next();
});

// Static method to get catalogue by ID
productCatalogueSchema.statics.getById = async function(id) {
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
productCatalogueSchema.statics.getChildren = async function(parentId) {
  try {
    return await this.find({
      parentId,
      deletedAt: null
    });
  } catch (error) {
    throw new Error(`Error fetching child catalogues: ${error.message}`);
  }
};

// Static method to get catalogue tree
productCatalogueSchema.statics.getTree = async function() {
  try {
    const allCatalogues = await this.find({ deletedAt: null });
    
    const catalogueMap = new Map();
    allCatalogues.forEach(cat => {
      catalogueMap.set(cat._id.toString(), {
        ...cat.toObject(),
        children: []
      });
    });

    const tree = [];
    allCatalogues.forEach(cat => {
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
productCatalogueSchema.statics.getAll = async function() {
  try {
    return await this.find({ deletedAt: null });
  } catch (error) {
    throw new Error(`Error fetching all catalogues: ${error.message}`);
  }
};

const ProductCatalogue = mongoose.model('ProductCatalogue', productCatalogueSchema);

module.exports = ProductCatalogue; 