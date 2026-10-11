import mongoose from "mongoose";
import User from "../models/userModel.js";
import Enrollment from "../models/enrollmentModel.js";

export const getMyProfile = async (req, res) => {
  try {
    const student = await User.findById(req.user._id).select(
      "_id name age city email role createdAt"
    );

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found.",
      });
    }

    return res.json({ success: true, data: student });
  } catch (error) {
    console.error("PROFILE ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load profile.",
    });
  }
};

export const getStudents = async (req, res) => {
  try {
    const students = await User.find({ role: "student" })
      .select("_id name age city email createdAt")
      .sort({ createdAt: -1 });

    return res.json({ success: true, data: students });
  } catch (error) {
    console.error("GET STUDENTS ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load students.",
    });
  }
};

export const createStudent = async (req, res) => {
  try {
    const name = req.body.name?.trim();
    const city = req.body.city?.trim();
    const email = req.body.email?.trim().toLowerCase();
    const age = Number(req.body.age);
    const password = req.body.password;

    if (!name || !city || !email || !password || !Number.isInteger(age)) {
      return res.status(400).json({
        success: false,
        message: "Name, age, city, email and password are required.",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must contain at least 6 characters.",
      });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(409).json({
        success: false,
        message: "User already exists.",
      });
    }

    const student = await User.create({
      name,
      age,
      city,
      email,
      password,
      role: "student",
    });

    return res.status(201).json({
      success: true,
      message: "Student created successfully.",
      data: student.toSafeJSON(),
    });
  } catch (error) {
    console.error("CREATE STUDENT ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create student.",
    });
  }
};

export const updateStudent = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid student ID.",
      });
    }

    const updates = {};
    if (req.body.name !== undefined) updates.name = req.body.name.trim();
    if (req.body.city !== undefined) updates.city = req.body.city.trim();
    if (req.body.email !== undefined) updates.email = req.body.email.trim().toLowerCase();
    if (req.body.age !== undefined) updates.age = Number(req.body.age);

    const student = await User.findOneAndUpdate(
      { _id: req.params.id, role: "student" },
      updates,
      { new: true, runValidators: true }
    );

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found.",
      });
    }

    return res.json({
      success: true,
      message: "Student updated successfully.",
      data: student.toSafeJSON(),
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Another account already uses that email.",
      });
    }

    console.error("UPDATE STUDENT ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update student.",
    });
  }
};

export const deleteStudent = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid student ID.",
      });
    }

    const student = await User.findOneAndDelete({
      _id: req.params.id,
      role: "student",
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found.",
      });
    }

    await Enrollment.deleteMany({ student: student._id });

    return res.json({
      success: true,
      message: "Student and related enrollments deleted successfully.",
    });
  } catch (error) {
    console.error("DELETE STUDENT ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete student.",
    });
  }
};
