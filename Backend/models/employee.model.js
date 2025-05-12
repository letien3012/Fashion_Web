const { db } = require("../firebase/firebase-admin");
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

class Employee {
  constructor(data) {
    this.email = data.email;
    this.password = data.password;
    this.fullname = data.fullname;
    this.address = data.address || "";
    this.role = data.role || "employee";
    this.image = data.image || null;
    this.publish = data.publish || true;
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || null;
    this.deletedAt = data.deletedAt || null;
  }

  // Helper method to hash password
  static async hashPassword(password) {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }

  // Helper method to compare password
  static async comparePassword(password, hashedPassword) {
    return bcrypt.compare(password, hashedPassword);
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

  // Helper method to save image
  static async saveImage(base64Image, employeeId) {
    try {
      // Create directory if it doesn't exist
      const uploadDir = path.join(__dirname, '../public/images/employee');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      // Remove data:image/jpeg;base64, from the string if present
      const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');

      // Generate filename
      const filename = `${employeeId}_${Date.now()}.jpg`;
      const filepath = path.join(uploadDir, filename);

      // Save file
      fs.writeFileSync(filepath, buffer);

      // Return the relative path for storage in database
      return `/images/employee/${filename}`;
    } catch (error) {
      throw new Error(`Error saving image: ${error.message}`);
    }
  }

  // Helper method to delete image
  static async deleteImage(imagePath) {
    try {
      if (!imagePath) return;
      
      const fullPath = path.join(__dirname, '../public', imagePath);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
    } catch (error) {
      console.error(`Error deleting image: ${error.message}`);
    }
  }

  async save() {
    try {
      let imagePath = null;
      if (this.image && this.image.startsWith('data:image')) {
        const tempId = Date.now().toString();
        imagePath = await Employee.saveImage(this.image, tempId);
      }

      // Hash password before saving
      const hashedPassword = await Employee.hashPassword(this.password);

      const employeeData = {
        email: this.email,
        password: hashedPassword,
        fullname: this.fullname,
        address: this.address,
        role: this.role,
        image: imagePath,
        publish: this.publish,
        createdAt: this.createdAt,
        updatedAt: null,
        deletedAt: null,
      };

      const employeeRef = await db.collection("employees").add(employeeData);
      const employeeId = employeeRef.id;

      if (imagePath) {
        const oldPath = path.join(__dirname, '../public', imagePath);
        const newPath = path.join(__dirname, '../public/images/employee', `${employeeId}_${Date.now()}.jpg`);
        fs.renameSync(oldPath, newPath);
        imagePath = `/images/employee/${path.basename(newPath)}`;
        
        await db.collection("employees").doc(employeeId).update({ image: imagePath });
      }

      return employeeId;
    } catch (error) {
      throw new Error(`Error saving employee: ${error.message}`);
    }
  }

  static async update(id, data) {
    try {
      let imagePath = data.image;
      let updateData = { ...data };
      
      // Handle new image upload
      if (data.image && data.image.startsWith('data:image')) {
        const oldEmployee = await Employee.getById(id);
        if (oldEmployee.image) {
          await Employee.deleteImage(oldEmployee.image);
        }
        imagePath = await Employee.saveImage(data.image, id);
        updateData.image = imagePath;
      }

      // Hash password if it's being updated
      if (data.password) {
        updateData.password = await Employee.hashPassword(data.password);
      }

      updateData.updatedAt = new Date();
      await db.collection("employees").doc(id).update(updateData);
      return true;
    } catch (error) {
      throw new Error(`Error updating employee: ${error.message}`);
    }
  }

  static async delete(id) {
    try {
      const updateData = {
        deletedAt: new Date(),
        updatedAt: new Date()
      };
      await db.collection("employees").doc(id).update(updateData);
      return true;
    } catch (error) {
      throw new Error(`Error deleting employee: ${error.message}`);
    }
  }

  static async restore(id) {
    try {
      const updateData = {
        deletedAt: null,
        updatedAt: new Date()
      };
      await db.collection("employees").doc(id).update(updateData);
      return true;
    } catch (error) {
      throw new Error(`Error restoring employee: ${error.message}`);
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
      const snapshot = await db.collection("employees")
        .where("deletedAt", "==", null)
        .get();
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
