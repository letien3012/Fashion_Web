const ImportReceipt = require("../models/importReceipt.model");
const Consignment = require("../models/consignment.model");

// Thêm phiếu nhập mới
exports.add = async (req, res) => {
  try {
    const { code, import_details } = req.body;

    if (!code) {
      return res.status(400).json({
        message: "Code is required",
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
      data: importReceipts,
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
    const { code, import_details } = req.body;

    if (!code) {
      return res.status(400).json({
        message: "Code is required",
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

    // Validate required fields
    if (
      !detail.productId ||
      !detail.sku ||
      !detail.quantity ||
      !detail.price ||
      !detail.variant_id
    ) {
      return res.status(400).json({
        message: "Missing required fields",
        required: {
          productId: "Product ID is required",
          sku: "SKU is required",
          quantity: "Quantity is required",
          price: "Price is required",
          variant_id: "Variant ID is required",
        },
      });
    }

    // Validate numeric fields
    if (detail.quantity < 0 || detail.price < 0) {
      return res.status(400).json({
        message: "Invalid numeric values",
        required: {
          quantity: "Quantity must be a non-negative number",
          price: "Price must be a non-negative number",
        },
      });
    }

    const importReceipt = await ImportReceipt.findById(id);
    if (!importReceipt) {
      return res.status(404).json({
        message: "Import receipt not found",
      });
    }

    if (importReceipt.status === "completed") {
      return res.status(400).json({
        message: "Cannot add details to completed import receipt",
      });
    }

    importReceipt.import_details.push(detail);
    importReceipt.updatedAt = new Date();
    await importReceipt.save();

    res.status(200).json({
      message: "Import detail added successfully",
      data: importReceipt,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error adding import detail",
      error: error.message,
    });
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

// Cập nhật trạng thái phiếu nhập
exports.updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    let createdConsignments = []; // Khai báo biến ở ngoài để có thể sử dụng trong toàn bộ hàm

    console.log(
      `[ImportReceipt] Received status update request for ID: ${id}, new status: ${status}`
    );

    if (!status) {
      console.log(`[ImportReceipt] Status is missing in request body`);
      return res.status(400).json({ message: "Status is required" });
    }

    // Lấy thông tin phiếu nhập hiện tại
    const importReceipt = await ImportReceipt.getById(id);
    console.log(
      `[ImportReceipt] Current receipt status: ${importReceipt.status}, ID: ${id}`
    );

    if (!importReceipt) {
      console.log(`[ImportReceipt] Receipt not found with ID: ${id}`);
      return res.status(404).json({ message: "Import receipt not found" });
    }

    // Kiểm tra tính hợp lệ của trạng thái mới
    const validTransitions = {
      pending: ["processing", "cancelled"],
      processing: ["completed", "cancelled"],
      completed: [],
      cancelled: [],
    };

    console.log(
      `[ImportReceipt] Valid transitions for status ${importReceipt.status}:`,
      validTransitions[importReceipt.status]
    );

    if (!validTransitions[importReceipt.status]?.includes(status)) {
      console.log(
        `[ImportReceipt] Invalid status transition from ${importReceipt.status} to ${status}`
      );
      return res.status(400).json({
        message: `Cannot change status from ${importReceipt.status} to ${status}`,
      });
    }

    // Nếu chuyển sang trạng thái completed, tạo consignment
    if (status === "completed") {
      console.log(
        `[ImportReceipt] Processing completion for receipt ID: ${id}`
      );

      // Kiểm tra có chi tiết nhập hàng không
      if (
        !importReceipt.import_details ||
        importReceipt.import_details.length === 0
      ) {
        console.log(
          `[ImportReceipt] No import details found for receipt ID: ${id}`
        );
        return res.status(400).json({
          message: "Cannot complete import receipt without any details",
        });
      }

      console.log(
        `[ImportReceipt] Found ${importReceipt.import_details.length} details to process`
      );

      try {
        // Tạo consignment cho từng chi tiết
        for (const detail of importReceipt.import_details) {
          console.log(`[ImportReceipt] Processing detail:`, detail);

          // Lấy variant_id từ object nếu cần
          const variantId =
            typeof detail.variant_id === "object"
              ? detail.variant_id._id
              : detail.variant_id;

          if (!variantId) {
            console.log(
              `[ImportReceipt] Missing variant ID for product ${detail.productId} in receipt ID: ${id}`
            );
            throw new Error(
              `Missing variant ID for product ${detail.productId}`
            );
          }

          const consignmentData = {
            code: `${importReceipt.code}`,
            productId: detail.productId,
            variantId: variantId,
            quantity: detail.quantity,
            price: detail.price,
            importReceiptId: importReceipt._id,
            status: "active",
            current_quantity: detail.quantity,
          };

          console.log(
            `[ImportReceipt] Creating consignment with data:`,
            consignmentData
          );

          const consignment = new Consignment(consignmentData);
          await consignment.save();
          createdConsignments.push(consignment);

          console.log(
            `[ImportReceipt] Consignment created successfully with ID: ${consignment._id}`
          );
        }

        console.log(
          `[ImportReceipt] Successfully created ${createdConsignments.length} consignments`
        );
      } catch (error) {
        console.error(
          `[ImportReceipt] Error creating consignments for receipt ID: ${id}:`,
          error
        );

        // Nếu có lỗi, xóa các consignment đã tạo
        console.log(`[ImportReceipt] Rolling back created consignments...`);
        for (const consignment of createdConsignments) {
          await Consignment.findByIdAndDelete(consignment._id);
          console.log(
            `[ImportReceipt] Deleted consignment with ID: ${consignment._id}`
          );
        }

        return res.status(500).json({
          message: "Error creating consignments. Status update cancelled.",
          error: error.message,
        });
      }
    }

    // Cập nhật trạng thái
    console.log(`[ImportReceipt] Updating receipt status to: ${status}`);
    const updatedReceipt = await ImportReceipt.updateStatus(id, status);
    console.log(`[ImportReceipt] Status updated successfully to: ${status}`);

    // Chuẩn bị response data
    const responseData = {
      message: "Status updated successfully",
      data: {
        importReceipt: updatedReceipt,
      },
    };

    // Thêm thông tin consignment nếu có
    if (status === "completed" && createdConsignments.length > 0) {
      responseData.data.consignments = createdConsignments;
    }

    res.status(200).json(responseData);
  } catch (error) {
    console.error(`[ImportReceipt] Error in updateStatus:`, error);
    res.status(400).json({ message: error.message });
  }
};
