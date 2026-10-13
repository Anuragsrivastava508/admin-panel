const crypto = require("crypto");
const prisma = require("../config/db");

// GET /api/payments
async function getPayments(req, res, next) {
  try {
    const search = req.query.search || "";
    const status = req.query.status || "";

    const where = {};
    if (status && status !== "ALL") {
      where.paymentStatus = status;
    }

    if (search) {
      where.OR = [
        { transactionId: { contains: search } },
        { booking: { pnr: { contains: search } } },
        { booking: { customer: { name: { contains: search } } } },
      ];
    }

    const payments = await prisma.payment.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        booking: {
          include: {
            customer: true,
            vehicle: true,
          },
        },
      },
    });

    return res.status(200).json({ success: true, payments });
  } catch (error) {
    next(error);
  }
}

// POST /api/payments
async function createPayment(req, res, next) {
  try {
    const { bookingId, amount, paymentMethod, paymentStatus, referenceNote } = req.body;

    if (!bookingId || amount === undefined || Number(amount) <= 0) {
      return res.status(400).json({ error: "Booking ID and valid positive amount are required" });
    }

    if (!paymentMethod) {
      return res.status(400).json({ error: "Payment method is required" });
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    const transactionId = "TXN-" + crypto.randomBytes(6).toString("hex").toUpperCase();

    const payment = await prisma.payment.create({
      data: {
        transactionId,
        bookingId,
        amount: Number(amount),
        paymentMethod,
        paymentStatus: paymentStatus || "PAID",
        referenceNote: referenceNote || null,
      },
      include: {
        booking: {
          include: {
            customer: true,
          },
        },
      },
    });

    const currentAdvance = Number(booking.advancePaid) + Number(amount);
    const balance = Math.max(0, Number(booking.totalAmount) - currentAdvance);
    const newStatus = balance <= 0 ? "PAID" : "PARTIAL";

    await prisma.booking.update({
      where: { id: bookingId },
      data: {
        advancePaid: currentAdvance,
        paymentStatus: newStatus,
      },
    });

    return res.status(201).json({ success: true, payment });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getPayments,
  createPayment,
};
