import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import useAuth from "../../hooks/useAuth";
import "../../styles/auth.css";

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg({ type: "", text: "" });
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      setMsg({ type: "success", text: "Account created successfully ✅" });
      setTimeout(() => navigate("/dashboard"), 700);
    } catch (err) {
      setMsg({
        type: "error",
        text: err?.response?.data?.message || err.message || "Register failed ❌",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-wrap">
        {/* LEFT */}
        <div className="auth-left">
          <div className="auth-brand">
            <h1>Expense Tracker</h1>
            <p>
              Track your money smartly. Control spending. Save more. 💸✨
            </p>

            <div className="auth-feature-list">
              <div className="auth-feature">
                <div className="auth-dot"></div>
                <span>Category wise expense tracking</span>
              </div>
              <div className="auth-feature">
                <div className="auth-dot"></div>
                <span>Monthly budget alerts</span>
              </div>
              <div className="auth-feature">
                <div className="auth-dot"></div>
                <span>Analytics with charts & reports</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="auth-right">
          <h2 className="auth-title">Create account</h2>
          <p className="auth-subtitle">Register to start tracking expenses.</p>

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="auth-field">
              <label>Full Name</label>
              <input
                className="auth-input"
                type="text"
                name="name"
                placeholder="Enter your name"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="auth-field">
              <label>Email</label>
              <input
                className="auth-input"
                type="email"
                name="email"
                placeholder="Enter your email"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="auth-field">
              <label>Password</label>
              <div className="auth-input-group">
                <input
                  className="auth-input"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Min 6 characters"
                  value={form.password}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  className="auth-password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button className="auth-btn" type="submit" disabled={loading}>
              {loading ? "Creating..." : "Register"}
            </button>
          </form>

          {msg.text && <div className={`auth-msg ${msg.type}`}>{msg.text}</div>}

          <div className="auth-bottom">
            Already have an account? <Link to="/login">Login</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
