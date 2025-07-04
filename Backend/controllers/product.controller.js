const Product = require("../models/product.model");
const ProductCatalogue = require("../models/productCatalogue.model");
const ImageModel = require("../models/image.model");
const ProductEmbedding = require("../models/productEmbedding.model");
const fs = require("fs");
const path = require("path");
const axios = require("axios");
const AttributeCatalogue = require("../models/attributeCatalogue.model");
const Attribute = require("../models/attribute.model");

// Add helper function to download and process image
const downloadAndProcessImage = async (
  imageUrl,
  folder = "product",
  productId = null
) => {
  try {
    if (!imageUrl) return "";
    // Check if URL is valid
    if (!imageUrl.startsWith("http")) return imageUrl;

    // Download image
    const response = await axios.get(imageUrl, { responseType: "arraybuffer" });
    const buffer = Buffer.from(response.data);

    // Convert to base64
    const base64Image = `data:${
      response.headers["content-type"]
    };base64,${buffer.toString("base64")}`;

    // Save using ImageModel
    const savedPath = await ImageModel.saveImage(base64Image, folder);

    // Extract features if productId is provided
    if (productId) {
      try {
        await axios.post(
          `${process.env.BACKEND_URL}/api/imageService/extract-features`,
          {
            imagePath: `${process.env.BACKEND_URL}${savedPath}`,
            productId: productId,
          }
        );
      } catch (error) {
        console.error(
          `Error extracting features for image ${savedPath}:`,
          error.message
        );
      }
    }

    return savedPath;
  } catch (error) {
    console.error(`Error processing image from ${imageUrl}:`, error.message);
    return "";
  }
};

const downloadAndProcessMultipleImages = async (
  imageUrls,
  folder = "product",
  productId = null
) => {
  try {
    if (!imageUrls || !Array.isArray(imageUrls)) return [];
    const validUrls = imageUrls.filter((url) => url && typeof url === "string");
    const downloadPromises = validUrls.map((url) =>
      downloadAndProcessImage(url, folder, productId)
    );
    const results = await Promise.all(downloadPromises);
    return results.filter((path) => path); // Remove empty paths
  } catch (error) {
    console.error("Error processing multiple images:", error.message);
    return [];
  }
};

// Helper function to download an image and convert it to a base64 string
const downloadAndConvertToBase64 = async (imageUrl) => {
  try {
    // If it's not a string or doesn't start with http, it's not a downloadable URL.
    if (
      !imageUrl ||
      typeof imageUrl !== "string" ||
      !imageUrl.startsWith("http")
    ) {
      return imageUrl; // Return as is (might be empty, or already a path/base64)
    }
    const response = await axios.get(imageUrl, { responseType: "arraybuffer" });
    const buffer = Buffer.from(response.data, "binary");
    return `data:${response.headers["content-type"]};base64,${buffer.toString(
      "base64"
    )}`;
  } catch (error) {
    console.error(`Error downloading image from ${imageUrl}:`, error.message);
    return ""; // Return empty string on error to avoid breaking the process
  }
};

// Helper to process multiple image URLs
const downloadMultipleAndConvertToBase64 = async (imageUrls) => {
  if (!imageUrls || !Array.isArray(imageUrls)) return [];
  const downloadPromises = imageUrls.map((url) =>
    downloadAndConvertToBase64(url)
  );
  return Promise.all(downloadPromises);
};

// Hàm gọi YOLO service để tạo embedding
const createTextEmbedding = async (text) => {
  try {
    const imageServiceUrl = process.env.IMAGE_SERVICE_URL;
    const response = await axios.post(`${imageServiceUrl}/vectorize-text`, {
      text: text,
    });

    if (response.data && response.data.embedding) {
      return response.data.embedding;
    } else {
      throw new Error("Invalid response from YOLO service");
    }
  } catch (error) {
    console.error(
      "Error calling YOLO service for text embedding:",
      error.message
    );
    throw new Error(`Failed to create text embedding: ${error.message}`);
  }
};

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
      attributeCatalogueIds,
      variants,
    } = req.body;

    // Kiểm tra các trường bắt buộc
    if (!code || !name || !catalogueId) {
      return res.status(400).json({
        message: "Thiếu thông tin bắt buộc",
        required: {
          code: !code ? "Mã sản phẩm là bắt buộc" : null,
          name: !name ? "Tên sản phẩm là bắt buộc" : null,
          catalogueId: !catalogueId ? "Danh mục sản phẩm là bắt buộc" : null,
        },
      });
    }

    // Kiểm tra số lượng attributeCatalogueIds
    if (attributeCatalogueIds && attributeCatalogueIds.length > 2) {
      return res.status(400).json({
        message: "Không thể có nhiều hơn 2 danh mục thuộc tính",
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
      // Ensure attributeId1, attributeId2 are present in each variant if provided
      req.body.variants = variants.map((v) => ({
        ...v,
        attributeId1:
          v.attributeId1 || v.attributeId1 === "" ? v.attributeId1 : undefined,
        attributeId2:
          v.attributeId2 || v.attributeId2 === "" ? v.attributeId2 : undefined,
      }));
    }

    const product = new Product(req.body);
    const id = await product.save();

    // Tạo chuỗi thông tin sản phẩm để embedding
    try {
      const embeddingText = await Product.getEmbeddingText(id);

      // Gọi YOLO service để tạo embedding
      try {
        const textEmbedding = await createTextEmbedding(embeddingText);

        // Lưu embedding vector vào database
        await ProductEmbedding.findOneAndUpdate(
          { product: id },
          {
            product: id,
            embedding: textEmbedding,
            sourceText: embeddingText,
          },
          { upsert: true, new: true }
        );
      } catch (embeddingError) {
        console.error(
          "❌ Lỗi khi tạo embedding vector:",
          embeddingError.message
        );
      }
    } catch (embeddingError) {
      console.error("Lỗi khi tạo chuỗi embedding:", embeddingError.message);
    }

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
    const products = await Product.find({ deletedAt: null }).sort({
      createdAt: -1,
    });
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

// Lấy sản phẩm theo danh mục và loại trừ sản phẩm hiện tại
exports.getByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { exclude } = req.query;

    const query = {
      catalogueId: categoryId,
      deletedAt: null,
      publish: true,
    };

    if (exclude) {
      query._id = { $ne: exclude };
    }

    const products = await Product.find(query)
      .select("_id name image price variants rating totalReviews")
      .limit(8);

    res.status(200).json({
      message: "Products retrieved successfully",
      data: { products },
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
      attributeCatalogueIds,
      variants,
    } = req.body;

    // Kiểm tra các trường bắt buộc
    if (!code || !name || !catalogueId) {
      return res.status(400).json({
        message: "Thiếu thông tin bắt buộc",
        required: {
          code: !code ? "Mã sản phẩm là bắt buộc" : null,
          name: !name ? "Tên sản phẩm là bắt buộc" : null,
          catalogueId: !catalogueId ? "Danh mục sản phẩm là bắt buộc" : null,
        },
      });
    }

    // Kiểm tra số lượng attributeCatalogueIds
    if (attributeCatalogueIds && attributeCatalogueIds.length > 2) {
      return res.status(400).json({
        message: "Không thể có nhiều hơn 2 danh mục thuộc tính",
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

    // Cập nhật thông tin sản phẩm (xử lý ảnh được thực hiện trong model)
    await Product.update(req.params.id, req.body);

    // Tạo chuỗi thông tin sản phẩm để embedding sau khi cập nhật
    try {
      const embeddingText = await Product.getEmbeddingText(req.params.id);

      // Gọi YOLO service để tạo embedding
      try {
        const textEmbedding = await createTextEmbedding(embeddingText);

        // Lưu embedding vector vào database
        await ProductEmbedding.findOneAndUpdate(
          { product: req.params.id },
          {
            product: req.params.id,
            embedding: textEmbedding,
            sourceText: embeddingText,
          },
          { upsert: true, new: true }
        );
      } catch (embeddingError) {
        console.error(
          "❌ Lỗi khi tạo embedding vector:",
          embeddingError.message
        );
      }
    } catch (embeddingError) {
      console.error(
        "Lỗi khi tạo chuỗi embedding sau cập nhật:",
        embeddingError.message
      );
    }

    res.status(200).json({ message: "Product updated successfully" });
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(400).json({ message: error.message });
  }
};

// Xóa sản phẩm
exports.delete = async (req, res) => {
  try {
    const product = await Product.getById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

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

// Get total number of products
exports.getTotalProducts = async (req, res) => {
  try {
    const count = await Product.countDocuments();
    res.status(200).json({ success: true, data: { totalProducts: count } });
  } catch (error) {
    console.error("Error getting total products:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
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

// Import products from Excel
exports.importFromExcel = async (req, res) => {
  try {
    // Kiểm tra authentication
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return res
        .status(401)
        .json({ message: "No authentication token, access denied" });
    }

    if (!req.file) {
      return res
        .status(400)
        .json({ message: "Không có file Excel được upload" });
    }

    const XLSX = require("xlsx");
    const workbook = XLSX.readFile(req.file.path);

    try {
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      const headerIndex = data.findIndex(
        (row) =>
          Array.isArray(row) &&
          row.includes("STT") &&
          row.includes("Mã sản phẩm")
      );

      if (headerIndex === -1) {
        fs.unlinkSync(req.file.path);
        return res.status(400).json({
          message:
            "Không tìm thấy dòng tiêu đề hợp lệ trong file Excel. Vui lòng kiểm tra lại file hoặc sử dụng template được cung cấp.",
        });
      }

      const rows = data.slice(headerIndex + 1);
      const headerRow = data[headerIndex];

      const skuIdx = headerRow.indexOf("SKU");
      const priceIdx = headerRow.indexOf("Giá");
      const variantImageIdx = headerRow.indexOf("Đường dẫn ảnh biến thể");

      if (skuIdx === -1 || priceIdx === -1 || variantImageIdx === -1) {
        fs.unlinkSync(req.file.path);
        return res.status(400).json({
          message:
            "File Excel thiếu các cột bắt buộc: SKU, Giá, hoặc Đường dẫn ảnh biến thể.",
        });
      }

      const attrStartIdx = priceIdx + 1;
      const attrEndIdx = variantImageIdx;
      const attributeColumns = headerRow.slice(attrStartIdx, attrEndIdx);

      const productGroups = {};
      let currentProductCode = null;

      rows.forEach((row, index) => {
        if (row.length === 0 || row.every((cell) => !cell)) return;
        const excelRowNumber = index + headerIndex + 2;
        const isNewProductRow = row[0] && row[1];
        if (isNewProductRow) {
          currentProductCode = row[1];
          if (!productGroups[currentProductCode]) {
            productGroups[currentProductCode] = {
              product: {},
              variants: [],
              startRow: excelRowNumber,
            };
          }
          let album = [];
          if (row[7]) {
            // Album column
            album = row[7]
              .toString()
              .split(",")
              .map((url) => url.trim())
              .filter(Boolean);
          }
          productGroups[currentProductCode].product = {
            code: row[1],
            name: row[2],
            shortDescription: row[3] || "",
            content: row[4] || "",
            catalogueId: row[5],
            isDisplay: false,
            image: row[6] || "",
            album: album,
          };
        }
        if (currentProductCode && row[skuIdx]) {
          const attrValues = row.slice(attrStartIdx, attrEndIdx);
          productGroups[currentProductCode].variants.push({
            sku: row[skuIdx],
            price: parseFloat(row[priceIdx]) || 0,
            attrValues,
            isDisplay: true,
            image: row[variantImageIdx] || "", // Using corrected index
            rowNumber: excelRowNumber,
          });
        }
      });

      const results = { success: [], errors: [], total: 0 };

      // Process each product group
      for (const [productCode, group] of Object.entries(productGroups)) {
        try {
          const { product, variants, startRow } = group;

          if (!product.code || !product.name || !product.catalogueId) {
            results.errors.push({
              row: startRow,
              error: `Thiếu thông tin sản phẩm bắt buộc (Mã, Tên, hoặc ID Danh mục)`,
            });
            continue;
          }
          const existingProduct = await Product.findOne({
            code: product.code,
            deletedAt: null,
          });
          if (existingProduct) {
            results.errors.push({
              row: startRow,
              error: `Mã sản phẩm '${product.code}' đã tồn tại`,
            });
            continue;
          }
          const catalogue = await ProductCatalogue.findById(
            product.catalogueId
          );
          if (!catalogue) {
            results.errors.push({
              row: startRow,
              error: `ID Danh mục '${product.catalogueId}' không tồn tại`,
            });
            continue;
          }
          if (variants.length === 0) {
            results.errors.push({
              row: startRow,
              error: `Sản phẩm phải có ít nhất 1 biến thể`,
            });
            continue;
          }

          // --- BẮT ĐẦU mapping thuộc tính ---
          // Luôn luôn tạo mới AttributeCatalogue cho từng cột thuộc tính của mỗi sản phẩm
          let attributeCatalogueIds = [];
          for (const attrColName of attributeColumns) {
            const catalogue = await AttributeCatalogue.create({
              name: attrColName,
            });
            attributeCatalogueIds.push(catalogue._id);
          }
          attributeCatalogueIds = attributeCatalogueIds.slice(0, 2); // chỉ lấy tối đa 2

          // Xử lý variants: mapping attrValues sang attributeId1/2
          const processedVariants = [];
          for (const variant of variants) {
            const attrValues = variant.attrValues || [];
            let attributeId1 = null,
              attributeId2 = null;
            for (let i = 0; i < attributeCatalogueIds.length; i++) {
              const attrValue = attrValues[i];
              if (!attrValue) continue;
              let attribute = await Attribute.findOne({
                name: attrValue,
                attributeCatalogueId: attributeCatalogueIds[i],
                deletedAt: null,
              });
              if (!attribute) {
                attribute = await Attribute.create({
                  name: attrValue,
                  attributeCatalogueId: attributeCatalogueIds[i],
                });
              }
              if (i === 0) attributeId1 = attribute._id;
              if (i === 1) attributeId2 = attribute._id;
            }
            const variantImageBase64 = await downloadAndConvertToBase64(
              variant.image
            );
            processedVariants.push({
              sku: variant.sku,
              price: variant.price,
              image: variantImageBase64 || "",
              publish: variant.isDisplay,
              attributeId1,
              attributeId2,
            });
          }
          // --- KẾT THÚC mapping thuộc tính ---

          // Convert image URLs to base64
          product.image = await downloadAndConvertToBase64(product.image);
          product.album = await downloadMultipleAndConvertToBase64(
            product.album
          );

          const newProduct = new Product({
            ...product,
            attributeCatalogueIds,
            variants: processedVariants,
            publish: product.isDisplay,
            createdBy: req.user?.id || "system",
            updatedBy: req.user?.id || "system",
          });

          await newProduct.save();

          // Tạo embedding cho sản phẩm vừa import
          try {
            const embeddingText = await Product.getEmbeddingText(
              newProduct._id
            );

            // Gọi YOLO service để tạo embedding
            const textEmbedding = await createTextEmbedding(embeddingText);

            // Lưu embedding vector vào database
            await ProductEmbedding.findOneAndUpdate(
              { product: newProduct._id },
              {
                product: newProduct._id,
                embedding: textEmbedding,
                sourceText: embeddingText,
              },
              { upsert: true, new: true }
            );
          } catch (embeddingError) {
            console.error(
              `❌ Lỗi khi tạo embedding cho sản phẩm ${product.code}:`,
              embeddingError.message
            );
            // Không dừng quá trình import, chỉ log lỗi
          }

          results.success.push({
            row: startRow,
            code: product.code,
            name: product.name,
          });
          results.total++;
        } catch (error) {
          results.errors.push({
            row: group ? group.startRow : "N/A",
            error: `Lỗi hệ thống khi xử lý sản phẩm '${productCode}': ${error.message}`,
          });
        }
      }

      res.json({ message: "Import hoàn tất", results });
    } catch (error) {
      console.error("Error processing Excel data:", error);
      res.status(500).json({
        message: "Lỗi khi xử lý dữ liệu từ Excel",
        error: error.message,
      });
    } finally {
      // Xóa file tạm một cách an toàn, không gửi response ở đây
      fs.unlink(req.file.path, (err) => {
        if (err) {
          console.error("Không thể xóa file tạm:", err);
        }
      });
    }
  } catch (error) {
    console.error("Error importing from Excel:", error);
    if (!res.headersSent) {
      res
        .status(500)
        .json({ message: "Lỗi khi import từ Excel", error: error.message });
    }
  }
};

// Download template Excel
exports.downloadTemplate = async (req, res) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return res
        .status(401)
        .json({ message: "No authentication token, access denied" });
    }

    const XLSX = require("xlsx");
    const catalogues = await ProductCatalogue.find({ deletedAt: null });

    const workbook = XLSX.utils.book_new();

    // Tạo dữ liệu cho 1 sheet duy nhất (các cột thuộc tính động: Size, Màu)
    const combinedData = [
      ["THÔNG TIN SẢN PHẨM VÀ BIẾN THỂ"],
      [""],
      [
        "Lưu ý: Mỗi sản phẩm có thể có nhiều biến thể. Dòng đầu tiên của mỗi sản phẩm điền đầy đủ thông tin, các dòng tiếp theo chỉ điền thông tin biến thể (từ cột SKU trở đi). Các cột thuộc tính (ví dụ: Size, Màu) sẽ lấy tên cột làm danh mục thuộc tính, giá trị ô làm thuộc tính con.",
      ],
      [""],
      [""],
      [
        "STT",
        "Mã sản phẩm",
        "Tên sản phẩm",
        "Mô tả ngắn",
        "Nội dung chi tiết",
        "ID Danh mục",
        "Đường dẫn ảnh",
        "Album ảnh (phân cách bằng dấu phẩy)",
        "SKU",
        "Giá",
        "Size", // thuộc tính động 1
        "Màu", // thuộc tính động 2
        "Đường dẫn ảnh biến thể",
      ],
      // Sản phẩm 1, biến thể 1
      [
        1,
        "SP001",
        "Áo thun nam",
        "Áo thun nam chất liệu cotton",
        "Nội dung chi tiết sản phẩm",
        catalogues.length > 0 ? catalogues[0]._id : "ID_DANH_MUC",
        "https://example.com/image1.jpg",
        "https://example.com/album1.jpg,https://example.com/album2.jpg",
        "SP001-S-M",
        150000,
        "M",
        "Đen",
        "https://example.com/variant1.jpg",
      ],
      // Sản phẩm 1, biến thể 2 (chỉ điền từ cột SKU trở đi)
      [
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "SP001-L-XL",
        180000,
        "L",
        "Trắng",
        "https://example.com/variant2.jpg",
      ],
      // Sản phẩm 2, biến thể 1
      [
        2,
        "SP002",
        "Quần jean nam",
        "Quần jean nam chất liệu denim",
        "Nội dung chi tiết sản phẩm",
        catalogues.length > 1
          ? catalogues[1]._id
          : catalogues.length > 0
          ? catalogues[0]._id
          : "ID_DANH_MUC",
        "https://example.com/image2.jpg",
        "https://example.com/album3.jpg,https://example.com/album4.jpg",
        "SP002-30-32",
        250000,
        "30",
        "Xanh",
        "https://example.com/variant3.jpg",
      ],
      // Sản phẩm 2, biến thể 2 (chỉ điền từ cột SKU trở đi)
      [
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "SP002-32-34",
        270000,
        "32",
        "Đen",
        "https://example.com/variant4.jpg",
      ],
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(combinedData);

    // Merge cells chỉ cho phần tiêu đề và hướng dẫn, KHÔNG merge phần dữ liệu
    worksheet["!merges"] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 14 } },
      { s: { r: 2, c: 0 }, e: { r: 2, c: 14 } },
      { s: { r: 4, c: 0 }, e: { r: 4, c: 14 } },
    ];

    XLSX.utils.book_append_sheet(workbook, worksheet, "Sản phẩm & Biến thể");

    // Sheet danh mục
    const catalogueData = [
      ["DANH SÁCH DANH MỤC SẢN PHẨM"],
      [""],
      ["Tham khảo ID danh mục từ bảng dưới đây để điền vào cột 'ID Danh mục'."],
      [""],
      ["ID Danh mục", "Tên danh mục"],
    ];

    // Thêm dữ liệu danh mục
    catalogues.forEach((cat) => {
      catalogueData.push([cat._id.toString(), cat.name]);
    });

    const catalogueWorksheet = XLSX.utils.aoa_to_sheet(catalogueData);

    // Merge cells cho tiêu đề
    catalogueWorksheet["!merges"] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 1 } }, // Merge tiêu đề chính
      { s: { r: 2, c: 0 }, e: { r: 2, c: 1 } }, // Merge dòng lưu ý
    ];

    XLSX.utils.book_append_sheet(workbook, catalogueWorksheet, "Danh mục");

    // Sheet hướng dẫn
    const guideData = [
      ["HƯỚNG DẪN SỬ DỤNG TEMPLATE EXCEL"],
      [""],
      ["1. CÁCH SỬ DỤNG"],
      ["   Bước 1", "Tải template Excel từ hệ thống"],
      [
        "   Bước 2",
        "Mở file Excel và điền thông tin vào sheet 'Sản phẩm & Biến thể'",
      ],
      ["   Bước 3", "Tham khảo ID danh mục từ sheet 'Danh mục'"],
      ["   Bước 4", "Upload file Excel để import sản phẩm"],
      [""],
      ["2. CẤU TRÚC DỮ LIỆU"],
      ["   - Mỗi sản phẩm có thể có nhiều biến thể"],
      [
        "   - Dòng đầu tiên của mỗi sản phẩm: điền đầy đủ thông tin sản phẩm và biến thể đầu tiên",
      ],
      [
        "   - Các dòng tiếp theo: chỉ điền thông tin biến thể (SKU, Giá, v.v.), để trống thông tin sản phẩm",
      ],
      [""],
      ["3. CÁC CỘT BẮT BUỘC"],
      ["   Sản phẩm:", ""],
      ["   - Mã sản phẩm", "Phải là duy nhất, không được trùng"],
      ["   - Tên sản phẩm", "Tên hiển thị của sản phẩm"],
      ["   - ID Danh mục", "Tham khảo từ sheet 'Danh mục'"],
      ["   Biến thể:", ""],
      ["   - SKU", "Mã SKU của biến thể (duy nhất)"],
      ["   - Giá", "Giá sản phẩm (số dương)"],
      ["   - Tên thuộc tính 1", "Tên thuộc tính bắt buộc (VD: Size S, M, L)"],
      [""],
      ["4. CÁC CỘT TÙY CHỌN"],
      ["   - Mô tả ngắn", "Mô tả ngắn gọn sản phẩm"],
      ["   - Nội dung chi tiết", "Mô tả chi tiết sản phẩm"],
      ["   - Hiển thị", "true/false (mặc định: false)"],
      ["   - Đường dẫn ảnh", "URL ảnh chính của sản phẩm"],
      ["   - Album ảnh", "Danh sách URL ảnh, phân cách bằng dấu phẩy"],
      ["   - Tên thuộc tính 2", "Tên thuộc tính thứ 2 (VD: Màu Đen, Trắng)"],
      ["   - Hiển thị biến thể", "true/false (mặc định: true)"],
      ["   - Đường dẫn ảnh biến thể", "URL ảnh của biến thể"],
      [""],
      ["5. LƯU Ý QUAN TRỌNG"],
      ["   - Không thay đổi tên cột trong sheet 'Sản phẩm & Biến thể'"],
      ["   - Mã sản phẩm phải duy nhất trong hệ thống"],
      ["   - SKU phải duy nhất trong hệ thống"],
      ["   - Mỗi sản phẩm phải có ít nhất 1 biến thể"],
      ["   - Để trống các ô thông tin sản phẩm cho biến thể thứ 2 trở đi"],
      ["   - Giá phải là số dương"],
      ["   - Đường dẫn ảnh phải là URL hợp lệ hoặc để trống"],
      ["   - Thuộc tính sẽ được tự động tạo nếu chưa tồn tại"],
      [""],
      ["6. VÍ DỤ ĐIỀN DỮ LIỆU"],
      ["   Sản phẩm SP001 có 2 biến thể:"],
      ["   Dòng 1: Điền đầy đủ thông tin sản phẩm + biến thể SP001-S-M"],
      [
        "   Dòng 2: Chỉ điền SKU=SP001-L-XL, Giá=180000, v.v. (để trống thông tin sản phẩm)",
      ],
      [""],
      ["7. TỰ ĐỘNG TẠO THUỘC TÍNH"],
      [
        "   - Hệ thống sẽ tự động tạo danh mục thuộc tính dựa trên tên thuộc tính",
      ],
      [
        "   - Tên danh mục: Lấy phần đầu của tên thuộc tính (VD: 'Size S' → Danh mục 'Size')",
      ],
      [
        "   - Tên thuộc tính: Lấy phần còn lại của tên thuộc tính (VD: 'Size S' → Thuộc tính 'S')",
      ],
      [
        "   - Nếu tên thuộc tính chỉ có 1 từ, sẽ dùng làm cả danh mục và thuộc tính",
      ],
      ["   - Nếu thuộc tính đã tồn tại, sẽ sử dụng thuộc tính cũ"],
      [""],
      ["8. VÍ DỤ TẠO DANH MỤC VÀ THUỘC TÍNH"],
      ["   - 'Size S' → Danh mục 'Size', Thuộc tính 'S'"],
      ["   - 'Size M' → Danh mục 'Size', Thuộc tính 'M'"],
      ["   - 'Màu Đen' → Danh mục 'Màu', Thuộc tính 'Đen'"],
      ["   - 'Màu Trắng' → Danh mục 'Màu', Thuộc tính 'Trắng'"],
      ["   - 'Thương hiệu Nike' → Danh mục 'Thương hiệu', Thuộc tính 'Nike'"],
      [
        "   - 'gsdeiugdieuhgu' → Danh mục 'gsdeiugdieuhgu', Thuộc tính 'gsdeiugdieuhgu'",
      ],
    ];

    const guideWorksheet = XLSX.utils.aoa_to_sheet(guideData);

    // Merge cells cho tiêu đề và các section
    guideWorksheet["!merges"] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 1 } }, // Merge tiêu đề chính
      { s: { r: 2, c: 0 }, e: { r: 2, c: 1 } }, // Merge "1. CÁCH SỬ DỤNG"
      { s: { r: 8, c: 0 }, e: { r: 8, c: 1 } }, // Merge "2. CẤU TRÚC DỮ LIỆU"
      { s: { r: 13, c: 0 }, e: { r: 13, c: 1 } }, // Merge "3. CÁC CỘT BẮT BUỘC"
      { s: { r: 20, c: 0 }, e: { r: 20, c: 1 } }, // Merge "4. CÁC CỘT TÙY CHỌN"
      { s: { r: 30, c: 0 }, e: { r: 30, c: 1 } }, // Merge "5. LƯU Ý QUAN TRỌNG"
      { s: { r: 39, c: 0 }, e: { r: 39, c: 1 } }, // Merge "6. VÍ DỤ ĐIỀN DỮ LIỆU"
      { s: { r: 43, c: 0 }, e: { r: 43, c: 1 } }, // Merge "7. TỰ ĐỘNG TẠO THUỘC TÍNH"
      { s: { r: 49, c: 0 }, e: { r: 49, c: 1 } }, // Merge "8. VÍ DỤ TẠO DANH MỤC VÀ THUỘC TÍNH"
    ];

    XLSX.utils.book_append_sheet(workbook, guideWorksheet, "Hướng dẫn");

    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=product_template.xlsx"
    );
    res.send(buffer);
  } catch (error) {
    console.error("Error downloading template:", error);
    res.status(500).json({
      message: "Lỗi khi tải template",
      error: error.message,
    });
  }
};

// Toggle product publish status
exports.togglePublish = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(id);

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        message: "Sản phẩm không tồn tại",
      });
    }

    console.log(product);
    // Toggle the publish status
    const newPublishStatus = !product.publish;

    // Use findByIdAndUpdate instead of save to avoid duplicate key error
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      {
        publish: newPublishStatus,
        updatedAt: new Date(),
      },
      { new: true }
    );

    res.status(200).json({
      message: `Sản phẩm đã được ${
        updatedProduct.publish ? "hiển thị" : "ẩn"
      } thành công`,
      data: {
        _id: updatedProduct._id,
        name: updatedProduct.name,
        publish: updatedProduct.publish,
      },
    });
  } catch (error) {
    console.error("Error toggling product publish status:", error);
    res.status(500).json({
      message: "Lỗi khi thay đổi trạng thái sản phẩm",
      error: error.message,
    });
  }
};

// Bulk toggle product publish status
exports.bulkTogglePublish = async (req, res) => {
  try {
    const { productIds } = req.body;

    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return res.status(400).json({
        message: "Danh sách sản phẩm không hợp lệ",
      });
    }

    const products = await Product.find({ _id: { $in: productIds } });
    if (products.length === 0) {
      return res.status(404).json({
        message: "Không tìm thấy sản phẩm nào",
      });
    }

    // Toggle publish status for all products
    const updatePromises = products.map((product) => {
      const newPublishStatus = !product.publish;
      return Product.findByIdAndUpdate(
        product._id,
        {
          publish: newPublishStatus,
          updatedAt: new Date(),
        },
        { new: true }
      );
    });

    const updatedProducts = await Promise.all(updatePromises);

    res.status(200).json({
      message: `Đã thay đổi trạng thái ${updatedProducts.length} sản phẩm thành công`,
      data: updatedProducts.map((p) => ({
        _id: p._id,
        name: p.name,
        publish: p.publish,
      })),
    });
  } catch (error) {
    console.error("Error bulk toggling product publish status:", error);
    res.status(500).json({
      message: "Lỗi khi thay đổi trạng thái sản phẩm",
      error: error.message,
    });
  }
};

// Bulk delete products
exports.bulkDelete = async (req, res) => {
  try {
    const { productIds } = req.body;

    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return res.status(400).json({
        message: "Danh sách sản phẩm không hợp lệ",
      });
    }

    const products = await Product.find({ _id: { $in: productIds } });
    if (products.length === 0) {
      return res.status(404).json({
        message: "Không tìm thấy sản phẩm nào",
      });
    }

    // Soft delete all products
    const deletePromises = products.map((product) =>
      Product.findByIdAndUpdate(
        product._id,
        {
          deletedAt: new Date(),
          updatedAt: new Date(),
        },
        { new: true }
      )
    );

    const deletedProducts = await Promise.all(deletePromises);

    res.status(200).json({
      message: `Đã xóa ${deletedProducts.length} sản phẩm thành công`,
      data: deletedProducts.map((p) => ({
        _id: p._id,
        name: p.name,
        deletedAt: p.deletedAt,
      })),
    });
  } catch (error) {
    console.error("Error bulk deleting products:", error);
    res.status(500).json({
      message: "Lỗi khi xóa sản phẩm",
      error: error.message,
    });
  }
};
