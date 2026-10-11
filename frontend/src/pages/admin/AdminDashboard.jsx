import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAdminStats } from "../../api/api";

function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    students: 0,
    courses: 0,
    enrollments: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadStats = useCallback(async () => {
    setLoading(true);
    const response = await getAdminStats();

    if (response.success) {
      setStats(response.data);
      setError("");
    } else {
      setError(response.message || "Unable to load statistics.");
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  return (
    <div className="page-shell">
      <div className="page-header">
        <div>
          <span className="eyebrow">ADMINISTRATION</span>
          <h1>Admin Dashboard</h1>
          <p>Monitor students, courses and enrollments.</p>
        </div>
        <button className="btn btn-secondary" onClick={loadStats}>Refresh</button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="stats-grid admin-stats">
        <button className="stat-card clickable" onClick={() => navigate("/admin/students")}>
          <span className="stat-icon">👩‍🎓</span>
          <span className="stat-label">STUDENTS</span>
          <strong>{loading ? "—" : stats.students}</strong>
          <span>Registered student accounts</span>
        </button>

        <button className="stat-card clickable" onClick={() => navigate("/admin/courses")}>
          <span className="stat-icon">📚</span>
          <span className="stat-label">COURSES</span>
          <strong>{loading ? "—" : stats.courses}</strong>
          <span>Available course catalog</span>
        </button>

        <div className="stat-card">
          <span className="stat-icon">🎓</span>
          <span className="stat-label">ENROLLMENTS</span>
          <strong>{loading ? "—" : stats.enrollments}</strong>
          <span>Total student enrollments</span>
        </div>
      </div>

      <div className="quick-actions">
        <h2>Quick actions</h2>
        <div className="action-grid">
          <button className="action-card" onClick={() => navigate("/admin/courses")}>
            <span>➕</span>
            <div><strong>Manage Courses</strong><small>Create, edit or delete courses.</small></div>
          </button>
          <button className="action-card" onClick={() => navigate("/admin/students")}>
            <span>👥</span>
            <div><strong>View Students</strong><small>See students and their enrollments.</small></div>
          </button>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
