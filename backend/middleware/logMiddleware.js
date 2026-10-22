const logger = require("../utils/logger");

const sensitiveFields = [
  "password",
  "confirmPassword",
  "oldPassword",
  "newPassword",
  "token",
  "accessToken",
  "refreshToken",
  "otp",
  "secret",
  "apiKey",
  "authorization"
];

function sanitize(data) {
  if (!data) return data;

  if (Array.isArray(data)) {
    return data.map(sanitize);
  }

  if (typeof data === "object") {
    const result = {};

    for (const key in data) {
      if (sensitiveFields.includes(key)) {
        result[key] = "[REDACTED]";
      } else {
        result[key] = sanitize(data[key]);
      }
    }

    return result;
  }

  return data;
}

const logMiddleware = (req, res, next) => {
  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;
    const { method, originalUrl } = req;
    const { statusCode } = res;

    let level = "info";
    if (statusCode >= 500) level = "error";
    else if (statusCode >= 400) level = "warn";
    else if (statusCode >= 300) level = "http";

    logger.log(level, `${method} ${originalUrl} ${statusCode} - ${duration}ms`, {
      ip: req.ip,
      userAgent: req.headers["user-agent"],
      userId: req.user?.id || null,
      userEmail: req.user?.email,
      role: req.user?.role || null,
      query: req.query,
      body: sanitize(req.body)
    });
  });

  next();
};

module.exports = logMiddleware;
