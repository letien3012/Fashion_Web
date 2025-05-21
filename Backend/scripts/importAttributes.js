const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const AttributeCatalogue = require("../models/attributeCatalogue.model");
const Attribute = require("../models/attribute.model");

// Connect to MongoDB
mongoose
  .connect("mongodb://localhost:27017/fashion_web", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });

async function importAttributeCatalogues() {
  try {
    // Read attribute catalogues from JSON file
    const cataloguesData = JSON.parse(
      fs.readFileSync(
        path.join(__dirname, "../data/attributeCatalogue.json"),
        "utf8"
      )
    );

    // Import each catalogue
    const catalogueMap = new Map();
    for (const catalogueData of cataloguesData) {
      const catalogue = await AttributeCatalogue.create(catalogueData);
      catalogueMap.set(catalogue.name, catalogue._id);
      console.log(`Created catalogue: ${catalogue.name}`);
    }

    return catalogueMap;
  } catch (error) {
    console.error("Error importing attribute catalogues:", error);
    throw error;
  }
}

async function importAttributes(catalogueMap) {
  try {
    // Read attributes from JSON file
    const attributesData = JSON.parse(
      fs.readFileSync(path.join(__dirname, "../data/attributes.json"), "utf8")
    );

    // Replace placeholder IDs with actual catalogue IDs
    const attributes = attributesData.map((attr) => ({
      ...attr,
      attributeCatalogueId: attr.name.match(/^(S|M|L|XL|XXL)$/)
        ? catalogueMap.get("Size")
        : catalogueMap.get("Color"),
    }));

    // Import each attribute
    for (const attributeData of attributes) {
      const attribute = await Attribute.create(attributeData);
      console.log(`Created attribute: ${attribute.name}`);
    }
  } catch (error) {
    console.error("Error importing attributes:", error);
    throw error;
  }
}

async function main() {
  try {
    // Clear existing data
    await AttributeCatalogue.deleteMany({});
    await Attribute.deleteMany({});
    console.log("Cleared existing attribute data");

    // Import data
    const catalogueMap = await importAttributeCatalogues();
    await importAttributes(catalogueMap);

    console.log("Import completed successfully");
    process.exit(0);
  } catch (error) {
    console.error("Import failed:", error);
    process.exit(1);
  }
}

main();
