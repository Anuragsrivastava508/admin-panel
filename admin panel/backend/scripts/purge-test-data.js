require("dotenv").config({ path: ".env.local" });
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function purgeAllTestData() {
  console.log("Purging all test bookings, leads, customers, and payments...");
  const p = await prisma.payment.deleteMany({});
  const b = await prisma.booking.deleteMany({});
  const e = await prisma.enquiry.deleteMany({});
  const c = await prisma.customer.deleteMany({});
  const n = await prisma.systemNotification.deleteMany({});

  console.log(`Deleted: ${b.count} bookings, ${e.count} enquiries, ${c.count} customers, ${p.count} payments.`);
  console.log("Database reset to 0 dummy data. Only master fleet, drivers, packages, and admin users remain.");
}

purgeAllTestData().catch(console.error).finally(() => prisma.$disconnect());
