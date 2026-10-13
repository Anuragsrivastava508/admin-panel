const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/paymentController");
const { protectAdmin } = require("../middleware/authMiddleware");

// Protected billing routes
router.use(protectAdmin);

router.get("/", paymentController.getPayments);
router.post("/", paymentController.createPayment);

module.exports = router;
