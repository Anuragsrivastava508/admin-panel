const prisma = require("../config/db");
const { sendAdminWhatsAppNotification } = require("../services/whatsappService");

// GET /api/enquiries, /api/inquiries, /api/leads
async function getEnquiries(req, res, next) {
  try {
    const search = req.query.search || "";
    const status = req.query.status || "";

    const where = {};
    if (status && status !== "ALL") {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { id: { contains: search } },
        { name: { contains: search } },
        { phone: { contains: search } },
        { email: { contains: search } },
        { destinationCircuit: { contains: search } },
        { subject: { contains: search } },
      ];
    }

    const enquiries = await prisma.enquiry.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        customer: true,
      },
    });

    return res.status(200).json({
      success: true,
      count: enquiries.length,
      enquiries,
      inquiries: enquiries,
      leads: enquiries,
    });
  } catch (error) {
    next(error);
  }
}

// POST /api/enquiries, /api/inquiries, /api/leads
async function createEnquiry(req, res, next) {
  try {
    const {
      name,
      phone,
      email,
      subject,
      service,
      message,
      travelDate,
      passengers,
      persons,
      pickupLocation,
      pickup,
      destination,
      destinationCircuit,
      vehicleChoice,
      vehicle,
      budget,
      estimatedFare,
      source,
    } = req.body;

    if (!name || typeof name !== "string" || !name.trim()) {
      return res.status(400).json({ success: false, error: "Please enter your full name" });
    }

    if (!phone || typeof phone !== "string") {
      return res.status(400).json({ success: false, error: "Please provide a valid contact number" });
    }

    const cleanPhone = phone.replace(/[\s\-\(\)\+]/g, "");
    if (cleanPhone.length < 10) {
      return res.status(400).json({ success: false, error: "Please enter a valid 10-digit phone number" });
    }

    const rawSubject = (subject || service || destination || destinationCircuit || "Himalayan Tour Inquiry").trim();
    const resolvedDestination = (destination || destinationCircuit || pickupLocation || "Delhi NCR Circuit").trim();
    const resolvedPickup = (pickupLocation || pickup || "Delhi NCR").trim();
    const resolvedPassengers = String(passengers || persons || "1").trim();
    const resolvedVehicle = (vehicleChoice || vehicle || "Force Tempo Traveller").trim();
    const sanitizedName = name.trim().replace(/[<>]/g, "");
    const sanitizedEmail = email ? email.trim().toLowerCase() : null;
    let sanitizedMessage = message ? String(message).trim() : "";
    const resolvedSource = source || "WEBSITE_FORM";

    let validTravelDate = null;
    if (travelDate && typeof travelDate === "string") {
      const parsed = Date.parse(travelDate);
      if (!isNaN(parsed)) {
        validTravelDate = new Date(parsed);
      } else {
        sanitizedMessage = sanitizedMessage
          ? `${sanitizedMessage} (Requested Date: ${travelDate})`
          : `Requested Date: ${travelDate}`;
      }
    }
    if (budget) {
      sanitizedMessage = sanitizedMessage ? `${sanitizedMessage} | Budget: ₹${budget}` : `Budget: ₹${budget}`;
    }

    // Duplicate check within 60s
    const sixtySecsAgo = new Date(Date.now() - 60000);
    const recentEnquiry = await prisma.enquiry.findFirst({
      where: {
        phone: phone.trim(),
        createdAt: { gte: sixtySecsAgo },
      },
    });

    if (recentEnquiry) {
      return res.status(200).json({
        success: true,
        message: "Your inquiry has been received successfully",
        inquiryId: recentEnquiry.id,
        crmStatus: "SUCCESS",
        whatsappStatus: recentEnquiry.whatsappStatus || "SENT",
        data: {
          inquiryId: recentEnquiry.id,
          leadId: recentEnquiry.id,
          status: recentEnquiry.status,
          customerName: recentEnquiry.name,
          phone: recentEnquiry.phone,
          subject: recentEnquiry.subject || recentEnquiry.destinationCircuit,
        },
        enquiry: recentEnquiry,
      });
    }

    // Generate formatted Sequential ID: INQ-YYYYMMDD-XXX
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, "");
    const totalCount = await prisma.enquiry.count();
    let seqNum = totalCount + 1;
    let inquiryId = `INQ-${dateStr}-${String(seqNum).padStart(3, "0")}`;

    let exists = await prisma.enquiry.findUnique({ where: { id: inquiryId } });
    while (exists) {
      seqNum += 1;
      inquiryId = `INQ-${dateStr}-${String(seqNum).padStart(3, "0")}`;
      exists = await prisma.enquiry.findUnique({ where: { id: inquiryId } });
    }

    // Link or create customer
    let customer = await prisma.customer.findFirst({
      where: { phone: phone.trim() },
    });

    if (!customer) {
      try {
        customer = await prisma.customer.create({
          data: {
            name: sanitizedName,
            phone: phone.trim(),
            email: sanitizedEmail,
            city: resolvedPickup,
          },
        });
      } catch (custErr) {
        console.warn("Could not upsert customer record:", custErr.message);
      }
    }

    const enquiry = await prisma.enquiry.create({
      data: {
        id: inquiryId,
        customerId: customer ? customer.id : null,
        name: sanitizedName,
        phone: phone.trim(),
        email: sanitizedEmail,
        pickupLocation: resolvedPickup,
        destinationCircuit: resolvedDestination,
        subject: rawSubject,
        travelDate: validTravelDate,
        passengers: resolvedPassengers,
        vehicleChoice: resolvedVehicle,
        message: sanitizedMessage || null,
        estimatedFare: estimatedFare ? Number(estimatedFare) : null,
        status: "NEW",
        crmStatus: "SUCCESS",
        whatsappStatus: "PENDING",
        source: resolvedSource,
      },
    });

    await prisma.systemNotification.create({
      data: {
        title: `New Inquiry: ${inquiryId}`,
        message: `${sanitizedName} requested ${rawSubject} (${phone.trim()})`,
        type: "ENQUIRY",
        link: "/enquiries",
      },
    });

    // Dispatch WhatsApp Notification (Non-blocking / Background safe)
    let whatsappStatus = "FAILED";
    try {
      const waResult = await sendAdminWhatsAppNotification({
        inquiryId: enquiry.id,
        name: sanitizedName,
        phone: phone.trim(),
        email: sanitizedEmail,
        subject: rawSubject,
        pickupLocation: resolvedPickup,
        destination: resolvedDestination,
        destinationCircuit: resolvedDestination,
        travelDate: validTravelDate,
        passengers: resolvedPassengers,
        vehicleChoice: resolvedVehicle,
        message: sanitizedMessage,
        source: resolvedSource,
        createdAt: enquiry.createdAt,
      });

      whatsappStatus = waResult.status === "SENT" ? "SENT" : "FAILED";
      await prisma.enquiry.update({
        where: { id: enquiry.id },
        data: { whatsappStatus },
      });
    } catch (waErr) {
      console.error("[WhatsApp Integration Catch]:", waErr.message);
      whatsappStatus = "FAILED";
      await prisma.enquiry.update({
        where: { id: enquiry.id },
        data: { whatsappStatus: "FAILED" },
      });
    }

    return res.status(201).json({
      success: true,
      message: "Inquiry submitted successfully",
      inquiryId: enquiry.id,
      crmStatus: "SUCCESS",
      whatsappStatus,
      data: {
        inquiryId: enquiry.id,
        leadId: enquiry.id,
        status: enquiry.status,
        customerName: enquiry.name,
        phone: enquiry.phone,
        subject: enquiry.subject || enquiry.destinationCircuit,
        createdAt: enquiry.createdAt,
      },
      enquiry,
    });
  } catch (error) {
    next(error);
  }
}

// GET /api/enquiries/:id, /api/inquiries/:id
async function getEnquiryById(req, res, next) {
  try {
    const enquiry = await prisma.enquiry.findUnique({
      where: { id: req.params.id },
      include: { customer: true },
    });

    if (!enquiry) {
      return res.status(404).json({ success: false, error: "Inquiry not found" });
    }

    return res.status(200).json({
      success: true,
      enquiry,
      inquiry: enquiry,
    });
  } catch (error) {
    next(error);
  }
}

// PATCH /api/enquiries/:id, /api/inquiries/:id
async function updateEnquiry(req, res, next) {
  try {
    const { status, internalNotes, retryWhatsApp } = req.body;

    const existing = await prisma.enquiry.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      return res.status(404).json({ success: false, error: "Inquiry not found" });
    }

    const data = {};
    if (status !== undefined) data.status = status;
    if (internalNotes !== undefined) data.internalNotes = internalNotes;

    if (retryWhatsApp) {
      const waRes = await sendAdminWhatsAppNotification({
        name: existing.name,
        phone: existing.phone,
        email: existing.email,
        subject: existing.subject || existing.destinationCircuit,
        destinationCircuit: existing.destinationCircuit,
        travelDate: existing.travelDate,
        passengers: existing.passengers,
        message: existing.message,
        source: existing.source,
        createdAt: existing.createdAt,
      });

      data.whatsappStatus = waRes.status === "SENT" ? "SENT" : "FAILED";
    }

    const updated = await prisma.enquiry.update({
      where: { id: req.params.id },
      data,
    });

    return res.status(200).json({
      success: true,
      message: "Inquiry updated successfully",
      enquiry: updated,
      inquiry: updated,
    });
  } catch (error) {
    next(error);
  }
}

// DELETE /api/enquiries/:id, /api/inquiries/:id
async function deleteEnquiry(req, res, next) {
  try {
    await prisma.enquiry.delete({
      where: { id: req.params.id },
    });
    return res.status(200).json({ success: true, message: "Inquiry deleted successfully" });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getEnquiries,
  createEnquiry,
  getEnquiryById,
  updateEnquiry,
  deleteEnquiry,
};
