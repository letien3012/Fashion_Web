const AttributeCatalogue = require("../models/attributeCatalogue.model");

// Get all active catalogues
exports.getAllCatalogues = async (req, res) => {
  try {
    const catalogues = await AttributeCatalogue.getAllCatalogues();
    res.status(200).json({
      message: "Lấy danh sách danh mục thuộc tính thành công",
      data: catalogues,
    });
  } catch (error) {
    console.error("Get all catalogues error:", error);
    res.status(500).json({
      message: "Lỗi server",
      error: error.message,
    });
  }
};

// Get catalogue by ID
exports.getCatalogueById = async (req, res) => {
  try {
    const catalogue = await AttributeCatalogue.findActiveById(req.params.id);
    if (!catalogue) {
      return res.status(404).json({
        message: "Không tìm thấy danh mục thuộc tính",
      });
    }
    res.status(200).json(catalogue);
  } catch (error) {
    console.error("Get catalogue by ID error:", error);
    res.status(500).json({
      message: "Lỗi server",
      error: error.message,
    });
  }
};

// Add new catalogue
exports.addCatalogue = async (req, res) => {
  try {
    const { name } = req.body;

    // Validate required fields
    if (!name) {
      return res.status(400).json({
        message: "Vui lòng nhập tên danh mục",
      });
    }

    // Check if name already exists
    const existingCatalogue = await AttributeCatalogue.findOne({ name });
    if (existingCatalogue) {
      return res.status(400).json({
        message: "Tên danh mục đã tồn tại",
      });
    }

    // Create new catalogue
    const catalogue = new AttributeCatalogue({
      name
    });

    await catalogue.save();

    res.status(201).json({
      message: "Thêm danh mục thuộc tính thành công",
      catalogue,
    });
  } catch (error) {
    console.error("Add catalogue error:", error);
    res.status(500).json({
      message: "Lỗi server",
      error: error.message,
    });
  }
};

// Update catalogue
exports.updateCatalogue = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const catalogue = await AttributeCatalogue.findActiveById(id);
    if (!catalogue) {
      return res.status(404).json({
        message: "Không tìm thấy danh mục thuộc tính",
      });
    }

    // Check if new name already exists (excluding current catalogue)
    if (name && name !== catalogue.name) {
      const existingCatalogue = await AttributeCatalogue.findOne({
        name,
        _id: { $ne: id }
      });
      if (existingCatalogue) {
        return res.status(400).json({
          message: "Tên danh mục đã tồn tại",
        });
      }
    }

    // Update name
    catalogue.name = name || catalogue.name;
    await catalogue.save();

    res.status(200).json({
      message: "Cập nhật danh mục thuộc tính thành công",
      catalogue,
    });
  } catch (error) {
    console.error("Update catalogue error:", error);
    res.status(500).json({
      message: "Lỗi server",
      error: error.message,
    });
  }
};

// Delete catalogue (soft delete)
exports.deleteCatalogue = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate ID
    if (!id) {
      return res.status(400).json({
        message: "ID danh mục không hợp lệ",
      });
    }

    // Find active catalogue
    const catalogue = await AttributeCatalogue.findActiveById(id);
    if (!catalogue) {
      return res.status(404).json({
        message: "Không tìm thấy danh mục thuộc tính",
      });
    }

    // Perform soft delete
    await AttributeCatalogue.softDelete(id);

    res.status(200).json({
      message: "Xóa danh mục thuộc tính thành công",
    });
  } catch (error) {
    console.error("Delete catalogue error:", error);
    res.status(500).json({
      message: "Lỗi server",
      error: error.message,
    });
  }
};
