import envVal from "../config/envload.js"; // Load environment variables

const result = envVal;

import pino from "pino";
import winston from "winston";
import "winston-mongodb"; // Import the MongoDB transport
import mongoose from "mongoose";

// Pino Logger Configuration
const pinoLogger = pino({
  level: "info",
  transport: {
    target: "pino-pretty", // Use the pino-pretty transport
    options: {
      colorize: true, // Enable colorized output
      translateTime: "SYS:standard", // Format the timestamp
      ignore: "pid,hostname", // Exclude certain fields
    },
  },
});

// MongoDB Connection String
const MONGO_URL =
  process.env.MONGO_URL ||
  "mongodb://admin:Password123@mongodb:27017/logs?authSource=admin&retryWrites=true&w=majority";

console.log("MongoDB URL --:", MONGO_URL);

// MongoDB Transport for Winston
const mongoTransport = new winston.transports.MongoDB({
  db: MONGO_URL,
  collection: "winston_logs", // MongoDB collection for logs
  // options: {
  //     useUnifiedTopology: true,
  // },
});

// Custom Transport to Delegate Logging to Pino
class PinoTransport extends winston.Transport {
  log(info, callback) {
    setImmediate(() => this.emit("logged", info));
    pinoLogger[info.level]
      ? pinoLogger[info.level](info.message)
      : pinoLogger.info(info.message);
    callback();
  }
}

// Winston Logger Configuration
const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(), // Console Transport
    new PinoTransport(), // Custom Pino Transport
    mongoTransport, // MongoDB Transport
  ],
});

// Log Messages
logger.info("Logger initialized successfully.");

// Connect to MongoDB Using Mongoose
mongoose
  .connect(MONGO_URL, {
    //  useNewUrlParser: true,
    //  useUnifiedTopology: true,
  })
  .then(() => {
    logger.info("MongoDB connected successfully.");
  })
  .catch((err) => {
    logger.error(`MongoDB connection error: ${err.message}`, { error: err });
  });

export default logger;
