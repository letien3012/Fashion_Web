const ImportReceipt = require("../models/importReceipt.model");

// Thêm phiếu nhập mới
exports.add = async (req, res) => {
  try {
    const { code, publish, import_receipt_detail } = req.body;

    if (!code) {
      return res.status(400).json({ 
        message: "Code is required"
      });
    }

    const importReceipt = new ImportReceipt(req.body);
    const id = await importReceipt.save();
    res.status(201).json({
      message: "Import receipt added successfully",
      id,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Lấy danh sách phiếu nhập
exports.getAll = async (req, res) => {
  try {
    const importReceipts = await ImportReceipt.getAll();
    res.status(200).json({
      message: "Import receipts retrieved successfully",
      data: importReceipts
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Lấy phiếu nhập theo ID
exports.getById = async (req, res) => {
  try {
    const importReceipt = await ImportReceipt.getById(req.params.id);
    res.status(200).json(importReceipt);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

// Cập nhật phiếu nhập
exports.update = async (req, res) => {
  try {
    const { code, publish, import_receipt_detail } = req.body;
    
    if (!code) {
      return res.status(400).json({ 
        message: "Code is required"
      });
    }

    await ImportReceipt.update(req.params.id, req.body);
    res.status(200).json({ message: "Import receipt updated successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Xóa phiếu nhập
exports.delete = async (req, res) => {
  try {
    await ImportReceipt.delete(req.params.id);
    res.status(200).json({ message: "Import receipt deleted successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Thêm chi tiết vào phiếu nhập
exports.addDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const detail = req.body;

    await ImportReceipt.addDetail(id, detail);
    res.status(200).json({ message: "Detail added successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Cập nhật chi tiết trong phiếu nhập
exports.updateDetail = async (req, res) => {
  try {
    const { id, detailIndex } = req.params;
    const detail = req.body;

    await ImportReceipt.updateDetail(id, parseInt(detailIndex), detail);
    res.status(200).json({ message: "Detail updated successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Xóa chi tiết khỏi phiếu nhập
exports.deleteDetail = async (req, res) => {
  try {
    const { id, detailIndex } = req.params;

    await ImportReceipt.deleteDetail(id, parseInt(detailIndex));
    res.status(200).json({ message: "Detail deleted successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Sửa lại controller publish
exports.publish = async (req, res) => {
  try {
    const { id } = req.params;
    await ImportReceipt.publish(id);
    res.status(200).json({ message: "Import receipt published successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Thêm controller mới để cập nhật trạng thái publish
exports.updatePublishStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }

    await ImportReceipt.updatePublishStatus(id, status);
    res.status(200).json({ message: "Publish status updated successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}; 