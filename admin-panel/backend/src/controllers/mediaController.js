const prisma = require("../config/db");

// GET /api/media
async function getMedia(req, res, next) {
  try {
    const category = req.query.category;
    const where = {};
    if (category && category !== "ALL") {
      where.category = category;
    }

    const media = await prisma.mediaItem.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return res.status(200).json({ success: true, media });
  } catch (error) {
    next(error);
  }
}

// POST /api/media
async function createMedia(req, res, next) {
  try {
    const { title, category, url, alt, size, isFeatured } = req.body;

    if (!title || !url) {
      return res.status(400).json({ error: "Title and URL are required" });
    }

    const item = await prisma.mediaItem.create({
      data: {
        title: title.trim(),
        category: category || "EXTERIOR",
        url: url.trim(),
        alt: alt || title.trim(),
        size: size || "1.5 MB",
        isFeatured: Boolean(isFeatured),
      },
    });

    return res.status(201).json({ success: true, item });
  } catch (error) {
    next(error);
  }
}

// DELETE /api/media/:id
async function deleteMedia(req, res, next) {
  try {
    await prisma.mediaItem.delete({
      where: { id: req.params.id },
    });
    return res.status(200).json({ success: true, message: "Media deleted successfully" });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getMedia,
  createMedia,
  deleteMedia,
};
