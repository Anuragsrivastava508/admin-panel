const prisma = require("../config/db");

// GET /api/drivers
async function getDrivers(req, res, next) {
  try {
    const drivers = await prisma.driver.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        vehicles: true,
      },
    });

    return res.status(200).json({ success: true, drivers });
  } catch (error) {
    next(error);
  }
}

// POST /api/drivers
async function createDriver(req, res, next) {
  try {
    const {
      name,
      phone,
      licenseNumber,
      experienceYears,
      certifiedPasses,
      status,
      photoUrl,
    } = req.body;

    if (!name || !phone || !licenseNumber) {
      return res.status(400).json({ error: "Name, phone, and license number are required" });
    }

    const driver = await prisma.driver.create({
      data: {
        name: name.trim(),
        phone: phone.trim(),
        licenseNumber: licenseNumber.trim().toUpperCase(),
        experienceYears: Number(experienceYears) || 0,
        certifiedPasses: certifiedPasses ? certifiedPasses.trim() : "",
        status: status || "AVAILABLE",
        rating: 5.0,
        photoUrl: photoUrl || null,
      },
    });

    return res.status(201).json({ success: true, driver });
  } catch (error) {
    next(error);
  }
}

// PATCH /api/drivers/:id
async function updateDriver(req, res, next) {
  try {
    const { name, phone, status, rating, experienceYears, certifiedPasses, photoUrl } = req.body;

    const data = {};
    if (name !== undefined) data.name = name;
    if (phone !== undefined) data.phone = phone;
    if (status !== undefined) data.status = status;
    if (rating !== undefined) data.rating = Number(rating);
    if (experienceYears !== undefined) data.experienceYears = Number(experienceYears);
    if (certifiedPasses !== undefined) data.certifiedPasses = certifiedPasses;
    if (photoUrl !== undefined) data.photoUrl = photoUrl;

    const updated = await prisma.driver.update({
      where: { id: req.params.id },
      data,
    });

    return res.status(200).json({ success: true, driver: updated });
  } catch (error) {
    next(error);
  }
}

// DELETE /api/drivers/:id
async function deleteDriver(req, res, next) {
  try {
    await prisma.driver.delete({
      where: { id: req.params.id },
    });
    return res.status(200).json({ success: true, message: "Driver deleted successfully" });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getDrivers,
  createDriver,
  updateDriver,
  deleteDriver,
};
