const express = require("express");
const router = express.Router();
const prisma = require("../config/db");

router.get("/", async (req, res) => {
  const startTime = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    const userCount = await prisma.user.count();
    const durationMs = Date.now() - startTime;

    return res.status(200).json({
      status: "healthy",
      database: "connected",
      latencyMs: durationMs,
      timestamp: new Date().toISOString(),
      service: "Budhram Tour & Travels Node.js REST API",
      version: "1.0.0",
      environment: process.env.NODE_ENV || "development",
      adminUsersConfigured: userCount > 0,
    });
  } catch (error) {
    console.error("Health check error:", error.message || error);
    return res.status(503).json({
      status: "unhealthy",
      database: "disconnected",
      timestamp: new Date().toISOString(),
      error: "Database connectivity check failed",
    });
  }
});

module.exports = router;
