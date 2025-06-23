const jwt = require("jsonwebtoken");
const Employee = require("../models/employee.model");

const adminAuth = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res
        .status(401)
        .json({ message: "No authentication token, access denied" });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if user is admin/employee
    const employee = await Employee.findById(decoded.id);
    if (!employee) {
      return res.status(401).json({ message: "Admin access required" });
    }

    // Add admin info to request
    req.admin = {
      id: decoded.id,
      email: decoded.email,
      role: employee.role,
    };

    next();
  } catch (error) {
    res.status(401).json({ message: "Token is not valid" });
  }
};

module.exports = adminAuth;
