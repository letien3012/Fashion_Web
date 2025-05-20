const mongoose = require("mongoose");
const ImageModel = require('./image.model');

const productSchema = new mongoose.Schema({
  code: { type: String, required: true },
  name: { type: String, required: true },
  content: { type: String, default: "" },
  description: { type: String, default: "" },
  view_count: { type: Number, default: 0 },
  favorite_count: { type: Number, default: 0 },
  image: { type: String, default: null },
  album: [{ type: String }],
  catalogueId: { type: mongoose.Schema.Types.ObjectId, ref: 'ProductCatalogue', required: true },
  variants: [{
    sku: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    quantity_sold: { type: Number, default: 0 },
    image: { type: String, required: true },
    attributeId1: { type: mongoose.Schema.Types.ObjectId, ref: 'Attribute' },
    attributeId2: { type: mongoose.Schema.Types.ObjectId, ref: 'Attribute' }
  }],
  publish: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date },
  deletedAt: { type: Date }
});

// Pre-save middleware to handle images
productSchema.pre('save', async function(next) {
  try {
    console.log('Pre-save middleware - Processing product:', this._id);

    // Handle main image
    if (this.isModified('image') && this.image && this.image.startsWith('data:image')) {
      console.log('Processing main image');
      const imagePath = await ImageModel.saveImage(this.image, 'product');
      this.image = imagePath;
    }

    // Handle album images
    if (this.isModified('album') && this.album && this.album.length > 0) {
      console.log('Processing album images');
      const base64Images = this.album.filter(img => img.startsWith('data:image'));
      if (base64Images.length > 0) {
        const albumPaths = await ImageModel.saveMultipleImages(base64Images, 'product');
        this.album = albumPaths;
      }
    }

    // Handle variant images
    if (this.isModified('variants')) {
      console.log('Processing variant images');
      for (let variant of this.variants) {
        if (variant.image && variant.image.startsWith('data:image')) {
          const imagePath = await ImageModel.saveImage(variant.image, 'product');
          variant.image = imagePath;
        }
      }
    }

    next();
  } catch (error) {
    console.error('Pre-save middleware error:', error);
    next(error);
  }
});

// Pre-remove middleware to handle image deletion
productSchema.pre('remove', async function(next) {
  try {
    // Delete main image
    if (this.image) {
      await ImageModel.deleteImage(this.image);
    }

    // Delete album images
    if (this.album && this.album.length > 0) {
      await ImageModel.deleteMultipleImages(this.album);
    }

    // Delete variant images
    if (this.variants && this.variants.length > 0) {
      const variantImages = this.variants.map(v => v.image).filter(Boolean);
      if (variantImages.length > 0) {
        await ImageModel.deleteMultipleImages(variantImages);
      }
    }

    next();
  } catch (error) {
    next(error);
  }
});

const Product = mongoose.model('Product', productSchema);

Product.validateVariant = async function(variant) {
  try {
    console.log('Validating variant:', JSON.stringify(variant, null, 2));

    // Validate required fields
    if (!variant.sku) {
      throw new Error("Variant SKU is required");
    }

    // Validate price
    if (variant.price === undefined || variant.price === null) {
      throw new Error("Variant price is required");
    }
    const price = Number(variant.price);
    if (isNaN(price) || price < 0) {
      throw new Error("Variant price must be a positive number");
    }
    variant.price = price;

    // Validate quantity
    if (variant.quantity === undefined || variant.quantity === null) {
      throw new Error("Variant quantity is required");
    }
    const quantity = Number(variant.quantity);
    if (isNaN(quantity) || quantity < 0) {
      throw new Error("Variant quantity must be a positive number");
    }
    variant.quantity = quantity;

    // Validate image
    if (!variant.image) {
      throw new Error("Variant image is required");
    }

    // Handle variant image if it's base64
    if (variant.image.startsWith("data:image")) {
      try {
        const imagePath = await ImageModel.saveImage(variant.image, 'product');
        variant.image = imagePath;
      } catch (error) {
        console.error('Error saving variant image:', error);
        throw new Error("Failed to save variant image");
      }
    }

    // Validate attributes if they exist
    if (variant.attributeId1) {
      try {
        // Check if attributeId1 is a valid ObjectId
        if (!mongoose.Types.ObjectId.isValid(variant.attributeId1)) {
          throw new Error(`Invalid attribute ID format: ${variant.attributeId1}`);
        }
        const attribute1 = await mongoose.model('Attribute').findById(variant.attributeId1);
        if (!attribute1) {
          throw new Error(`Attribute ID '${variant.attributeId1}' does not exist`);
        }
      } catch (error) {
        console.error('Error validating attribute1:', error);
        throw new Error(`Invalid attribute ID: ${variant.attributeId1}`);
      }
    }

    if (variant.attributeId2) {
      try {
        // Check if attributeId2 is a valid ObjectId
        if (!mongoose.Types.ObjectId.isValid(variant.attributeId2)) {
          throw new Error(`Invalid attribute ID format: ${variant.attributeId2}`);
        }
        const attribute2 = await mongoose.model('Attribute').findById(variant.attributeId2);
        if (!attribute2) {
          throw new Error(`Attribute ID '${variant.attributeId2}' does not exist`);
        }
      } catch (error) {
        console.error('Error validating attribute2:', error);
        throw new Error(`Invalid attribute ID: ${variant.attributeId2}`);
      }
    }

    console.log('Variant validation successful');
    return true;
  } catch (error) {
    console.error('Variant validation error:', error);
    throw error;
  }
};

Product.getById = async function(id) {
  try {
    const product = await this.findById(id);
    if (!product) {
      throw new Error("Product not found");
    }
    return product;
  } catch (error) {
    throw new Error(`Error getting product by ID: ${error.message}`);
  }
};

Product.getByCatalogueId = async function(catalogueId) {
  try {
    return await this.find({ catalogueId });
  } catch (error) {
    throw new Error(`Error fetching products by catalogue: ${error.message}`);
  }
};

Product.prototype.save = async function() {
  try {
    let imagePath = null;
    let albumPaths = [];

    // Handle main image
    if (this.image && this.image.startsWith("data:image")) {
      const tempId = Date.now().toString();
      imagePath = await Product.saveImage(this.image, tempId);
    }

    // Handle album images
    if (this.album && this.album.length > 0) {
      const base64Images = this.album.filter((img) =>
        img.startsWith("data:image")
      );
      if (base64Images.length > 0) {
        const tempId = Date.now().toString();
        albumPaths = await Product.saveMultipleImages(base64Images, tempId);
      }
    }

    const productData = {
      code: this.code,
      name: this.name,
      content: this.content,
      description: this.description,
      view_count: this.view_count,
      favorite_count: this.favorite_count,
      image: imagePath,
      album: albumPaths,
      catalogueId: this.catalogueId,
      variants: this.variants,
      publish: this.publish,
      createdAt: this.createdAt,
      updatedAt: null,
      deletedAt: null,
    };

    const product = new Product(productData);
    await product.save();
    const productId = product._id;

    // Rename files with actual product ID
    if (imagePath) {
      const oldPath = path.join(__dirname, "../public", imagePath);
      const newPath = path.join(
        __dirname,
        "../public/images/product",
        `${productId}_${Date.now()}.jpg`
      );
      fs.renameSync(oldPath, newPath);
      imagePath = `/images/product/${path.basename(newPath)}`;
    }

    if (albumPaths.length > 0) {
      const newAlbumPaths = [];
      for (let i = 0; i < albumPaths.length; i++) {
        const oldPath = path.join(__dirname, "../public", albumPaths[i]);
        const newPath = path.join(
          __dirname,
          "../public/images/product",
          `${productId}_${Date.now()}_${i}.jpg`
        );
        fs.renameSync(oldPath, newPath);
        newAlbumPaths.push(`/images/product/${path.basename(newPath)}`);
      }
      albumPaths = newAlbumPaths;
    }

    // Update product with final image paths
    await Product.findByIdAndUpdate(productId, {
      image: imagePath,
      album: albumPaths,
    });

    return productId;
  } catch (error) {
    throw new Error(`Error saving product: ${error.message}`);
  }
};

Product.update = async function(id, data) {
  try {
    let imagePath = data.image;
    let albumPaths = data.album || [];
    let updateData = { ...data };

    // Handle main image update
    if (data.image && data.image.startsWith("data:image")) {
      const oldProduct = await Product.findById(id);
      if (oldProduct.image) {
        await Product.deleteImage(oldProduct.image);
      }
      imagePath = await Product.saveImage(data.image, id);
      updateData.image = imagePath;
    }

    // Handle album images update
    if (data.album && data.album.length > 0) {
      const oldProduct = await Product.findById(id);
      if (oldProduct.album && oldProduct.album.length > 0) {
        await Product.deleteMultipleImages(oldProduct.album);
      }

      const base64Images = data.album.filter((img) =>
        img.startsWith("data:image")
      );
      if (base64Images.length > 0) {
        albumPaths = await Product.saveMultipleImages(base64Images, id);
        updateData.album = albumPaths;
      }
    }

    updateData.updatedAt = new Date();
    await Product.findByIdAndUpdate(id, updateData);
    return true;
  } catch (error) {
    throw new Error(`Error updating product: ${error.message}`);
  }
};

Product.addVariant = async function(productId, variant) {
  try {
    await Product.validateVariant(variant);

    const product = await this.findById(productId);
    if (!product) {
      throw new Error("Product not found");
    }

    product.variants.push(variant);
    product.updatedAt = new Date();
    await product.save();

    return true;
  } catch (error) {
    throw new Error(`Error adding variant: ${error.message}`);
  }
};

Product.updateVariant = async function(productId, variantIndex, variant) {
  try {
    await Product.validateVariant(variant);

    const product = await this.findById(productId);
    if (!product) {
      throw new Error("Product not found");
    }

    if (variantIndex >= product.variants.length) {
      throw new Error("Variant index out of bounds");
    }

    product.variants[variantIndex] = variant;
    product.updatedAt = new Date();
    await product.save();

    return true;
  } catch (error) {
    throw new Error(`Error updating variant: ${error.message}`);
  }
};

Product.findVariantIndexBySku = async function(productId, sku) {
  try {
    const product = await this.findById(productId);
    if (!product) {
      throw new Error("Product not found");
    }

    const index = product.variants.findIndex((variant) => variant.sku === sku);
    if (index === -1) {
      throw new Error(`Variant with SKU '${sku}' not found`);
    }

    return index;
  } catch (error) {
    throw new Error(`Error finding variant index: ${error.message}`);
  }
};

Product.checkVariantQuantity = async function(productId, variantIndex, quantity) {
  try {
    const product = await this.findById(productId);
    if (!product) {
      throw new Error("Product not found");
    }

    if (variantIndex >= product.variants.length) {
      throw new Error("Variant index out of bounds");
    }

    const variant = product.variants[variantIndex];
    const availableQuantity = variant.quantity - variant.quantity_sold;

    if (availableQuantity < quantity) {
      throw new Error(
        `Insufficient quantity. Available: ${availableQuantity}, Requested: ${quantity}`
      );
    }

    return {
      success: true,
      availableQuantity: availableQuantity,
      variant: variant,
    };
  } catch (error) {
    throw new Error(`Error checking variant quantity: ${error.message}`);
  }
};

Product.updateVariantQuantity = async function(productId, variantIndex, quantity) {
  try {
    const product = await this.findById(productId);
    if (!product) {
      throw new Error("Product not found");
    }

    if (variantIndex >= product.variants.length) {
      throw new Error("Variant index out of bounds");
    }

    const variant = product.variants[variantIndex];
    const availableQuantity = variant.quantity - variant.quantity_sold;

    if (availableQuantity < quantity) {
      throw new Error(
        `Insufficient quantity. Available: ${availableQuantity}, Requested: ${quantity}`
      );
    }

    product.variants[variantIndex].quantity_sold += quantity;
    product.updatedAt = new Date();
    await product.save();

    return {
      success: true,
      message: "Quantity updated successfully",
      newQuantitySold: product.variants[variantIndex].quantity_sold,
      remainingQuantity:
        product.variants[variantIndex].quantity -
        product.variants[variantIndex].quantity_sold,
    };
  } catch (error) {
    throw new Error(`Error updating variant quantity: ${error.message}`);
  }
};

Product.checkAndUpdateVariantQuantity = async function(
  productId,
  variantIndex,
  quantity
) {
  try {
    const checkResult = await this.checkVariantQuantity(
      productId,
      variantIndex,
      quantity
    );

    if (!checkResult.success) {
      throw new Error("Quantity check failed");
    }

    const updateResult = await this.updateVariantQuantity(
      productId,
      variantIndex,
      quantity
    );

    return {
      success: true,
      message: "Check and update successful",
      checkResult,
      updateResult,
    };
  } catch (error) {
    throw new Error(`Error in check and update: ${error.message}`);
  }
};

Product.deleteVariant = async function(productId, variantIndex) {
  try {
    const product = await this.findById(productId);
    if (!product) {
      throw new Error("Product not found");
    }

    if (variantIndex >= product.variants.length) {
      throw new Error("Variant index out of bounds");
    }

    product.variants.splice(variantIndex, 1);
    product.updatedAt = new Date();
    await product.save();

    return true;
  } catch (error) {
    throw new Error(`Error deleting variant: ${error.message}`);
  }
};

Product.delete = async function(id) {
  try {
    await this.findByIdAndDelete(id);
    return true;
  } catch (error) {
    throw new Error(`Error deleting product: ${error.message}`);
  }
};

Product.getAll = async function() {
  try {
    return await this.find();
  } catch (error) {
    throw new Error(`Error fetching products: ${error.message}`);
  }
};

Product.incrementViewCount = async function(id) {
  try {
    await this.findByIdAndUpdate(id, {
      $inc: { view_count: 1 },
      updatedAt: new Date(),
    });
    return true;
  } catch (error) {
    throw new Error(`Error incrementing view count: ${error.message}`);
  }
};

Product.incrementFavoriteCount = async function(id) {
  try {
    await this.findByIdAndUpdate(id, {
      $inc: { favorite_count: 1 },
      updatedAt: new Date(),
    });
    return true;
  } catch (error) {
    throw new Error(`Error incrementing favorite count: ${error.message}`);
  }
};

Product.decrementFavoriteCount = async function(id) {
  try {
    await this.findByIdAndUpdate(id, {
      $inc: { favorite_count: -1 },
      updatedAt: new Date(),
    });
    return true;
  } catch (error) {
    throw new Error(`Error decrementing favorite count: ${error.message}`);
  }
};

module.exports = Product;
