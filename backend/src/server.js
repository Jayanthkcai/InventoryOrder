// Import necessary modules

import envVal from "./config/envload.js";

const result = envVal;
if (result.error) {
  console.error("Failed to load .env file --:", result.error);
} else {
  console.log(".env file loaded successfully");
}

import express from "express";
import mongoose from "mongoose";
import config from "./config/mongo.js"; // Assuming mongo.js exports config object
import logger from "./middleware/logger.js"; // Custom logger middleware

// Routes
import orderController from "./commands/order/order.controller.js";
import inventoryController from "./commands/inventory/inventory.controller.js";

// Event Bus Setup (Assuming there's a directory for events)
import eventBus from "./events/eventBus.js";

//Import Jobs to start
import listenToInventoryOrderCheck from "./commands/inventory/job/inventoryordercheck.js";
import listenToInventoryOrderRes from "./commands/order/job/inventoryOrderRes.js";

// const result = dotenv.config({ path: './.env' });

// if (result.error) {
//     console.error('Failed to load .env file:', result.error);
// } else {
//     console.log('.env file loaded successfully');
// }

//logger.info(`Env values ${process.env.MONGO_URL}`)

// Initialize the Express app
const app = express();

// Middleware Setup
app.use(express.json()); // JSON parser middleware
// Custom logging middleware
app.use((req, res, next) => {
  req.logger = logger;
  next();
});

logger.info(`mongo url ${process.env.MONGO_URL}`);

// Define routes
app.use("/orders", orderController);
app.use("/inventory", inventoryController);

// Connect to the database
if (mongoose.connection.readyState === 0) {
  mongoose
    .connect(config.uri, config.options)
    .then(() => {
      logger.info("Database connected successfully");
      // Start the server
      const PORT = process.env.HOST_PORT || 3000;
      app.listen(PORT, () => {
        logger.info(`Server is running on http://localhost:${PORT}`);
      });
    })
    .catch((err) => {
      logger.error("Database connection error:", err);
    });
} else {
  // Start the server
  const PORT = process.env.HOST_PORT || 3000;
  app.listen(PORT, () => {
    logger.info(`Server is running on http://localhost:${PORT}`);
  });
}

// Listen for specific events
//eventBus.consume();

// Handle other app-level events
eventBus.publish("error", (error) => {
  logger.info(`Event Bus error:`, error);
});

//Jobs
listenToInventoryOrderCheck();
listenToInventoryOrderRes();

export default app; // Export the app for testing or use elsewhere
