const Review = require("../models/review.model");
const Order = require("../models/order.model");
const ImageModel = require("../models/image.model");

// Thêm đánh giá mới
exports.add = async (req, res) => {
  try {
    const { customerId, productId, orderId, star, content } = req.body;
    const images = req.body.images || [];

    // Kiểm tra các trường bắt buộc
    if (!customerId || !productId || !orderId || !star || !content) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    // Kiểm tra số sao hợp lệ
    if (star < 1 || star > 5) {
      return res.status(400).json({
        success: false,
        message: "Star rating must be between 1 and 5",
      });
    }

    // Kiểm tra đơn hàng tồn tại và thuộc về khách hàng
    const order = await Order.findOne({
      _id: orderId,
      customerId: customerId,
      status: "delivered",
    });

    if (!order) {
      return res.status(400).json({
        success: false,
        message: "Order not found or not eligible for review",
      });
    }

    // Kiểm tra đã đánh giá chưa
    const existingReview = await Review.findOne({
      orderId: orderId,
      customerId: customerId,
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: "You have already reviewed this order",
      });
    }

    // Xử lý ảnh
    let processedImages = [];
    if (images && images.length > 0) {
      if (images.length > 5) {
        return res.status(400).json({
          success: false,
          message: "Maximum 5 images allowed",
        });
      }

      // Lưu ảnh và lấy đường dẫn
      processedImages = await Promise.all(
        images.map(async (image) => {
          if (image.startsWith("data:image")) {
            return await ImageModel.saveImage(image, "review");
          }
          return image;
        })
      );
    }

    // Tạo review mới
    const review = new Review({
      customerId,
      productId,
      orderId,
      star,
      content,
      images: processedImages,
    });

    const savedReview = await review.save();

    res.status(201).json({
      success: true,
      message: "Review added successfully",
      data: savedReview,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Lấy danh sách đánh giá
exports.getAll = async (req, res) => {
  try {
    const { page = 1, limit = 10, sort = "-createdAt" } = req.query;
    const skip = (page - 1) * limit;

    const reviews = await Review.find()
      .populate("customerId", "fullname email")
      .populate("productId", "name image")
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Review.countDocuments();

    res.status(200).json({
      success: true,
      data: {
        reviews,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};

// Lấy đánh giá theo ID
exports.getById = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id)
      .populate("customerId", "name avatar")
      .populate("productId", "name image");

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    res.status(200).json({
      success: true,
      data: review,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Lấy đánh giá theo sản phẩm
exports.getByProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const { page = 1, limit = 10, sort = "-createdAt" } = req.query;
    const skip = (page - 1) * limit;

    const reviews = await Review.find({
      productId,
    })
      .populate("customerId", "fullname image")
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Review.countDocuments({
      productId,
    });

    res.status(200).json({
      success: true,
      data: {
        reviews,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};

// Lấy đánh giá theo khách hàng
exports.getByCustomer = async (req, res) => {
  try {
    const { customerId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const reviews = await Review.find({ customerId })
      .populate("productId", "name image")
      .sort("-createdAt")
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Review.countDocuments({ customerId });

    res.status(200).json({
      success: true,
      data: {
        reviews,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};

// Cập nhật đánh giá
exports.update = async (req, res) => {
  try {
    const { star, content } = req.body;
    const images = req.body.images || [];
    const reviewId = req.params.id;

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    // Kiểm tra số sao hợp lệ nếu cập nhật
    if (star && (star < 1 || star > 5)) {
      return res.status(400).json({
        success: false,
        message: "Star rating must be between 1 and 5",
      });
    }

    // Xử lý ảnh mới
    if (images.length > 0) {
      if (images.length > 5) {
        return res.status(400).json({
          success: false,
          message: "Maximum 5 images allowed",
        });
      }

      // Xóa ảnh cũ
      if (review.images && review.images.length > 0) {
        await ImageModel.deleteMultipleImages(review.images);
      }

      // Lưu ảnh mới
      const processedImages = await Promise.all(
        images.map(async (image) => {
          if (image.startsWith("data:image")) {
            return await ImageModel.saveImage(image, "review");
          }
          return image;
        })
      );

      review.images = processedImages;
    }

    // Cập nhật các trường khác
    if (star) review.star = star;
    if (content) review.content = content;

    await review.save();

    res.status(200).json({
      success: true,
      message: "Review updated successfully",
      data: review,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Thêm phản hồi cho đánh giá
exports.addReply = async (req, res) => {
  try {
    const { employeeId, content } = req.body;

    // Kiểm tra các trường bắt buộc
    if (!employeeId || !content) {
      return res.status(400).json({
        message: "Missing required fields",
        required: {
          employeeId: !employeeId ? "Employee ID is required" : null,
          content: !content ? "Content is required" : null,
        },
      });
    }

    const reply = {
      employeeId,
      content,
      createdAt: new Date(),
    };

    await Review.addReply(req.params.id, reply);
    res.status(200).json({ message: "Reply added successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Xóa đánh giá
exports.delete = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    // Xóa ảnh
    if (review.images && review.images.length > 0) {
      await ImageModel.deleteMultipleImages(review.images);
    }

    await review.remove();

    res.status(200).json({
      success: true,
      message: "Review deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
