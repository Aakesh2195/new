import mongoose from "mongoose";

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, minlength: 2, maxlength: 150 },
  description: { type: String, required: true, trim: true, minlength: 2, maxlength: 1000 },
}, { timestamps: true });

export default mongoose.model("Course", courseSchema);
