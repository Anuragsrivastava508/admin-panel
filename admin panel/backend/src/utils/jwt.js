const jwt = require("jsonwebtoken");
const env = require("../config/env");

function signToken(payload, expiresIn = "7d") {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn });
}

function verifyToken(token) {
  try {
    return jwt.verify(token, env.JWT_SECRET);
  } catch {
    return null;
  }
}

module.exports = {
  signToken,
  verifyToken,
};
