const express = require("express");
const router = express.Router();
const mediaController = require("../controllers/mediaController");
const { protectAdmin } = require("../middleware/authMiddleware");

// GET media items
router.get("/", mediaController.getMedia);

// POST upload/enroll media item
router.post("/", protectAdmin, mediaController.createMedia);

// DELETE media item
router.delete("/:id", protectAdmin, mediaController.deleteMedia);

module.exports = router;
