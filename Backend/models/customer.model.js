const { db } = require("../firebase/firebase-admin");

class Customer {
  constructor(data) {
    this.email = data.email;
    this.password = data.password;
    this.fullname = data.fullname;
    this.address = data.address || "";
    this.image = data.image || null;
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || null;
    this.deletedAt = null;
  }

  static async getById(id) {
    try {
      const doc = await db.collection("customers").doc(id).get();
      if (!doc.exists) {
        throw new Error("Customer not found");
      }
      return { id: doc.id, ...doc.data() };
    } catch (error) {
      throw new Error(`Error getting customer by ID: ${error.message}`);
    }
  }

  static async getByEmail(email) {
    try {
      const snapshot = await db
        .collection("customers")
        .where("email", "==", email)
        .get();

      if (snapshot.empty) return null;

      const doc = snapshot.docs[0];
      return { id: doc.id, ...doc.data() };
    } catch (error) {
      throw new Error(`Error getting customer by email: ${error.message}`);
    }
  }

  async save() {
    try {
      const customerData = {
        email: this.email,
        fullname: this.fullname,
        address: this.address,
        image: this.image,
        createdAt: this.createdAt,
        updatedAt: null,
        deletedAt: null,
      };

      const customerRef = await db.collection("customers").add(customerData);
      return customerRef.id;
    } catch (error) {
      throw new Error(`Error saving customer: ${error.message}`);
    }
  }

  static async update(id, data) {
    try {
      const updateData = {
        ...data,
        updatedAt: new Date(),
      };

      await db.collection("customers").doc(id).update(updateData);
      return true;
    } catch (error) {
      throw new Error(`Error updating customer: ${error.message}`);
    }
  }

  static async delete(id) {
    try {
      await db.collection("customers").doc(id).delete();
      return true;
    } catch (error) {
      throw new Error(`Error deleting customer: ${error.message}`);
    }
  }

  static async getCustomerOrders(customerId) {
    try {
      const snapshot = await db
        .collection("orders")
        .where("customerId", "==", customerId)
        .orderBy("createdAt", "desc")
        .get();

      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      throw new Error(`Error fetching customer orders: ${error.message}`);
    }
  }

  static async getAll() {
    try {
      const snapshot = await db.collection("customers").get();
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      throw new Error(`Error fetching customers: ${error.message}`);
    }
  }
}

module.exports = Customer;
