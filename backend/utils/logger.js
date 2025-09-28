const winston = require("winston");
const path = require("path");
const fs = require("fs");

const logDir = path.join(__dirname, "../logs");
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

// Custom format with stack support
const customFormat = winston.format.printf(({ level, message, timestamp, stack, ...meta }) => {
  return `[${timestamp}] ${level.toUpperCase()}: ${stack || message} ${
    Object.keys(meta).length ? JSON.stringify(meta) : ""
  }`;
});

const logger = winston.createLogger({
    // global for all transport, & can be overite
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.errors({ stack: true })
  ),
  transports: [
    // Console logs
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        winston.format.errors({ stack: true }),
        customFormat
      )
    }),

    // Error logs (with stack trace)
    new winston.transports.File({
        //overite global properties (level, timestamp, errors)
      filename: path.join(logDir, "error.log"),
      level: "error",
      format: winston.format.combine(
        winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        winston.format.errors({ stack: true }),
        customFormat
      )
    }),

    // All logs (json format)
    new winston.transports.File({
        //overite global properties (all type level accept, timestamp, errors, format to display)
      filename: path.join(logDir, "combined.log"),
      format: winston.format.combine(
        winston.format.errors({ stack: true }),
        winston.format.json(),
      )
    })
  ],

  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join(logDir, "exceptions.log"),
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
      )
    })
  ],

  rejectionHandlers: [
    new winston.transports.File({
      filename: path.join(logDir, "rejections.log"),
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
      )
    })
  ],

  exitOnError: false
});

module.exports = logger;
