import express from "express";
import { generateQuiz, getQuiz, submitQuiz, getMyQuizStats } from "../controllers/quizController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();

router.use(authMiddleware, roleMiddleware("student"));
router.post("/generate", generateQuiz);
router.get("/my-stats", getMyQuizStats);
router.get("/:quizId", getQuiz);
router.post("/:quizId/submit", submitQuiz);

export default router;
