const path = require("path");
const dotenv = require("dotenv");

// Load .env from backend root
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const env = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || "development",
  DATABASE_URL: process.env.DATABASE_URL || "file:./dev.db",
  JWT_SECRET:
    process.env.JWT_SECRET ||
    "0975c6733c86152de336d1d196a03ce8590cf2511ebd64a283d518a6685cb6edc1e9e66b9be94883db9ea852e60a0680",
  COOKIE_NAME: process.env.ADMIN_SESSION_COOKIE || "budhram_admin_session",
  ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(",").map((o) => o.trim())
    : [
        "http://localhost:3000",
        "http://localhost:3001",
        "https://budhramtravels.com",
        "https://www.budhramtravels.com",
      ],
  FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:3000",
  PUBLIC_WEBSITE_URL: process.env.PUBLIC_WEBSITE_URL || "https://budhramtravels.com",
  WHATSAPP_ACCESS_TOKEN: process.env.WHATSAPP_ACCESS_TOKEN,
  WHATSAPP_PHONE_NUMBER_ID: process.env.WHATSAPP_PHONE_NUMBER_ID,
  WHATSAPP_ADMIN_NUMBER: process.env.WHATSAPP_ADMIN_NUMBER || "919310847853",
};

module.exports = env;
