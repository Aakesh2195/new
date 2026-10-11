import mongoose from "mongoose";

const questionSchema = new mongoose.Schema({
  question: { type: String, required: true, trim: true },
  options: {
    type: [String],
    required: true,
    validate: {
      validator: (value) => value.length === 4,
      message: "Each question must have exactly four options.",
    },
  },
  correctAnswer: { type: Number, required: true, min: 0, max: 3 },
}, { _id: true });

const quizSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true, index: true },
  topic: { type: String, required: true, trim: true, minlength: 2, maxlength: 150 },
  questions: {
    type: [questionSchema],
    required: true,
    validate: {
      validator: (value) => value.length > 0,
      message: "A quiz must contain at least one question.",
    },
  },
  passPercent: { type: Number, required: true, min: 1, max: 100, default: 70 },
}, { timestamps: true });

export default mongoose.model("Quiz", quizSchema);
