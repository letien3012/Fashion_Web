const mongoose = require("mongoose");
const ImageModel = require("./image.model");

const replySchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee",
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const reviewSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Customer",
    required: true,
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order",
    required: true,
  },
  star: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  content: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    default: null,
  },
  reply: [replySchema],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
  },
  deletedAt: {
    type: Date,
  },
});

// Pre-save middleware to handle image
reviewSchema.pre("save", async function (next) {
  try {
    console.log("Pre-save middleware - Processing review:", this._id);

    // Handle image
    if (
      this.isModified("image") &&
      this.image &&
      this.image.startsWith("data:image")
    ) {
      console.log("Processing review image");
      const imagePath = await ImageModel.saveImage(this.image, "review");
      this.image = imagePath;
    }

    next();
  } catch (error) {
    console.error("Pre-save middleware error:", error);
    next(error);
  }
});

// Pre-remove middleware to handle image deletion
reviewSchema.pre("remove", async function (next) {
  try {
    // Delete image
    if (this.image) {
      await ImageModel.deleteImage(this.image);
    }
    next();
  } catch (error) {
    next(error);
  }
});

const Review = mongoose.model("Review", reviewSchema);

// Static methods
Review.getAll = async function () {
  try {
    return await this.find({ deletedAt: null })
      .populate("customerId", "name email")
      .populate("productId", "name image")
      .populate("orderId", "code")
      .populate("reply.employeeId", "name");
  } catch (error) {
    throw new Error(`Error fetching reviews: ${error.message}`);
  }
};

Review.getById = async function (id) {
  try {
    const review = await this.findById(id)
      .populate("customerId", "name email")
      .populate("productId", "name image")
      .populate("orderId", "code")
      .populate("reply.employeeId", "name");

    if (!review) {
      throw new Error("Review not found");
    }
    return review;
  } catch (error) {
    throw new Error(`Error getting review by ID: ${error.message}`);
  }
};

Review.getByProductId = async function (productId) {
  try {
    return await this.find({
      productId,
      deletedAt: null,
    })
      .populate("customerId", "name email")
      .populate("reply.employeeId", "name")
      .sort({ createdAt: -1 });
  } catch (error) {
    throw new Error(`Error getting reviews by product: ${error.message}`);
  }
};

Review.getByCustomerId = async function (customerId) {
  try {
    return await this.find({
      customerId,
      deletedAt: null,
    })
      .populate("productId", "name image")
      .populate("reply.employeeId", "name")
      .sort({ createdAt: -1 });
  } catch (error) {
    throw new Error(`Error getting reviews by customer: ${error.message}`);
  }
};

Review.update = async function (id, data) {
  try {
    const review = await this.findById(id);
    if (!review) {
      throw new Error("Review not found");
    }

    // Update fields
    Object.keys(data).forEach((key) => {
      if (key !== "_id" && key !== "createdAt" && key !== "reply") {
        review[key] = data[key];
      }
    });

    review.updatedAt = new Date();
    return await review.save();
  } catch (error) {
    throw new Error(`Error updating review: ${error.message}`);
  }
};

Review.addReply = async function (id, reply) {
  try {
    const review = await this.findById(id);
    if (!review) {
      throw new Error("Review not found");
    }

    review.reply.push(reply);
    review.updatedAt = new Date();
    return await review.save();
  } catch (error) {
    throw new Error(`Error adding reply: ${error.message}`);
  }
};

Review.delete = async function (id) {
  try {
    const review = await this.findById(id);
    if (!review) {
      throw new Error("Review not found");
    }

    review.deletedAt = new Date();
    return await review.save();
  } catch (error) {
    throw new Error(`Error deleting review: ${error.message}`);
  }
};

module.exports = Review;
