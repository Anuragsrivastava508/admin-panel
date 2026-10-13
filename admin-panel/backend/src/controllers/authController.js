const prisma = require("../config/db");
const { hashPassword, comparePassword } = require("../utils/password");
const { signToken } = require("../utils/jwt");
const env = require("../config/env");

// POST /api/auth/login
async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const searchEmail = email.trim();
    const admin = await prisma.user.findFirst({
      where: {
        OR: [{ email: searchEmail }, { email: searchEmail.toLowerCase() }],
      },
    });

    if (!admin) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const isValid = await comparePassword(password, admin.password);
    if (!isValid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = signToken({
      adminId: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role,
    });

    res.cookie(env.COOKIE_NAME, token, {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: "/",
    });

    return res.status(200).json({
      success: true,
      token,
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        phone: admin.phone,
        avatar: admin.avatar,
      },
    });
  } catch (error) {
    next(error);
  }
}

// POST /api/auth/register
async function register(req, res, next) {
  try {
    const { email, password, name, phone } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: "Name, email, and password are required" });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: "Password must be at least 8 characters long" });
    }

    const searchEmail = email.trim().toLowerCase();

    const existing = await prisma.user.findFirst({
      where: { email: searchEmail },
    });

    if (existing) {
      return res.status(400).json({ error: "An admin account with this email already exists" });
    }

    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        email: searchEmail,
        name: name.trim(),
        password: hashedPassword,
        role: "ADMIN",
        phone: phone ? phone.trim() : null,
      },
    });

    const token = signToken({
      adminId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    res.cookie(env.COOKIE_NAME, token, {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
    });

    return res.status(201).json({
      success: true,
      token,
      admin: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    next(error);
  }
}

// POST /api/auth/logout
async function logout(req, res) {
  res.clearCookie(env.COOKIE_NAME, {
    httpOnly: true,
    path: "/",
  });
  return res.status(200).json({ success: true, message: "Logged out successfully" });
}

// GET /api/auth/me
async function getMe(req, res) {
  if (!req.admin) {
    return res.status(401).json({ authenticated: false, admin: null });
  }
  return res.status(200).json({
    authenticated: true,
    admin: req.admin,
  });
}

// PUT /api/auth/password
async function updatePassword(req, res, next) {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: "Current and new password are required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.admin.id },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const isValid = await comparePassword(currentPassword, user.password);
    if (!isValid) {
      return res.status(400).json({ error: "Incorrect current password" });
    }

    const hashed = await hashPassword(newPassword);
    await prisma.user.update({
      where: { id: req.admin.id },
      data: { password: hashed },
    });

    return res.status(200).json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  login,
  register,
  logout,
  getMe,
  updatePassword,
};
