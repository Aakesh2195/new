import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMyCourses, getMyQuizStats } from "../../api/api";

function StudentDashboard() {
  const [courses, setCourses] = useState([]);
  const [quizStats, setQuizStats] = useState({ totalAttempts: 0, latestScores: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statsError, setStatsError] = useState("");
  const navigate = useNavigate();

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    const [coursesResponse, statsResponse] = await Promise.all([
      getMyCourses(),
      getMyQuizStats(),
    ]);

    if (coursesResponse.success) {
      setCourses(coursesResponse.data || []);
      setError("");
    } else {
      setError(coursesResponse.message || "Unable to load your courses.");
    }

    if (statsResponse.success) {
      setQuizStats(statsResponse.data || { totalAttempts: 0, latestScores: [] });
      setStatsError("");
    } else {
      setStatsError(statsResponse.message || "Unable to load quiz scores.");
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/", { replace: true });
  };

  const completedCount = courses.filter((item) => item.completed).length;
  const formatDate = (date) => new Date(date).toLocaleDateString(undefined, {
    day: "numeric", month: "short", year: "numeric",
  });

  return (
    <div className="dashboard-page">
      <div className="floating-emojis" aria-hidden="true">
        <span style={{ left: "5%" }}>📚</span>
        <span style={{ left: "18%" }}>🎓</span>
        <span style={{ left: "32%" }}>✏️</span>
        <span style={{ left: "48%" }}>📖</span>
        <span style={{ left: "65%" }}>🧠</span>
        <span style={{ left: "82%" }}>🎒</span>
      </div>

      <div className="dashboard-content">
        <header className="dashboard-header">
          <div>
            <span className="eyebrow">STUDENT PORTAL</span>
            <h1>My Dashboard</h1>
            <p>Track your courses and quiz results in one place.</p>
          </div>
          <div className="dashboard-actions">
            <button className="btn btn-primary" onClick={() => navigate("/student/courses")}>📚 Browse Courses</button>
            <button className="btn btn-outline" onClick={() => navigate("/student/profile")}>👤 Profile</button>
            <button className="btn btn-ghost" onClick={logout}>Logout</button>
          </div>
        </header>

        {error && <div className="alert alert-error">{error}</div>}

        <div className="stats-grid student-stats">
          <div className="stat-card">
            <span className="stat-label">ENROLLED COURSES</span>
            <strong>{loading ? "—" : courses.length}</strong>
            <span>Your current learning list</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">COMPLETED</span>
            <strong>{loading ? "—" : completedCount}</strong>
            <span>Courses completed after passing the quiz</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">QUIZ ATTEMPTS</span>
            <strong>{loading ? "—" : quizStats.totalAttempts}</strong>
            <span>Total quizzes submitted by you</span>
          </div>
        </div>

        <section className="content-section quiz-history-section">
          <div className="section-heading">
            <div>
              <h2>Latest Quiz Scores</h2>
              <p>Your five most recent quiz submissions.</p>
            </div>
            <button className="btn btn-secondary" onClick={fetchDashboard}>Refresh</button>
          </div>

          {statsError && <div className="alert alert-error">{statsError}</div>}
          {!loading && !statsError && quizStats.latestScores.length === 0 && (
            <div className="state-card quiz-empty-state">
              <h3>No quiz attempts yet</h3>
              <p>Your scores will appear here after you submit a course quiz.</p>
            </div>
          )}
          {quizStats.latestScores.length > 0 && (
            <div className="quiz-history-list">
              {quizStats.latestScores.map((attempt) => (
                <article className="quiz-history-item" key={attempt._id}>
                  <div className="quiz-history-main">
                    <strong>{attempt.courseTitle}</strong>
                    <span>{formatDate(attempt.attemptedAt)}</span>
                  </div>
                  <div className="quiz-history-score">
                    <strong>{attempt.percentage}%</strong>
                    <span>{attempt.score}/{attempt.totalQuestions} correct</span>
                  </div>
                  <span className={`quiz-history-status ${attempt.passed ? "passed" : "not-passed"}`}>
                    {attempt.passed ? "Passed" : "Try again"}
                  </span>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="content-section">
          <div className="section-heading">
            <div>
              <h2>My Courses</h2>
              <p>Your enrolled courses are stored in MongoDB.</p>
            </div>
          </div>

          {loading && <div className="state-card">Loading your dashboard...</div>}
          {!loading && !error && courses.length === 0 && (
            <div className="state-card">
              <h3>You have not enrolled yet.</h3>
              <p>Browse the catalog to choose your first course.</p>
              <button className="btn btn-primary" onClick={() => navigate("/student/courses")}>Browse Courses</button>
            </div>
          )}
          {!loading && courses.length > 0 && (
            <div className="courses-grid">
              {courses.map((item) => (
                <article className="course-card" key={item._id}>
                  <div className="course-icon">🎓</div>
                  <h3>{item.course?.title || "Course unavailable"}</h3>
                  <p>{item.course?.description || "This course is no longer available."}</p>
                  <div className="course-card-footer">
                    <span className={`status-pill ${item.completed ? "completed" : ""}`}>
                      {item.completed ? "✓ Completed" : "Enrolled"}
                    </span>
                    {item.completed ? (
                      <button className="btn btn-secondary" disabled>✓ Completed</button>
                    ) : (
                      <button className="btn btn-primary" onClick={() => navigate(`/student/quiz/${item.course?._id}`)} disabled={!item.course?._id}>Take Quiz</button>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default StudentDashboard;
