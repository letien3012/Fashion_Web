const Review = require("../models/review.model");

// Thêm đánh giá mới
exports.add = async (req, res) => {
  try {
    const { customerId, productId, orderId, star, content, image } = req.body;

    // Kiểm tra các trường bắt buộc
    if (!customerId || !productId || !orderId || !star || !content) {
      return res.status(400).json({
        message: "Missing required fields",
        required: {
          customerId: !customerId ? "Customer ID is required" : null,
          productId: !productId ? "Product ID is required" : null,
          orderId: !orderId ? "Order ID is required" : null,
          star: !star ? "Star rating is required" : null,
          content: !content ? "Content is required" : null,
        },
      });
    }

    // Kiểm tra số sao hợp lệ
    if (star < 1 || star > 5) {
      return res.status(400).json({
        message: "Star rating must be between 1 and 5",
      });
    }

    const review = new Review(req.body);
    const savedReview = await review.save();
    res.status(201).json({
      message: "Review added successfully",
      data: savedReview,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Lấy danh sách đánh giá
exports.getAll = async (req, res) => {
  try {
    const reviews = await Review.getAll();
    res.status(200).json({
      message: "Reviews retrieved successfully",
      data: reviews,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Lấy đánh giá theo ID
exports.getById = async (req, res) => {
  try {
    const review = await Review.getById(req.params.id);
    res.status(200).json({
      message: "Review retrieved successfully",
      data: review,
    });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

// Lấy đánh giá theo sản phẩm
exports.getByProduct = async (req, res) => {
  try {
    const reviews = await Review.getByProductId(req.params.productId);
    res.status(200).json({
      message: "Reviews retrieved successfully",
      data: reviews,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Lấy đánh giá theo khách hàng
exports.getByCustomer = async (req, res) => {
  try {
    const reviews = await Review.getByCustomerId(req.params.customerId);
    res.status(200).json({
      message: "Reviews retrieved successfully",
      data: reviews,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Cập nhật đánh giá
exports.update = async (req, res) => {
  try {
    const { star, content, image } = req.body;

    // Kiểm tra số sao hợp lệ nếu cập nhật
    if (star && (star < 1 || star > 5)) {
      return res.status(400).json({
        message: "Star rating must be between 1 and 5",
      });
    }

    await Review.update(req.params.id, req.body);
    res.status(200).json({ message: "Review updated successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
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

// Xóa đánh giá (soft delete)
exports.delete = async (req, res) => {
  try {
    await Review.delete(req.params.id);
    res.status(200).json({ message: "Review deleted successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
