import { NavLink, Outlet, useNavigate } from "react-router-dom";

function AdminLayout() {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/", { replace: true });
  };

  return (
    <div className="admin-layout">
      <aside className="sidebar">
        <div>
          <span className="sidebar-kicker">ADMIN PORTAL</span>
          <h2>ScholarStack</h2>
        </div>

        <nav className="sidebar-nav">
          <NavLink to="/admin" end>Dashboard</NavLink>
          <NavLink to="/admin/students">Students</NavLink>
          <NavLink to="/admin/courses">Courses</NavLink>
        </nav>

        <button className="sidebar-logout" onClick={logout}>Logout</button>
      </aside>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}

export default AdminLayout;
