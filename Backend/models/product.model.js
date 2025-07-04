const mongoose = require("mongoose");
const ImageModel = require("./image.model");
const { extractAndSaveFeatures } = require("../imageService/imageService");
const axios = require("axios");
const { decode } = require("html-entities");

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
      image: { type: String, required: false, default: null },
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

// Pre-save middleware to handle images and feature extraction
productSchema.pre("save", async function (next) {
  try {
    const productId = this._id; // ID is available here for both new and existing docs

    // Handle main image
    if (
      this.isModified("image") &&
      this.image &&
      this.image.startsWith("data:image")
    ) {
      const savedPath = await ImageModel.saveImage(this.image, "product");
      this.image = savedPath; // Replace base64 with saved path
      // Extract features for the new image
      await axios.post(
        `${process.env.BACKEND_URL}/api/imageService/extract-features`,
        {
          imagePath: `${process.env.BACKEND_URL}${savedPath}`,
          productId: productId,
        }
      );
    }

    // Handle album images
    if (this.isModified("album") && this.album && this.album.length > 0) {
      const processedAlbum = [];
      for (const img of this.album) {
        if (img && img.startsWith("data:image")) {
          const savedPath = await ImageModel.saveImage(img, "product");
          processedAlbum.push(savedPath); // Add the new path
          // Extract features for the new image
          await axios.post(
            `${process.env.BACKEND_URL}/api/imageService/extract-features`,
            {
              imagePath: `${process.env.BACKEND_URL}${savedPath}`,
              productId: productId,
            }
          );
        } else {
          processedAlbum.push(img); // Keep existing URL/path if not a new base64 image
        }
      }
      this.album = processedAlbum;
    }

    // Handle variant images
    if (this.isModified("variants")) {
      for (let variant of this.variants) {
        if (variant.image && variant.image.startsWith("data:image")) {
          const savedPath = await ImageModel.saveImage(
            variant.image,
            "product"
          );
          variant.image = savedPath; // Replace base64 with saved path
          // Extract features for the new variant image
          await axios.post(
            `${process.env.BACKEND_URL}/api/imageService/extract-features`,
            {
              imagePath: `${process.env.BACKEND_URL}${savedPath}`,
              productId: productId,
            }
          );
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
        `${process.env.BACKEND_URL}/api/imageService/extract-features`,
        {
          imagePath: `${process.env.BACKEND_URL}${this.image}`,
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
            `${process.env.BACKEND_URL}/api/imageService/extract-features`,
            {
              imagePath: `${process.env.BACKEND_URL}${albumPaths[i]}`,
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
            `${process.env.BACKEND_URL}/api/imageService/extract-features`,
            {
              imagePath: `${process.env.BACKEND_URL}${variant.image}`,
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
    let updateData = { ...data };
    const oldProduct = await Product.findById(id);
    if (!oldProduct) {
      throw new Error("Product not found");
    }

    // Handle main image update
    let deletedMainImage = null;
    if (data.image && data.image.startsWith("data:image")) {
      if (oldProduct.image) {
        deletedMainImage = oldProduct.image;
      }
      updateData.image = await ImageModel.saveImage(data.image, "product");
      // Trích xuất đặc trưng cho ảnh chính mới
      await axios.post(
        `${process.env.BACKEND_URL}/api/imageService/extract-features`,
        {
          imagePath: `${process.env.BACKEND_URL}${updateData.image}`,
          productId: id,
        }
      );
    }

    // Handle album images update
    let deletedAlbumImages = [];
    if (data.album && data.album.length > 0) {
      // Tách ảnh mới và ảnh cũ
      const newImages = data.album.filter((img) =>
        img.startsWith("data:image")
      );
      const existingImages = data.album.filter(
        (img) => !img.startsWith("data:image")
      );

      // Tìm các ảnh cũ đã bị loại bỏ
      if (oldProduct.album && oldProduct.album.length > 0) {
        deletedAlbumImages = oldProduct.album.filter(
          (oldImg) => !existingImages.includes(oldImg)
        );
      }

      // Lưu các ảnh mới
      if (newImages.length > 0) {
        const newPaths = await ImageModel.saveMultipleImages(
          newImages,
          "product"
        );
        updateData.album = [...existingImages, ...newPaths];
        // Trích xuất đặc trưng cho từng ảnh mới
        for (const newPath of newPaths) {
          await axios.post(
            `${process.env.BACKEND_URL}/api/imageService/extract-features`,
            {
              imagePath: `${process.env.BACKEND_URL}${newPath}`,
              productId: id,
            }
          );
        }
      } else {
        updateData.album = existingImages;
      }
    } else if (oldProduct.album && oldProduct.album.length > 0) {
      // Nếu album mới là rỗng, xóa hết ảnh cũ
      deletedAlbumImages = oldProduct.album;
      updateData.album = [];
    }

    // Handle variants update
    let deletedVariantImages = [];
    if (data.variants && data.variants.length > 0) {
      const oldVariants = oldProduct.variants || [];
      // Xác định các ảnh variant cũ bị thay thế hoặc bị xóa
      const newVariantImages = data.variants
        .map((v) => v.image)
        .filter(Boolean);
      const oldVariantImages = oldVariants.map((v) => v.image).filter(Boolean);
      deletedVariantImages = oldVariantImages.filter(
        (oldImg) => !newVariantImages.includes(oldImg)
      );

      // Process new variants
      for (let i = 0; i < data.variants.length; i++) {
        const variant = data.variants[i];
        const oldVariant = oldVariants[i];
        if (variant.image && variant.image.startsWith("data:image")) {
          // Nếu có ảnh cũ ở vị trí này và khác ảnh mới, thêm vào danh sách xóa
          if (
            oldVariant &&
            oldVariant.image &&
            !deletedVariantImages.includes(oldVariant.image)
          ) {
            deletedVariantImages.push(oldVariant.image);
          }
          variant.image = await ImageModel.saveImage(variant.image, "product");
          // Trích xuất đặc trưng cho ảnh variant mới
          await axios.post(
            `${process.env.BACKEND_URL}/api/imageService/extract-features`,
            {
              imagePath: `${process.env.BACKEND_URL}${variant.image}`,
              productId: id,
            }
          );
        }
      }
    } else if (oldProduct.variants && oldProduct.variants.length > 0) {
      // Nếu không còn variant nào, xóa hết ảnh variant cũ
      deletedVariantImages = oldProduct.variants
        .map((v) => v.image)
        .filter(Boolean);
    }

    // Xóa đặc trưng và file ảnh cho ảnh chính nếu bị thay thế
    if (deletedMainImage) {
      try {
        await axios.post(
          `${process.env.BACKEND_URL}/api/imageService/delete-features`,
          {
            imagePaths: [deletedMainImage],
          }
        );
        await ImageModel.deleteImage(deletedMainImage);
      } catch (err) {
        console.error("Error deleting main image features or file:", err);
      }
    }

    // Xóa đặc trưng và file ảnh cho các ảnh album đã bị loại bỏ
    if (deletedAlbumImages.length > 0) {
      try {
        await axios.post(
          `${process.env.BACKEND_URL}/api/imageService/delete-features`,
          {
            imagePaths: deletedAlbumImages,
          }
        );
        await ImageModel.deleteMultipleImages(deletedAlbumImages);
      } catch (err) {
        console.error("Error deleting album image features or files:", err);
      }
    }

    // Xóa đặc trưng và file ảnh cho các ảnh variant đã bị loại bỏ
    if (deletedVariantImages.length > 0) {
      try {
        await axios.post(
          `${process.env.BACKEND_URL}/api/imageService/delete-features`,
          {
            imagePaths: deletedVariantImages,
          }
        );
        await ImageModel.deleteMultipleImages(deletedVariantImages);
      } catch (err) {
        console.error("Error deleting variant image features or files:", err);
      }
    }

    updateData.updatedAt = new Date();

    // Use findByIdAndUpdate with new: true to get the updated document
    const updatedProduct = await Product.findByIdAndUpdate(id, updateData, {
      new: true,
    }).populate("variants.attributeId1 variants.attributeId2");

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

// Phương thức tạo chuỗi thông tin sản phẩm để embedding
Product.getEmbeddingText = async function (productId) {
  try {
    const product = await this.findById(productId)
      .populate("catalogueId")
      .populate("attributeCatalogueIds")
      .populate("variants.attributeId1")
      .populate("variants.attributeId2")
      .populate("variants.attributeId1.attributeCatalogueId")
      .populate("variants.attributeId2.attributeCatalogueId");

    if (!product) {
      throw new Error("Product not found");
    }

    // Hàm xử lý HTML tags và entities
    const stripHtmlTags = (html) => {
      if (!html) return "";

      // Decode HTML entities trước
      let decodedText = decode(html);

      // Loại bỏ HTML tags và normalize spaces
      return decodedText
        .replace(/<[^>]*>/g, " ")
        .replace(/\s+/g, " ")
        .trim();
    };

    let embeddingText = "";

    // Thêm tên sản phẩm
    if (product.name) {
      embeddingText += `Sản phẩm: ${product.name}. `;
    }

    // Thêm mô tả
    if (product.description) {
      embeddingText += `Mô tả: ${product.description}. `;
    }

    // Thêm nội dung (đã xử lý HTML)
    if (product.content) {
      const cleanContent = stripHtmlTags(product.content);
      if (cleanContent) {
        embeddingText += `Thông tin chi tiết: ${cleanContent}. `;
      }
    }

    // Thêm tên catalogue
    if (product.catalogueId && product.catalogueId.name) {
      embeddingText += `Danh mục: ${product.catalogueId.name}. `;
    }

    // Thêm thông tin các biến thể
    if (product.variants && product.variants.length > 0) {
      embeddingText += `Các biến thể sản phẩm: `;
      for (let i = 0; i < product.variants.length; i++) {
        const variant = product.variants[i];
        let variantInfo = "";

        // Thêm thuộc tính 1 với tên catalogue
        if (variant.attributeId1 && variant.attributeId1.name) {
          // Thử lấy tên catalogue từ attributeCatalogueIds của product
          let catalogueName1 = "";
          if (
            product.attributeCatalogueIds &&
            product.attributeCatalogueIds.length > 0
          ) {
            const attr1 = await mongoose
              .model("Attribute")
              .findById(variant.attributeId1._id)
              .populate("attributeCatalogueId");
            catalogueName1 = attr1?.attributeCatalogueId?.name || "";
          }

          variantInfo += catalogueName1
            ? `${catalogueName1} ${variant.attributeId1.name}`
            : variant.attributeId1.name;
        }

        // Thêm thuộc tính 2 với tên catalogue
        if (variant.attributeId2 && variant.attributeId2.name) {
          if (variantInfo) variantInfo += ` `;
          // Thử lấy tên catalogue từ attributeCatalogueIds của product
          let catalogueName2 = "";
          if (
            product.attributeCatalogueIds &&
            product.attributeCatalogueIds.length > 0
          ) {
            const attr2 = await mongoose
              .model("Attribute")
              .findById(variant.attributeId2._id)
              .populate("attributeCatalogueId");
            catalogueName2 = attr2?.attributeCatalogueId?.name || "";
          }

          variantInfo += catalogueName2
            ? `${catalogueName2}${variant.attributeId2.name}`
            : variant.attributeId2.name;
        }

        // Thêm giá
        if (variant.price) {
          if (variantInfo) variantInfo += ` `;
          variantInfo += `giá ${variant.price.toLocaleString("vi-VN")} VNĐ`;
        }

        if (variantInfo) {
          embeddingText += variantInfo;
          if (i < product.variants.length - 1) {
            embeddingText += "; ";
          } else {
            embeddingText += ". ";
          }
        }
      }
    }

    return embeddingText.trim();
  } catch (error) {
    throw new Error(`Error getting embedding text: ${error.message}`);
  }
};

// Phương thức tạo chuỗi thông tin sản phẩm cho nhiều sản phẩm
Product.getMultipleEmbeddingTexts = async function (productIds) {
  try {
    const products = await this.find({ _id: { $in: productIds } })
      .populate("catalogueId")
      .populate("attributeCatalogueIds")
      .populate("variants.attributeId1")
      .populate("variants.attributeId2")
      .populate("variants.attributeId1.attributeCatalogueId")
      .populate("variants.attributeId2.attributeCatalogueId");

    // Hàm xử lý HTML tags và entities
    const stripHtmlTags = (html) => {
      if (!html) return "";

      // Decode HTML entities trước
      let decodedText = decode(html);

      // Loại bỏ HTML tags và normalize spaces
      return decodedText
        .replace(/<[^>]*>/g, " ")
        .replace(/\s+/g, " ")
        .trim();
    };

    const embeddingTexts = {};

    for (const product of products) {
      let embeddingText = "";

      // Thêm tên sản phẩm
      if (product.name) {
        embeddingText += `Sản phẩm: ${product.name}. `;
      }

      // Thêm mô tả
      if (product.description) {
        embeddingText += `Mô tả: ${product.description}. `;
      }

      // Thêm nội dung (đã xử lý HTML)
      if (product.content) {
        const cleanContent = stripHtmlTags(product.content);
        if (cleanContent) {
          embeddingText += `Thông tin chi tiết: ${cleanContent}. `;
        }
      }

      // Thêm tên catalogue
      if (product.catalogueId && product.catalogueId.name) {
        embeddingText += `Danh mục: ${product.catalogueId.name}. `;
      }

      // Thêm thông tin các biến thể
      if (product.variants && product.variants.length > 0) {
        embeddingText += `Các biến thể sản phẩm: `;
        for (let i = 0; i < product.variants.length; i++) {
          const variant = product.variants[i];
          let variantInfo = "";

          // Thêm thuộc tính 1 với tên catalogue
          if (variant.attributeId1 && variant.attributeId1.name) {
            const catalogueName1 =
              variant.attributeId1.attributeCatalogueId?.name || "";
            variantInfo += catalogueName1
              ? `${catalogueName1} ${variant.attributeId1.name}`
              : variant.attributeId1.name;
          }

          // Thêm thuộc tính 2 với tên catalogue
          if (variant.attributeId2 && variant.attributeId2.name) {
            if (variantInfo) variantInfo += ` `;
            const catalogueName2 =
              variant.attributeId2.attributeCatalogueId?.name || "";
            variantInfo += catalogueName2
              ? `${catalogueName2} ${variant.attributeId2.name}`
              : variant.attributeId2.name;
          }

          // Thêm giá
          if (variant.price) {
            if (variantInfo) variantInfo += ` `;
            variantInfo += `giá ${variant.price.toLocaleString("vi-VN")} VNĐ`;
          }

          if (variantInfo) {
            embeddingText += variantInfo;
            if (i < product.variants.length - 1) {
              embeddingText += "; ";
            } else {
              embeddingText += ". ";
            }
          }
        }
      }

      embeddingTexts[product._id.toString()] = embeddingText.trim();
    }

    return embeddingTexts;
  } catch (error) {
    throw new Error(`Error getting multiple embedding texts: ${error.message}`);
  }
};

module.exports = Product;
