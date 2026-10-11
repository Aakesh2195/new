import mongoose from "mongoose";
import Course from "../models/courseModel.js";
import Enrollment from "../models/enrollmentModel.js";

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

export const getCourses = async (req, res) => {
  try {
    const courses = await Course.find().sort({ createdAt: -1 });
    return res.json({ success: true, data: courses });
  } catch (error) {
    console.error("GET COURSES ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load courses.",
    });
  }
};

export const createCourse = async (req, res) => {
  try {
    const title = req.body.title?.trim();
    const description = req.body.description?.trim();

    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: "Title and description are required.",
      });
    }

    const course = await Course.create({ title, description });

    return res.status(201).json({
      success: true,
      message: "Course created successfully.",
      data: course,
    });
  } catch (error) {
    console.error("CREATE COURSE ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create course.",
    });
  }
};

export const updateCourse = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid course ID." });
    }

    const title = req.body.title?.trim();
    const description = req.body.description?.trim();

    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: "Title and description are required.",
      });
    }

    const course = await Course.findByIdAndUpdate(
      req.params.id,
      { title, description },
      { new: true, runValidators: true }
    );

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found.",
      });
    }

    return res.json({
      success: true,
      message: "Course updated successfully.",
      data: course,
    });
  } catch (error) {
    console.error("UPDATE COURSE ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update course.",
    });
  }
};

export const deleteCourse = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid course ID." });
    }

    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found.",
      });
    }

    await Enrollment.deleteMany({ course: course._id });
    await course.deleteOne();

    return res.json({
      success: true,
      message: "Course deleted successfully.",
    });
  } catch (error) {
    console.error("DELETE COURSE ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete course.",
    });
  }
};
