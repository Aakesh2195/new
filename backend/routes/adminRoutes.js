import express from "express";
import { getAllStudents, getAdminStats } from "../controllers/adminController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();

router.get("/stats", authMiddleware, roleMiddleware("admin"), getAdminStats);
router.get("/students", authMiddleware, roleMiddleware("admin"), getAllStudents);

export default router;
