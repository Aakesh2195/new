import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { enrollInCourse, getAllCourses, getMyCourses } from "../../api/api";

function AllCourses() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [enrolledIds, setEnrolledIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enrollingId, setEnrollingId] = useState(null);
  const [error, setError] = useState("");

  const loadCourses = useCallback(async () => {
    setLoading(true);
    setError("");

    const [coursesResponse, enrolledResponse] = await Promise.all([
      getAllCourses(),
      getMyCourses(),
    ]);

    if (!coursesResponse.success) {
      setError(coursesResponse.message || "Unable to load courses.");
      setLoading(false);
      return;
    }

    setCourses(coursesResponse.data || []);

    if (enrolledResponse.success) {
      setEnrolledIds(
        (enrolledResponse.data || [])
          .filter((item) => item.course?._id)
          .map((item) => String(item.course._id))
      );
    } else if (enrolledResponse.status === 401) {
      setError(enrolledResponse.message);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    loadCourses();
  }, [loadCourses]);

  const enroll = async (courseId) => {
    setEnrollingId(courseId);

    const response = await enrollInCourse(courseId);

    if (response.success) {
      setEnrolledIds((previous) => [
        ...new Set([...previous, String(courseId)]),
      ]);
    } else {
      setError(response.message || "Unable to enroll.");
    }

    setEnrollingId(null);
  };

  return (
    <div className="page-shell">
      <div className="page-header">
        <div>
          <span className="eyebrow">LEARNING CATALOG</span>
          <h1>All Courses</h1>
          <p>Browse available courses and enroll with one click.</p>
        </div>

        <button className="btn btn-outline" onClick={() => navigate("/student")}>
          ← Dashboard
        </button>
      </div>

      {error && (
        <div className="alert alert-error page-alert">
          {error}
        </div>
      )}

      {loading && <div className="state-card">Loading courses...</div>}

      {!loading && !error && courses.length === 0 && (
        <div className="state-card">
          <h3>No courses available</h3>
          <p>Courses will appear here when an administrator creates them.</p>
        </div>
      )}

      {!loading && courses.length > 0 && (
        <div className="courses-grid">
          {courses.map((course) => {
            const enrolled = enrolledIds.includes(String(course._id));
            const busy = enrollingId === course._id;

            return (
              <article className="course-card" key={course._id}>
                <div className="course-icon">📚</div>
                <div className="course-content">
                  <h3>{course.title}</h3>
                  <p>{course.description}</p>
                </div>

                <button
                  className={`btn ${enrolled ? "btn-secondary" : "btn-primary"}`}
                  disabled={enrolled || busy}
                  onClick={() => enroll(course._id)}
                >
                  {busy ? "Enrolling..." : enrolled ? "✓ Enrolled" : "Enroll Now"}
                </button>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default AllCourses;
