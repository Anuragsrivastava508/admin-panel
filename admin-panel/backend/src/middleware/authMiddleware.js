const { verifyToken } = require("../utils/jwt");
const env = require("../config/env");
const prisma = require("../config/db");

async function protectAdmin(req, res, next) {
  try {
    let token = null;

    // Check authorization header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }

    // Check cookie if header not present
    if (!token && req.cookies && req.cookies[env.COOKIE_NAME]) {
      token = req.cookies[env.COOKIE_NAME];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        authenticated: false,
        error: "Authentication required. Please log in.",
      });
    }

    const payload = verifyToken(token);
    if (!payload || !payload.adminId) {
      return res.status(401).json({
        success: false,
        authenticated: false,
        error: "Session expired or invalid token. Please log in again.",
      });
    }

    const admin = await prisma.user.findUnique({
      where: { id: payload.adminId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        avatar: true,
      },
    });

    if (!admin) {
      return res.status(401).json({
        success: false,
        authenticated: false,
        error: "Admin account not found.",
      });
    }

    req.admin = admin;
    req.user = admin;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    return res.status(401).json({
      success: false,
      authenticated: false,
      error: "Authentication failed.",
    });
  }
}

async function optionalAuth(req, res, next) {
  try {
    let token = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    } else if (req.cookies && req.cookies[env.COOKIE_NAME]) {
      token = req.cookies[env.COOKIE_NAME];
    }

    if (token) {
      const payload = verifyToken(token);
      if (payload && payload.adminId) {
        const admin = await prisma.user.findUnique({
          where: { id: payload.adminId },
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            phone: true,
            avatar: true,
          },
        });
        if (admin) {
          req.admin = admin;
          req.user = admin;
        }
      }
    }
    next();
  } catch {
    next();
  }
}

module.exports = {
  protectAdmin,
  optionalAuth,
};
