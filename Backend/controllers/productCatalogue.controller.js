const ProductCatalogue = require("../models/productCatalogue.model");
const ImageModel = require("../models/image.model");

// Thêm danh mục sản phẩm mới
exports.add = async (req, res) => {
  try {
    const { name, description, parentId } = req.body;
    let icon = null;

    // Handle icon upload if present
    if (req.body.icon) {
      icon = await ImageModel.saveImage(req.body.icon, "icon");
    }

    // Validate required fields
    if (!name) {
      return res.status(400).json({
        message: "Vui lòng nhập tên danh mục",
      });
    }

    // Create new catalogue
    const catalogue = new ProductCatalogue({
      name,
      description,
      parentId: parentId === "" ? null : parentId,
      icon,
    });

    await catalogue.save();

    res.status(201).json({
      message: "Thêm danh mục thành công",
      data: catalogue,
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi server",
      error: error.message,
    });
  }
};

// Lấy danh sách danh mục con
exports.getChildren = async (req, res) => {
  try {
    const children = await ProductCatalogue.getChildren(req.params.id);
    res.status(200).json({
      message: "Success",
      data: children,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Lấy cấu trúc cây danh mục
exports.getTree = async (req, res) => {
  try {
    const tree = await ProductCatalogue.getTree();
    res.status(200).json({
      message: "Success",
      data: tree,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Lấy danh sách danh mục sản phẩm
exports.getAll = async (req, res) => {
  try {
    const catalogues = await ProductCatalogue.getAllWithProductCount();
    res.status(200).json({
      data: catalogues,
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi server",
      error: error.message,
    });
  }
};

// Lấy danh mục sản phẩm theo ID
exports.getById = async (req, res) => {
  try {
    const catalogue = await ProductCatalogue.findById(req.params.id);
    if (!catalogue) {
      return res.status(404).json({
        message: "Không tìm thấy danh mục",
      });
    }
    const productCount = await ProductCatalogue.getProductCount(req.params.id);
    const catalogueWithCount = {
      ...catalogue.toObject(),
      productCount,
    };
    res.status(200).json(catalogueWithCount);
  } catch (error) {
    res.status(500).json({
      message: "Lỗi server",
      error: error.message,
    });
  }
};

// Cập nhật danh mục sản phẩm
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, parentId } = req.body;
    let icon = null;

    const catalogue = await ProductCatalogue.findById(id);
    if (!catalogue) {
      return res.status(404).json({
        message: "Không tìm thấy danh mục",
      });
    }

    // Update fields
    catalogue.name = name || catalogue.name;
    catalogue.description = description || catalogue.description;
    catalogue.parentId =
      parentId === null ? null : parentId || catalogue.parentId;

    // Handle icon update
    if (req.body.icon) {
      // If icon is a base64 string (new icon)
      if (req.body.icon.startsWith("data:")) {
        icon = await ImageModel.saveImage(req.body.icon, "icon");
        // Delete old icon if exists
        if (catalogue.icon) {
          await ImageModel.deleteImage(catalogue.icon);
        }
        catalogue.icon = icon;
      }
      // If icon is a path (old icon), keep it
      else if (req.body.icon.startsWith("/images/")) {
        catalogue.icon = req.body.icon;
      }
    }

    await catalogue.save();
    res.status(200).json({
      message: "Cập nhật danh mục thành công",
      data: catalogue,
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi server",
      error: error.message,
    });
  }
};

// Xóa danh mục sản phẩm
exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    const catalogue = await ProductCatalogue.findById(id);
    if (!catalogue) {
      return res.status(404).json({
        message: "Không tìm thấy danh mục",
      });
    }

    // Delete icon if exists
    if (catalogue.icon) {
      await ImageModel.deleteImage(catalogue.icon);
    }

    await catalogue.delete();

    res.status(200).json({
      message: "Xóa danh mục thành công",
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi server",
      error: error.message,
    });
  }
};
