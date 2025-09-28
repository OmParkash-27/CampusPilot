const logger = require("../utils/logger");

const errorHandler = (err, req, res, next) => {
  logger.error(err.message, {
    ip: req.ip,
    method: req.method,
    url: req.originalUrl,
    stack: err.stack,
    userAgent: req.headers["user-agent"],
    userId: req.user?._id || null,
    role: req.user?.role || null,
    query: req.query,
    body: req.body
  });
  const statusCode = err.statusCode || 500;
  const message = err.message || "Something went wrong!";
  res.status(statusCode).json({ message });
};

module.exports = errorHandler;
