import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { loginUser } from "../../api/api";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (token && role === "admin") navigate("/admin", { replace: true });
    if (token && role === "student") navigate("/student", { replace: true });
  }, [navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setError("Enter your email and password.");
      return;
    }

    setLoading(true);

    try {
      const data = await loginUser({
        email: email.trim(),
        password,
      });

      if (!data.success) {
        setError(data.message || "Login failed.");
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.role);

      navigate(data.role === "admin" ? "/admin" : "/student", {
        replace: true,
      });
    } catch (error) {
      console.error(error);
      setError("Unexpected error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-brand">
        <div className="brand-content">
          <span className="brand-badge">STUDENT MANAGEMENT</span>
          <h1>ScholarStack</h1>
          <p>
            A complete platform for managing students, courses and
            enrollments in one place.
          </p>
        </div>

        <div className="floating-emojis" aria-hidden="true">
          {["📚", "🎓", "✏️", "📖", "🧠", "📓", "🎒", "📐"].map(
            (emoji, index) => (
              <span
                key={index}
                style={{
                  left: `${8 + index * 12}%`,
                  animationDelay: `${index * -1.7}s`,
                  animationDuration: `${18 + index * 1.5}s`,
                }}
              >
                {emoji}
              </span>
            )
          )}
        </div>
      </div>

      <main className="login-page">
        <div className="login-card">
          <div className="auth-heading">
            <span className="eyebrow">WELCOME BACK</span>
            <h2>Login</h2>
            <p>Access your ScholarStack dashboard.</p>
          </div>

          {location.state?.message && <div className="alert alert-success">{location.state.message}</div>}
          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            <label>
              Email
              <input
                className="input"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </label>

            <label>
              Password
              <input
                className="input"
                type="password"
                autoComplete="current-password"
                placeholder="Enter your password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </label>

            <button className="btn btn-primary btn-full" type="submit" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <p className="auth-switch">
            New here?{" "}
            <button type="button" className="text-button" onClick={() => navigate("/signup")}>
              Create an account
            </button>
          </p>

          <div className="demo-note">
            <strong>Admin demo</strong>
            <span>Use the admin credentials configured in backend/.env.</span>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Login;
