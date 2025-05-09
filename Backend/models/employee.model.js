const { db } = require("../firebase/firebase-admin");

class Employee {
  constructor(data) {
    this.email = data.email;
    this.password = data.password; // You might want to hash the password before saving.
    this.fullname = data.fullname;
    this.address = data.address || "";
    this.role = data.role || "employee";
    this.image = data.image || null;
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || null;
    this.deletedAt = null;
  }

  static async getById(id) {
    try {
      const doc = await db.collection("employees").doc(id).get();
      if (!doc.exists) {
        throw new Error("Employee not found");
      }
      return { id: doc.id, ...doc.data() };
    } catch (error) {
      throw new Error(`Error getting employee by ID: ${error.message}`);
    }
  }

  static async getByEmail(email) {
    try {
      const snapshot = await db
        .collection("employees")
        .where("email", "==", email)
        .get();

      if (snapshot.empty) return null;

      const doc = snapshot.docs[0];
      return { id: doc.id, ...doc.data() };
    } catch (error) {
      throw new Error(`Error getting employee by email: ${error.message}`);
    }
  }

  async save() {
    try {
      const employeeData = {
        email: this.email,
        fullname: this.fullname,
        address: this.address,
        role: this.role,
        image: this.image,
        createdAt: this.createdAt,
        updatedAt: null,
        deletedAt: null,
      };

      // Directly store the employee in Firestore (no Firebase Auth)
      const employeeRef = await db.collection("employees").add(employeeData);
      return employeeRef.id;
    } catch (error) {
      throw new Error(`Error saving employee: ${error.message}`);
    }
  }

  static async update(id, data) {
    try {
      const updateData = {
        ...data,
        updatedAt: new Date(),
      };
      console.log("Update Data:", updateData);

      await db.collection("employees").doc(id).update(updateData);

      return true;
    } catch (error) {
      throw new Error(`Error updating employee: ${error.message}`);
    }
  }

  static async delete(id) {
    try {
      await db.collection("employees").doc(id).delete();
      return true;
    } catch (error) {
      throw new Error(`Error deleting employee: ${error.message}`);
    }
  }

  static async getEmployeeOrders(employeeId) {
    try {
      const snapshot = await db
        .collection("orders")
        .where("employeeId", "==", employeeId)
        .orderBy("createdAt", "desc")
        .get();

      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      throw new Error(`Error fetching employee orders: ${error.message}`);
    }
  }

  static async getAllEmployees() {
    try {
      const snapshot = await db.collection("employees").get();
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      throw new Error(`Error fetching employees: ${error.message}`);
    }
  }
}

module.exports = Employee;
