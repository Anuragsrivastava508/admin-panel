const express = require("express");
const router = express.Router();
const bookingController = require("../controllers/bookingController");
const { protectAdmin, optionalAuth } = require("../middleware/authMiddleware");

// GET bookings list (for admin dashboard, and optional customer lookups)
router.get("/", bookingController.getBookings);

// POST create booking (accessible by public website forms and admin desk)
router.post("/", bookingController.createBooking);

// GET single booking
router.get("/:id", bookingController.getBookingById);

// PATCH update booking status / fields (admin protected)
router.patch("/:id", protectAdmin, bookingController.updateBooking);

// DELETE booking (admin protected)
router.delete("/:id", protectAdmin, bookingController.deleteBooking);

module.exports = router;
