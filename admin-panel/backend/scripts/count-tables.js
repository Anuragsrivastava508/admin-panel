const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  try {
    const [
      user,
      vehicle,
      driver,
      booking,
      customer,
      pkg,
      testimonial,
      enquiry,
      payment,
      siteSetting,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.vehicle.count(),
      prisma.driver.count(),
      prisma.booking.count(),
      prisma.customer.count(),
      prisma.tripPackage.count(),
      prisma.testimonial.count(),
      prisma.enquiry.count(),
      prisma.payment.count(),
      prisma.siteSetting.count(),
    ]);

    console.log(JSON.stringify({
      user,
      vehicle,
      driver,
      booking,
      customer,
      package: pkg,
      testimonial,
      enquiry,
      payment,
      siteSetting,
    }, null, 2));
  } catch (error) {
    console.log("Database connection:", error.message || error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
