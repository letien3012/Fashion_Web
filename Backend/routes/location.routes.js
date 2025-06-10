const express = require("express");
const router = express.Router();
const locationController = require("../controllers/location.controller");

// Province routes
router.get("/provinces", locationController.getProvinces);
router.get("/provinces/search", locationController.searchProvinces);

// District routes
router.get(
  "/provinces/:provinceCode/districts",
  locationController.getDistricts
);
router.get("/districts/search", locationController.searchDistricts);

// Ward routes
router.get("/districts/:districtCode/wards", locationController.getWards);
router.get("/wards/search", locationController.searchWards);

module.exports = router;
