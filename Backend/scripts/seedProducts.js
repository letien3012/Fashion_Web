const mongoose = require("mongoose");
const Product = require("../models/product.model");
const ProductCatalogue = require("../models/productCatalogue.model");
const Attribute = require("../models/attribute.model");
const AttributeCatalogue = require("../models/attributeCatalogue.model");

// MongoDB connection
const connectDB = async () => {
  try {
    await mongoose.connect("mongodb://localhost:27017/fashion_web", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

// Sample data
const sampleProducts = [
  {
    code: "TS001",
    name: "Áo thun nam basic cotton",
    content: "Áo thun nam chất liệu cotton 100% mềm mại, thoáng mát",
    description:
      "Áo thun nam basic với thiết kế đơn giản, phù hợp mọi lứa tuổi. Chất liệu cotton 100% tự nhiên, thấm hút mồ hôi tốt, không gây kích ứng da.",
    catalogueId: null, // Will be set after creating catalogue
    variants: [
      {
        sku: "TS001-S-M",
        price: 150000,
        image:
          "https://via.placeholder.com/300x400/FF6B6B/FFFFFF?text=TS001-S-M",
        attributeId1: null, // Size
        attributeId2: null, // Color
        publish: true,
      },
      {
        sku: "TS001-M-M",
        price: 150000,
        image:
          "https://via.placeholder.com/300x400/FF6B6B/FFFFFF?text=TS001-M-M",
        attributeId1: null,
        attributeId2: null,
        publish: true,
      },
      {
        sku: "TS001-L-M",
        price: 150000,
        image:
          "https://via.placeholder.com/300x400/FF6B6B/FFFFFF?text=TS001-L-M",
        attributeId1: null,
        attributeId2: null,
        publish: true,
      },
    ],
    publish: true,
  },
  {
    code: "TS002",
    name: "Áo thun nữ crop top",
    content: "Áo thun nữ crop top thời trang, phong cách trẻ trung",
    description:
      "Áo thun nữ crop top với thiết kế hiện đại, phù hợp với xu hướng thời trang hiện nay. Chất liệu cotton blend co giãn tốt, tạo cảm giác thoải mái khi mặc.",
    catalogueId: null,
    variants: [
      {
        sku: "TS002-S-P",
        price: 180000,
        image:
          "https://via.placeholder.com/300x400/FF8E8E/FFFFFF?text=TS002-S-P",
        attributeId1: null,
        attributeId2: null,
        publish: true,
      },
      {
        sku: "TS002-M-P",
        price: 180000,
        image:
          "https://via.placeholder.com/300x400/FF8E8E/FFFFFF?text=TS002-M-P",
        attributeId1: null,
        attributeId2: null,
        publish: true,
      },
    ],
    publish: true,
  },
  {
    code: "QN001",
    name: "Quần jean nam slim fit",
    content: "Quần jean nam slim fit phong cách Hàn Quốc",
    description:
      "Quần jean nam slim fit với thiết kế ôm dáng, tôn vóc dáng nam giới. Chất liệu denim cao cấp, độ bền màu tốt, không bị phai màu sau nhiều lần giặt.",
    catalogueId: null,
    variants: [
      {
        sku: "QN001-30-B",
        price: 450000,
        image:
          "https://via.placeholder.com/300x400/4ECDC4/FFFFFF?text=QN001-30-B",
        attributeId1: null,
        attributeId2: null,
        publish: true,
      },
      {
        sku: "QN001-32-B",
        price: 450000,
        image:
          "https://via.placeholder.com/300x400/4ECDC4/FFFFFF?text=QN001-32-B",
        attributeId1: null,
        attributeId2: null,
        publish: true,
      },
      {
        sku: "QN001-34-B",
        price: 450000,
        image:
          "https://via.placeholder.com/300x400/4ECDC4/FFFFFF?text=QN001-34-B",
        attributeId1: null,
        attributeId2: null,
        publish: true,
      },
    ],
    publish: true,
  },
  {
    code: "QN002",
    name: "Quần jean nữ mom fit",
    content: "Quần jean nữ mom fit thời trang, tôn dáng",
    description:
      "Quần jean nữ mom fit với thiết kế thắt lưng cao, ống rộng thoải mái. Phù hợp với mọi dáng người, tạo cảm giác tự tin và thoải mái khi mặc.",
    catalogueId: null,
    variants: [
      {
        sku: "QN002-26-B",
        price: 380000,
        image:
          "https://via.placeholder.com/300x400/45B7D1/FFFFFF?text=QN002-26-B",
        attributeId1: null,
        attributeId2: null,
        publish: true,
      },
      {
        sku: "QN002-28-B",
        price: 380000,
        image:
          "https://via.placeholder.com/300x400/45B7D1/FFFFFF?text=QN002-28-B",
        attributeId1: null,
        attributeId2: null,
        publish: true,
      },
    ],
    publish: true,
  },
  {
    code: "SK001",
    name: "Váy đầm nữ dự tiệc",
    content: "Váy đầm nữ dự tiệc sang trọng, quyến rũ",
    description:
      "Váy đầm nữ dự tiệc với thiết kế sang trọng, phù hợp cho các buổi tiệc quan trọng. Chất liệu vải cao cấp, đường may tinh tế, tôn vẻ đẹp người mặc.",
    catalogueId: null,
    variants: [
      {
        sku: "SK001-S-B",
        price: 850000,
        image:
          "https://via.placeholder.com/300x400/96CEB4/FFFFFF?text=SK001-S-B",
        attributeId1: null,
        attributeId2: null,
        publish: true,
      },
      {
        sku: "SK001-M-B",
        price: 850000,
        image:
          "https://via.placeholder.com/300x400/96CEB4/FFFFFF?text=SK001-M-B",
        attributeId1: null,
        attributeId2: null,
        publish: true,
      },
    ],
    publish: true,
  },
  {
    code: "JK001",
    name: "Áo khoác denim nam",
    content: "Áo khoác denim nam phong cách streetwear",
    description:
      "Áo khoác denim nam với thiết kế phong cách streetwear hiện đại. Chất liệu denim bền bỉ, phù hợp mặc trong nhiều dịp khác nhau.",
    catalogueId: null,
    variants: [
      {
        sku: "JK001-M-B",
        price: 650000,
        image:
          "https://via.placeholder.com/300x400/FFEAA7/000000?text=JK001-M-B",
        attributeId1: null,
        attributeId2: null,
        publish: true,
      },
      {
        sku: "JK001-L-B",
        price: 650000,
        image:
          "https://via.placeholder.com/300x400/FFEAA7/000000?text=JK001-L-B",
        attributeId1: null,
        attributeId2: null,
        publish: true,
      },
    ],
    publish: true,
  },
  {
    code: "JK002",
    name: "Áo khoác bomber nữ",
    content: "Áo khoác bomber nữ thời trang, năng động",
    description:
      "Áo khoác bomber nữ với thiết kế năng động, phù hợp với phong cách streetwear. Chất liệu nhẹ, ấm áp, phù hợp mặc trong mùa thu đông.",
    catalogueId: null,
    variants: [
      {
        sku: "JK002-S-B",
        price: 520000,
        image:
          "https://via.placeholder.com/300x400/DDA0DD/FFFFFF?text=JK002-S-B",
        attributeId1: null,
        attributeId2: null,
        publish: true,
      },
      {
        sku: "JK002-M-B",
        price: 520000,
        image:
          "https://via.placeholder.com/300x400/DDA0DD/FFFFFF?text=JK002-M-B",
        attributeId1: null,
        attributeId2: null,
        publish: true,
      },
    ],
    publish: true,
  },
  {
    code: "AC001",
    name: "Phụ kiện mũ bucket",
    content: "Mũ bucket thời trang, phong cách Hàn Quốc",
    description:
      "Mũ bucket với thiết kế thời trang, phù hợp với nhiều phong cách khác nhau. Chất liệu cotton thoáng mát, có thể điều chỉnh kích thước.",
    catalogueId: null,
    variants: [
      {
        sku: "AC001-ONE-B",
        price: 120000,
        image:
          "https://via.placeholder.com/300x400/98D8C8/FFFFFF?text=AC001-ONE-B",
        attributeId1: null,
        attributeId2: null,
        publish: true,
      },
    ],
    publish: true,
  },
  {
    code: "AC002",
    name: "Túi xách nữ crossbody",
    content: "Túi xách nữ crossbody thời trang, tiện lợi",
    description:
      "Túi xách nữ crossbody với thiết kế nhỏ gọn, tiện lợi. Chất liệu da tổng hợp bền bỉ, có nhiều ngăn để sắp xếp đồ dùng.",
    catalogueId: null,
    variants: [
      {
        sku: "AC002-ONE-B",
        price: 280000,
        image:
          "https://via.placeholder.com/300x400/F7DC6F/000000?text=AC002-ONE-B",
        attributeId1: null,
        attributeId2: null,
        publish: true,
      },
    ],
    publish: true,
  },
  {
    code: "SH001",
    name: "Giày sneaker nam",
    content: "Giày sneaker nam thể thao, thoải mái",
    description:
      "Giày sneaker nam với thiết kế thể thao, phù hợp cho các hoạt động hàng ngày. Đế cao su bền bỉ, lót trong êm ái.",
    catalogueId: null,
    variants: [
      {
        sku: "SH001-40-W",
        price: 750000,
        image:
          "https://via.placeholder.com/300x400/BB8FCE/FFFFFF?text=SH001-40-W",
        attributeId1: null,
        attributeId2: null,
        publish: true,
      },
      {
        sku: "SH001-41-W",
        price: 750000,
        image:
          "https://via.placeholder.com/300x400/BB8FCE/FFFFFF?text=SH001-41-W",
        attributeId1: null,
        attributeId2: null,
        publish: true,
      },
      {
        sku: "SH001-42-W",
        price: 750000,
        image:
          "https://via.placeholder.com/300x400/BB8FCE/FFFFFF?text=SH001-42-W",
        attributeId1: null,
        attributeId2: null,
        publish: true,
      },
    ],
    publish: true,
  },
];

// Create catalogues
const createCatalogues = async () => {
  const catalogues = [
    { name: "Áo thun", description: "Các loại áo thun nam nữ" },
    { name: "Quần jean", description: "Quần jean nam nữ các loại" },
    { name: "Váy đầm", description: "Váy đầm nữ thời trang" },
    { name: "Áo khoác", description: "Áo khoác nam nữ các loại" },
    { name: "Phụ kiện", description: "Phụ kiện thời trang" },
    { name: "Giày dép", description: "Giày dép nam nữ" },
  ];

  const createdCatalogues = [];
  for (const catalogue of catalogues) {
    const existingCatalogue = await ProductCatalogue.findOne({
      name: catalogue.name,
    });
    if (!existingCatalogue) {
      const newCatalogue = new ProductCatalogue(catalogue);
      await newCatalogue.save();
      createdCatalogues.push(newCatalogue);
      console.log(`Created catalogue: ${catalogue.name}`);
    } else {
      createdCatalogues.push(existingCatalogue);
      console.log(`Catalogue already exists: ${catalogue.name}`);
    }
  }
  return createdCatalogues;
};

// Create attribute catalogues and attributes
const createAttributes = async () => {
  // Create attribute catalogues
  const attributeCatalogues = [{ name: "Kích thước" }, { name: "Màu sắc" }];

  const createdAttributeCatalogues = [];
  for (const attrCatalogue of attributeCatalogues) {
    const existingAttrCatalogue = await AttributeCatalogue.findOne({
      name: attrCatalogue.name,
    });
    if (!existingAttrCatalogue) {
      const newAttrCatalogue = new AttributeCatalogue(attrCatalogue);
      await newAttrCatalogue.save();
      createdAttributeCatalogues.push(newAttrCatalogue);
      console.log(`Created attribute catalogue: ${attrCatalogue.name}`);
    } else {
      createdAttributeCatalogues.push(existingAttrCatalogue);
      console.log(`Attribute catalogue already exists: ${attrCatalogue.name}`);
    }
  }

  // Create attributes
  const sizeCatalogue = createdAttributeCatalogues.find(
    (ac) => ac.name === "Kích thước"
  );
  const colorCatalogue = createdAttributeCatalogues.find(
    (ac) => ac.name === "Màu sắc"
  );

  const sizes = [
    "S",
    "M",
    "L",
    "XL",
    "26",
    "28",
    "30",
    "32",
    "34",
    "40",
    "41",
    "42",
    "ONE",
  ];
  const colors = [
    "Trắng",
    "Đen",
    "Xanh dương",
    "Hồng",
    "Đỏ",
    "Vàng",
    "Xanh lá",
  ];

  const createdAttributes = [];

  // Create size attributes
  for (const size of sizes) {
    const existingSize = await Attribute.findOne({
      name: size,
      attributeCatalogueId: sizeCatalogue._id,
    });
    if (!existingSize) {
      const newSize = new Attribute({
        name: size,
        attributeCatalogueId: sizeCatalogue._id,
      });
      await newSize.save();
      createdAttributes.push(newSize);
      console.log(`Created size attribute: ${size}`);
    } else {
      createdAttributes.push(existingSize);
    }
  }

  // Create color attributes
  for (const color of colors) {
    const existingColor = await Attribute.findOne({
      name: color,
      attributeCatalogueId: colorCatalogue._id,
    });
    if (!existingColor) {
      const newColor = new Attribute({
        name: color,
        attributeCatalogueId: colorCatalogue._id,
      });
      await newColor.save();
      createdAttributes.push(newColor);
      console.log(`Created color attribute: ${color}`);
    } else {
      createdAttributes.push(existingColor);
    }
  }

  return { createdAttributeCatalogues, createdAttributes };
};

// Assign catalogues and attributes to products
const assignProductData = async (
  products,
  productCatalogues,
  attributeCatalogues,
  attributes
) => {
  const sizeCatalogue = attributeCatalogues.find(
    (ac) => ac.name === "Kích thước"
  );
  const colorCatalogue = attributeCatalogues.find(
    (ac) => ac.name === "Màu sắc"
  );

  if (!sizeCatalogue || !colorCatalogue) {
    throw new Error("Required attribute catalogues not found");
  }

  const sizeAttributes = attributes.filter(
    (attr) =>
      attr.attributeCatalogueId.toString() === sizeCatalogue._id.toString()
  );
  const colorAttributes = attributes.filter(
    (attr) =>
      attr.attributeCatalogueId.toString() === colorCatalogue._id.toString()
  );

  // Assign catalogues to products
  const aoThunCatalogue = productCatalogues.find((c) => c.name === "Áo thun");
  const quanJeanCatalogue = productCatalogues.find(
    (c) => c.name === "Quần jean"
  );
  const vayDamCatalogue = productCatalogues.find((c) => c.name === "Váy đầm");
  const aoKhoacCatalogue = productCatalogues.find((c) => c.name === "Áo khoác");
  const phuKienCatalogue = productCatalogues.find((c) => c.name === "Phụ kiện");
  const giayDepCatalogue = productCatalogues.find((c) => c.name === "Giày dép");

  if (
    !aoThunCatalogue ||
    !quanJeanCatalogue ||
    !vayDamCatalogue ||
    !aoKhoacCatalogue ||
    !phuKienCatalogue ||
    !giayDepCatalogue
  ) {
    throw new Error("Required product catalogues not found");
  }

  products[0].catalogueId = aoThunCatalogue._id;
  products[1].catalogueId = aoThunCatalogue._id;
  products[2].catalogueId = quanJeanCatalogue._id;
  products[3].catalogueId = quanJeanCatalogue._id;
  products[4].catalogueId = vayDamCatalogue._id;
  products[5].catalogueId = aoKhoacCatalogue._id;
  products[6].catalogueId = aoKhoacCatalogue._id;
  products[7].catalogueId = phuKienCatalogue._id;
  products[8].catalogueId = phuKienCatalogue._id;
  products[9].catalogueId = giayDepCatalogue._id;

  // Assign attributes to variants
  for (const product of products) {
    for (const variant of product.variants) {
      const skuParts = variant.sku.split("-");
      const sizeCode = skuParts[1];
      const colorCode = skuParts[2];

      // Find size attribute
      const sizeAttr = sizeAttributes.find((attr) => attr.name === sizeCode);
      if (sizeAttr) {
        variant.attributeId1 = sizeAttr._id;
      }

      // Find color attribute
      let colorName = "";
      switch (colorCode) {
        case "M":
          colorName = "Đen";
          break;
        case "P":
          colorName = "Hồng";
          break;
        case "B":
          colorName = "Xanh dương";
          break;
        case "W":
          colorName = "Trắng";
          break;
        default:
          colorName = "Đen";
      }
      const colorAttr = colorAttributes.find((attr) => attr.name === colorName);
      if (colorAttr) {
        variant.attributeId2 = colorAttr._id;
      }
    }
  }

  return products;
};

// Main seeding function
const seedProducts = async () => {
  try {
    await connectDB();

    console.log("Starting product seeding...");

    // Create catalogues
    const catalogues = await createCatalogues();
    console.log(`Created/found ${catalogues.length} catalogues`);

    // Create attributes
    const { createdAttributeCatalogues, createdAttributes } =
      await createAttributes();
    console.log(
      `Created/found ${createdAttributeCatalogues.length} attribute catalogues`
    );
    console.log(`Created/found ${createdAttributes.length} attributes`);

    // Assign data to products
    const productsWithData = await assignProductData(
      sampleProducts,
      catalogues,
      createdAttributeCatalogues,
      createdAttributes
    );

    // Create products
    let createdCount = 0;
    for (const productData of productsWithData) {
      const existingProduct = await Product.findOne({ code: productData.code });
      if (!existingProduct) {
        const product = new Product(productData);
        await product.save();
        createdCount++;
        console.log(
          `Created product: ${productData.name} (${productData.code})`
        );
      } else {
        console.log(
          `Product already exists: ${productData.name} (${productData.code})`
        );
      }
    }

    console.log(`\nSeeding completed! Created ${createdCount} new products.`);
    console.log("Total products in database:", await Product.countDocuments());
  } catch (error) {
    console.error("Seeding error:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Database disconnected");
  }
};

// Run the seeding
if (require.main === module) {
  seedProducts();
}

module.exports = { seedProducts };
