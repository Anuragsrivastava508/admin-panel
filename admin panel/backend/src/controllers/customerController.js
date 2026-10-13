const prisma = require("../config/db");

// GET /api/customers
async function getCustomers(req, res, next) {
  try {
    const search = req.query.search || "";

    const where = {};
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { phone: { contains: search } },
        { email: { contains: search } },
        { city: { contains: search } },
      ];
    }

    const customers = await prisma.customer.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        bookings: {
          select: {
            id: true,
            pnr: true,
            destination: true,
            totalAmount: true,
            bookingStatus: true,
            travelDate: true,
          },
          orderBy: { travelDate: "desc" },
        },
      },
    });

    const enriched = customers.map((c) => {
      const totalSpent = c.bookings.reduce((sum, b) => sum + Number(b.totalAmount || 0), 0);
      const lastBooking = c.bookings[0] || null;
      return {
        ...c,
        totalBookings: c.bookings.length,
        totalSpent,
        lastBookingDate: lastBooking ? lastBooking.travelDate : null,
      };
    });

    return res.status(200).json({ success: true, customers: enriched });
  } catch (error) {
    next(error);
  }
}

// POST /api/customers
async function createCustomer(req, res, next) {
  try {
    const { name, phone, email, address, city, notes } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ error: "Name and phone are required" });
    }

    const existing = await prisma.customer.findFirst({
      where: { phone: phone.trim() },
    });

    if (existing) {
      return res.status(400).json({ error: "Customer with this phone number already exists" });
    }

    const customer = await prisma.customer.create({
      data: {
        name: name.trim(),
        phone: phone.trim(),
        email: email ? email.trim() : null,
        address: address ? address.trim() : null,
        city: city || "Delhi NCR",
        notes: notes || null,
      },
    });

    return res.status(201).json({ success: true, customer });
  } catch (error) {
    next(error);
  }
}

// GET /api/customers/:id
async function getCustomerById(req, res, next) {
  try {
    const customer = await prisma.customer.findUnique({
      where: { id: req.params.id },
      include: {
        bookings: {
          orderBy: { createdAt: "desc" },
          include: {
            vehicle: true,
            driver: true,
            payments: true,
          },
        },
        enquiries: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!customer) {
      return res.status(404).json({ error: "Customer not found" });
    }

    return res.status(200).json({ success: true, customer });
  } catch (error) {
    next(error);
  }
}

// PATCH /api/customers/:id
async function updateCustomer(req, res, next) {
  try {
    const { name, phone, email, address, city, notes } = req.body;

    const data = {};
    if (name !== undefined) data.name = name;
    if (phone !== undefined) data.phone = phone;
    if (email !== undefined) data.email = email;
    if (address !== undefined) data.address = address;
    if (city !== undefined) data.city = city;
    if (notes !== undefined) data.notes = notes;

    const updated = await prisma.customer.update({
      where: { id: req.params.id },
      data,
    });

    return res.status(200).json({ success: true, customer: updated });
  } catch (error) {
    next(error);
  }
}

// DELETE /api/customers/:id
async function deleteCustomer(req, res, next) {
  try {
    await prisma.customer.delete({
      where: { id: req.params.id },
    });

    return res.status(200).json({ success: true, message: "Customer deleted successfully" });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getCustomers,
  createCustomer,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
};
