const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");

const employeeSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    fullname: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      default: "",
    },
    address: {
      type: String,
      default: "",
    },
    role: {
      type: String,
      enum: ["admin", "employee"],
      default: "employee",
    },
    image: {
      type: String,
      default: null,
    },
    publish: {
      type: Boolean,
      default: true,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Helper method to hash password
employeeSchema.statics.hashPassword = async function (password) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

// Helper method to compare password
employeeSchema.statics.comparePassword = async function (
  password,
  hashedPassword
) {
  return bcrypt.compare(password, hashedPassword);
};

// Helper method to save image
employeeSchema.statics.saveImage = async function (base64Image, employeeId) {
  try {
    // Create directory if it doesn't exist
    const uploadDir = path.join(__dirname, "../public/images/employee");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Remove data:image/jpeg;base64, from the string if present
    const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64Data, "base64");

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
};

// Helper method to delete image
employeeSchema.statics.deleteImage = async function (imagePath) {
  try {
    if (!imagePath) return;

    const fullPath = path.join(__dirname, "../public", imagePath);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
  } catch (error) {
    console.error(`Error deleting image: ${error.message}`);
  }
};

// Pre-save middleware to hash password
employeeSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await this.constructor.hashPassword(this.password);
  }
  next();
});

// Pre-save middleware to handle image
employeeSchema.pre("save", async function (next) {
  if (
    this.isModified("image") &&
    this.image &&
    this.image.startsWith("data:image")
  ) {
    const tempId = this._id || Date.now().toString();
    const imagePath = await this.constructor.saveImage(this.image, tempId);
    this.image = imagePath;
  }
  next();
});

// Static method to get employee by ID
employeeSchema.statics.getById = async function (id) {
  try {
    const employee = await this.findById(id).select("-password");
    if (!employee) {
      throw new Error("Employee not found");
    }
    return employee;
  } catch (error) {
    throw new Error(`Error getting employee by ID: ${error.message}`);
  }
};

// Static method to get employee by email
employeeSchema.statics.getByEmail = async function (email) {
  try {
    const employee = await this.findOne({ email });
    return employee;
  } catch (error) {
    throw new Error(`Error getting employee by email: ${error.message}`);
  }
};

// Static method to get employee orders
employeeSchema.statics.getEmployeeOrders = async function (employeeId) {
  try {
    const Order = mongoose.model("Order");
    return await Order.find({ employeeId })
      .populate("customerId", "email fullname")
      .sort({ createdAt: -1 });
  } catch (error) {
    throw new Error(`Error getting employee orders: ${error.message}`);
  }
};

// Static method to get all employees
employeeSchema.statics.getAllEmployees = function () {
  return this.find({ deletedAt: null }).select("-password");
};

// Static method to find non-deleted employee by ID
employeeSchema.statics.findActiveById = function (id) {
  return this.findOne({ _id: id, deletedAt: null });
};

const Employee = mongoose.model("Employee", employeeSchema);

module.exports = Employee;
