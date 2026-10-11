import mongoose from "mongoose";
import Quiz from "../models/quizModel.js";
import QuizAttempt from "../models/quizAttemptModel.js";
import Enrollment from "../models/enrollmentModel.js";
import Course from "../models/courseModel.js";

const PASS_PERCENT = Number(process.env.QUIZ_PASS_PERCENT) || 70;

const publicQuiz = (quiz) => ({
  _id: quiz._id,
  course: quiz.course,
  topic: quiz.topic,
  passPercent: quiz.passPercent,
  questions: quiz.questions.map((item) => ({
    _id: item._id,
    question: item.question,
    options: item.options,
  })),
  createdAt: quiz.createdAt,
});

const courseApiSearch = (title) => {
  const value = title.toLowerCase();
  if (value.includes("javascript") || value.includes("js")) return "javascript";
  if (value.includes("python")) return "python";
  if (value.includes("sql") || value.includes("database") || value.includes("dbms")) return "database";
  if (value.includes("docker")) return "docker";
  if (value.includes("kubernetes")) return "kubernetes";
  if (value.includes("linux")) return "linux";
  if (value.includes("network")) return "networking";
  if (value.includes("devops")) return "devops";
  if (value.includes("cloud")) return "cloud";
  return title;
};

const quizApiRequest = async (url) => {
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${process.env.QUIZAPI_KEY}`, "Content-Type": "application/json" },
    signal: AbortSignal.timeout(15000),
  });
  if (!response.ok) throw new Error(`QuizAPI request failed (${response.status})`);
  return response.json();
};

export const generateQuiz = async (req, res) => {
  try {
    const { courseId } = req.body;
    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({ success: false, message: "Invalid course ID." });
    }
    if (!process.env.QUIZAPI_KEY) {
      return res.status(503).json({ success: false, message: "QuizAPI is not configured. Add QUIZAPI_KEY to backend/.env and restart the backend." });
    }

    const [course, enrollment] = await Promise.all([
      Course.findById(courseId),
      Enrollment.findOne({ student: req.user._id, course: courseId }),
    ]);
    if (!course) return res.status(404).json({ success: false, message: "Course not found." });
    if (!enrollment) return res.status(403).json({ success: false, message: "Enroll in this course before taking a quiz." });
    if (enrollment.completed) return res.status(400).json({ success: false, message: "This course is already completed." });

    const search = encodeURIComponent(courseApiSearch(course.title));
    const list = await quizApiRequest(`https://quizapi.io/api/v1/quizzes?topic=${search}&limit=20&sort=popular`);
    const quizzes = Array.isArray(list.data) ? list.data : [];
    const titleWords = courseApiSearch(course.title).toLowerCase().split(/\s+/).filter((word) => word.length > 2);
    const relevantQuizzes = quizzes.filter((item) => {
      const haystack = `${item.title || ""} ${item.description || ""} ${(item.tags || []).join(" ")} ${item.categorySlug || ""}`.toLowerCase();
      return titleWords.some((word) => haystack.includes(word));
    });
    // Try multiple relevant QuizAPI quizzes instead of relying on one quiz's question count.
    const candidates = [...relevantQuizzes, ...quizzes.filter((item) => !relevantQuizzes.includes(item))]
      .filter((item) => item?.id)
      .slice(0, 8);
    if (!candidates.length) {
      return res.status(404).json({ success: false, message: `QuizAPI has no quizzes matching “${course.title}”. Try a course with a supported programming subject.` });
    }

    const questions = [];
    const seenQuestions = new Set();
    for (const candidate of candidates) {
      if (questions.length >= 10) break;
      try {
        const detailResponse = await quizApiRequest(`https://quizapi.io/api/v1/quizzes/${encodeURIComponent(candidate.id)}`);
        const externalQuiz = detailResponse.data || detailResponse;
        const rawQuestions = Array.isArray(externalQuiz.questions) ? externalQuiz.questions : [];
        for (const q of rawQuestions) {
          if (!Array.isArray(q.answers) || !q.text) continue;
          const options = q.answers.filter((answer) => answer && answer.text).slice(0, 4);
          const correctAnswer = options.findIndex((answer) => answer.isCorrect === true);
          const normalizedQuestion = q.text.trim().toLowerCase().replace(/\s+/g, " ");
          if (options.length !== 4 || correctAnswer < 0 || seenQuestions.has(normalizedQuestion)) continue;
          seenQuestions.add(normalizedQuestion);
          questions.push({ question: q.text, options: options.map((answer) => answer.text), correctAnswer });
          if (questions.length >= 10) break;
        }
      } catch (detailError) {
        // Skip a quiz that is unavailable and try the next matching result.
        console.warn(`Skipping QuizAPI quiz ${candidate.id}:`, detailError.message);
      }
    }

    // Do not block students when the provider has fewer than 10 questions available.
    // Five or more questions still make a usable assessment; scoring uses its actual length.
    if (questions.length < 5) {
      return res.status(422).json({ success: false, message: `QuizAPI returned only ${questions.length} usable questions for ${course.title}. Try again later, or choose a course with more available questions.` });
    }

    const quiz = await Quiz.create({
      student: req.user._id,
      course: course._id,
      topic: course.title,
      questions,
      passPercent: PASS_PERCENT,
    });
    return res.status(201).json({ success: true, provider: "quizapi", message: "Course quiz loaded from QuizAPI.", data: publicQuiz(quiz) });
  } catch (error) {
    console.error("QUIZAPI GENERATION ERROR:", error.message);
    return res.status(502).json({ success: false, message: "Unable to fetch questions from QuizAPI. Check your API key, plan, and internet connection, then try again." });
  }
};

export const getQuiz = async (req, res) => {
  try {
    const { quizId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(quizId)) {
      return res.status(400).json({ success: false, message: "Invalid quiz ID." });
    }

    const quiz = await Quiz.findOne({ _id: quizId, student: req.user._id });
    if (!quiz) return res.status(404).json({ success: false, message: "Quiz not found." });

    return res.json({ success: true, data: publicQuiz(quiz) });
  } catch (error) {
    console.error("QUIZ LOAD ERROR:", error);
    return res.status(500).json({ success: false, message: "Failed to load quiz." });
  }
};

export const submitQuiz = async (req, res) => {
  try {
    const { quizId } = req.params;
    const answers = req.body?.answers;

    if (!mongoose.Types.ObjectId.isValid(quizId)) {
      return res.status(400).json({ success: false, message: "Invalid quiz ID." });
    }

    if (!Array.isArray(answers)) {
      return res.status(400).json({ success: false, message: "answers must be an array." });
    }

    const quiz = await Quiz.findOne({ _id: quizId, student: req.user._id });
    if (!quiz) return res.status(404).json({ success: false, message: "Quiz not found." });

    const enrollment = await Enrollment.findOne({ student: req.user._id, course: quiz.course });
    if (!enrollment) return res.status(403).json({ success: false, message: "You are not enrolled in this course." });

    const score = quiz.questions.reduce((total, question, index) => {
      return total + (Number(answers[index]) === question.correctAnswer ? 1 : 0);
    }, 0);

    const totalQuestions = quiz.questions.length;
    const percentage = Math.round((score / totalQuestions) * 100);
    const passed = percentage >= quiz.passPercent;

    await QuizAttempt.create({
      quiz: quiz._id,
      student: req.user._id,
      course: quiz.course,
      answers: answers.map((answer) => Number.isInteger(Number(answer)) ? Number(answer) : -1),
      score,
      totalQuestions,
      percentage,
      passed,
    });

    if (passed && !enrollment.completed) {
      enrollment.completed = true;
      enrollment.completedAt = new Date();
      await enrollment.save();
    }

    return res.json({
      success: true,
      passed,
      score,
      totalQuestions,
      percentage,
      passPercent: quiz.passPercent,
      courseCompleted: enrollment.completed,
      message: passed
        ? "Congratulations! You passed the quiz and completed the course."
        : `You scored ${percentage}%. You need at least ${quiz.passPercent}% to complete the course.`,
    });
  } catch (error) {
    console.error("QUIZ SUBMIT ERROR:", error);
    return res.status(500).json({ success: false, message: "Failed to submit quiz." });
  }
};


// Return only the signed-in student's quiz history and attempt count.
export const getMyQuizStats = async (req, res) => {
  try {
    const studentId = req.user._id;
    const [totalAttempts, latestAttempts] = await Promise.all([
      QuizAttempt.countDocuments({ student: studentId }),
      QuizAttempt.find({ student: studentId })
        .populate("course", "title")
        .sort({ createdAt: -1 })
        .limit(5)
        .select("course score totalQuestions percentage passed createdAt"),
    ]);

    return res.json({
      success: true,
      data: {
        totalAttempts,
        latestScores: latestAttempts.map((attempt) => ({
          _id: attempt._id,
          courseTitle: attempt.course?.title || "Course unavailable",
          score: attempt.score,
          totalQuestions: attempt.totalQuestions,
          percentage: attempt.percentage,
          passed: attempt.passed,
          attemptedAt: attempt.createdAt,
        })),
      },
    });
  } catch (error) {
    console.error("QUIZ STATS ERROR:", error);
    return res.status(500).json({ success: false, message: "Failed to load quiz statistics." });
  }
};
