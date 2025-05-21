const Consignment = require('../models/consignment.model');

// Add new consignment
exports.addConsignment = async (req, res) => {
  try {
    const { code, price, quantity, current_quantity, publish } = req.body;

    // Validate required fields
    if (!code || !price || !quantity || !current_quantity) {
      return res.status(400).json({
        message: "Missing required fields",
        required: {
          code: "Consignment code is required",
          price: "Price is required",
          quantity: "Quantity is required",
          current_quantity: "Current quantity is required"
        }
      });
    }

    // Validate numeric fields
    if (price < 0 || quantity < 0 || current_quantity < 0) {
      return res.status(400).json({
        message: "Invalid numeric values",
        required: {
          price: "Price must be a non-negative number",
          quantity: "Quantity must be a non-negative number",
          current_quantity: "Current quantity must be a non-negative number"
        }
      });
    }

    // Validate current_quantity cannot exceed quantity
    if (current_quantity > quantity) {
      return res.status(400).json({
        message: "Current quantity cannot exceed total quantity"
      });
    }

    const consignment = new Consignment({
      code,
      price,
      quantity,
      current_quantity,
      publish: publish || false
    });

    await consignment.save();
    res.status(201).json({
      message: "Consignment added successfully",
      data: consignment
    });
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({
        message: "Consignment code already exists"
      });
    } else {
      res.status(500).json({
        message: "Error adding consignment",
        error: error.message
      });
    }
  }
};

// Update consignment current quantity
exports.updateCurrentQuantity = async (req, res) => {
  try {
    const { id } = req.params;
    const { current_quantity } = req.body;

    if (!current_quantity || current_quantity < 0) {
      return res.status(400).json({
        message: "Invalid current quantity",
        required: {
          current_quantity: "Current quantity must be a non-negative number"
        }
      });
    }

    const consignment = await Consignment.findById(id);
    if (!consignment) {
      return res.status(404).json({
        message: "Consignment not found"
      });
    }

    // Validate current_quantity cannot exceed total quantity
    if (current_quantity > consignment.quantity) {
      return res.status(400).json({
        message: "Current quantity cannot exceed total quantity"
      });
    }

    consignment.current_quantity = current_quantity;
    await consignment.save();

    res.status(200).json({
      message: "Consignment current quantity updated successfully",
      data: consignment
    });
  } catch (error) {
    res.status(500).json({
      message: "Error updating consignment current quantity",
      error: error.message
    });
  }
};

// Get all consignments
exports.getAllConsignments = async (req, res) => {
  try {
    const consignments = await Consignment.find();
    res.status(200).json({
      data: consignments
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching consignments",
      error: error.message
    });
  }
};

// Get consignment by ID
exports.getConsignmentById = async (req, res) => {
  try {
    const { id } = req.params;
    const consignment = await Consignment.findById(id);
    
    if (!consignment) {
      return res.status(404).json({
        message: "Consignment not found"
      });
    }

    res.status(200).json({
      data: consignment
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching consignment",
      error: error.message
    });
  }
};
