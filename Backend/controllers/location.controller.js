const axios = require("axios");

const BASE_API_URL = "https://provinces.open-api.vn/api";

// Helper function to mark all keywords as required
const markRequireAll = (query) => {
  const words = query.split(/\s+/);
  return words.map((w) => `+${w}`).join(" ");
};

// Get all provinces
const getProvinces = async (req, res) => {
  try {
    const response = await axios.get(`${BASE_API_URL}/p/`);
    res.json(response.data);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching provinces", error: error.message });
  }
};

// Search provinces
const searchProvinces = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ message: "Search query is required" });
    }
    const response = await axios.get(`${BASE_API_URL}/p/search/`, {
      params: { q: markRequireAll(q) },
    });
    res.json(response.data);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error searching provinces", error: error.message });
  }
};

// Get districts by province code
const getDistricts = async (req, res) => {
  try {
    const { provinceCode } = req.params;
    const response = await axios.get(`${BASE_API_URL}/p/${provinceCode}`, {
      params: { depth: 2 },
    });
    res.json(response.data);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching districts", error: error.message });
  }
};

// Search districts
const searchDistricts = async (req, res) => {
  try {
    const { q, p } = req.query;
    if (!q || !p) {
      return res
        .status(400)
        .json({ message: "Search query and province code are required" });
    }
    const response = await axios.get(`${BASE_API_URL}/d/search/`, {
      params: { q: markRequireAll(q), p },
    });
    res.json(response.data);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error searching districts", error: error.message });
  }
};

// Get wards by district code
const getWards = async (req, res) => {
  try {
    const { districtCode } = req.params;
    const response = await axios.get(`${BASE_API_URL}/d/${districtCode}`, {
      params: { depth: 2 },
    });
    res.json(response.data);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching wards", error: error.message });
  }
};

// Search wards
const searchWards = async (req, res) => {
  try {
    const { q, d } = req.query;
    if (!q || !d) {
      return res
        .status(400)
        .json({ message: "Search query and district code are required" });
    }
    const response = await axios.get(`${BASE_API_URL}/w/search/`, {
      params: { q: markRequireAll(q), d },
    });
    res.json(response.data);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error searching wards", error: error.message });
  }
};

module.exports = {
  getProvinces,
  searchProvinces,
  getDistricts,
  searchDistricts,
  getWards,
  searchWards,
};
