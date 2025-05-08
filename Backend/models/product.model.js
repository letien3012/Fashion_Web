const { db } = require("../firebase/firebase-admin");

class Product {
  constructor(data) {
    this.code = data.code;
    this.name = data.name;
    this.content = data.content || "";
    this.description = data.description || "";
    this.view_count = data.view_count || 0;
    this.favorite_count = data.favorite_count || 0;
    this.image = data.image || null;
    this.catalogueId = data.catalogueId;
    this.variants = data.variants || [];
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || null;
    this.deletedAt = data.deletedAt || null;
  }

  static validateVariant(variant) {
    if (!variant.sku) {
      throw new Error("Variant SKU is required");
    }
    if (typeof variant.price !== 'number' || variant.price < 0) {
      throw new Error("Variant price must be a positive number");
    }
    if (typeof variant.quantity_sold !== 'number' || variant.quantity_sold < 0) {
      throw new Error("Variant quantity_sold must be a positive number");
    }
    return true;
  }

  static async getById(id) {
    try {
      const doc = await db.collection("products").doc(id).get();
      if (!doc.exists) {
        throw new Error("Product not found");
      }
      return { id: doc.id, ...doc.data() };
    } catch (error) {
      throw new Error(`Error getting product by ID: ${error.message}`);
    }
  }

  static async getByCatalogueId(catalogueId) {
    try {
      const snapshot = await db
        .collection("products")
        .where("catalogueId", "==", catalogueId)
        .get();
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      throw new Error(`Error fetching products by catalogue: ${error.message}`);
    }
  }

  async save() {
    try {
      if (this.variants && this.variants.length > 0) {
        this.variants.forEach(variant => {
          Product.validateVariant(variant);
        });
      }

      const productData = {
        code: this.code,
        name: this.name,
        content: this.content,
        description: this.description,
        view_count: this.view_count,
        favorite_count: this.favorite_count,
        image: this.image,
        catalogueId: this.catalogueId,
        variants: this.variants,
        createdAt: this.createdAt,
        updatedAt: null,
        deletedAt: null,
      };

      const productRef = await db.collection("products").add(productData);
      return productRef.id;
    } catch (error) {
      throw new Error(`Error saving product: ${error.message}`);
    }
  }

  static async update(id, data) {
    try {
      if (data.variants && data.variants.length > 0) {
        data.variants.forEach(variant => {
          Product.validateVariant(variant);
        });
      }

      const updateData = {
        ...data,
        updatedAt: new Date(),
      };

      await db.collection("products").doc(id).update(updateData);
      return true;
    } catch (error) {
      throw new Error(`Error updating product: ${error.message}`);
    }
  }

  static async addVariant(productId, variant) {
    try {
      Product.validateVariant(variant);

      const product = await this.getById(productId);
      const variants = product.variants || [];
      variants.push(variant);

      await db.collection("products").doc(productId).update({
        variants: variants,
        updatedAt: new Date()
      });

      return true;
    } catch (error) {
      throw new Error(`Error adding variant: ${error.message}`);
    }
  }

  static async updateVariant(productId, variantIndex, variant) {
    try {
      Product.validateVariant(variant);

      const product = await this.getById(productId);
      const variants = product.variants || [];
      
      if (variantIndex >= variants.length) {
        throw new Error("Variant index out of bounds");
      }

      variants[variantIndex] = variant;

      await db.collection("products").doc(productId).update({
        variants: variants,
        updatedAt: new Date()
      });

      return true;
    } catch (error) {
      throw new Error(`Error updating variant: ${error.message}`);
    }
  }

  static async deleteVariant(productId, variantIndex) {
    try {
      const product = await this.getById(productId);
      const variants = product.variants || [];
      
      if (variantIndex >= variants.length) {
        throw new Error("Variant index out of bounds");
      }

      variants.splice(variantIndex, 1);

      await db.collection("products").doc(productId).update({
        variants: variants,
        updatedAt: new Date()
      });

      return true;
    } catch (error) {
      throw new Error(`Error deleting variant: ${error.message}`);
    }
  }

  static async delete(id) {
    try {
      await db.collection("products").doc(id).delete();
      return true;
    } catch (error) {
      throw new Error(`Error deleting product: ${error.message}`);
    }
  }

  static async getAll() {
    try {
      const snapshot = await db.collection("products").get();
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      throw new Error(`Error fetching products: ${error.message}`);
    }
  }

  static async incrementViewCount(id) {
    try {
      await db.collection("products").doc(id).update({
        view_count: db.FieldValue.increment(1),
        updatedAt: new Date()
      });
      return true;
    } catch (error) {
      throw new Error(`Error incrementing view count: ${error.message}`);
    }
  }

  static async incrementFavoriteCount(id) {
    try {
      await db.collection("products").doc(id).update({
        favorite_count: db.FieldValue.increment(1),
        updatedAt: new Date()
      });
      return true;
    } catch (error) {
      throw new Error(`Error incrementing favorite count: ${error.message}`);
    }
  }

  static async decrementFavoriteCount(id) {
    try {
      await db.collection("products").doc(id).update({
        favorite_count: db.FieldValue.increment(-1),
        updatedAt: new Date()
      });
      return true;
    } catch (error) {
      throw new Error(`Error decrementing favorite count: ${error.message}`);
    }
  }
}

module.exports = Product; 