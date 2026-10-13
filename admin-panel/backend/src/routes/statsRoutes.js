const express = require("express");
const router = express.Router();
const statsController = require("../controllers/statsController");
const { protectAdmin, optionalAuth } = require("../middleware/authMiddleware");

// GET stats
router.get("/", optionalAuth, statsController.getStats);

module.exports = router;
