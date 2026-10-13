const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkSample() {
  const b = await prisma.booking.findMany({ take: 5, include: { customer: true, payments: true } });
  console.log("=== SAMPLE BOOKINGS ===", JSON.stringify(b, null, 2));

  const e = await prisma.enquiry.findMany({ take: 5 });
  console.log("=== SAMPLE ENQUIRIES ===", JSON.stringify(e, null, 2));

  const users = await prisma.user.findMany();
  console.log("=== USERS ===", JSON.stringify(users, null, 2));

  const settings = await prisma.siteSetting.findMany();
  console.log("=== SETTINGS ===", JSON.stringify(settings, null, 2));

  const fareSettings = await prisma.fareSetting.findMany();
  console.log("=== FARE SETTINGS ===", JSON.stringify(fareSettings, null, 2));

  const advisories = await prisma.routeAdvisory.findMany();
  console.log("=== ROUTE ADVISORIES ===", JSON.stringify(advisories, null, 2));
}

checkSample().catch(console.error).finally(() => prisma.$disconnect());
