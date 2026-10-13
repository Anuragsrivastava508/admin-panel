const express = require("express");
const router = express.Router();
const enquiryController = require("../controllers/enquiryController");
const { protectAdmin } = require("../middleware/authMiddleware");

// GET all enquiries/leads
router.get("/", enquiryController.getEnquiries);

// POST create inquiry/lead (from website or admin)
router.post("/", enquiryController.createEnquiry);

// GET inquiry by ID
router.get("/:id", enquiryController.getEnquiryById);

// PATCH update inquiry status, notes, retry WhatsApp
router.patch("/:id", protectAdmin, enquiryController.updateEnquiry);

// DELETE inquiry
router.delete("/:id", protectAdmin, enquiryController.deleteEnquiry);

module.exports = router;
