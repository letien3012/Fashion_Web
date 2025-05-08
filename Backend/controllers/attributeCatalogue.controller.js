const AttributeCatalogue = require("../models/attributeCatalogue.model");

// Thêm mới attributeCatalogue
exports.add = async (req, res) => {
  try {
    const attributeCatalogue = new AttributeCatalogue(req.body);
    const id = await attributeCatalogue.save();
    res.status(201).json({
      message: "AttributeCatalogue added successfully",
      id,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Lấy tất cả attributeCatalogues
exports.getAll = async (req, res) => {
  try {
    const attributeCatalogues = await AttributeCatalogue.getAll();
    res.status(200).json(attributeCatalogues);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Lấy attributeCatalogue theo ID
exports.getById = async (req, res) => {
  try {
    const attributeCatalogue = await AttributeCatalogue.getById(req.params.id);
    res.status(200).json(attributeCatalogue);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

// Cập nhật attributeCatalogue
exports.update = async (req, res) => {
  try {
    await AttributeCatalogue.update(req.params.id, req.body);
    res
      .status(200)
      .json({ message: "AttributeCatalogue updated successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Xóa attributeCatalogue
exports.delete = async (req, res) => {
  try {
    await AttributeCatalogue.delete(req.params.id);
    res
      .status(200)
      .json({ message: "AttributeCatalogue deleted successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
