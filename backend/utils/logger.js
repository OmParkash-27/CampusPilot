const winston = require("winston");
const path = require("path");
const fs = require("fs");
const DailyRotateFile = require("winston-daily-rotate-file");

const logDir = path.join(__dirname, "../logs");
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

// Custom format
const customFormat = winston.format.printf(({ level, message, timestamp, stack, ...meta }) => {
  return `[${timestamp}] ${level.toUpperCase()}: ${stack || message} ${
    Object.keys(meta).length ? JSON.stringify(meta) : ""
  }`;
});

// Rotation config
const rotateOptions = {
  datePattern: "YYYY-MM-DD",   // ✅ fixed
  maxFiles: "2d",              // auto delete after 2 days
};

// Logger
const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }), // ✅ fixed
    winston.format.errors({ stack: true })
  ),

  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        winston.format.errors({ stack: true }),
        customFormat
      )
    }),

    //  Error logs (ROTATED)
    new DailyRotateFile({
      filename: path.join(logDir, "error-%DATE%.log"),
      level: "error",
      ...rotateOptions,
      format: winston.format.combine(
        winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        winston.format.errors({ stack: true }),
        customFormat
      )
    }),

    //  Combined logs (ROTATED)
    new DailyRotateFile({
      filename: path.join(logDir, "combined-%DATE%.log"),
      ...rotateOptions,
      format: winston.format.combine(
        winston.format.errors({ stack: true }),
        winston.format.json()
      )
    })
  ],

  //  Exception logs (ROTATED)
  exceptionHandlers: [
    new DailyRotateFile({
      filename: path.join(logDir, "exceptions-%DATE%.log"),
      ...rotateOptions,
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
      )
    })
  ],

  // Rejection logs (ROTATED)
  rejectionHandlers: [
    new DailyRotateFile({
      filename: path.join(logDir, "rejections-%DATE%.log"),
      ...rotateOptions,
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