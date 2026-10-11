import { NavLink } from "react-router-dom";

function Sidebar() {
  return (
    <nav className="sidebar-nav">
      <NavLink to="/admin" end>Dashboard</NavLink>
      <NavLink to="/admin/students">Students</NavLink>
      <NavLink to="/admin/courses">Courses</NavLink>
    </nav>
  );
}
export default Sidebar;
