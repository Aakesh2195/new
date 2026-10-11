import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

const generateToken = (user) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is missing from the environment.");
  }

  return jwt.sign(
    { id: user._id.toString(), role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );
};

export const signup = async (req, res) => {
  try {
    const name = req.body.name?.trim();
    const city = req.body.city?.trim();
    const email = req.body.email?.trim().toLowerCase();
    const age = Number(req.body.age);
    const password = req.body.password;

    if (!name || !city || !email || !password || !Number.isInteger(age)) {
      return res.status(400).json({ success: false, message: "Name, age, city, email and password are required." });
    }
    if (age < 5 || age > 100) {
      return res.status(400).json({ success: false, message: "Age must be between 5 and 100." });
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, message: "Password must contain at least 6 characters." });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ success: false, message: "An account with this email already exists." });
    }

    const user = await User.create({ name, age, city, email, password, role: "student" });

    return res.status(201).json({
      success: true,
      message: "Student account created successfully.",
      data: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    console.error("SIGNUP ERROR:", error);
    return res.status(500).json({ success: false, message: "Unable to create account." });
  }
};

export const login = async (req, res) => {
  try {
    const email = req.body.email?.trim().toLowerCase();
    const password = req.body.password;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required." });
    }

    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: "Invalid email or password." });
    }

    const token = generateToken(user);

    return res.json({
      success: true,
      token,
      role: user.role,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error);
    return res.status(500).json({ success: false, message: "Unable to login." });
  }
};
