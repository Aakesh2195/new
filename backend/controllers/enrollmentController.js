import mongoose from "mongoose";
import Enrollment from "../models/enrollmentModel.js";
import Course from "../models/courseModel.js";

export const enrollCourse = async (req, res) => {
  try {
    const { courseId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({ success: false, message: "Invalid course ID." });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found." });
    }

    const enrollment = await Enrollment.create({
      student: req.user._id,
      course: course._id,
    });

    return res.status(201).json({
      success: true,
      message: "Enrolled successfully.",
      data: enrollment,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "You are already enrolled in this course.",
      });
    }

    console.error("ENROLL ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to enroll in course.",
    });
  }
};

export const myCourses = async (req, res) => {
  try {
    const enrollments = await Enrollment.find({ student: req.user._id })
      .populate("course", "title description createdAt")
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      data: enrollments.filter((item) => item.course),
    });
  } catch (error) {
    console.error("MY COURSES ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load enrolled courses.",
    });
  }
};

