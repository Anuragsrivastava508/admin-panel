const prisma = require("../config/db");

// GET /api/stats
async function getStats(req, res, next) {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [
      totalBookings,
      todayBookings,
      pendingBookings,
      confirmedBookings,
      enRouteBookings,
      completedBookings,
      totalCustomers,
      totalVehicles,
      activeVehicles,
      totalDrivers,
      totalEnquiries,
      newEnquiries,
      pendingQueries,
      testimonials,
      recentBookings,
      recentEnquiries,
      allBookingsRevenue,
      allPayments,
    ] = await Promise.all([
      prisma.booking.count(),
      prisma.booking.count({ where: { createdAt: { gte: todayStart } } }),
      prisma.booking.count({ where: { bookingStatus: "PENDING" } }),
      prisma.booking.count({ where: { bookingStatus: "CONFIRMED" } }),
      prisma.booking.count({ where: { bookingStatus: "EN_ROUTE" } }),
      prisma.booking.count({ where: { bookingStatus: "COMPLETED" } }),
      prisma.customer.count(),
      prisma.vehicle.count(),
      prisma.vehicle.count({ where: { status: "ACTIVE_ON_ROAD" } }),
      prisma.driver.count(),
      prisma.enquiry.count(),
      prisma.enquiry.count({ where: { status: "NEW" } }),
      prisma.enquiry.count({ where: { status: { in: ["NEW", "PENDING"] } } }),
      prisma.testimonial.findMany({ select: { rating: true } }),
      prisma.booking.findMany({
        take: 6,
        orderBy: { createdAt: "desc" },
        include: {
          customer: true,
          vehicle: true,
          driver: true,
          tripPackage: true,
        },
      }),
      prisma.enquiry.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
      }),
      prisma.booking.aggregate({
        _sum: {
          totalAmount: true,
          advancePaid: true,
        },
      }),
      prisma.payment.aggregate({
        where: { paymentStatus: "PAID" },
        _sum: {
          amount: true,
        },
      }),
    ]);

    const averageRating =
      testimonials.length > 0
        ? Number((testimonials.reduce((acc, t) => acc + t.rating, 0) / testimonials.length).toFixed(1))
        : 0;

    const totalRevenue = Number(allBookingsRevenue._sum.totalAmount || 0);
    const totalCollected = Number(allPayments._sum.amount || allBookingsRevenue._sum.advancePaid || 0);
    const totalPending = Math.max(0, totalRevenue - totalCollected);
    const quotesSentCount = await prisma.enquiry.count({ where: { status: "QUOTE_SENT" } });
    const activeTrips = confirmedBookings + enRouteBookings;

    return res.status(200).json({
      success: true,
      stats: {
        totalBookings,
        todayBookings,
        pendingBookings,
        confirmedBookings,
        activeTrips,
        enRouteBookings,
        completedBookings,
        totalCustomers,
        totalVehicles,
        activeVehicles,
        queuedVehicles: Math.max(0, totalVehicles - activeVehicles),
        totalDrivers,
        totalEnquiries,
        newEnquiries,
        newLeads: newEnquiries,
        pendingQueries,
        quotesSentCount,
        averageRating,
        reviewCount: testimonials.length,
        totalRevenue,
        totalCollected,
        totalPending,
      },
      recentBookings,
      recentEnquiries,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getStats,
};
