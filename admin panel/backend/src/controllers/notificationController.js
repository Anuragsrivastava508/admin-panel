const prisma = require("../config/db");

// GET /api/notifications
async function getNotifications(req, res, next) {
  try {
    const notifications = await prisma.systemNotification.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    const unreadCount = await prisma.systemNotification.count({
      where: { read: false },
    });

    return res.status(200).json({
      success: true,
      unreadCount,
      notifications,
    });
  } catch (error) {
    next(error);
  }
}

// PATCH /api/notifications/:id
async function markRead(req, res, next) {
  try {
    const updated = await prisma.systemNotification.update({
      where: { id: req.params.id },
      data: { read: true },
    });

    return res.status(200).json({ success: true, notification: updated });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getNotifications,
  markRead,
};
