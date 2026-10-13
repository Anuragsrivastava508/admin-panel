const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notificationController");
const { protectAdmin } = require("../middleware/authMiddleware");

// Protected notification routes
router.use(protectAdmin);

router.get("/", notificationController.getNotifications);
router.patch("/:id", notificationController.markRead);

module.exports = router;
