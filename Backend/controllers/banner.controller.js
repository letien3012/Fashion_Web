const Banner = require("../models/banner.model");

// Thêm banner mới
exports.add = async (req, res) => {
  try {
    const { name, content, image, type } = req.body;
    console.log(req.body);

    // Kiểm tra các trường bắt buộc
    if (!name || !type) {
      return res.status(400).json({
        message: "Missing required fields",
        required: {
          name: !name ? "Name is required" : null,
          type: !type ? "Type is required" : null,
        },
      });
    }

    const banner = new Banner(req.body);
    const savedBanner = await banner.save();
    res.status(201).json({
      message: "Banner added successfully",
      data: savedBanner,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Lấy danh sách banner
exports.getAll = async (req, res) => {
  try {
    const banners = await Banner.getAll();
    res.status(200).json({
      message: "Banners retrieved successfully",
      data: banners,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Lấy banner theo ID
exports.getById = async (req, res) => {
  try {
    const banner = await Banner.getById(req.params.id);
    res.status(200).json({
      message: "Banner retrieved successfully",
      data: banner,
    });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

// Cập nhật banner
exports.update = async (req, res) => {
  try {
    const { name, content, image, type, publish } = req.body;

    // Kiểm tra các trường bắt buộc
    if (!name || !type) {
      return res.status(400).json({
        message: "Missing required fields",
        required: {
          name: !name ? "Name is required" : null,
          type: !type ? "Type is required" : null,
        },
      });
    }

    await Banner.update(req.params.id, req.body);
    res.status(200).json({ message: "Banner updated successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Xóa banner (soft delete)
exports.delete = async (req, res) => {
  try {
    await Banner.delete(req.params.id);
    res.status(200).json({ message: "Banner deleted successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Lấy banner theo type
exports.getByType = async (req, res) => {
  try {
    const banners = await Banner.find({
      type: req.params.type,
      deletedAt: null,
      publish: true,
    });
    res.status(200).json({
      message: "Banners retrieved successfully",
      data: banners,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
