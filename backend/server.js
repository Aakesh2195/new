import dotenv from "dotenv";
import { fileURLToPath } from "url";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";

import connectDB from "./config/database.js";
import seedDefaultData from "./config/seed.js";

import authRoutes from "./routes/authRoutes.js";
import testRoutes from "./routes/testRoutes.js";
import courseRoutes from "./routes/courseRoutes.js";
import enrollmentRoutes from "./routes/enrollmentRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import studentRoutes from "./routes/studentRoutes.js";
import quizRoutes from "./routes/quizRoutes.js";

dotenv.config({ path: fileURLToPath(new URL("./.env", import.meta.url)) });

const app = express();
const PORT = Number(process.env.PORT) || 5000;
const API_PREFIX = process.env.VERCEL ? "/api" : "";
const configuredOrigins = (process.env.FRONTEND_URL || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
const vercelOrigins = [process.env.VERCEL_URL, process.env.VERCEL_BRANCH_URL]
  .filter(Boolean)
  .map((origin) => origin.startsWith("http") ? origin : `https://${origin}`);
const allowedOrigins = [...configuredOrigins, ...vercelOrigins]
  .map((origin) => origin.replace(/\/+$/, ""));

app.use(cors({
  origin: (origin, callback) => {
    // Allow server-to-server requests and configured browser origins.
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error("CORS origin not allowed."));
  },
  credentials: true,
}));

app.use(express.json({ limit: "1mb" }));

app.get(`${API_PREFIX}/`, (req, res) => {
  res.json({ success: true, message: "ScholarStack API is running" });
});

app.get(`${API_PREFIX}/health`, (req, res) => {
  const connected = mongoose.connection.readyState === 1;
  res.status(connected ? 200 : 503).json({
    success: connected,
    database: connected ? "connected" : "disconnected",
    timestamp: new Date().toISOString(),
  });
});

app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    next(error);
  }
});

app.use(`${API_PREFIX}/auth`, authRoutes);
app.use(`${API_PREFIX}/test`, testRoutes);
app.use(`${API_PREFIX}/students`, studentRoutes);
app.use(`${API_PREFIX}/courses`, courseRoutes);
app.use(`${API_PREFIX}/enroll`, enrollmentRoutes);
app.use(`${API_PREFIX}/quiz`, quizRoutes);
app.use(`${API_PREFIX}/admin`, adminRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

app.use((error, req, res, next) => {
  console.error("UNHANDLED ERROR:", error);
  res.status(error.message === "CORS origin not allowed." ? 403 : 500).json({
    success: false,
    message: error.message === "CORS origin not allowed."
      ? "Request origin is not allowed by the backend."
      : "Internal server error.",
  });
});

const startServer = async () => {
  try {
    await connectDB();
    await seedDefaultData();

    const server = app.listen(PORT, () => {
      console.log(`ScholarStack API running at http://localhost:${PORT}`);
      console.log(`Allowed frontend origins: ${allowedOrigins.join(", ")}`);
    });

    const shutdown = async (signal) => {
      console.log(`${signal} received. Shutting down...`);
      server.close(async () => {
        await mongoose.connection.close();
        process.exit(0);
      });
    };

    process.once("SIGINT", () => shutdown("SIGINT"));
    process.once("SIGTERM", () => shutdown("SIGTERM"));
  } catch (error) {
    console.error("Server startup failed:", error.message);
    process.exit(1);
  }
};

if (!process.env.VERCEL) {
  startServer();
}

export default app;
