const fs = require("fs");
const path = require("path");

class ImageModel {
  static async saveImage(base64Image, folder = "product") {
    try {
      // Create directory if it doesn't exist
      const uploadDir = path.join(__dirname, `../public/images/${folder}`);
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      // Remove data:image/jpeg;base64, from the string if present
      const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, "");
      const buffer = Buffer.from(base64Data, "base64");

      // Generate filename
      const filename = `${Date.now()}_${Math.round(Math.random() * 1e9)}.jpg`;
      const filepath = path.join(uploadDir, filename);

      // Save file
      fs.writeFileSync(filepath, buffer);

      // Return the relative path for storage in database
      return `/images/${folder}/${filename}`;
    } catch (error) {
      throw new Error(`Error saving image: ${error.message}`);
    }
  }

  static async saveMultipleImages(base64Images, folder = "product") {
    try {
      const imagePaths = [];
      for (const base64Image of base64Images) {
        const path = await this.saveImage(base64Image, folder);
        imagePaths.push(path);
      }
      return imagePaths;
    } catch (error) {
      throw new Error(`Error saving multiple images: ${error.message}`);
    }
  }

  static async deleteImage(imagePath) {
    try {
      if (!imagePath) return;

      const fullPath = path.join(__dirname, "../public", imagePath);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
    } catch (error) {
      console.error(`Error deleting image: ${error.message}`);
    }
  }

  static async deleteMultipleImages(imagePaths) {
    try {
      for (const imagePath of imagePaths) {
        await this.deleteImage(imagePath);
      }
    } catch (error) {
      console.error(`Error deleting multiple images: ${error.message}`);
    }
  }
}

module.exports = ImageModel;
