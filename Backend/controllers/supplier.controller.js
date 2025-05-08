const Supplier = require("../models/supplier.model");

// Thêm nhà cung cấp mới
exports.add = async (req, res) => {
  try {
    const { name, address, phone } = req.body;

    if (!name) {
      return res.status(400).json({ 
        message: "Name is required"
      });
    }

    const supplier = new Supplier(req.body);
    const id = await supplier.save();
    res.status(201).json({
      message: "Supplier added successfully",
      id,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Lấy danh sách nhà cung cấp
exports.getAll = async (req, res) => {
  try {
    const suppliers = await Supplier.getAll();
    res.status(200).json({
      message: "Suppliers retrieved successfully",
      data: suppliers
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Lấy nhà cung cấp theo ID
exports.getById = async (req, res) => {
  try {
    const supplier = await Supplier.getById(req.params.id);
    res.status(200).json(supplier);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

// Cập nhật nhà cung cấp
exports.update = async (req, res) => {
  try {
    const { name, address, phone } = req.body;
    
    if (!name) {
      return res.status(400).json({ 
        message: "Name is required"
      });
    }

    await Supplier.update(req.params.id, req.body);
    res.status(200).json({ message: "Supplier updated successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Xóa nhà cung cấp
exports.delete = async (req, res) => {
  try {
    await Supplier.delete(req.params.id);
    res.status(200).json({ message: "Supplier deleted successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}; 