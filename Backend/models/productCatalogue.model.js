const { db } = require("../firebase/firebase-admin");

class ProductCatalogue {
  constructor(data) {
    this.name = data.name;
    this.description = data.description || "";
    this.icon = data.icon || null;
    this.parentId = data.parentId || null;
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || null;
    this.deletedAt = data.deletedAt || null;
  }

  static async getById(id) {
    try {
      const doc = await db.collection("product_catalogues").doc(id).get();
      if (!doc.exists) {
        throw new Error("ProductCatalogue not found");
      }
      return { id: doc.id, ...doc.data() };
    } catch (error) {
      throw new Error(`Error getting productCatalogue by ID: ${error.message}`);
    }
  }

  static async getChildren(parentId) {
    try {
      const snapshot = await db
        .collection("product_catalogues")
        .where("parentId", "==", parentId)
        .get();
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      throw new Error(`Error fetching child catalogues: ${error.message}`);
    }
  }

  static async getTree() {
    try {
      const snapshot = await db.collection("product_catalogues").get();
      const allCatalogues = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      const catalogueMap = new Map();
      allCatalogues.forEach(cat => catalogueMap.set(cat.id, { ...cat, children: [] }));

      const tree = [];
      allCatalogues.forEach(cat => {
        if (cat.parentId) {
          const parent = catalogueMap.get(cat.parentId);
          if (parent) {
            parent.children.push(catalogueMap.get(cat.id));
          }
        } else {
          tree.push(catalogueMap.get(cat.id));
        }
      });

      return tree;
    } catch (error) {
      throw new Error(`Error fetching catalogue tree: ${error.message}`);
    }
  }

  async save() {
    try {
      const productCatalogueData = {
        name: this.name,
        description: this.description,
        icon: this.icon,
        parentId: this.parentId,
        createdAt: this.createdAt,
        updatedAt: null,
        deletedAt: null,
      };

      const productCatalogueRef = await db.collection("product_catalogues").add(productCatalogueData);
      return productCatalogueRef.id;
    } catch (error) {
      throw new Error(`Error saving productCatalogue: ${error.message}`);
    }
  }

  static async update(id, data) {
    try {
      const updateData = {
        ...data,
        updatedAt: new Date(),
      };

      await db.collection("product_catalogues").doc(id).update(updateData);
      return true;
    } catch (error) {
      throw new Error(`Error updating productCatalogue: ${error.message}`);
    }
  }

  static async delete(id) {
    try {
      const children = await this.getChildren(id);
      if (children.length > 0) {
        throw new Error("Cannot delete catalogue with children. Please delete children first.");
      }

      await db.collection("product_catalogues").doc(id).delete();
      return true;
    } catch (error) {
      throw new Error(`Error deleting productCatalogue: ${error.message}`);
    }
  }

  static async getAll() {
    try {
      const snapshot = await db.collection("product_catalogues").get();
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      throw new Error(`Error fetching productCatalogues: ${error.message}`);
    }
  }
}

module.exports = ProductCatalogue; 