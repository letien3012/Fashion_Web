const ProductCatalogue = require("../models/productCatalogue.model");

// Thêm danh mục sản phẩm mới
exports.add = async (req, res) => {
  try {
    const { name, description, icon, parentId } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Name is required" });
    }

    // Nếu có parentId, kiểm tra parent có tồn tại không
    if (parentId) {
      const parent = await ProductCatalogue.getById(parentId);
      if (!parent) {
        return res.status(400).json({ message: "Parent catalogue not found" });
      }
    }

    const productCatalogue = new ProductCatalogue(req.body);
    const id = await productCatalogue.save();
    res.status(201).json({
      message: "ProductCatalogue added successfully",
      id,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Lấy danh sách danh mục con
exports.getChildren = async (req, res) => {
  try {
    const children = await ProductCatalogue.getChildren(req.params.id);
    res.status(200).json({
      message: "Child catalogues retrieved successfully",
      data: children
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Lấy cấu trúc cây danh mục
exports.getTree = async (req, res) => {
  try {
    const tree = await ProductCatalogue.getTree();
    res.status(200).json({
      message: "Catalogue tree retrieved successfully",
      data: tree
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Lấy danh sách danh mục sản phẩm
exports.getAll = async (req, res) => {
  try {
    const productCatalogues = await ProductCatalogue.getAll();
    res.status(200).json({
      message: "ProductCatalogues retrieved successfully",
      data: productCatalogues
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Lấy danh mục sản phẩm theo ID
exports.getById = async (req, res) => {
  try {
    const productCatalogue = await ProductCatalogue.getById(req.params.id);
    res.status(200).json(productCatalogue);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

// Cập nhật danh mục sản phẩm
exports.update = async (req, res) => {
  try {
    const { name, description, icon } = req.body;
    
    if (!name) {
      return res.status(400).json({ message: "Name is required" });
    }

    await ProductCatalogue.update(req.params.id, req.body);
    res.status(200).json({ message: "ProductCatalogue updated successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Xóa danh mục sản phẩm
exports.delete = async (req, res) => {
  try {
    await ProductCatalogue.delete(req.params.id);
    res.status(200).json({ message: "ProductCatalogue deleted successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}; 