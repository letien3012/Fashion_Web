const { db } = require("../firebase/firebase-admin");

class Supplier {
  constructor(data) {
    this.name = data.name;
    this.address = data.address || "";
    this.phone = data.phone || "";
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || null;
    this.deletedAt = data.deletedAt || null;
  }

  static async getById(id) {
    try {
      const doc = await db.collection("suppliers").doc(id).get();
      if (!doc.exists) {
        throw new Error("Supplier not found");
      }
      return { id: doc.id, ...doc.data() };
    } catch (error) {
      throw new Error(`Error getting supplier by ID: ${error.message}`);
    }
  }

  async save() {
    try {
      const supplierData = {
        name: this.name,
        address: this.address,
        phone: this.phone,
        createdAt: this.createdAt,
        updatedAt: null,
        deletedAt: null,
      };

      const supplierRef = await db.collection("suppliers").add(supplierData);
      return supplierRef.id;
    } catch (error) {
      throw new Error(`Error saving supplier: ${error.message}`);
    }
  }

  static async update(id, data) {
    try {
      const updateData = {
        ...data,
        updatedAt: new Date(),
      };

      await db.collection("suppliers").doc(id).update(updateData);
      return true;
    } catch (error) {
      throw new Error(`Error updating supplier: ${error.message}`);
    }
  }

  static async delete(id) {
    try {
      await db.collection("suppliers").doc(id).delete();
      return true;
    } catch (error) {
      throw new Error(`Error deleting supplier: ${error.message}`);
    }
  }

  static async getAll() {
    try {
      const snapshot = await db.collection("suppliers").get();
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      throw new Error(`Error fetching suppliers: ${error.message}`);
    }
  }
}

module.exports = Supplier; 