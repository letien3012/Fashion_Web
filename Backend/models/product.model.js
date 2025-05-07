const { db } = require("../firebase/firebase-admin");

class Product {
  constructor(data) {
    this.name = data.name;
    this.description = data.description;
    this.price = data.price;
    this.imageUrl = data.imageUrl;
    this.category = data.category;
    this.stock = data.stock;
  }

  static async getAll() {
    try {
      const snapshot = await db.collection("products").get();
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      throw error;
    }
  }

  static async getById(id) {
    try {
      const doc = await db.collection("products").doc(id).get();
      if (!doc.exists) {
        throw new Error("Product not found");
      }
      return {
        id: doc.id,
        ...doc.data(),
      };
    } catch (error) {
      throw error;
    }
  }

  async save() {
    try {
      const docRef = await db.collection("products").add({
        name: this.name,
        description: this.description,
        price: this.price,
        imageUrl: this.imageUrl,
        category: this.category,
        stock: this.stock,
        createdAt: new Date(),
      });
      return docRef.id;
    } catch (error) {
      throw error;
    }
  }

  static async update(id, data) {
    try {
      await db
        .collection("products")
        .doc(id)
        .update({
          ...data,
          updatedAt: new Date(),
        });
      return true;
    } catch (error) {
      throw error;
    }
  }

  static async delete(id) {
    try {
      await db.collection("products").doc(id).delete();
      return true;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Product;
