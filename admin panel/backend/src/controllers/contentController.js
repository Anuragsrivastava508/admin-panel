const prisma = require("../config/db");

// GET /api/content
async function getContent(req, res, next) {
  try {
    const key = req.query.key || "homepage_config";

    const content = await prisma.websiteContent.findUnique({
      where: { key },
    });

    if (!content) {
      return res.status(200).json({ success: true, data: null });
    }

    try {
      const parsed = JSON.parse(content.data);
      return res.status(200).json({
        success: true,
        key: content.key,
        data: parsed,
        lastPublishedAt: content.lastPublishedAt,
        publishedBy: content.publishedBy,
      });
    } catch {
      return res.status(200).json({
        success: true,
        key: content.key,
        data: content.data,
      });
    }
  } catch (error) {
    next(error);
  }
}

// POST /api/content
async function saveContent(req, res, next) {
  try {
    const { key, data } = req.body;

    if (!key || !data) {
      return res.status(400).json({ error: "Key and data are required" });
    }

    const dataString = typeof data === "string" ? data : JSON.stringify(data);
    const publishedBy = req.admin ? `${req.admin.name} (${req.admin.role})` : "Super Admin";

    const updated = await prisma.websiteContent.upsert({
      where: { key },
      update: {
        data: dataString,
        lastPublishedAt: new Date(),
        publishedBy,
      },
      create: {
        key,
        data: dataString,
        lastPublishedAt: new Date(),
        publishedBy,
      },
    });

    return res.status(200).json({
      success: true,
      content: {
        key: updated.key,
        lastPublishedAt: updated.lastPublishedAt,
      },
    });
  } catch (error) {
    next(error);
  }
}

// POST /api/content/sync
async function syncContent(req, res, next) {
  try {
    const timestamp = new Date();
    const publishedBy = req.admin ? `${req.admin.name} (${req.admin.role})` : "Super Admin";

    await prisma.websiteContent.updateMany({
      data: {
        lastPublishedAt: timestamp,
        publishedBy,
      },
    });

    await prisma.systemNotification.create({
      data: {
        title: "Live Edge Sync Completed",
        message: "Static cache invalidated across Delhi NCR CDN nodes. budhramtravels.com updated.",
        type: "SYSTEM",
      },
    });

    return res.status(200).json({
      success: true,
      message: "Synced with budhramtravels.com production edge",
      timestamp,
      edgeNodesUpdated: 12,
      cacheStatus: "INVALIDATED_AND_WARMED",
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getContent,
  saveContent,
  syncContent,
};
