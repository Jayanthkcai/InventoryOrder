import mongoose from "mongoose";

const connectDB = async () => {
  try {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(
        process.env.MONGO_URL ||
          "mongodb://admin:Password123@localhost:27017/logs?authSource=admin&retryWrites=true&w=majority",
        {
          serverSelectionTimeoutMS: 60000, // 60 seconds timeout
          // useNewUrlParser: true,
        }
      );
      console.log("MongoDB connected successfully");
    } else {
      console.log("MongoDB connection already established");
    }
  } catch (error) {
    console.error("Database connection error:", error.message);
    throw error;
  }
};

// Handle Mongoose connection events
mongoose.connection.on("connected", () => {
  console.log("Mongoose connected to the database");
});

mongoose.connection.on("error", (err) => {
  console.error("Mongoose connection error:", err);
});

mongoose.connection.on("disconnected", () => {
  console.log("Mongoose disconnected");
});

export default connectDB;
