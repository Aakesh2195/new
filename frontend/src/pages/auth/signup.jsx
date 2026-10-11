import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signupUser } from "../../api/api";

function Signup() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    age: "",
    city: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const update = (field) => (event) =>
    setForm((previous) => ({ ...previous, [field]: event.target.value }));

  const handleSignup = async (event) => {
    event.preventDefault();
    setError("");

    if (
      !form.name.trim() ||
      !form.age ||
      !form.city.trim() ||
      !form.email.trim() ||
      !form.password
    ) {
      setError("All fields are required.");
      return;
    }

    if (form.password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const data = await signupUser({
        name: form.name.trim(),
        age: Number(form.age),
        city: form.city.trim(),
        email: form.email.trim(),
        password: form.password,
      });

      if (!data.success) {
        setError(data.message || "Signup failed.");
        return;
      }

      navigate("/", {
        replace: true,
        state: { message: "Account created successfully. Please login." },
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
          <span className="brand-badge">GET STARTED</span>
          <h1>Join ScholarStack</h1>
          <p>Create your student account and start exploring available courses.</p>
        </div>
      </div>

      <main className="login-page">
        <div className="login-card signup-card">
          <div className="auth-heading">
            <span className="eyebrow">STUDENT REGISTRATION</span>
            <h2>Create Account</h2>
            <p>Your account will be created with the student role.</p>
          </div>

          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSignup} className="auth-form">
            <label>
              Full Name
              <input className="input" placeholder="Your name" value={form.name} onChange={update("name")} required />
            </label>

            <div className="two-column">
              <label>
                Age
                <input className="input" type="number" min="5" max="100" placeholder="Age" value={form.age} onChange={update("age")} required />
              </label>

              <label>
                City
                <input className="input" placeholder="City" value={form.city} onChange={update("city")} required />
              </label>
            </div>

            <label>
              Email
              <input className="input" type="email" autoComplete="email" placeholder="you@example.com" value={form.email} onChange={update("email")} required />
            </label>

            <label>
              Password
              <input className="input" type="password" autoComplete="new-password" placeholder="At least 6 characters" value={form.password} onChange={update("password")} required />
            </label>

            <label>
              Confirm Password
              <input className="input" type="password" autoComplete="new-password" placeholder="Repeat your password" value={form.confirmPassword} onChange={update("confirmPassword")} required />
            </label>

            <button className="btn btn-primary btn-full" disabled={loading}>
              {loading ? "Creating..." : "Create Student Account"}
            </button>
          </form>

          <p className="auth-switch">
            Already have an account?{" "}
            <button type="button" className="text-button" onClick={() => navigate("/")}>
              Login
            </button>
          </p>
        </div>
      </main>
    </div>
  );
}

export default Signup;
