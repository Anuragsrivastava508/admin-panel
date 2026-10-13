const express = require("express");
const router = express.Router();
const odometerController = require("../controllers/odometerController");
const { protectAdmin } = require("../middleware/authMiddleware");

// Odometer logs
router.get("/", odometerController.getOdometerLogs);
router.post("/", protectAdmin, odometerController.createOdometerLog);

module.exports = router;
