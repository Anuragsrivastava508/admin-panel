const express = require("express");
const router = express.Router();

const authRoutes = require("./authRoutes");
const bookingRoutes = require("./bookingRoutes");
const enquiryRoutes = require("./enquiryRoutes");
const vehicleRoutes = require("./vehicleRoutes");
const driverRoutes = require("./driverRoutes");
const packageRoutes = require("./packageRoutes");
const mediaRoutes = require("./mediaRoutes");
const testimonialRoutes = require("./testimonialRoutes");
const customerRoutes = require("./customerRoutes");
const paymentRoutes = require("./paymentRoutes");
const odometerRoutes = require("./odometerRoutes");
const notificationRoutes = require("./notificationRoutes");
const contentRoutes = require("./contentRoutes");
const statsRoutes = require("./statsRoutes");
const settingsRoutes = require("./settingsRoutes");
const healthRoutes = require("./healthRoutes");

// 1. Authentication & Admin Profiles
router.use("/auth", authRoutes);
router.use("/admin", authRoutes); // Alias for REST consistency

// 2. Bookings & Dispatch
router.use("/bookings", bookingRoutes);

// 3. Inquiries, Leads & Contact
router.use("/enquiries", enquiryRoutes);
router.use("/inquiries", enquiryRoutes); // Exact match for website & admin callers
router.use("/leads", enquiryRoutes); // Exact match for website lead forms

// 4. Tour Packages & Circuits
router.use("/packages", packageRoutes);
router.use("/tours", packageRoutes); // Alias requested in user spec

// 5. Media Gallery
router.use("/media", mediaRoutes);

// 6. Testimonials & Reviews
router.use("/testimonials", testimonialRoutes);
router.use("/reviews", testimonialRoutes); // Alias requested in user spec

// 7. Force Tempo Fleet & Mountain Chauffeurs
router.use("/vehicles", vehicleRoutes);
router.use("/drivers", driverRoutes);
router.use("/odometer", odometerRoutes);

// 8. Customer CRM & Payments
router.use("/customers", customerRoutes);
router.use("/payments", paymentRoutes);

// 9. Website CMS & Notifications
router.use("/content", contentRoutes);
router.use("/notifications", notificationRoutes);

// 10. Settings & Governance
router.use("/settings", settingsRoutes);
router.use("/contact", settingsRoutes); // Alias for contact settings

// 11. Dashboard Analytics & Health
router.use("/stats", statsRoutes);
router.use("/health", healthRoutes);

module.exports = router;
