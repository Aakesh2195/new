import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { generateQuiz, getMyCourses, submitQuiz } from "../../api/api";

function CourseQuiz() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadCourse = async () => {
      const response = await getMyCourses();
      if (!response.success) {
        setError(response.message || "Unable to load your course.");
        setLoading(false);
        return;
      }

      const enrollment = (response.data || []).find(
        (item) => String(item.course?._id) === String(courseId)
      );

      if (!enrollment) {
        setError("You are not enrolled in this course.");
      } else {
        setCourse(enrollment);
        if (enrollment.completed) {
          setError("You have already completed this course.");
        } else {
          const quizResponse = await generateQuiz(courseId);
          if (quizResponse.success) {
            setQuiz(quizResponse.data);
            setAnswers(Array(quizResponse.data.questions.length).fill(null));
          } else {
            setError(quizResponse.message || "Unable to load questions for this course.");
          }
        }
      }
      setGenerating(false);
      setLoading(false);
    };

    loadCourse();
  }, [courseId]);

  const selectAnswer = (questionIndex, optionIndex) => {
    setAnswers((previous) => {
      const next = [...previous];
      next[questionIndex] = optionIndex;
      return next;
    });
  };

  const finishQuiz = async () => {
    if (!quiz) return;
    if (answers.some((answer) => answer === null)) {
      setError("Please answer every question before submitting.");
      return;
    }

    setError("");
    setSubmitting(true);
    const response = await submitQuiz(quiz._id, answers);
    setResult(response.success ? response : { success: false, message: response.message });
    if (!response.success) setError(response.message || "Unable to submit quiz.");
    setSubmitting(false);
  };

  if (loading) return <div className="page-shell"><div className="state-card">Loading course...</div></div>;

  if (error && !course) {
    return (
      <div className="page-shell">
        <div className="alert alert-error">{error}</div>
        <button className="btn btn-outline" onClick={() => navigate("/student")}>← Dashboard</button>
      </div>
    );
  }

  const courseTitle = course?.course?.title || "Course";

  return (
    <div className="page-shell quiz-page">
      <div className="page-header">
        <div>
          <span className="eyebrow">COURSE ASSESSMENT</span>
          <h1>{courseTitle} Quiz</h1>
          <p>Pass the quiz to mark this course as completed.</p>
        </div>
        <button className="btn btn-outline" onClick={() => navigate("/student")}>← Dashboard</button>
      </div>

      {error && <div className="alert alert-error page-alert">{error}</div>}

      {!quiz && !result && (
        <section className="quiz-generator-card">
          <h2>{generating ? "Loading your course quiz..." : "Quiz unavailable"}</h2>
          <p>{generating ? `Finding questions related to ${courseTitle}. Please wait.` : "We couldn't find enough relevant questions for this course. Please try again later or contact your administrator."}</p>
          {!generating && <button className="btn btn-primary" onClick={() => window.location.reload()}>Try Again</button>}
        </section>
      )}

      {quiz && !result && (
        <section className="quiz-card">
          <div className="quiz-card-header">
            <div>
              <h2>{courseTitle} Assessment</h2>
              <p>{quiz.questions.length} questions · Pass mark: {quiz.passPercent}%</p>
            </div>
            <span className="status-pill">QuizAPI</span>
          </div>

          <div className="quiz-questions">
            {quiz.questions.map((question, questionIndex) => (
              <article className="quiz-question" key={question._id || questionIndex}>
                <h3>{questionIndex + 1}. {question.question}</h3>
                <div className="quiz-options">
                  {question.options.map((option, optionIndex) => (
                    <label className={`quiz-option ${answers[questionIndex] === optionIndex ? "selected" : ""}`} key={optionIndex}>
                      <input
                        type="radio"
                        name={`question-${questionIndex}`}
                        checked={answers[questionIndex] === optionIndex}
                        onChange={() => selectAnswer(questionIndex, optionIndex)}
                      />
                      <span>{option}</span>
                    </label>
                  ))}
                </div>
              </article>
            ))}
          </div>

          <button className="btn btn-primary quiz-submit" onClick={finishQuiz} disabled={submitting}>
            {submitting ? "Submitting..." : "Submit Quiz"}
          </button>
        </section>
      )}

      {result && (
        <section className={`quiz-result-card ${result.passed ? "passed" : "failed"}`}>
          <div className="quiz-result-icon">{result.passed ? "🎉" : "📚"}</div>
          <h2>{result.passed ? "Quiz Passed!" : "Quiz Not Passed"}</h2>
          <p>{result.message}</p>
          <div className="quiz-score">
            <strong>{result.percentage}%</strong>
            <span>{result.score} / {result.totalQuestions} correct</span>
          </div>
          <div className="quiz-result-actions">
            {result.passed ? (
              <button className="btn btn-primary" onClick={() => navigate("/student")}>Back to Dashboard</button>
            ) : (
              <>
                <button className="btn btn-primary" onClick={() => { window.location.reload(); }}>Try Another Quiz</button>
                <button className="btn btn-outline" onClick={() => navigate("/student")}>Dashboard</button>
              </>
            )}
          </div>
        </section>
      )}
    </div>
  );
}

export default CourseQuiz;
