const Product = require("../models/product.model");
const ProductCatalogue = require("../models/productCatalogue.model");
const ImageModel = require("../models/image.model");
const fs = require("fs");
const path = require("path");

// Thêm sản phẩm mới
exports.add = async (req, res) => {
  try {
    const {
      code,
      name,
      content,
      description,
      image,
      album,
      catalogueId,
      variants,
    } = req.body;

    // Kiểm tra các trường bắt buộc
    if (!code || !name || !catalogueId) {
      return res.status(400).json({
        message: "Missing required fields",
        required: {
          code: !code ? "Code is required" : null,
          name: !name ? "Name is required" : null,
          catalogueId: !catalogueId ? "Catalogue ID is required" : null,
        },
      });
    }

    // Kiểm tra danh mục có tồn tại không
    try {
      await ProductCatalogue.getById(catalogueId);
    } catch (error) {
      return res.status(400).json({ message: "Invalid catalogue ID" });
    }

    // Validate variants if present
    if (variants && variants.length > 0) {
      for (const variant of variants) {
        try {
          await Product.validateVariant(variant);
        } catch (error) {
          return res.status(400).json({
            message: "Invalid variant data",
            error: error.message,
          });
        }
      }
    }

    const product = new Product(req.body);
    const id = await product.save();
    res.status(201).json({
      message: "Product added successfully",
      id,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Lấy danh sách sản phẩm
exports.getAll = async (req, res) => {
  try {
    const products = await Product.getAll();
    res.status(200).json({
      message: "Products retrieved successfully",
      data: products,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Lấy sản phẩm theo ID
exports.getById = async (req, res) => {
  try {
    const product = await Product.getById(req.params.id);
    // Tăng số lượt xem
    await Product.incrementViewCount(req.params.id);
    res.status(200).json(product);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

// Lấy sản phẩm theo danh mục
exports.getByCatalogue = async (req, res) => {
  try {
    const products = await Product.getByCatalogueId(req.params.catalogueId);
    res.status(200).json({
      message: "Products retrieved successfully",
      data: products,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Cập nhật sản phẩm
exports.update = async (req, res) => {
  try {
    const {
      code,
      name,
      content,
      description,
      image,
      album,
      catalogueId,
      variants,
    } = req.body;
    // Kiểm tra các trường bắt buộc
    if (!code || !name || !catalogueId) {
      return res.status(400).json({
        message: "Missing required fields",
        required: {
          code: !code ? "Code is required" : null,
          name: !name ? "Name is required" : null,
          catalogueId: !catalogueId ? "Catalogue ID is required" : null,
        },
      });
    }

    // Kiểm tra danh mục có tồn tại không
    try {
      await ProductCatalogue.getById(catalogueId);
    } catch (error) {
      return res.status(400).json({ message: "Invalid catalogue ID" });
    }

    // Validate variants if present
    if (variants && variants.length > 0) {
      for (const variant of variants) {
        try {
          await Product.validateVariant(variant);
        } catch (error) {
          return res.status(400).json({
            message: "Invalid variant data",
            error: error.message,
          });
        }
      }
    }

    // Lấy thông tin sản phẩm cũ
    const oldProduct = await Product.getById(req.params.id);
    if (!oldProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Xử lý ảnh chính
    let imagePath = oldProduct.image;
    if (image && image.startsWith("data:image")) {
      try {
        imagePath = await ImageModel.saveImage(image, "product");
      } catch (error) {
        console.error("Error handling main image:", error);
        return res.status(500).json({ message: "Error processing main image" });
      }
    }

    // Xử lý album ảnh
    let albumPaths = oldProduct.album || [];
    if (album && album.length > 0) {
      try {
        // Tách ảnh mới và ảnh cũ
        const newImages = album.filter((img) => img.startsWith("data:image"));
        const existingImages = album.filter(
          (img) => !img.startsWith("data:image")
        );

        // Lưu các ảnh mới
        if (newImages.length > 0) {
          const newPaths = await ImageModel.saveMultipleImages(
            newImages,
            "product"
          );
          albumPaths = [...existingImages, ...newPaths];
        } else {
          // Nếu không có ảnh mới, giữ nguyên album cũ
          albumPaths = oldProduct.album || [];
        }
      } catch (error) {
        console.error("Error handling album images:", error);
        return res
          .status(500)
          .json({ message: "Error processing album images" });
      }
    } else {
      // Nếu không có album mới, giữ nguyên album cũ
      albumPaths = oldProduct.album || [];
    }

    // Xử lý ảnh variant
    if (variants && variants.length > 0) {
      const oldVariants = oldProduct.variants || [];

      for (let i = 0; i < variants.length; i++) {
        const variant = variants[i];
        const oldVariant = oldVariants[i];

        // Nếu có ảnh mới (base64)
        if (variant.image && variant.image.startsWith("data:image")) {
          try {
            // Lưu ảnh mới vào thư mục images/product/
            const savedImagePath = await ImageModel.saveImage(
              variant.image,
              "product"
            );
            // Cập nhật đường dẫn ảnh trong variant
            variant.image = savedImagePath;
          } catch (error) {
            console.error("Error handling variant image:", error);
            return res
              .status(500)
              .json({ message: "Error processing variant images" });
          }
        } else if (variant.image && !variant.image.startsWith("data:image")) {
        } else {
          // Nếu không có ảnh - giữ ảnh cũ hoặc null
          variant.image = oldVariant?.image || null;
        }
      }
    }

    // Cập nhật thông tin sản phẩm
    const updateData = {
      ...req.body,
      image: imagePath,
      album: albumPaths,
      variants: variants,
    };
    await Product.update(req.params.id, updateData);
    res.status(200).json({ message: "Product updated successfully" });
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(400).json({ message: error.message });
  }
};

// Xóa sản phẩm
exports.delete = async (req, res) => {
  try {
    await Product.delete(req.params.id);
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Tăng số lượt yêu thích
exports.incrementFavorite = async (req, res) => {
  try {
    await Product.incrementFavoriteCount(req.params.id);
    res
      .status(200)
      .json({ message: "Favorite count incremented successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Giảm số lượt yêu thích
exports.decrementFavorite = async (req, res) => {
  try {
    await Product.decrementFavoriteCount(req.params.id);
    res
      .status(200)
      .json({ message: "Favorite count decremented successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Thêm variant mới
exports.addVariant = async (req, res) => {
  try {
    const { productId } = req.params;
    const variant = req.body;

    await Product.addVariant(productId, variant);
    res.status(200).json({ message: "Variant added successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Cập nhật variant
exports.updateVariant = async (req, res) => {
  try {
    const { productId, variantIndex } = req.params;
    const variant = req.body;

    await Product.updateVariant(productId, parseInt(variantIndex), variant);
    res.status(200).json({ message: "Variant updated successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Xóa variant
exports.deleteVariant = async (req, res) => {
  try {
    const { productId, variantIndex } = req.params;

    await Product.deleteVariant(productId, parseInt(variantIndex));
    res.status(200).json({ message: "Variant deleted successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Kiểm tra số lượng variant
exports.checkVariantQuantity = async (req, res) => {
  try {
    const { productId, variantIndex } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity <= 0) {
      return res.status(400).json({
        message: "Invalid quantity",
        required: {
          quantity: "Quantity must be a positive number",
        },
      });
    }

    const result = await Product.checkVariantQuantity(
      productId,
      parseInt(variantIndex),
      quantity
    );
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Cập nhật số lượng variant
exports.updateVariantQuantity = async (req, res) => {
  try {
    const { productId, variantIndex } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity <= 0) {
      return res.status(400).json({
        message: "Invalid quantity",
        required: {
          quantity: "Quantity must be a positive number",
        },
      });
    }

    const result = await Product.updateVariantQuantity(
      productId,
      parseInt(variantIndex),
      quantity
    );
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Kiểm tra và cập nhật số lượng variant
exports.checkAndUpdateVariantQuantity = async (req, res) => {
  try {
    const { productId, variantIndex } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity <= 0) {
      return res.status(400).json({
        message: "Invalid quantity",
        required: {
          quantity: "Quantity must be a positive number",
        },
      });
    }

    const result = await Product.checkAndUpdateVariantQuantity(
      productId,
      parseInt(variantIndex),
      quantity
    );
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Tìm variant index bằng SKU
exports.findVariantIndex = async (req, res) => {
  try {
    const { productId } = req.params;
    const { sku } = req.body;

    if (!sku) {
      return res.status(400).json({
        message: "SKU is required",
        required: {
          sku: "SKU is required",
        },
      });
    }

    const index = await Product.findVariantIndexBySku(productId, sku);
    res.status(200).json({
      success: true,
      variantIndex: index,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Lấy giá gốc và giá giảm của 1 variant
exports.getVariantPrice = async (req, res) => {
  try {
    const { productId, variantId } = req.params;
    const result = await Product.getVariantPrice(productId, variantId);
    res.json(result);
  } catch (error) {
    console.error("getVariantPrice error:", error);
    res.status(400).json({ message: error.message });
  }
};

// Lấy sản phẩm bán chạy
exports.getBestSelling = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 8;
    const products = await Product.getBestSelling(limit);
    res.status(200).json({
      message: "Success",
      data: products,
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi server",
      error: error.message,
    });
  }
};

// Tìm kiếm sản phẩm
exports.search = async (req, res) => {
  try {
    const { keyword } = req.query;
    if (!keyword) {
      return res.status(400).json({
        message: "Keyword is required",
      });
    }

    const products = await Product.search(keyword);
    res.status(200).json({
      message: "Products retrieved successfully",
      data: products,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
