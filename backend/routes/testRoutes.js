import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();

router.get("/admin", authMiddleware, roleMiddleware("admin"), (req, res) => {
  res.json({ success: true, message: "Welcome Admin", user: req.user.toSafeJSON() });
});

router.get("/student", authMiddleware, roleMiddleware("student"), (req, res) => {
  res.json({ success: true, message: "Welcome Student", user: req.user.toSafeJSON() });
});

export default router;
