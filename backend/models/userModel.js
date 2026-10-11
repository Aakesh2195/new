import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, minlength: 2, maxlength: 80 },
  age: { type: Number, required: true, min: 5, max: 100 },
  city: { type: String, required: true, trim: true, maxlength: 100 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 160 },
  password: { type: String, required: true, minlength: 6 },
  role: { type: String, enum: ["admin", "student"], default: "student", required: true },
}, { timestamps: true });

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.comparePassword = function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.toSafeJSON = function () {
  return {
    _id: this._id, name: this.name, age: this.age, city: this.city,
    email: this.email, role: this.role, createdAt: this.createdAt,
  };
};

export default mongoose.model("User", userSchema);
