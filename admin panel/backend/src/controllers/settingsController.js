const prisma = require("../config/db");

// GET /api/settings
async function getSettings(req, res, next) {
  try {
    const [siteSetting, fareSettings, routeAdvisories] = await Promise.all([
      prisma.siteSetting.findUnique({
        where: { id: "default" },
      }),
      prisma.fareSetting.findMany({
        orderBy: { effectiveFrom: "desc" },
      }),
      prisma.routeAdvisory.findMany({
        orderBy: { updatedAt: "desc" },
      }),
    ]);

    return res.status(200).json({
      success: true,
      siteSetting,
      fareSettings,
      routeAdvisories,
      settings: siteSetting,
    });
  } catch (error) {
    next(error);
  }
}

// PUT /api/settings, PATCH /api/settings
async function updateSettings(req, res, next) {
  try {
    const {
      agencyName,
      phone,
      alternatePhone,
      email,
      address,
      gstNumber,
      honestKmPledgeText,
      defaultTerms,
    } = req.body;

    const data = {};
    if (agencyName !== undefined) data.agencyName = agencyName.trim();
    if (phone !== undefined) data.phone = phone.trim();
    if (alternatePhone !== undefined) data.alternatePhone = alternatePhone ? alternatePhone.trim() : null;
    if (email !== undefined) data.email = email.trim();
    if (address !== undefined) data.address = address.trim();
    if (gstNumber !== undefined) data.gstNumber = gstNumber ? gstNumber.trim() : null;
    if (honestKmPledgeText !== undefined) data.honestKmPledgeText = honestKmPledgeText;
    if (defaultTerms !== undefined) data.defaultTerms = defaultTerms;

    const updated = await prisma.siteSetting.upsert({
      where: { id: "default" },
      update: data,
      create: {
        id: "default",
        agencyName: agencyName ? agencyName.trim() : "Budhram Tour And Travels",
        phone: phone ? phone.trim() : "+91 9310847853",
        email: email ? email.trim() : "info@budhramtravels.com",
        address: address ? address.trim() : "Majnu Ka Tilla / ISBT Kashmiri Gate Fleet Hub, Delhi NCR",
        ...data,
      },
    });

    return res.status(200).json({ success: true, settings: updated, siteSetting: updated });
  } catch (error) {
    next(error);
  }
}

// POST /api/settings/fare
async function saveFareSetting(req, res, next) {
  try {
    const {
      vehicleTier,
      baseRatePerKm,
      driverAllowancePerDay,
      nightHaltPerNight,
      hillStateSurchargePerDay,
      minKmPerDay,
    } = req.body;

    if (!vehicleTier || baseRatePerKm === undefined) {
      return res.status(400).json({ error: "Vehicle tier and base rate per km are required" });
    }

    const fare = await prisma.fareSetting.create({
      data: {
        vehicleTier: vehicleTier.trim(),
        baseRatePerKm: Number(baseRatePerKm),
        driverAllowancePerDay: Number(driverAllowancePerDay) || 500,
        nightHaltPerNight: Number(nightHaltPerNight) || 0,
        hillStateSurchargePerDay: Number(hillStateSurchargePerDay) || 0,
        minKmPerDay: Number(minKmPerDay) || 250,
      },
    });

    return res.status(201).json({ success: true, fare });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getSettings,
  updateSettings,
  saveFareSetting,
};
