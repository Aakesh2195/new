import express from "express";
import { getMyProfile, getStudents, createStudent, updateStudent, deleteStudent } from "../controllers/studentController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();

router.get("/me", authMiddleware, roleMiddleware("student"), getMyProfile);
router.get("/", authMiddleware, roleMiddleware("admin"), getStudents);
router.post("/", authMiddleware, roleMiddleware("admin"), createStudent);
router.put("/:id", authMiddleware, roleMiddleware("admin"), updateStudent);
router.delete("/:id", authMiddleware, roleMiddleware("admin"), deleteStudent);

export default router;
