const mongoose = require("mongoose");
const ImageModel = require("./image.model");

const bannerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  content: { type: String, default: "" },
  image: { type: String, default: null },
  type: { type: String, required: true }, // Có thể là: main, sub, promotion, etc.
  publish: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date },
  deletedAt: { type: Date },
});

// Pre-save middleware to handle image
bannerSchema.pre("save", async function (next) {
  try {
    console.log("Pre-save middleware - Processing banner:", this._id);

    // Handle main image
    if (
      this.isModified("image") &&
      this.image &&
      this.image.startsWith("data:image")
    ) {
      console.log("Processing banner image");
      const imagePath = await ImageModel.saveImage(this.image, "banner");
      this.image = imagePath;
    }

    next();
  } catch (error) {
    console.error("Pre-save middleware error:", error);
    next(error);
  }
});

// Pre-remove middleware to handle image deletion
bannerSchema.pre("remove", async function (next) {
  try {
    // Delete main image
    if (this.image) {
      await ImageModel.deleteImage(this.image);
    }
    next();
  } catch (error) {
    next(error);
  }
});

const Banner = mongoose.model("Banner", bannerSchema);

// Static methods
Banner.getAll = async function () {
  try {
    return await this.find({ deletedAt: null });
  } catch (error) {
    throw new Error(`Error fetching banners: ${error.message}`);
  }
};

Banner.getById = async function (id) {
  try {
    const banner = await this.findById(id);
    if (!banner) {
      throw new Error("Banner not found");
    }
    return banner;
  } catch (error) {
    throw new Error(`Error getting banner by ID: ${error.message}`);
  }
};

Banner.update = async function (id, data) {
  try {
    const banner = await this.findById(id);
    if (!banner) {
      throw new Error("Banner not found");
    }

    // Update fields
    Object.keys(data).forEach((key) => {
      if (key !== "_id" && key !== "createdAt") {
        banner[key] = data[key];
      }
    });

    banner.updatedAt = new Date();
    return await banner.save();
  } catch (error) {
    throw new Error(`Error updating banner: ${error.message}`);
  }
};

Banner.delete = async function (id) {
  try {
    const banner = await this.findById(id);
    if (!banner) {
      throw new Error("Banner not found");
    }

    banner.deletedAt = new Date();
    return await banner.save();
  } catch (error) {
    throw new Error(`Error deleting banner: ${error.message}`);
  }
};

module.exports = Banner;
