import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";

import useAuth from "../../hooks/useAuth";
import "../../styles/auth.css";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [shake, setShake] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      setMsg({ type: "error", text: "Please enter both email and password." });
      return;
    }
    setMsg({ type: "", text: "" });
    setLoading(true);
    try {
      await login(form.email, form.password);
      setMsg({ type: "success", text: "Login successful ✅" });
      setTimeout(() => navigate("/dashboard"), 600);
    } catch (err) {
      setMsg({
        type: "error",
        text: err?.response?.data?.message || err.message || "Login failed ❌",
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
              Login and continue tracking your daily expenses. Smart money life
              starts here 😎💰
            </p>

            <div className="auth-feature-list">
              <div className="auth-feature">
                <div className="auth-dot"></div>
                <span>Fast and secure login</span>
              </div>
              <div className="auth-feature">
                <div className="auth-dot"></div>
                <span>Income + Expense management</span>
              </div>
              <div className="auth-feature">
                <div className="auth-dot"></div>
                <span>Dashboard & analytics reports</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="auth-right">
          <h2 className="auth-title">Welcome back</h2>
          <p className="auth-subtitle">Login to your account.</p>

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="auth-field">
              <label>Email</label>
              <input
                className="auth-input"
                type="email"
                name="email"
                placeholder="Enter your email"
                value={form.email}
                onChange={handleChange}
              />
            </div>

            <div className="auth-field">
              <label>Password</label>
              <div className="auth-input-group">
                <input
                  className="auth-input"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={handleChange}
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

            <button className={`auth-btn ${shake ? "shake" : ""}`} type="submit" disabled={loading}>
              {loading ? "Logging in..." : "Login 😊"}
            </button>
          </form>

          {msg.text && <div className={`auth-msg ${msg.type}`}>{msg.text}</div>}

          <div className="auth-bottom">
            New user? <Link to="/register">Create account</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
