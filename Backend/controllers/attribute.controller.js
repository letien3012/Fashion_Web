const Attribute = require("../models/attribute.model");

// Thêm mới attribute
exports.add = async (req, res) => {
  try {
    const attribute = new Attribute(req.body);
    const id = await attribute.save();
    res.status(201).json({
      message: "Attribute added successfully",
      id,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Lấy tất cả attributes
exports.getAll = async (req, res) => {
  try {
    const attributes = await Attribute.getAll();
    res.status(200).json({
      message: "Lấy danh sách thuộc tính thành công",
      data: attributes,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Lấy attributes theo catalogue ID
exports.getByCatalogueId = async (req, res) => {
  try {
    const attributes = await Attribute.getByCatalogueId(req.params.catalogueId);
    res.status(200).json({
      message: "Lấy danh sách thuộc tính theo danh mục thành công",
      data: attributes,
    });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

// Lấy attribute theo ID
exports.getById = async (req, res) => {
  try {
    const attribute = await Attribute.getById(req.params.id);
    res.status(200).json({
      message: "Lấy thông tin thuộc tính thành công",
      data: attribute,
    });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

// Cập nhật attribute
exports.update = async (req, res) => {
  try {
    await Attribute.update(req.params.id, req.body);
    res.status(200).json({ message: "Attribute updated successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Xóa attribute
exports.delete = async (req, res) => {
  try {
    await Attribute.delete(req.params.id);
    res.status(200).json({ message: "Attribute deleted successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
