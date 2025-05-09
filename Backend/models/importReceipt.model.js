const { db } = require("../firebase/firebase-admin");

class ImportReceipt {
  constructor(data) {
    this.code = data.code;
    this.publish = data.publish || "pending";
    this.import_receipt_detail = data.import_receipt_detail || [];
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || null;
    this.deletedAt = data.deletedAt || null;
  }

  // Validate import receipt detail
  static async validateDetail(detail) {
    if (!detail.productId) {
      throw new Error("Product ID is required in detail");
    }
    if (!detail.variant) {
      throw new Error("Variant information is required in detail");
    }
    if (typeof detail.price !== 'number' || detail.price < 0) {
      throw new Error("Price must be a positive number");
    }
    if (typeof detail.quantity !== 'number' || detail.quantity <= 0) {
      throw new Error("Quantity must be a positive number");
    }

    // Validate variant structure
    const variant = detail.variant;
    if (!variant.sku) {
      throw new Error("Variant SKU is required");
    }
    if (!variant.image) {
      throw new Error("Variant image is required");
    }

    // Kiểm tra attributeId1 nếu có
    if (variant.attributeId1) {
      const attribute1Doc = await db.collection("attributes").doc(variant.attributeId1).get();
      if (!attribute1Doc.exists) {
        throw new Error(`Attribute ID '${variant.attributeId1}' does not exist`);
      }
    }

    // Kiểm tra attributeId2 nếu có
    if (variant.attributeId2) {
      const attribute2Doc = await db.collection("attributes").doc(variant.attributeId2).get();
      if (!attribute2Doc.exists) {
        throw new Error(`Attribute ID '${variant.attributeId2}' does not exist`);
      }
    }

    return true;
  }

  static async getById(id) {
    try {
      const doc = await db.collection("import_receipts").doc(id).get();
      if (!doc.exists) {
        throw new Error("Import receipt not found");
      }
      return { id: doc.id, ...doc.data() };
    } catch (error) {
      throw new Error(`Error getting import receipt by ID: ${error.message}`);
    }
  }

  async save() {
    try {
      // Validate all details
      if (this.import_receipt_detail && this.import_receipt_detail.length > 0) {
        this.import_receipt_detail.forEach(detail => {
          ImportReceipt.validateDetail(detail);
        });
      }

      const importReceiptData = {
        code: this.code,
        publish: this.publish,
        import_receipt_detail: this.import_receipt_detail,
        createdAt: this.createdAt,
        updatedAt: null,
        deletedAt: null,
      };

      const importReceiptRef = await db.collection("import_receipts").add(importReceiptData);
      return importReceiptRef.id;
    } catch (error) {
      throw new Error(`Error saving import receipt: ${error.message}`);
    }
  }

  static async update(id, data) {
    try {
      // Validate details if they exist in update data
      if (data.import_receipt_detail && data.import_receipt_detail.length > 0) {
        data.import_receipt_detail.forEach(detail => {
          ImportReceipt.validateDetail(detail);
        });
      }

      const updateData = {
        ...data,
        updatedAt: new Date(),
      };

      await db.collection("import_receipts").doc(id).update(updateData);
      return true;
    } catch (error) {
      throw new Error(`Error updating import receipt: ${error.message}`);
    }
  }

  static async delete(id) {
    try {
      await db.collection("import_receipts").doc(id).delete();
      return true;
    } catch (error) {
      throw new Error(`Error deleting import receipt: ${error.message}`);
    }
  }

  static async getAll() {
    try {
      const snapshot = await db.collection("import_receipts").get();
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      throw new Error(`Error fetching import receipts: ${error.message}`);
    }
  }

  // Thêm chi tiết vào phiếu nhập
  static async addDetail(id, detail) {
    try {
      ImportReceipt.validateDetail(detail);

      const importReceipt = await this.getById(id);
      const details = importReceipt.import_receipt_detail || [];
      details.push(detail);

      await db.collection("import_receipts").doc(id).update({
        import_receipt_detail: details,
        updatedAt: new Date()
      });

      return true;
    } catch (error) {
      throw new Error(`Error adding detail: ${error.message}`);
    }
  }

  // Cập nhật chi tiết trong phiếu nhập
  static async updateDetail(id, detailIndex, detail) {
    try {
      ImportReceipt.validateDetail(detail);

      const importReceipt = await this.getById(id);
      const details = importReceipt.import_receipt_detail || [];
      
      if (detailIndex >= details.length) {
        throw new Error("Detail index out of bounds");
      }

      details[detailIndex] = detail;

      await db.collection("import_receipts").doc(id).update({
        import_receipt_detail: details,
        updatedAt: new Date()
      });

      return true;
    } catch (error) {
      throw new Error(`Error updating detail: ${error.message}`);
    }
  }

  // Xóa chi tiết khỏi phiếu nhập
  static async deleteDetail(id, detailIndex) {
    try {
      const importReceipt = await this.getById(id);
      const details = importReceipt.import_receipt_detail || [];
      
      if (detailIndex >= details.length) {
        throw new Error("Detail index out of bounds");
      }

      details.splice(detailIndex, 1);

      await db.collection("import_receipts").doc(id).update({
        import_receipt_detail: details,
        updatedAt: new Date()
      });

      return true;
    } catch (error) {
      throw new Error(`Error deleting detail: ${error.message}`);
    }
  }

  // Sửa lại phương thức publish
  static async publish(id) {
    try {
      const importReceipt = await this.getById(id);
      
      if (importReceipt.publish === "success") {
        throw new Error("Import receipt is already published successfully");
      }

      // Cập nhật trạng thái publish thành success
      await db.collection("import_receipts").doc(id).update({
        publish: "success",
        updatedAt: new Date()
      });

      // Tạo consignments cho từng chi tiết
      const consignmentPromises = importReceipt.import_receipt_detail.map(async (detail) => {
        const consignmentData = {
          code: importReceipt.code,
          import_receipt_id: id,
          productId: detail.productId,
          variant: {
            ...detail.variant,
            quantity: detail.quantity,  // Thêm trường quantity vào variant
            quantity_sold: 0  // Khởi tạo quantity_sold = 0
          },
          price: detail.price,
          quantity: detail.quantity,
          current_quantity: detail.quantity,
          publish: true,
          createdAt: new Date(),
          updatedAt: null,
          deletedAt: null
        };

        // Thêm vào collection consignments
        const consignmentRef = await db.collection("consignments").add(consignmentData);
        return consignmentRef.id;
      });

      // Đợi tất cả consignments được tạo
      await Promise.all(consignmentPromises);

      return true;
    } catch (error) {
      // Nếu có lỗi, cập nhật trạng thái thành failed
      await db.collection("import_receipts").doc(id).update({
        publish: "failed",
        updatedAt: new Date()
      });
      throw new Error(`Error publishing import receipt: ${error.message}`);
    }
  }

  // Thêm phương thức để cập nhật trạng thái publish
  static async updatePublishStatus(id, status) {
    try {
      if (!["pending", "success", "failed"].includes(status)) {
        throw new Error("Invalid publish status");
      }

      await db.collection("import_receipts").doc(id).update({
        publish: status,
        updatedAt: new Date()
      });

      return true;
    } catch (error) {
      throw new Error(`Error updating publish status: ${error.message}`);
    }
  }
}

module.exports = ImportReceipt; 