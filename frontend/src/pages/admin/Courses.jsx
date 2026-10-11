import { useCallback, useEffect, useState } from "react";
import {
  addCourse,
  deleteCourse,
  getAllCourses,
  updateCourse,
} from "../../api/api";

function Courses() {
  const [courses, setCourses] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    const response = await getAllCourses();

    if (response.success) {
      setCourses(response.data || []);
      setError("");
    } else {
      setError(response.message || "Unable to load courses.");
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const clearForm = () => {
    setEditingId(null);
    setTitle("");
    setDescription("");
  };

  const addOrUpdateCourse = async (event) => {
    event.preventDefault();
    setError("");

    if (!title.trim() || !description.trim()) {
      setError("Fill in both course title and description.");
      return;
    }

    setSaving(true);

    const response = editingId
      ? await updateCourse(editingId, {
          title: title.trim(),
          description: description.trim(),
        })
      : await addCourse({
          title: title.trim(),
          description: description.trim(),
        });

    setSaving(false);

    if (!response.success) {
      setError(response.message || "Unable to save course.");
      return;
    }

    clearForm();
    await fetchCourses();
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this course? Existing enrollments will also be removed.")) {
      return;
    }

    const response = await deleteCourse(id);

    if (!response.success) {
      setError(response.message || "Unable to delete course.");
      return;
    }

    if (editingId === id) clearForm();
    await fetchCourses();
  };

  return (
    <div className="page-shell">
      <div className="page-header">
        <div>
          <span className="eyebrow">CATALOG MANAGEMENT</span>
          <h1>Courses</h1>
          <p>Create and maintain the courses students can enroll in.</p>
        </div>
        <button className="btn btn-secondary" onClick={fetchCourses}>Refresh</button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <form className="course-form" onSubmit={addOrUpdateCourse}>
        <div className="form-heading">
          <div>
            <h2>{editingId ? "Edit Course" : "Add Course"}</h2>
            <p>{editingId ? "Update the selected course." : "Create a course for students."}</p>
          </div>
          {editingId && <button type="button" className="btn btn-ghost" onClick={clearForm}>Cancel</button>}
        </div>

        <div className="two-column">
          <label>
            Course title
            <input className="input" placeholder="e.g. Operating Systems" value={title} onChange={(e) => setTitle(e.target.value)} />
          </label>
          <label>
            Description
            <input className="input" placeholder="Short course description" value={description} onChange={(e) => setDescription(e.target.value)} />
          </label>
        </div>

        <button className="btn btn-primary" disabled={saving}>
          {saving ? "Saving..." : editingId ? "Update Course" : "Add Course"}
        </button>
      </form>

      {loading && <div className="state-card">Loading courses...</div>}

      {!loading && courses.length === 0 && (
        <div className="state-card">
          <h3>No courses found.</h3>
          <p>Create the first course using the form above.</p>
        </div>
      )}

      {!loading && courses.length > 0 && (
        <div className="admin-list">
          {courses.map((course) => (
            <article className="list-card" key={course._id}>
              <div className="list-main">
                <span className="course-icon small">📚</span>
                <div>
                  <h3>{course.title}</h3>
                  <p>{course.description}</p>
                </div>
              </div>

              <div className="course-actions">
                <button className="btn btn-edit" onClick={() => {
                  setEditingId(course._id);
                  setTitle(course.title);
                  setDescription(course.description);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}>
                  Edit
                </button>
                <button className="btn btn-danger" onClick={() => handleDelete(course._id)}>
                  Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

export default Courses;
