const { db } = require("../firebase/firebase-admin");

class Attribute {
  constructor(data) {
    this.name = data.name;
    this.image = data.image || null;
    this.attributeCatalogueId = data.attributeCatalogueId; // Lưu ID của attributeCatalogue
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || null;
    this.deletedAt = data.deletedAt || null;
  }

  // Lấy danh sách tất cả các attributes
  static async getAll() {
    try {
      const snapshot = await db.collection("attributes").get();
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      throw new Error(`Error fetching attribute list: ${error.message}`);
    }
  }

  // Lấy attribute theo ID
  static async getById(id) {
    try {
      const doc = await db.collection("attributes").doc(id).get();
      if (!doc.exists) {
        throw new Error("Attribute not found");
      }
      return { id: doc.id, ...doc.data() };
    } catch (error) {
      throw new Error(`Error fetching attribute by ID: ${error.message}`);
    }
  }

  // Lưu mới attribute vào Firestore
  async save() {
    try {
      // Kiểm tra attributeCatalogueId có tồn tại không
      const attributeCatalogueRef = db
        .collection("attribute_catalogues")
        .doc(this.attributeCatalogueId);
      const doc = await attributeCatalogueRef.get();

      if (!doc.exists) {
        throw new Error(
          `AttributeCatalogue ID '${this.attributeCatalogueId}' does not exist.`
        );
      }

      // Nếu tồn tại thì mới thêm attribute
      const attributeData = {
        name: this.name,
        image: this.image,
        attributeCatalogueId: this.attributeCatalogueId,
        createdAt: this.createdAt,
        updatedAt: null,
        deletedAt: null,
      };

      const attributeRef = await db.collection("attributes").add(attributeData);
      return attributeRef.id;
    } catch (error) {
      throw new Error(`Error saving attribute: ${error.message}`);
    }
  }

  // Cập nhật thông tin attribute
  static async update(id, data) {
    try {
      const updateData = {
        ...data,
        updatedAt: new Date(),
      };
      await db.collection("attributes").doc(id).update(updateData);
      return true;
    } catch (error) {
      throw new Error(`Error updating attribute: ${error.message}`);
    }
  }

  // Xóa attribute
  static async delete(id) {
    try {
      await db.collection("attributes").doc(id).delete();
      return true;
    } catch (error) {
      throw new Error(`Error deleting attribute: ${error.message}`);
    }
  }
}

module.exports = Attribute;
