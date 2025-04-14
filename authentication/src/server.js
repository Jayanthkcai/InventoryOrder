// Import necessary modules
import envVal from "./config/envload.js"; // Load environment variables

const result = envVal;

if (result.error) {
  console.error("Failed to load .env file:", result.error);
} else {
  console.log(".env file loaded successfully-1");
}

import express from "express";
import mongoose from "mongoose";
import config from "./config/mongoconfig.js"; // Assuming mongo.js exports config object
import logger from "./middleware/logger.js"; // Custom logger middleware

// Routes

import userController from "./commands/users/user.controller.js";
import loginController from "./commands/login/login.controller.js";
import forgotPWDController from "./commands/forgotpassword/forgotpwd.controller.js";

// Event Bus Setup (Assuming there's a directory for events)
import eventBus from "./events/eventBus.js";

// Initialize the Express app
const app = express();

// Middleware Setup
app.use(express.json()); // JSON parser middleware
// Custom logging middleware
app.use((req, res, next) => {
  req.logger = logger;
  next();
});

// Define routes
app.use("/user", userController);
app.use("/authlogin", loginController);
app.use("/forgotpwd", forgotPWDController);

// Connect to the database
if (mongoose.connection.readyState === 0) {
  mongoose
    .connect(config.uri, config.options)
    .then(() => {
      logger.info("Database connected successfully -");
      // Start the server
      const PORT = process.env.HOST_PORTA || 3002;
      app.listen(PORT, () => {
        logger.info(`Server is running on http://localhost:${PORT}`);
      });
    })
    .catch((err) => {
      logger.error("Database connection error:", err);
    });
} else {
  // Start the server
  // console.log(process.env);
  const PORT = process.env.HOST_PORTA || 3002;
  // logger.info("process path ", process.env);
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

export default app; // Export the app for testing or use elsewhere
