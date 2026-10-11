import mongoose from "mongoose";

let connectionPromise;

const connectDB = async () => {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    throw new Error("MONGO_URI is missing. Configure it in backend/.env or your deployment environment.");
  }

  if (mongoose.connection.readyState === 1) return;
  if (connectionPromise) return connectionPromise;

  connectionPromise = mongoose.connect(uri, { maxPoolSize: 10 })
    .then(() => {
      console.log(`MongoDB connected: ${mongoose.connection.name}`);
    })
    .catch((error) => {
      console.error("MongoDB connection failed:", error.message);
      throw error;
    })
    .finally(() => {
      connectionPromise = undefined;
    });

  await connectionPromise;
};

export default connectDB;
