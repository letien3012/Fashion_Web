const mongoose = require('mongoose');
const ImageModel = require('./image.model');

const promotionSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: { type: String },
  image: { type: String },
  publish: { type: String, enum: ['active', 'inactive'], default: 'inactive' },
  type: { type: String, enum: ['product', 'voucher'], required: true },
  discount: { type: Number, required: true },
  // productId là danh sách các object gồm productId và variantId
  productId: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    variantId: { type: mongoose.Schema.Types.ObjectId, required: true }
  }],
  voucher_condition: {
    min_order_value: { type: Number },
    max_discount: { type: Number },
  },
  start_date: { type: Date },
  end_date: { type: Date },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
  deleted_at: { type: Date, default: null }
});

// Static methods
promotionSchema.statics.getAll = async function() {
  try {
    return await this.find({ deleted_at: null })
      .populate('productId.productId')
      .populate('productId.variantId');
  } catch (error) {
    throw new Error(`Error fetching promotions: ${error.message}`);
  }
};

promotionSchema.statics.getById = async function(id) {
  try {
    const promotion = await this.findOne({ _id: id, deleted_at: null })
      .populate('productId.productId')
      .populate('productId.variantId');
    if (!promotion) {
      throw new Error('Promotion not found');
    }
    return promotion;
  } catch (error) {
    throw new Error(`Error fetching promotion: ${error.message}`);
  }
};

promotionSchema.statics.getActivePromotions = async function() {
  try {
    const now = new Date();
    return await this.find({
      deleted_at: null,
      publish: 'active',
      start_date: { $lte: now },
      end_date: { $gte: now }
    })
    .populate('productId.productId')
    .populate('productId.variantId');
  } catch (error) {
    throw new Error(`Error fetching active promotions: ${error.message}`);
  }
};

promotionSchema.statics.getByCode = async function(code) {
  try {
    const promotion = await this.findOne({ code, deleted_at: null })
      .populate('productId.productId')
      .populate('productId.variantId');
    if (!promotion) {
      throw new Error('Promotion not found');
    }
    return promotion;
  } catch (error) {
    throw new Error(`Error fetching promotion by code: ${error.message}`);
  }
};

// Instance methods
promotionSchema.methods.savePromotion = async function() {
  try {
    this.updated_at = new Date();
    return await this.save();
  } catch (error) {
    throw new Error(`Error saving promotion: ${error.message}`);
  }
};

promotionSchema.methods.update = async function(data) {
  try {
    Object.assign(this, data);
    this.updated_at = new Date();
    return await this.save();
  } catch (error) {
    throw new Error(`Error updating promotion: ${error.message}`);
  }
};

promotionSchema.methods.delete = async function() {
  try {
    this.deleted_at = new Date();
    return await this.save();
  } catch (error) {
    throw new Error(`Error deleting promotion: ${error.message}`);
  }
};

promotionSchema.methods.restore = async function() {
  try {
    this.deleted_at = null;
    return await this.save();
  } catch (error) {
    throw new Error(`Error restoring promotion: ${error.message}`);
  }
};

// Pre-save middleware
promotionSchema.pre('save', async function(next) {
  try {
    // Validate product type promotions
    if (this.type === 'product') {
      if (!Array.isArray(this.productId) || this.productId.length === 0) {
        throw new Error('Product promotions must have at least one product');
      }
      
      for (const item of this.productId) {
        if (!item.productId || !item.variantId) {
          throw new Error('Each product must have both productId and variantId');
        }
      }
    }

    // Handle image upload
    if (this.isModified('image') && this.image && this.image.startsWith('data:image')) {
      const imagePath = await ImageModel.saveImage(this.image, 'promotion');
      this.image = imagePath.replace('/public', '');
    }
    
    this.updated_at = new Date();
    next();
  } catch (error) {
    next(error);
  }
});

// Pre-remove middleware to handle image deletion
promotionSchema.pre('remove', async function(next) {
  try {
    if (this.image) {
      await ImageModel.deleteImage(this.image);
    }
    next();
  } catch (error) {
    next(error);
  }
});

const Promotion = mongoose.model('Promotion', promotionSchema);

module.exports = Promotion; 