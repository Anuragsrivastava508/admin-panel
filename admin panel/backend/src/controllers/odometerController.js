const prisma = require("../config/db");

// GET /api/odometer
async function getOdometerLogs(req, res, next) {
  try {
    const logs = await prisma.odometerLog.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        vehicle: true,
        driver: true,
      },
    });

    return res.status(200).json({ success: true, logs });
  } catch (error) {
    next(error);
  }
}

// POST /api/odometer
async function createOdometerLog(req, res, next) {
  try {
    const {
      vehicleId,
      driverId,
      tripPnr,
      startOdometer,
      endOdometer,
      fuelLitres,
      fuelCost,
      tollTaxes,
      auditStatus,
      notes,
    } = req.body;

    if (!vehicleId || startOdometer === undefined) {
      return res.status(400).json({ error: "Vehicle and start odometer are required" });
    }

    const start = Number(startOdometer);
    const end = endOdometer ? Number(endOdometer) : null;
    const totalKm = end && end > start ? end - start : null;

    const log = await prisma.odometerLog.create({
      data: {
        vehicleId,
        driverId: driverId || null,
        tripPnr: tripPnr || null,
        startOdometer: start,
        endOdometer: end,
        totalKm,
        billableKm: totalKm,
        fuelLitres: fuelLitres ? Number(fuelLitres) : null,
        fuelCost: fuelCost ? Number(fuelCost) : null,
        tollTaxes: tollTaxes ? Number(tollTaxes) : 0,
        variancePercent: 0.05,
        auditStatus: auditStatus || "VERIFIED_HONEST_KM",
        notes: notes || null,
      },
      include: {
        vehicle: true,
        driver: true,
      },
    });

    if (end && end > start) {
      await prisma.vehicle.update({
        where: { id: vehicleId },
        data: { currentOdometer: end },
      });
    }

    return res.status(201).json({ success: true, log });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getOdometerLogs,
  createOdometerLog,
};
