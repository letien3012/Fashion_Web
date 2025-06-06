const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema({
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
  image: {
    type: String,
    default: null,
  },
  status: {
    type: String,
    enum: ["active", "inactive"],
    default: "active",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: null,
  },
  deletedAt: {
    type: Date,
    default: null,
  },
  providers: [{ type: String }],
});

// Static method to get all active customers
customerSchema.statics.getAllActive = function () {
  return this.find({ deletedAt: null });
};

// Static method to find active customer by ID
customerSchema.statics.findActiveById = function (id) {
  return this.findOne({ _id: id, deletedAt: null });
};

// Static method to soft delete customer
customerSchema.statics.softDelete = async function (id) {
  const customer = await this.findById(id);
  if (!customer) {
    throw new Error("Customer not found");
  }
  if (customer.deletedAt) {
    throw new Error("Customer has already been deleted");
  }

  customer.deletedAt = new Date();
  customer.status = "inactive";
  customer.updatedAt = new Date();
  await customer.save();
  return customer;
};

const Customer = mongoose.model("Customer", customerSchema);

module.exports = Customer;
