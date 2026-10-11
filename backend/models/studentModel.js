import mongoose from "mongoose";

// Kept for compatibility with the original project.
// Student profile data is intentionally stored in User with role: "student".
const studentSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  age: { type: Number, required: true, min: 5, max: 100 },
  city: { type: String, required: true, trim: true },
}, { timestamps: true });

export default mongoose.model("Student", studentSchema);
