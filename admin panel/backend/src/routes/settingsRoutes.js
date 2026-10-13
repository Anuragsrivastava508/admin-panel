const express = require("express");
const router = express.Router();
const settingsController = require("../controllers/settingsController");
const { protectAdmin } = require("../middleware/authMiddleware");

// GET settings (publicly accessible for phone, address, terms)
router.get("/", settingsController.getSettings);

// PUT/PATCH update settings (admin protected)
router.put("/", protectAdmin, settingsController.updateSettings);
router.patch("/", protectAdmin, settingsController.updateSettings);

// POST save fare setting (admin protected)
router.post("/fare", protectAdmin, settingsController.saveFareSetting);

module.exports = router;
