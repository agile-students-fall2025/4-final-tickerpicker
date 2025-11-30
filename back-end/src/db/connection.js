import mongoose from "mongoose";

/**
 * Connects to MongoDB using the connection string from environment variables
 * @returns {Promise<void>}
 */
export async function connectToDatabase() {
  try {
    const mongoUri = process.env.MONGODB_URI;

    if (!mongoUri) {
      throw new Error(
        "MONGODB_URI is not defined in environment variables. Please check your .env file."
      );
    }

    // Connect to MongoDB
    // may have to use .createConnection() if we have more than 1 DB
    await mongoose.connect(mongoUri, {
      // These options are recommended for Mongoose 6+
      // serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      // socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
    });

    console.log("Successfully connected to MongoDB");

    // Handle connection events
    mongoose.connection.on("error", (err) => {
      console.error("MongoDB connection error:", err);
    });

    mongoose.connection.on("disconnected", () => {
      console.warn("MongoDB disconnected");
    });

    // Handle process termination
    process.on("SIGINT", async () => {
      await mongoose.connection.close();
      console.log("MongoDB connection closed through app termination");
      process.exit(0);
    });
  } 
  catch (error) {
    console.error("Error connecting to MongoDB:", error.message);
    throw error;
  }
}

/**
 * Closes the MongoDB connection
 * @returns {Promise<void>}
 */
export async function closeDatabaseConnection() {
  try {
    await mongoose.connection.close();
    console.log("MongoDB connection closed");
  } catch (error) {
    console.error("Error closing MongoDB connection:", error.message);
    throw error;
  }
}

