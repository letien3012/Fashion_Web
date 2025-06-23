const mongoose = require("mongoose");
const ImageModel = require("./image.model");
const { extractAndSaveFeatures } = require("../imageService/imageService");
const axios = require("axios");

const productSchema = new mongoose.Schema({
  code: { type: String, required: true },
  name: { type: String, required: true },
  content: { type: String, default: "" },
  description: { type: String, default: "" },
  view_count: { type: Number, default: 0 },
  favorite_count: { type: Number, default: 0 },
  image: { type: String, default: null },
  album: [{ type: String }],
  catalogueId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ProductCatalogue",
    required: true,
  },
  attributeCatalogueIds: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AttributeCatalogue",
      validate: {
        validator: function (v) {
          return this.attributeCatalogueIds.length <= 2;
        },
        message: "Cannot have more than 2 attribute catalogues",
      },
    },
  ],
  variants: [
    {
      sku: { type: String, required: true },
      price: { type: Number, required: true },
      image: { type: String, required: true },
      attributeId1: { type: mongoose.Schema.Types.ObjectId, ref: "Attribute" },
      attributeId2: { type: mongoose.Schema.Types.ObjectId, ref: "Attribute" },
      publish: { type: Boolean, default: true },
    },
  ],
  publish: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date },
  deletedAt: { type: Date },
});

// Pre-save middleware to handle images
productSchema.pre("save", async function (next) {
  try {
    console.log("Pre-save middleware - Processing product:", this._id);

    // Handle main image
    if (
      this.isModified("image") &&
      this.image &&
      this.image.startsWith("data:image")
    ) {
      console.log("Processing main image");
      const imagePath = await ImageModel.saveImage(this.image, "product");
      this.image = imagePath;
    }

    // Handle album images
    if (this.isModified("album") && this.album && this.album.length > 0) {
      console.log("Processing album images");
      const base64Images = this.album.filter((img) =>
        img.startsWith("data:image")
      );
      if (base64Images.length > 0) {
        const albumPaths = await ImageModel.saveMultipleImages(
          base64Images,
          "product"
        );
        this.album = albumPaths;
      }
    }

    // Handle variant images
    if (this.isModified("variants")) {
      console.log("Processing variant images");
      for (let variant of this.variants) {
        if (variant.image && variant.image.startsWith("data:image")) {
          const imagePath = await ImageModel.saveImage(
            variant.image,
            "product"
          );
          variant.image = imagePath;
        }
      }
    }

    next();
  } catch (error) {
    console.error("Pre-save middleware error:", error);
    next(error);
  }
});

// Pre-remove middleware to handle image deletion
productSchema.pre("remove", async function (next) {
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
      const variantImages = this.variants.map((v) => v.image).filter(Boolean);
      if (variantImages.length > 0) {
        await ImageModel.deleteMultipleImages(variantImages);
      }
    }

    next();
  } catch (error) {
    next(error);
  }
});

const Product = mongoose.model("Product", productSchema);

Product.validateVariant = async function (variant) {
  try {
    // Validate required fields
    if (!variant.sku) {
      throw new Error("Mã SKU là bắt buộc");
    }
    if (!variant.price) {
      throw new Error("Giá sản phẩm là bắt buộc");
    }
    if (!variant.attributeId1) {
      throw new Error("Thuộc tính đầu tiên là bắt buộc");
    }

    // Validate price
    const price = Number(variant.price);
    if (isNaN(price) || price < 0) {
      throw new Error("Giá sản phẩm phải là số dương");
    }
    variant.price = price;

    // Validate image
    if (variant.image && variant.image.startsWith("data:image")) {
      try {
        variant.image = await ImageModel.saveImage(variant.image, "product");
      } catch (error) {
        console.error("Error saving variant image:", error);
        throw new Error("Failed to save variant image");
      }
    }

    // Validate attributeId1
    if (variant.attributeId1) {
      console.log("Validating attributeId1:", variant.attributeId1);
      try {
        const attribute1 = await mongoose
          .model("Attribute")
          .findById(variant.attributeId1);
        if (!attribute1) {
          console.error("AttributeId1 not found:", variant.attributeId1);
          throw new Error("First attribute does not exist");
        }
        console.log(
          "AttributeId1 validated successfully:",
          variant.attributeId1
        );
      } catch (error) {
        console.error(
          "Error validating first attribute:",
          variant.attributeId1,
          error
        );
        throw new Error("Invalid first attribute");
      }
    }

    // Validate attributeId2
    if (variant.attributeId2) {
      console.log("Validating attributeId2:", variant.attributeId2);
      try {
        const attribute2 = await mongoose
          .model("Attribute")
          .findById(variant.attributeId2);
        if (!attribute2) {
          console.error("AttributeId2 not found:", variant.attributeId2);
          throw new Error("Second attribute does not exist");
        }
        console.log(
          "AttributeId2 validated successfully:",
          variant.attributeId2
        );
      } catch (error) {
        console.error(
          "Error validating second attribute:",
          variant.attributeId2,
          error
        );
        throw new Error("Invalid second attribute");
      }
    }

    return true;
  } catch (error) {
    console.error("Variant validation error:", error);
    throw error;
  }
};

Product.getById = async function (id) {
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

Product.getByCatalogueId = async function (catalogueId) {
  try {
    return await this.find({ catalogueId });
  } catch (error) {
    throw new Error(`Error fetching products by catalogue: ${error.message}`);
  }
};

Product.prototype.save = async function () {
  try {
    // Handle main image
    if (this.image && this.image.startsWith("data:image")) {
      this.image = await ImageModel.saveImage(this.image, "product");
      // Trích xuất đặc trưng cho ảnh chính
      await axios.post(
        "http://localhost:3005/api/imageService/extract-features",
        {
          imagePath: `http://localhost:3005${this.image}`,
          productId: this._id,
        }
      );
    }

    // Handle album images
    if (this.album && this.album.length > 0) {
      const base64Images = this.album.filter((img) =>
        img.startsWith("data:image")
      );
      if (base64Images.length > 0) {
        const albumPaths = await ImageModel.saveMultipleImages(
          base64Images,
          "product"
        );
        this.album = albumPaths;
        // Trích xuất đặc trưng cho từng ảnh trong album
        for (let i = 0; i < albumPaths.length; i++) {
          await axios.post(
            "http://localhost:3005/api/imageService/extract-features",
            {
              imagePath: `http://localhost:3005${albumPaths[i]}`,
              productId: this._id,
            }
          );
        }
      }
    }

    // Handle variant images
    if (this.variants && this.variants.length > 0) {
      for (let i = 0; i < this.variants.length; i++) {
        const variant = this.variants[i];
        if (variant.image && variant.image.startsWith("data:image")) {
          variant.image = await ImageModel.saveImage(variant.image, "product");
          // Trích xuất đặc trưng cho ảnh variant
          await axios.post(
            "http://localhost:3005/api/imageService/extract-features",
            {
              imagePath: `http://localhost:3005${variant.image}`,
              productId: this._id,
            }
          );
        }
      }
    }
    const productData = this.toObject();
    const savedProduct = await Product.create(productData);
    return savedProduct._id;
  } catch (error) {
    throw new Error(`Error saving product: ${error.message}`);
  }
};

Product.update = async function (id, data) {
  try {
    console.log("Updating product with data:", data);
    let updateData = { ...data };

    // Handle main image update
    if (data.image && data.image.startsWith("data:image")) {
      const oldProduct = await Product.findById(id);
      if (oldProduct.image) {
        await ImageModel.deleteImage(oldProduct.image);
      }
      updateData.image = await ImageModel.saveImage(data.image, "product");
    }

    // Handle album images update
    if (data.album && data.album.length > 0) {
      const oldProduct = await Product.findById(id);
      if (oldProduct.album && oldProduct.album.length > 0) {
        await ImageModel.deleteMultipleImages(oldProduct.album);
      }

      const base64Images = data.album.filter((img) =>
        img.startsWith("data:image")
      );
      if (base64Images.length > 0) {
        const albumPaths = await ImageModel.saveMultipleImages(
          base64Images,
          "product"
        );
        updateData.album = albumPaths;
      }
    }

    // Handle variants update
    if (data.variants && data.variants.length > 0) {
      const oldProduct = await Product.findById(id);

      // Delete old variant images
      if (oldProduct.variants && oldProduct.variants.length > 0) {
        const oldVariantImages = oldProduct.variants
          .map((v) => v.image)
          .filter(Boolean);
        if (oldVariantImages.length > 0) {
          await ImageModel.deleteMultipleImages(oldVariantImages);
        }
      }

      // Process new variants
      for (let variant of data.variants) {
        if (variant.image && variant.image.startsWith("data:image")) {
          variant.image = await ImageModel.saveImage(variant.image, "product");
        }
      }
    }

    updateData.updatedAt = new Date();

    // Use findByIdAndUpdate with new: true to get the updated document
    const updatedProduct = await Product.findByIdAndUpdate(id, updateData, {
      new: true,
    }).populate("variants.attributeId1 variants.attributeId2");

    console.log("Product updated:", updatedProduct);
    return updatedProduct;
  } catch (error) {
    console.error("Error updating product:", error);
    throw new Error(`Error updating product: ${error.message}`);
  }
};

Product.addVariant = async function (productId, variant) {
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

Product.updateVariant = async function (productId, variantIndex, variant) {
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

Product.findVariantIndexBySku = async function (productId, sku) {
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

Product.deleteVariant = async function (productId, variantIndex) {
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

Product.delete = async function (id) {
  try {
    await this.findByIdAndUpdate(id, {
      deletedAt: new Date(),
      updatedAt: new Date(),
    });
    return true;
  } catch (error) {
    throw new Error(`Error deleting product: ${error.message}`);
  }
};

Product.getAll = async function () {
  try {
    return await this.find();
  } catch (error) {
    throw new Error(`Error fetching products: ${error.message}`);
  }
};

Product.incrementViewCount = async function (id) {
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

Product.incrementFavoriteCount = async function (id) {
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

Product.decrementFavoriteCount = async function (id) {
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

// Xóa các phương thức liên quan đến quantity
Product.checkVariantQuantity = null;
Product.updateVariantQuantity = null;
Product.checkAndUpdateVariantQuantity = null;

// Lấy giá gốc và giá giảm của 1 variant
Product.getVariantPrice = async function (productId, variantId) {
  const product = await this.findById(productId);
  if (!product) throw new Error("Product not found");
  const variant =
    product.variants.id(variantId) ||
    product.variants.find((v) => v._id.toString() === variantId.toString());
  if (!variant) {
    console.log("Variant not found in product:", productId, variantId);
    throw new Error("Variant not found");
  }
  return {
    price: variant.price,
    priceSale: product.priceSale || null,
  };
};

// Kiểm tra variant có tồn tại và được publish hay không
Product.isVariantValid = async function (productId, variantId) {
  try {
    const product = await this.findById(productId);
    if (!product || product.deletedAt || !product.publish) {
      return false;
    }

    const variant = product.variants.find(
      (v) => v._id.toString() === variantId.toString()
    );

    return variant && variant.publish !== false;
  } catch (error) {
    console.error("Error checking variant validity:", error);
    return false;
  }
};

// Static method to get best selling products
Product.getBestSelling = async function (limit = 8) {
  try {
    const products = await this.aggregate([
      {
        $match: {
          deletedAt: null,
          publish: true,
        },
      },
      {
        $lookup: {
          from: "orders",
          let: { productId: "$_id" },
          pipeline: [
            { $unwind: "$items" },
            { $match: { $expr: { $eq: ["$items.productId", "$$productId"] } } },
            { $group: { _id: null, total: { $sum: "$items.quantity" } } },
          ],
          as: "sales",
        },
      },
      {
        $addFields: {
          totalSold: { $ifNull: [{ $arrayElemAt: ["$sales.total", 0] }, 0] },
        },
      },
      { $sort: { totalSold: -1 } },
      { $limit: limit },
      {
        $project: {
          _id: 1,
          name: 1,
          image: 1,
          description: 1,
          variants: 1,
          totalSold: 1,
          view_count: 1,
          favorite_count: 1,
        },
      },
    ]);
    return products;
  } catch (error) {
    throw new Error(`Error getting best selling products: ${error.message}`);
  }
};

Product.search = async function (keyword) {
  try {
    const searchRegex = new RegExp(keyword, "i");
    const products = await this.find({
      $or: [
        { name: searchRegex },
        { code: searchRegex },
        { content: searchRegex },
        { description: searchRegex },
      ],
      publish: true,
    }).populate("catalogueId");
    return products;
  } catch (error) {
    throw new Error(`Error searching products: ${error.message}`);
  }
};

module.exports = Product;
