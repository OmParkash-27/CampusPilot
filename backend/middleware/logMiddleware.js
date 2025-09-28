const logger = require("../utils/logger");

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
      body: req.body
    });
  });

  next();
};

module.exports = logMiddleware;
