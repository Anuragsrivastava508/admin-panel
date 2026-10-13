const express = require("express");
const router = express.Router();
const testimonialController = require("../controllers/testimonialController");
const { protectAdmin } = require("../middleware/authMiddleware");

// GET testimonials
router.get("/", testimonialController.getTestimonials);

// POST create testimonial
router.post("/", protectAdmin, testimonialController.createTestimonial);

// PATCH update testimonial
router.patch("/:id", protectAdmin, testimonialController.updateTestimonial);

// DELETE testimonial
router.delete("/:id", protectAdmin, testimonialController.deleteTestimonial);

module.exports = router;
