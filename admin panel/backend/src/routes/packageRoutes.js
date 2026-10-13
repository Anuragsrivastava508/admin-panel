const express = require("express");
const router = express.Router();
const packageController = require("../controllers/packageController");
const { protectAdmin } = require("../middleware/authMiddleware");

// GET all packages
router.get("/", packageController.getPackages);

// GET single package
router.get("/:id", packageController.getPackageById);

// POST publish package
router.post("/", protectAdmin, packageController.createPackage);

// PATCH update package
router.patch("/:id", protectAdmin, packageController.updatePackage);

// DELETE package
router.delete("/:id", protectAdmin, packageController.deletePackage);

module.exports = router;
