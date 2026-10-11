import dotenv from "dotenv";
import mongoose from "mongoose";
import { fileURLToPath } from "url";
import connectDB from "../config/database.js";
import seedDefaultData from "../config/seed.js";

dotenv.config({ path: fileURLToPath(new URL("../.env", import.meta.url)) });

try {
  await connectDB();
  await seedDefaultData();
} finally {
  await mongoose.connection.close();
}
