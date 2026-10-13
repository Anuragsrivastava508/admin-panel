const prisma = require("../config/db");

// GET /api/vehicles
async function getVehicles(req, res, next) {
  try {
    const vehicles = await prisma.vehicle.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        driver: true,
        odometerLogs: {
          take: 3,
          orderBy: { createdAt: "desc" },
        },
      },
    });

    return res.status(200).json({ success: true, vehicles });
  } catch (error) {
    next(error);
  }
}

// POST /api/vehicles
async function createVehicle(req, res, next) {
  try {
    const {
      regNumber,
      name,
      tier,
      seatingCapacity,
      color,
      features,
      ratePerKm,
      driverAllowancePerDay,
      status,
      currentOdometer,
      assignedDriverId,
      imageUrl,
    } = req.body;

    if (!regNumber || !name) {
      return res.status(400).json({ error: "Registration number and name are required" });
    }

    const existing = await prisma.vehicle.findUnique({
      where: { regNumber: regNumber.trim().toUpperCase() },
    });

    if (existing) {
      return res.status(400).json({ error: "Vehicle with this registration number already exists" });
    }

    const vehicle = await prisma.vehicle.create({
      data: {
        regNumber: regNumber.trim().toUpperCase(),
        name: name.trim(),
        tier: tier || "EXECUTIVE_12S",
        seatingCapacity: Number(seatingCapacity) || 0,
        color: color ? color.trim() : "",
        features: features ? features.trim() : "",
        ratePerKm: Number(ratePerKm) || 0,
        driverAllowancePerDay: Number(driverAllowancePerDay) || 0,
        status: status || "DISPATCH_QUEUED",
        currentOdometer: Number(currentOdometer) || 0,
        assignedDriverId: assignedDriverId || null,
        imageUrl: imageUrl ? imageUrl.trim() : null,
      },
      include: {
        driver: true,
      },
    });

    return res.status(201).json({ success: true, vehicle });
  } catch (error) {
    next(error);
  }
}

// PATCH /api/vehicles/:id
async function updateVehicle(req, res, next) {
  try {
    const {
      name,
      status,
      assignedDriverId,
      currentOdometer,
      ratePerKm,
      driverAllowancePerDay,
      features,
      color,
      imageUrl,
    } = req.body;

    const data = {};
    if (name !== undefined) data.name = name;
    if (status !== undefined) data.status = status;
    if (assignedDriverId !== undefined) data.assignedDriverId = assignedDriverId || null;
    if (currentOdometer !== undefined) data.currentOdometer = Number(currentOdometer);
    if (ratePerKm !== undefined) data.ratePerKm = Number(ratePerKm);
    if (driverAllowancePerDay !== undefined) data.driverAllowancePerDay = Number(driverAllowancePerDay);
    if (features !== undefined) data.features = features;
    if (color !== undefined) data.color = color;
    if (imageUrl !== undefined) data.imageUrl = imageUrl;

    const updated = await prisma.vehicle.update({
      where: { id: req.params.id },
      data,
      include: {
        driver: true,
      },
    });

    return res.status(200).json({ success: true, vehicle: updated });
  } catch (error) {
    next(error);
  }
}

// DELETE /api/vehicles/:id
async function deleteVehicle(req, res, next) {
  try {
    await prisma.vehicle.delete({
      where: { id: req.params.id },
    });
    return res.status(200).json({ success: true, message: "Vehicle deleted successfully" });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getVehicles,
  createVehicle,
  updateVehicle,
  deleteVehicle,
};
