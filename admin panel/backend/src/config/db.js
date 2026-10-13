const { PrismaClient } = require("@prisma/client");

let prisma;

if (process.env.NODE_ENV === "production") {
  prisma = new PrismaClient();
} else {
  if (!global.__prisma) {
    global.__prisma = new PrismaClient({
      log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
    });
  }
  prisma = global.__prisma;
}

// Graceful shutdown handling
process.on("beforeExit", async () => {
  if (prisma) {
    await prisma.$disconnect();
  }
});

module.exports = prisma;
