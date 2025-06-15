const Promotion = require("../models/promotion.model");
const ImageModel = require("../models/image.model");
const Product = require("../models/product.model");

// Thêm promotion mới
exports.add = async (req, res) => {
  try {
    const { code, name, type, discount, productId } = req.body;
    if (!code || !name || !type || !discount) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Validate productId nếu type là product
    if (type === "product" && productId) {
      if (!Array.isArray(productId) || productId.length === 0) {
        return res.status(400).json({
          message: "Product promotions must have at least one product",
        });
      }

      for (const item of productId) {
        if (!item.productId || !item.variantId) {
          return res.status(400).json({
            message: "Each product must have both productId and variantId",
          });
        }

        // Verify product and variant exist
        const product = await Product.findById(item.productId);
        if (!product) {
          return res
            .status(400)
            .json({ message: `Product with ID ${item.productId} not found` });
        }

        const variant = product.variants.find(
          (v) => v._id.toString() === item.variantId.toString()
        );
        if (!variant) {
          return res.status(400).json({
            message: `Variant with ID ${item.variantId} not found in product ${product.name}`,
          });
        }
      }
    }

    const promotion = new Promotion(req.body);
    const savedPromotion = await promotion.save();
    res.status(201).json({
      message: "Promotion added successfully",
      data: savedPromotion,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Lấy danh sách promotion
exports.getAll = async (req, res) => {
  try {
    const promotions = await Promotion.getAll();
    res.status(200).json({
      message: "Promotions retrieved successfully",
      data: promotions,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Lấy danh sách promotion đã xóa
exports.getDeleted = async (req, res) => {
  try {
    const promotions = await Promotion.find({ deleted_at: { $ne: null } })
      .populate("productId.productId")
      .populate("productId.variantId");
    res.status(200).json({
      message: "Deleted promotions retrieved successfully",
      data: promotions,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Lấy promotion theo ID
exports.getById = async (req, res) => {
  try {
    const promotion = await Promotion.getById(req.params.id);
    res.status(200).json(promotion);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

// Lấy promotion theo code
exports.getByCode = async (req, res) => {
  try {
    const promotion = await Promotion.getByCode(req.params.code);
    res.status(200).json(promotion);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

// Lấy danh sách promotion đang active
exports.getActivePromotions = async (req, res) => {
  try {
    const promotions = await Promotion.getActivePromotions();
    res.status(200).json({
      message: "Active promotions retrieved successfully",
      data: promotions,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Cập nhật promotion
exports.update = async (req, res) => {
  try {
    const { code, name, type, discount, productId } = req.body;
    if (!code || !name || !type || !discount) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Validate productId nếu type là product
    if (type === "product" && productId) {
      if (!Array.isArray(productId) || productId.length === 0) {
        return res.status(400).json({
          message: "Product promotions must have at least one product",
        });
      }

      for (const item of productId) {
        if (!item.productId || !item.variantId) {
          return res.status(400).json({
            message: "Each product must have both productId and variantId",
          });
        }

        // Verify product and variant exist
        const product = await Product.findById(item.productId);
        if (!product) {
          return res
            .status(400)
            .json({ message: `Product with ID ${item.productId} not found` });
        }

        const variant = product.variants.find(
          (v) => v._id.toString() === item.variantId.toString()
        );
        if (!variant) {
          return res.status(400).json({
            message: `Variant with ID ${item.variantId} not found in product ${product.name}`,
          });
        }
      }
    }

    const promotion = await Promotion.getById(req.params.id);

    // Handle image update
    if (req.body.image && req.body.image.startsWith("data:image")) {
      // Delete old image if exists
      if (promotion.image) {
        await ImageModel.deleteImage(promotion.image);
      }
    }

    const updatedPromotion = await promotion.update(req.body);
    res.status(200).json({
      message: "Promotion updated successfully",
      data: updatedPromotion,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Xóa mềm promotion
exports.delete = async (req, res) => {
  try {
    const promotion = await Promotion.getById(req.params.id);
    await promotion.delete();
    res.status(200).json({ message: "Promotion deleted successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Khôi phục promotion đã xóa
exports.restore = async (req, res) => {
  try {
    const promotion = await Promotion.findOne({
      _id: req.params.id,
      deleted_at: { $ne: null },
    });
    if (!promotion) {
      return res.status(404).json({ message: "Deleted promotion not found" });
    }
    await promotion.restore();
    res.status(200).json({ message: "Promotion restored successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Lấy danh sách sản phẩm đang được giảm giá
exports.getDiscountedProducts = async (req, res) => {
  try {
    // Lấy danh sách khuyến mãi đang active
    const activePromotions = await Promotion.getActivePromotions();
    const productPromotions = activePromotions.filter(
      (promo) => promo.type === "product"
    );

    // Lấy thông tin chi tiết của các sản phẩm có khuyến mãi
    const discountedProducts = await Promise.all(
      productPromotions.map(async (promotion) => {
        const products = await Promise.all(
          promotion.productId.map(async (item) => {
            const product = await Product.findById(item.productId);
            if (!product) return null;

            const variant = product.variants.find(
              (v) => v._id.toString() === item.variantId.toString()
            );
            if (!variant) return null;

            // Tính giá sau giảm giá
            const salePrice =
              Math.round(
                (variant.price - (variant.price * promotion.discount) / 100) *
                  100
              ) / 100;

            return {
              _id: product._id,
              name: product.name,
              image: product.image,
              album: product.album,
              price: variant.price,
              salePrice,
              discountPercentage: promotion.discount,
              variant: {
                _id: variant._id,
                sku: variant.sku,
                name: variant.name,
                price: variant.price,
                quantity: variant.quantity,
                attributeId1: variant.attributeId1,
                attributeId2: variant.attributeId2,
              },
              promotion: {
                _id: promotion._id,
                code: promotion.code,
                name: promotion.name,
                start_date: promotion.start_date,
                end_date: promotion.end_date,
              },
            };
          })
        );

        return products.filter(Boolean);
      })
    );

    // Làm phẳng mảng và loại bỏ các sản phẩm trùng lặp
    const uniqueProducts = Array.from(
      new Map(
        discountedProducts
          .flat()
          .map((product) => [product._id.toString(), product])
      ).values()
    );

    res.status(200).json({
      message: "Discounted products retrieved successfully",
      data: uniqueProducts,
    });
  } catch (error) {
    console.error("Error getting discounted products:", error);
    res.status(500).json({ message: error.message });
  }
};
