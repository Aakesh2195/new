import User from "../models/userModel.js";
import Enrollment from "../models/enrollmentModel.js";
import Course from "../models/courseModel.js";

export const getAllStudents = async (req, res) => {
  try {
    const students = await User.find({ role: "student" })
      .select("_id name age city email createdAt")
      .sort({ createdAt: -1 })
      .lean();

    const studentIds = students.map((student) => student._id);
    const enrollments = await Enrollment.find({ student: { $in: studentIds } })
      .populate("course", "title description")
      .lean();

    const enrollmentMap = new Map();

    for (const enrollment of enrollments) {
      if (!enrollment.course) continue;
      const key = enrollment.student.toString();
      if (!enrollmentMap.has(key)) enrollmentMap.set(key, []);
      enrollmentMap.get(key).push({
        _id: enrollment.course._id,
        title: enrollment.course.title,
        description: enrollment.course.description,
      });
    }

    const result = students.map((student) => {
      const courses = enrollmentMap.get(student._id.toString()) || [];
      return {
        ...student,
        joinedAt: student.createdAt,
        totalCourses: courses.length,
        courses,
      };
    });

    return res.json({ success: true, data: result });
  } catch (error) {
    console.error("ADMIN STUDENTS ERROR:", error);
    return res.status(500).json({ success: false, message: "Failed to load students." });
  }
};

export const getAdminStats = async (req, res) => {
  try {
    const [students, courses, enrollments] = await Promise.all([
      User.countDocuments({ role: "student" }),
      Course.countDocuments(),
      Enrollment.countDocuments(),
    ]);

    return res.json({ success: true, data: { students, courses, enrollments } });
  } catch (error) {
    console.error("ADMIN STATS ERROR:", error);
    return res.status(500).json({ success: false, message: "Failed to load dashboard statistics." });
  }
};
