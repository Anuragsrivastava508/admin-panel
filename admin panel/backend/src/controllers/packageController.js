const crypto = require("crypto");
const prisma = require("../config/db");

// GET /api/packages, /api/tours
async function getPackages(req, res, next) {
  try {
    const packages = await prisma.tripPackage.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { bookings: true },
        },
      },
    });

    return res.status(200).json({ success: true, packages, tours: packages });
  } catch (error) {
    next(error);
  }
}

// GET /api/packages/:id, /api/tours/:id
async function getPackageById(req, res, next) {
  try {
    const { id } = req.params;
    const pkg = await prisma.tripPackage.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
      include: {
        _count: {
          select: { bookings: true },
        },
      },
    });

    if (!pkg) {
      return res.status(404).json({ success: false, error: "Package not found" });
    }

    return res.status(200).json({ success: true, package: pkg, tour: pkg });
  } catch (error) {
    next(error);
  }
}

// POST /api/packages, /api/tours
async function createPackage(req, res, next) {
  try {
    const {
      title,
      destination,
      startingLocation,
      duration,
      distanceKm,
      basePrice,
      priceType,
      featured,
      status,
      overview,
      includedServices,
      excludedServices,
      images,
      highlightBadge,
    } = req.body;

    if (!title || !destination) {
      return res.status(400).json({ error: "Title and destination are required" });
    }

    let baseSlug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
    if (!baseSlug) baseSlug = "package";

    let slug = baseSlug;
    const existing = await prisma.tripPackage.findUnique({ where: { slug } });
    if (existing) {
      slug = `${baseSlug}-${crypto.randomBytes(3).toString("hex")}`;
    }

    const newPackage = await prisma.tripPackage.create({
      data: {
        title: title.trim(),
        slug,
        destination: destination.trim(),
        startingLocation: startingLocation ? startingLocation.trim() : null,
        duration: duration ? duration.trim() : null,
        distanceKm: distanceKm !== undefined && distanceKm !== "" ? Number(distanceKm) : null,
        basePrice: Number(basePrice) || 0,
        priceType: priceType || "KM-Based Fare",
        featured: Boolean(featured),
        status: status || "ACTIVE",
        overview: overview ? overview.trim() : null,
        includedServices: includedServices ? includedServices.trim() : null,
        excludedServices: excludedServices ? excludedServices.trim() : null,
        images: images ? images.trim() : null,
        highlightBadge: highlightBadge ? highlightBadge.trim() : null,
      },
    });

    return res.status(201).json({ success: true, package: newPackage, tour: newPackage });
  } catch (error) {
    next(error);
  }
}

// PATCH /api/packages/:id, /api/tours/:id
async function updatePackage(req, res, next) {
  try {
    const {
      title,
      destination,
      startingLocation,
      duration,
      distanceKm,
      basePrice,
      priceType,
      featured,
      status,
      overview,
      includedServices,
      excludedServices,
      images,
      highlightBadge,
    } = req.body;

    const data = {};
    if (title !== undefined) data.title = title.trim();
    if (destination !== undefined) data.destination = destination.trim();
    if (startingLocation !== undefined) data.startingLocation = startingLocation ? startingLocation.trim() : null;
    if (duration !== undefined) data.duration = duration ? duration.trim() : null;
    if (distanceKm !== undefined) data.distanceKm = distanceKm !== "" ? Number(distanceKm) : null;
    if (basePrice !== undefined) data.basePrice = Number(basePrice);
    if (priceType !== undefined) data.priceType = priceType;
    if (featured !== undefined) data.featured = Boolean(featured);
    if (status !== undefined) data.status = status;
    if (overview !== undefined) data.overview = overview;
    if (includedServices !== undefined) data.includedServices = includedServices;
    if (excludedServices !== undefined) data.excludedServices = excludedServices;
    if (images !== undefined) data.images = images;
    if (highlightBadge !== undefined) data.highlightBadge = highlightBadge;

    const updated = await prisma.tripPackage.update({
      where: { id: req.params.id },
      data,
    });

    return res.status(200).json({ success: true, package: updated, tour: updated });
  } catch (error) {
    next(error);
  }
}

// DELETE /api/packages/:id, /api/tours/:id
async function deletePackage(req, res, next) {
  try {
    await prisma.tripPackage.delete({
      where: { id: req.params.id },
    });
    return res.status(200).json({ success: true, message: "Package deleted successfully" });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getPackages,
  getPackageById,
  createPackage,
  updatePackage,
  deletePackage,
};
