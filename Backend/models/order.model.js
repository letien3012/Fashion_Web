const { db } = require("../firebase/firebase-admin");

class Order {
  constructor(data) {
    this.userId = data.userId;
    this.items = data.items || [];
    this.totalAmount = data.totalAmount;
    this.status = data.status || "pending";
    this.shippingAddress = data.shippingAddress;
    this.paymentMethod = data.paymentMethod;
    this.paymentStatus = data.paymentStatus || "pending";
  }

  static async getAll() {
    try {
      const snapshot = await db
        .collection("orders")
        .orderBy("createdAt", "desc")
        .get();

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
      const doc = await db.collection("orders").doc(id).get();
      if (!doc.exists) {
        throw new Error("Order not found");
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
      const orderData = {
        userId: this.userId,
        items: this.items,
        totalAmount: this.totalAmount,
        status: this.status,
        shippingAddress: this.shippingAddress,
        paymentMethod: this.paymentMethod,
        paymentStatus: this.paymentStatus,
        createdAt: new Date(),
        history: [
          {
            status: this.status,
            timestamp: new Date(),
            note: "Order created",
          },
        ],
      };

      const docRef = await db.collection("orders").add(orderData);
      return docRef.id;
    } catch (error) {
      throw error;
    }
  }

  static async updateStatus(id, status, note) {
    try {
      const orderRef = db.collection("orders").doc(id);
      const order = await orderRef.get();

      if (!order.exists) {
        throw new Error("Order not found");
      }

      const history = order.data().history || [];
      history.push({
        status,
        timestamp: new Date(),
        note,
      });

      await orderRef.update({
        status,
        history,
        updatedAt: new Date(),
      });

      return true;
    } catch (error) {
      throw error;
    }
  }

  static async addItem(id, item) {
    try {
      const orderRef = db.collection("orders").doc(id);
      const order = await orderRef.get();

      if (!order.exists) {
        throw new Error("Order not found");
      }

      const items = order.data().items || [];
      items.push({
        ...item,
        addedAt: new Date(),
      });

      await orderRef.update({
        items,
        updatedAt: new Date(),
      });

      return true;
    } catch (error) {
      throw error;
    }
  }

  static async updateItem(id, itemId, quantity) {
    try {
      const orderRef = db.collection("orders").doc(id);
      const order = await orderRef.get();

      if (!order.exists) {
        throw new Error("Order not found");
      }

      const items = order.data().items;
      const itemIndex = items.findIndex((item) => item.id === itemId);

      if (itemIndex === -1) {
        throw new Error("Item not found in order");
      }

      items[itemIndex].quantity = quantity;
      items[itemIndex].updatedAt = new Date();

      await orderRef.update({
        items,
        updatedAt: new Date(),
      });

      return true;
    } catch (error) {
      throw error;
    }
  }

  static async removeItem(id, itemId) {
    try {
      const orderRef = db.collection("orders").doc(id);
      const order = await orderRef.get();

      if (!order.exists) {
        throw new Error("Order not found");
      }

      const items = order.data().items;
      const updatedItems = items.filter((item) => item.id !== itemId);

      await orderRef.update({
        items: updatedItems,
        updatedAt: new Date(),
      });

      return true;
    } catch (error) {
      throw error;
    }
  }

  static async getHistory(id) {
    try {
      const doc = await db.collection("orders").doc(id).get();
      if (!doc.exists) {
        throw new Error("Order not found");
      }
      return doc.data().history || [];
    } catch (error) {
      throw error;
    }
  }

  static async updatePaymentStatus(id, status) {
    try {
      await db.collection("orders").doc(id).update({
        paymentStatus: status,
        updatedAt: new Date(),
      });
      return true;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Order;
