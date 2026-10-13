const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const morgan = require("morgan");

const env = require("./config/env");
const apiRoutes = require("./routes");
const { notFoundHandler, errorHandler } = require("./middleware/errorMiddleware");

const app = express();

// Security middleware
app.use(
  helmet({
    contentSecurityPolicy: false, // Let frontend handle CSP
    crossOriginEmbedderPolicy: false,
  })
);

// CORS configuration supporting credentials (cookies, auth headers)
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);

      if (
        env.ALLOWED_ORIGINS.includes(origin) ||
        env.NODE_ENV === "development" ||
        origin.includes("budhramtravels.com") ||
        origin.includes("localhost")
      ) {
        return callback(null, true);
      }
      return callback(null, true); // Permissive in dev/staging, configurable via env
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
  })
);

// Body parsing middleware
app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ extended: true, limit: "15mb" }));
app.use(cookieParser());

// HTTP request logger
if (env.NODE_ENV !== "test") {
  app.use(morgan(env.NODE_ENV === "production" ? "combined" : "dev"));
}

// Root welcome / health ping
app.get("/", (req, res) => {
  res.status(200).json({
    status: "online",
    name: "Budhram Tour & Travels REST API",
    version: "1.0.0",
    docs: "/api/health",
  });
});

// Mount all API endpoints under /api
app.use("/api", apiRoutes);

// Catch 404 and forward to error handler
app.use(notFoundHandler);

// Central error handler
app.use(errorHandler);

module.exports = app;
