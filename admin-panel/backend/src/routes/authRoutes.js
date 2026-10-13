const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { protectAdmin, optionalAuth } = require("../middleware/authMiddleware");

// Public endpoints
router.post("/login", authController.login);
router.post("/register", authController.register);
router.post("/logout", authController.logout);

// Protected endpoints
router.get("/me", optionalAuth, authController.getMe);
router.put("/password", protectAdmin, authController.updatePassword);

module.exports = router;
