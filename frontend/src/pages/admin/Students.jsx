import { useCallback, useEffect, useState } from "react";
import { getStudents } from "../../api/api";

function Students() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    const response = await getStudents();

    if (response.success) {
      setStudents(response.data || []);
      setError("");
    } else {
      setError(response.message || "Failed to load students.");
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  return (
    <div className="page-shell">
      <div className="page-header">
        <div>
          <span className="eyebrow">STUDENT DIRECTORY</span>
          <h1>Students</h1>
          <p>View registered students and their course enrollments.</p>
        </div>
        <button className="btn btn-secondary" onClick={fetchStudents}>Refresh</button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {loading && <div className="state-card">Loading students...</div>}

      {!loading && !error && students.length === 0 && (
        <div className="state-card">
          <h3>No students found.</h3>
          <p>Students will appear after they create accounts.</p>
        </div>
      )}

      {!loading && students.length > 0 && (
        <div className="students-grid">
          {students.map((student) => (
            <article className="student-card" key={student._id}>
              <div className="student-header">
                <div className="avatar">
                  {(student.name || "?").charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3>{student.name}</h3>
                  <p className="email">{student.email}</p>
                </div>
              </div>

              <div className="student-meta">
                <span>Age: {student.age ?? "—"}</span>
                <span>City: {student.city || "—"}</span>
              </div>

              <div className="enrollment-heading">
                <strong>{student.totalCourses} enrolled</strong>
              </div>

              <div className="courses-wrap">
                {student.courses?.length > 0 ? (
                  student.courses.map((course) => (
                    <span className="course-pill" key={course._id}>
                      {course.title}
                    </span>
                  ))
                ) : (
                  <span className="no-courses">No courses enrolled</span>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

export default Students;
