const express = require("express");
const router = express.Router();
const driverController = require("../controllers/driverController");
const { protectAdmin } = require("../middleware/authMiddleware");

// GET all drivers
router.get("/", driverController.getDrivers);

// POST register driver
router.post("/", protectAdmin, driverController.createDriver);

// PATCH update driver
router.patch("/:id", protectAdmin, driverController.updateDriver);

// DELETE driver
router.delete("/:id", protectAdmin, driverController.deleteDriver);

module.exports = router;
