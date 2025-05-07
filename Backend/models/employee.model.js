const { db, admin } = require("../firebase/firebase-admin");

class Employee {
  constructor(data) {
    this.email = data.email;
    this.password = data.password;
    this.fullName = data.fullName;
    this.phone = data.phone;
    this.address = data.address;
    this.role = data.role || "employee";
    this.position = data.position;
    this.department = data.department;
    this.employeeId = data.employeeId;
  }

  static async getById(id) {
    try {
      const doc = await db.collection("employees").doc(id).get();
      if (!doc.exists) {
        throw new Error("Employee not found");
      }
      return {
        id: doc.id,
        ...doc.data(),
      };
    } catch (error) {
      throw error;
    }
  }

  static async getByEmail(email) {
    try {
      const snapshot = await db
        .collection("employees")
        .where("email", "==", email)
        .get();

      if (snapshot.empty) {
        return null;
      }

      const doc = snapshot.docs[0];
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
      // Tạo employee trong Firebase Authentication
      const userRecord = await admin.auth().createUser({
        email: this.email,
        password: this.password,
        displayName: this.fullName,
      });

      // Lưu thông tin bổ sung vào Firestore
      const employeeData = {
        email: this.email,
        fullName: this.fullName,
        phone: this.phone,
        address: this.address,
        role: this.role,
        position: this.position,
        department: this.department,
        employeeId: this.employeeId,
        createdAt: new Date(),
      };

      await db.collection("employees").doc(userRecord.uid).set(employeeData);
      return userRecord.uid;
    } catch (error) {
      throw error;
    }
  }

  static async update(id, data) {
    try {
      // Cập nhật thông tin trong Firestore
      await db
        .collection("employees")
        .doc(id)
        .update({
          ...data,
          updatedAt: new Date(),
        });

      // Cập nhật thông tin trong Firebase Authentication nếu có thay đổi
      if (data.fullName) {
        await admin.auth().updateUser(id, {
          displayName: data.fullName,
        });
      }

      return true;
    } catch (error) {
      throw error;
    }
  }

  static async delete(id) {
    try {
      // Xóa employee khỏi Firebase Authentication
      await admin.auth().deleteUser(id);

      // Xóa thông tin employee khỏi Firestore
      await db.collection("employees").doc(id).delete();

      return true;
    } catch (error) {
      throw error;
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
      throw error;
    }
  }
}

module.exports = Employee;
