import { Navigate, Route, Routes } from "react-router-dom";
import Login from "./pages/auth/login";
import Signup from "./pages/auth/signup";
import StudentLayout from "./layout/StudentLayout";
import StudentDashboard from "./pages/student/StudentDashboard";
import AllCourses from "./pages/student/AllCourses";
import Profile from "./pages/student/Profile";
import CourseQuiz from "./pages/student/CourseQuiz";
import AdminLayout from "./layout/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import Students from "./pages/admin/Students";
import Courses from "./pages/admin/Courses";
const ProtectedRoute = ({ requiredRole, children }) => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  if (!token) return <Navigate to="/" replace />;
  if (role !== requiredRole) {
    return <Navigate to={role === "admin" ? "/admin" : "/student"} replace />;
  }
  return children;
};
function App() {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  const home = token
    ? role === "admin"
      ? "/admin"
      : role === "student"
        ? "/student"
        : "/"
    : "/";
  return (
    <Routes>
      <Route
        path="/"
        element={token && (role === "admin" || role === "student")
          ? <Navigate to={home} replace />
          : <Login />}
      />
      <Route path="/signup" element={<Signup />} />

      <Route
        path="/student"
        element={
          <ProtectedRoute requiredRole="student">
            <StudentLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<StudentDashboard />} />
        <Route path="courses" element={<AllCourses />} />
        <Route path="profile" element={<Profile />} />
        <Route path="quiz/:courseId" element={<CourseQuiz />} />
      </Route>
      <Route
        path="/admin"
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="students" element={<Students />} />
        <Route path="courses" element={<Courses />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
export default App;
