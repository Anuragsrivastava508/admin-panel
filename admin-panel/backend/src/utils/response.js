/**
 * Standardized API response formatters
 */

function sendSuccess(res, data = {}, message = null, status = 200) {
  const payload = { success: true };
  if (message) payload.message = message;
  if (typeof data === "object" && data !== null && !Array.isArray(data)) {
    Object.assign(payload, data);
  } else {
    payload.data = data;
  }
  return res.status(status).json(payload);
}

function sendError(res, message = "An error occurred", status = 500, details = null) {
  const payload = {
    success: false,
    error: message,
  };
  if (details) payload.details = details;
  return res.status(status).json(payload);
}

module.exports = {
  sendSuccess,
  sendError,
};
