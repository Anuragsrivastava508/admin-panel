const app = require("./src/app");
const env = require("./src/config/env");
const prisma = require("./src/config/db");

const PORT = env.PORT || 5000;

async function startServer() {
  try {
    // Verify database connection on startup
    await prisma.$connect();
    console.log(`[Database] Connected successfully to database engine (${env.DATABASE_URL})`);

    const server = app.listen(PORT, () => {
      console.log(`=================================================`);
      console.log(`🚀 Budhram Travels Node.js REST API Server`);
      console.log(`   Environment : ${env.NODE_ENV}`);
      console.log(`   Server Port : ${PORT}`);
      console.log(`   API Base URL: http://localhost:${PORT}/api`);
      console.log(`   Health Check: http://localhost:${PORT}/api/health`);
      console.log(`=================================================`);
    });

    // Graceful shutdown handling
    const shutdown = async (signal) => {
      console.log(`\n[Server] Received ${signal}. Starting graceful shutdown...`);
      server.close(async () => {
        console.log("[Server] HTTP server closed.");
        try {
          await prisma.$disconnect();
          console.log("[Database] Prisma disconnected.");
          process.exit(0);
        } catch (err) {
          console.error("[Database] Error during disconnect:", err);
          process.exit(1);
        }
      });

      // Force exit after 10s if graceful shutdown hangs
      setTimeout(() => {
        console.error("[Server] Forcefully terminating server process.");
        process.exit(1);
      }, 10000);
    };

    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("SIGINT", () => shutdown("SIGINT"));
  } catch (error) {
    console.error("[Server] Fatal error on server startup:", error);
    process.exit(1);
  }
}

process.on("unhandledRejection", (reason, promise) => {
  console.error("[Process] Unhandled Promise Rejection at:", promise, "reason:", reason);
});

process.on("uncaughtException", (error) => {
  console.error("[Process] Uncaught Exception thrown:", error);
  process.exit(1);
});

startServer();
