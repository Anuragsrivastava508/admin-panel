const crypto = require("crypto");
const prisma = require("../config/db");

// GET /api/bookings
async function getBookings(req, res, next) {
  try {
    const search = req.query.search || "";
    const status = req.query.status || "";
    const page = parseInt(req.query.page || "1", 10);
    const limit = parseInt(req.query.limit || "50", 10);

    const where = {};

    if (status && status !== "ALL") {
      where.bookingStatus = status;
    }

    if (search) {
      where.OR = [
        { pnr: { contains: search } },
        { destination: { contains: search } },
        { customer: { name: { contains: search } } },
        { customer: { phone: { contains: search } } },
      ];
    }

    const [total, bookings] = await Promise.all([
      prisma.booking.count({ where }),
      prisma.booking.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          customer: true,
          vehicle: true,
          driver: true,
          tripPackage: true,
          payments: true,
        },
      }),
    ]);

    const mappedBookings = bookings.map((b) => {
      const paidTotal = b.payments
        ? b.payments
            .filter((p) => p.paymentStatus === "PAID")
            .reduce((sum, p) => sum + Number(p.amount), 0)
        : Number(b.advancePaid);
      const balanceDue = Math.max(0, Number(b.totalAmount) - paidTotal);
      return {
        ...b,
        balanceDue,
      };
    });

    return res.status(200).json({
      success: true,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
      bookings: mappedBookings,
    });
  } catch (error) {
    next(error);
  }
}

// POST /api/bookings
async function createBooking(req, res, next) {
  try {
    const {
      customerName,
      customerPhone,
      customerEmail,
      pickupLocation,
      destination,
      travelDate,
      returnDate,
      passengerCount,
      vehicleId,
      driverId,
      tripPackageId,
      estimatedKm,
      ratePerKm,
      advancePaid,
      source,
      specialNotes,
    } = req.body;

    if (!customerName || typeof customerName !== "string" || !customerName.trim()) {
      return res.status(400).json({ success: false, error: "Customer name is required" });
    }

    if (!customerPhone || typeof customerPhone !== "string") {
      return res.status(400).json({ success: false, error: "Customer phone number is required" });
    }

    const cleanPhone = customerPhone.replace(/[\s\-\(\)\+]/g, "");
    if (cleanPhone.length < 10) {
      return res.status(400).json({ success: false, error: "Please enter a valid 10-digit phone number" });
    }

    if (!pickupLocation || typeof pickupLocation !== "string" || !pickupLocation.trim()) {
      return res.status(400).json({ success: false, error: "Pickup location is required" });
    }

    if (!destination || typeof destination !== "string" || !destination.trim()) {
      return res.status(400).json({ success: false, error: "Destination is required" });
    }

    if (!travelDate) {
      return res.status(400).json({ success: false, error: "Travel date is required" });
    }

    const parsedTravelDate = new Date(travelDate);
    if (isNaN(parsedTravelDate.getTime())) {
      return res.status(400).json({ success: false, error: "Invalid travel date format" });
    }

    // Find or create customer
    let customer = await prisma.customer.findFirst({
      where: { phone: customerPhone.trim() },
    });

    if (!customer) {
      customer = await prisma.customer.create({
        data: {
          name: customerName.trim(),
          phone: customerPhone.trim(),
          email: customerEmail?.trim() || null,
          city: pickupLocation.trim(),
        },
      });
    } else if (customerEmail && !customer.email) {
      customer = await prisma.customer.update({
        where: { id: customer.id },
        data: { email: customerEmail.trim() },
      });
    }

    // Duplicate check within 60s
    const sixtySecsAgo = new Date(Date.now() - 60000);
    const recentBooking = await prisma.booking.findFirst({
      where: {
        customerId: customer.id,
        destination: destination.trim(),
        createdAt: { gte: sixtySecsAgo },
      },
      include: {
        customer: true,
        vehicle: true,
        driver: true,
      },
    });

    if (recentBooking) {
      return res.status(200).json({
        success: true,
        message: "Booking already received (duplicate prevented)",
        booking: recentBooking,
        data: {
          bookingId: recentBooking.id,
          pnr: recentBooking.pnr,
          booking: recentBooking,
        },
      });
    }

    const km = Number(estimatedKm) || 0;
    const rate = Number(ratePerKm) || 0;
    const calculatedTotal = km * rate;
    const adv = Number(advancePaid) || 0;
    const balance = Math.max(0, calculatedTotal - adv);

    // Generate formatted Sequential PNR (BTT-2026-XXXXX)
    const count = await prisma.booking.count();
    let bookingNum = count + 1;
    let pnr = `BTT-2026-${String(bookingNum).padStart(5, "0")}`;
    let pnrExists = await prisma.booking.findUnique({ where: { pnr } });
    while (pnrExists) {
      bookingNum += 1;
      pnr = `BTT-2026-${String(bookingNum).padStart(5, "0")}`;
      pnrExists = await prisma.booking.findUnique({ where: { pnr } });
    }

    const booking = await prisma.booking.create({
      data: {
        pnr,
        customerId: customer.id,
        vehicleId: vehicleId || null,
        driverId: driverId || null,
        tripPackageId: tripPackageId || null,
        pickupLocation: pickupLocation.trim(),
        destination: destination.trim(),
        travelDate: parsedTravelDate,
        returnDate: returnDate ? new Date(returnDate) : null,
        passengerCount: Number(passengerCount) || 1,
        estimatedKm: km,
        ratePerKm: rate,
        totalAmount: calculatedTotal,
        advancePaid: adv,
        paymentStatus: adv >= calculatedTotal && calculatedTotal > 0 ? "PAID" : adv > 0 ? "PARTIAL" : "PENDING",
        bookingStatus: "PENDING",
        source: source || "WEBSITE_BOOKING",
        specialNotes: specialNotes || null,
      },
      include: {
        customer: true,
        vehicle: true,
        driver: true,
        tripPackage: true,
      },
    });

    if (adv > 0) {
      await prisma.payment.create({
        data: {
          transactionId: "TXN-" + crypto.randomBytes(6).toString("hex").toUpperCase(),
          bookingId: booking.id,
          amount: adv,
          paymentMethod: "UPI",
          paymentStatus: "PAID",
          referenceNote: `Advance payment for PNR ${pnr}`,
        },
      });
    }

    await prisma.systemNotification.create({
      data: {
        title: `Booking Request: ${pnr}`,
        message: `${customerName} booked trip to ${destination}. Estimated: ₹${calculatedTotal.toLocaleString()}`,
        type: "BOOKING",
        link: "/bookings",
      },
    });

    return res.status(201).json({
      success: true,
      message: "Booking submitted successfully",
      booking: { ...booking, balanceDue: balance },
      data: {
        bookingId: booking.id,
        pnr: booking.pnr,
        booking: { ...booking, balanceDue: balance },
      },
    });
  } catch (error) {
    next(error);
  }
}

// GET /api/bookings/:id
async function getBookingById(req, res, next) {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: req.params.id },
      include: {
        customer: true,
        vehicle: true,
        driver: true,
        tripPackage: true,
        payments: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    const paidTotal = booking.payments
      ? booking.payments
          .filter((p) => p.paymentStatus === "PAID")
          .reduce((sum, p) => sum + Number(p.amount), 0)
      : Number(booking.advancePaid);
    const balanceDue = Math.max(0, Number(booking.totalAmount) - paidTotal);

    return res.status(200).json({ success: true, booking: { ...booking, balanceDue } });
  } catch (error) {
    next(error);
  }
}

// PATCH /api/bookings/:id
async function updateBooking(req, res, next) {
  try {
    const {
      bookingStatus,
      paymentStatus,
      vehicleId,
      driverId,
      actualKm,
      totalAmount,
      advancePaid,
      specialNotes,
      travelDate,
      returnDate,
      destination,
      pickupLocation,
    } = req.body;

    const data = {};
    if (bookingStatus !== undefined) data.bookingStatus = bookingStatus;
    if (paymentStatus !== undefined) data.paymentStatus = paymentStatus;
    if (vehicleId !== undefined) data.vehicleId = vehicleId || null;
    if (driverId !== undefined) data.driverId = driverId || null;
    if (actualKm !== undefined) data.actualKm = actualKm ? Number(actualKm) : null;
    if (totalAmount !== undefined) data.totalAmount = Number(totalAmount);
    if (advancePaid !== undefined) data.advancePaid = Number(advancePaid);
    if (specialNotes !== undefined) data.specialNotes = specialNotes;
    if (travelDate !== undefined) data.travelDate = new Date(travelDate);
    if (returnDate !== undefined) data.returnDate = returnDate ? new Date(returnDate) : null;
    if (destination !== undefined) data.destination = destination;
    if (pickupLocation !== undefined) data.pickupLocation = pickupLocation;

    const updated = await prisma.booking.update({
      where: { id: req.params.id },
      data,
      include: {
        customer: true,
        vehicle: true,
        driver: true,
        tripPackage: true,
        payments: true,
      },
    });

    const paidTotal = updated.payments
      ? updated.payments
          .filter((p) => p.paymentStatus === "PAID")
          .reduce((sum, p) => sum + Number(p.amount), 0)
      : Number(updated.advancePaid);
    const computedBalance = Math.max(0, Number(updated.totalAmount) - paidTotal);

    return res.status(200).json({ success: true, booking: { ...updated, balanceDue: computedBalance } });
  } catch (error) {
    next(error);
  }
}

// DELETE /api/bookings/:id
async function deleteBooking(req, res, next) {
  try {
    await prisma.booking.delete({
      where: { id: req.params.id },
    });
    return res.status(200).json({ success: true, message: "Booking deleted successfully" });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getBookings,
  createBooking,
  getBookingById,
  updateBooking,
  deleteBooking,
};
