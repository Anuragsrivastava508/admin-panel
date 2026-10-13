const express = require("express");
const router = express.Router();
const vehicleController = require("../controllers/vehicleController");
const { protectAdmin } = require("../middleware/authMiddleware");

// GET all vehicles
router.get("/", vehicleController.getVehicles);

// POST register vehicle
router.post("/", protectAdmin, vehicleController.createVehicle);

// PATCH update vehicle
router.patch("/:id", protectAdmin, vehicleController.updateVehicle);

// DELETE vehicle
router.delete("/:id", protectAdmin, vehicleController.deleteVehicle);

module.exports = router;
