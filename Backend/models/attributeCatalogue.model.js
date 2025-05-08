const { db } = require("../firebase/firebase-admin");

class AttributeCatalogue {
  constructor(data) {
    this.name = data.name;
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || null;
    this.deletedAt = data.deletedAt || null;
  }

  // Lấy danh sách tất cả các attributeCatalogue
  static async getAll() {
    try {
      const snapshot = await db.collection("attribute_catalogues").get();
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      throw new Error(
        `Error fetching attribute catalogue list: ${error.message}`
      );
    }
  }

  // Lấy attributeCatalogue theo ID
  static async getById(id) {
    try {
      const doc = await db.collection("attribute_catalogues").doc(id).get();
      if (!doc.exists) {
        throw new Error("AttributeCatalogue not found");
      }
      return { id: doc.id, ...doc.data() };
    } catch (error) {
      throw new Error(
        `Error fetching attribute catalogue by ID: ${error.message}`
      );
    }
  }

  // Lưu mới attributeCatalogue vào Firestore
  async save() {
    try {
      const attributeCatalogueData = {
        name: this.name,
        createdAt: this.createdAt,
        updatedAt: null,
        deletedAt: null,
      };
      const attributeCatalogueRef = await db
        .collection("attribute_catalogues")
        .add(attributeCatalogueData);
      return attributeCatalogueRef.id;
    } catch (error) {
      throw new Error(`Error saving attribute catalogue: ${error.message}`);
    }
  }

  // Cập nhật thông tin attributeCatalogue
  static async update(id, data) {
    try {
      const updateData = {
        ...data,
        updatedAt: new Date(),
      };
      await db.collection("attribute_catalogues").doc(id).update(updateData);
      return true;
    } catch (error) {
      throw new Error(`Error updating attribute catalogue: ${error.message}`);
    }
  }

  // Xóa attributeCatalogue
  static async delete(id) {
    try {
      await db.collection("attribute_catalogues").doc(id).delete();
      return true;
    } catch (error) {
      throw new Error(`Error deleting attribute catalogue: ${error.message}`);
    }
  }
}

module.exports = AttributeCatalogue;
