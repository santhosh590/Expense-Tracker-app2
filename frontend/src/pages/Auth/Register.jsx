import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import useAuth from "../../hooks/useAuth";
import "../../styles/auth.css";

export default function Register() {
  const navigate = useNavigate();
  const { register, googleLogin } = useAuth();

  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });

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

  const handleGoogleSuccess = async (credentialResponse) => {
    setMsg({ type: "", text: "" });
    try {
      await googleLogin(credentialResponse.credential);
      setMsg({ type: "success", text: "Signed up with Google ✅" });
      setTimeout(() => navigate("/dashboard"), 600);
    } catch (err) {
      setMsg({
        type: "error",
        text: err?.response?.data?.message || "Google sign-up failed ❌",
      });
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
              <input
                className="auth-input"
                type="password"
                name="password"
                placeholder="Min 6 characters"
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>

            <button className="auth-btn" type="submit" disabled={loading}>
              {loading ? "Creating..." : "Register"}
            </button>
          </form>

          {/* Divider */}
          <div className="auth-divider">
            <span>or sign up with</span>
          </div>

          {/* Google Sign-Up */}
          <div className="auth-google-wrap">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() =>
                setMsg({ type: "error", text: "Google sign-up failed ❌" })
              }
              theme="filled_black"
              size="large"
              width="100%"
              text="signup_with"
              shape="pill"
            />
          </div>

          {msg.text && <div className={`auth-msg ${msg.type}`}>{msg.text}</div>}

          <div className="auth-bottom">
            Already have an account? <Link to="/login">Login</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
