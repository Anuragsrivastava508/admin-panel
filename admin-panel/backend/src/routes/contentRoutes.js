const express = require("express");
const router = express.Router();
const contentController = require("../controllers/contentController");
const { protectAdmin } = require("../middleware/authMiddleware");

// GET content (publicly available for website and CMS preview)
router.get("/", contentController.getContent);

// POST save content (admin protected)
router.post("/", protectAdmin, contentController.saveContent);

// POST trigger CDN edge sync (admin protected)
router.post("/sync", protectAdmin, contentController.syncContent);

module.exports = router;
