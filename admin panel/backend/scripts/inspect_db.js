const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const media = await prisma.mediaItem.findMany();
  console.log("=== CURRENT MEDIA ITEMS IN DB ===", media.length);
  console.log(JSON.stringify(media, null, 2));

  const pkgs = await prisma.tripPackage.findMany();
  console.log("\n=== CURRENT PACKAGES IN DB ===", pkgs.length);
  console.log(JSON.stringify(pkgs, null, 2));

  const vehicles = await prisma.vehicle.findMany();
  console.log("\n=== CURRENT VEHICLES IN DB ===", vehicles.length);
  console.log(JSON.stringify(vehicles, null, 2));

  const drivers = await prisma.driver.findMany();
  console.log("\n=== CURRENT DRIVERS IN DB ===", drivers.length);
  console.log(JSON.stringify(drivers, null, 2));

  const testimonials = await prisma.testimonial.findMany();
  console.log("\n=== CURRENT TESTIMONIALS IN DB ===", testimonials.length);
  console.log(JSON.stringify(testimonials, null, 2));

  const content = await prisma.websiteContent.findMany();
  console.log("\n=== CURRENT WEBSITE CONTENT IN DB ===", content.length);
  for (const c of content) {
    console.log(`Key: ${c.key}, Data length: ${c.data.length}`);
  }

  const bookings = await prisma.booking.count();
  const enquiries = await prisma.enquiry.count();
  const customers = await prisma.customer.count();
  const payments = await prisma.payment.count();
  console.log("\n=== COUNTS ===");
  console.log({ bookings, enquiries, customers, payments });
}

main().catch(console.error).finally(() => prisma.$disconnect());
