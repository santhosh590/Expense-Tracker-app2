import { useState, useEffect, useContext, useRef, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import { TransactionContext } from "../context/TransactionContext";
import { useBudget } from "../context/BudgetContext";
import { formatCurrency } from "../utils/formatCurrency";
import AchievementBadges from "../components/dashboard/AchievementBadges";
import {
  User, Mail, Shield, Sun, Moon, CreditCard, TrendingUp,
  Calendar, Edit3, Save, X, Palette, Globe, BadgeCheck,
  Camera, Lock, ChevronRight, Sparkles, Upload, Flame,
  PiggyBank, Target, Clock, Award, Zap, BarChart3,
  LogOut, Bell, Heart, Star
} from "lucide-react";

const API_BASE = "http://localhost:5001";

export default function Profile() {
  const { user, updateUser, uploadAvatar, logout, changePassword: changePasswordApi } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { transactions } = useContext(TransactionContext);
  const { budget } = useBudget();
  const fileInputRef = useRef(null);

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: "", email: "" });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "dark");
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState(() => {
    const tabParam = searchParams.get("tab");
    return ["overview", "settings", "achievements"].includes(tabParam) ? tabParam : "overview";
  });
  const [slideDir, setSlideDir] = useState("none");
  const [slideKey, setSlideKey] = useState(0);

  // Modal states
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showNotifModal, setShowNotifModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showSubModal, setShowSubModal] = useState(false);
  const [pwForm, setPwForm] = useState({ current: "", new: "", confirm: "" });
  const [pwMsg, setPwMsg] = useState({ type: "", text: "" });
  const [pwSaving, setPwSaving] = useState(false);
  const [notifSettings, setNotifSettings] = useState(() => {
    const saved = localStorage.getItem("notifSettings");
    return saved ? JSON.parse(saved) : { email: true, push: false, budgetAlert: true, weeklyReport: true, monthlyReport: false };
  });
  const [privacySettings, setPrivacySettings] = useState(() => {
    const saved = localStorage.getItem("privacySettings");
    return saved ? JSON.parse(saved) : { twoFactor: false, sessionTimeout: "30", dataExport: false };
  });

  const tabOrder = ["overview", "settings", "achievements"];
  const switchTab = (newTab) => {
    if (newTab === activeTab) return;
    const oldIdx = tabOrder.indexOf(activeTab);
    const newIdx = tabOrder.indexOf(newTab);
    setSlideDir(newIdx > oldIdx ? "right" : "left");
    setSlideKey(k => k + 1);
    setActiveTab(newTab);
  };

  useEffect(() => {
    if (user) setForm({ name: user.name || "", email: user.email || "" });
  }, [user]);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const handleSave = async () => {
    if (!form.name.trim()) { setMsg({ type: "error", text: "Name cannot be empty" }); return; }
    setSaving(true);
    setMsg({ type: "", text: "" });
    try {
      await updateUser(form);
      setMsg({ type: "success", text: "Profile updated successfully! ✅" });
      setEditing(false);
    } catch (err) {
      setMsg({ type: "error", text: err?.response?.data?.message || "Update failed" });
    }
    setSaving(false);
    setTimeout(() => setMsg({ type: "", text: "" }), 4000);
  };

  const handleCancel = () => {
    setForm({ name: user?.name || "", email: user?.email || "" });
    setEditing(false);
    setMsg({ type: "", text: "" });
  };

  const handleAvatarClick = () => fileInputRef.current?.click();

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { setMsg({ type: "error", text: "Please select an image file." }); setTimeout(() => setMsg({ type: "", text: "" }), 3000); return; }
    if (file.size > 5 * 1024 * 1024) { setMsg({ type: "error", text: "Image must be under 5MB." }); setTimeout(() => setMsg({ type: "", text: "" }), 3000); return; }
    setUploading(true);
    try { await uploadAvatar(file); setMsg({ type: "success", text: "Profile picture updated! 📸" }); }
    catch (err) { setMsg({ type: "error", text: "Failed to upload picture." }); }
    setUploading(false);
    setTimeout(() => setMsg({ type: "", text: "" }), 4000);
    e.target.value = "";
  };

  // Change password handler
  const handleChangePassword = async () => {
    if (!pwForm.current || !pwForm.new || !pwForm.confirm) {
      setPwMsg({ type: "error", text: "All fields are required" }); return;
    }
    if (pwForm.new.length < 6) {
      setPwMsg({ type: "error", text: "New password must be at least 6 characters" }); return;
    }
    if (pwForm.new !== pwForm.confirm) {
      setPwMsg({ type: "error", text: "New passwords do not match" }); return;
    }
    setPwSaving(true);
    setPwMsg({ type: "", text: "" });
    try {
      await changePasswordApi(pwForm.current, pwForm.new);
      setPwMsg({ type: "success", text: "Password changed successfully! ✅" });
      setPwForm({ current: "", new: "", confirm: "" });
      setTimeout(() => setShowPasswordModal(false), 1500);
    } catch (err) {
      setPwMsg({ type: "error", text: err?.response?.data?.message || "Failed to change password" });
    }
    setPwSaving(false);
  };

  // Save notifications
  const handleSaveNotif = () => {
    localStorage.setItem("notifSettings", JSON.stringify(notifSettings));
    setShowNotifModal(false);
    setMsg({ type: "success", text: "Notification settings saved! 🔔" });
    setTimeout(() => setMsg({ type: "", text: "" }), 3000);
  };

  // Save privacy
  const handleSavePrivacy = () => {
    localStorage.setItem("privacySettings", JSON.stringify(privacySettings));
    setShowPrivacyModal(false);
    setMsg({ type: "success", text: "Privacy settings saved! 🔒" });
    setTimeout(() => setMsg({ type: "", text: "" }), 3000);
  };

  // Sign out handler
  const handleSignOut = () => {
    logout();
    navigate("/login");
  };

  const totalIncome = transactions.filter(t => t.type === "income").reduce((a, b) => a + Number(b.amount), 0);
  const totalExpense = transactions.filter(t => t.type === "expense").reduce((a, b) => a + Number(b.amount), 0);
  const initial = user?.name?.[0]?.toUpperCase() || "U";
  const avatarUrl = user?.avatar ? `${API_BASE}${user.avatar}` : null;

  const habits = useMemo(() => {
    const expenses = transactions.filter(t => t.type === "expense");
    const incomes = transactions.filter(t => t.type === "income");
    const catCount = {};
    expenses.forEach(t => { catCount[t.category] = (catCount[t.category] || 0) + 1; });
    const favCat = Object.entries(catCount).sort((a, b) => b[1] - a[1])[0];
    const catSpend = {};
    expenses.forEach(t => { catSpend[t.category] = (catSpend[t.category] || 0) + Number(t.amount); });
    const topSpendCat = Object.entries(catSpend).sort((a, b) => b[1] - a[1])[0];
    const avgTx = transactions.length > 0 ? transactions.reduce((a, b) => a + Number(b.amount), 0) / transactions.length : 0;
    const dates = transactions.map(t => new Date(t.date)).sort((a, b) => a - b);
    const accountAge = dates.length > 0 ? Math.ceil((new Date() - dates[0]) / 86400000) : 0;
    const biggest = expenses.length > 0 ? [...expenses].sort((a, b) => Number(b.amount) - Number(a.amount))[0] : null;
    const dowNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const dowCount = {};
    transactions.forEach(t => { const d = new Date(t.date).getDay(); dowCount[d] = (dowCount[d] || 0) + 1; });
    const topDow = Object.entries(dowCount).sort((a, b) => b[1] - a[1])[0];
    const now = new Date();
    const thisMonthTx = transactions.filter(t => { const d = new Date(t.date); return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear(); });
    const totalInc = incomes.reduce((a, b) => a + Number(b.amount), 0);
    const totalExp = expenses.reduce((a, b) => a + Number(b.amount), 0);
    const savingsRate = totalInc > 0 ? Math.round(((totalInc - totalExp) / totalInc) * 100) : 0;
    return { favCat: favCat ? { name: favCat[0], count: favCat[1] } : null, topSpendCat: topSpendCat ? { name: topSpendCat[0], amount: topSpendCat[1] } : null, avgTx, accountAge, biggest, thisMonthTx: thisMonthTx.length, topDow: topDow ? { day: dowNames[topDow[0]], count: topDow[1] } : null, savingsRate };
  }, [transactions]);

  const memberSince = user?.createdAt ? new Date(user.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long" }) : "2024";

  const tabs = [
    { id: "overview", label: "Overview", icon: <BarChart3 size={14} /> },
    { id: "settings", label: "Settings", icon: <Palette size={14} /> },
    { id: "achievements", label: "Achievements", icon: <Award size={14} /> },
  ];

  return (
    <div>
      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} style={{ display: "none" }} />

      {/* ═══ PREMIUM HERO BANNER ═══ */}
      <div style={{
        borderRadius: 24, overflow: "hidden", marginBottom: 24,
        background: "var(--card)", border: "1px solid var(--border)",
        position: "relative",
      }}>
        {/* Animated gradient banner */}
        <div style={{
          height: 160, position: "relative",
          background: "linear-gradient(135deg, #1a1035 0%, #2d1b69 20%, #6366f1 40%, #a855f7 55%, #ec4899 70%, #f59e0b 85%, #22c55e 100%)",
          backgroundSize: "300% 300%",
          animation: "gradientShift 8s ease infinite",
        }}>
          {/* Overlay pattern */}
          <div style={{
            position: "absolute", inset: 0,
            backgroundImage: "radial-gradient(rgba(255,255,255,0.05) 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }} />
          {/* Fade to card */}
          <div style={{
            position: "absolute", bottom: 0, left: 0, right: 0, height: 80,
            background: "linear-gradient(transparent, var(--card))",
          }} />
          {/* Premium badge top right */}
          <div style={{
            position: "absolute", top: 16, right: 20,
            padding: "6px 16px", borderRadius: 24,
            background: "rgba(0,0,0,0.35)", backdropFilter: "blur(12px)",
            border: "1px solid rgba(255,255,255,0.1)",
            display: "flex", alignItems: "center", gap: 6,
            fontSize: 12, fontWeight: 800, color: "#f59e0b",
          }}>
            <Crown /> Premium Member
          </div>
        </div>

        {/* Profile Info Area */}
        <div style={{ padding: "0 32px 28px", marginTop: -60, position: "relative", zIndex: 2 }}>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 24 }}>
            {/* Avatar */}
            <div style={{ position: "relative", flexShrink: 0, cursor: "pointer" }} onClick={handleAvatarClick} title="Click to change profile picture">
              <div style={{
                width: 110, height: 110, borderRadius: 28,
                padding: 3,
                background: "linear-gradient(135deg, #6366f1, #a855f7, #ec4899, #f59e0b)",
                boxShadow: "0 8px 32px rgba(99,102,241,0.3), 0 0 0 4px var(--card)",
              }}>
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" style={{
                    width: "100%", height: "100%", borderRadius: 25,
                    objectFit: "cover", display: "block",
                  }} />
                ) : (
                  <div style={{
                    width: "100%", height: "100%", borderRadius: 25,
                    background: "linear-gradient(135deg, #1e1b4b, #312e81)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 38, fontWeight: 900, color: "white",
                    textShadow: "0 2px 8px rgba(0,0,0,0.3)",
                  }}>
                    {initial}
                  </div>
                )}
              </div>
              {/* Camera overlay */}
              <div style={{
                position: "absolute", bottom: 2, right: -4,
                width: 34, height: 34, borderRadius: 12,
                background: uploading ? "linear-gradient(135deg, #f59e0b, #ef4444)" : "linear-gradient(135deg, #6366f1, #4f46e5)",
                display: "flex", alignItems: "center", justifyContent: "center",
                border: "3px solid var(--card)", cursor: "pointer",
                boxShadow: "0 4px 12px rgba(99,102,241,0.3)",
                transition: "all 0.2s",
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.1)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; }}
              >
                {uploading ? <Upload size={14} color="white" style={{ animation: "pulse 1s infinite" }} /> : <Camera size={14} color="white" />}
              </div>
            </div>

            {/* Name, email, badge */}
            <div style={{ flex: 1, minWidth: 0, paddingBottom: 6 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                <h1 style={{ fontSize: 28, fontWeight: 900, color: "var(--text)", margin: 0, letterSpacing: "-0.5px" }}>{user?.name}</h1>
                <span style={{
                  display: "inline-flex", alignItems: "center", gap: 4,
                  background: "linear-gradient(135deg, #6366f1, #4f46e5)",
                  padding: "4px 14px", borderRadius: 24,
                  fontSize: 11, fontWeight: 800, color: "white",
                  boxShadow: "0 4px 12px rgba(99,102,241,0.3)",
                }}>
                  <BadgeCheck size={12} /> Verified
                </span>
              </div>
              <div style={{ fontSize: 14, color: "var(--muted)", marginTop: 6, display: "flex", alignItems: "center", gap: 8 }}>
                <Mail size={13} /> {user?.email}
                <span style={{ opacity: 0.3 }}>•</span>
                <Calendar size={13} /> Member since {memberSince}
              </div>
            </div>

            {/* Action buttons */}
            <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
              {editing ? (
                <>
                  <button className="btn small" onClick={handleSave} disabled={saving} style={{ gap: 6, fontSize: 13 }}>
                    <Save size={13} /> {saving ? "Saving..." : "Save"}
                  </button>
                  <button className="btn small secondary" onClick={handleCancel} style={{ gap: 6, fontSize: 13 }}>
                    <X size={13} /> Cancel
                  </button>
                </>
              ) : (
                <button className="btn small secondary" onClick={() => setEditing(true)} style={{ gap: 6, fontSize: 13, padding: "8px 18px" }}>
                  <Edit3 size={13} /> Edit Profile
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ═══ STATS ROW ═══ */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 24 }}>
        {[
          { icon: <CreditCard size={20} />, value: transactions.length, label: "Transactions", color: "#6366f1", gradient: "linear-gradient(135deg, rgba(99,102,241,0.12), rgba(99,102,241,0.04))" },
          { icon: <TrendingUp size={20} />, value: formatCurrency(totalIncome), label: "Total Income", color: "#22c55e", gradient: "linear-gradient(135deg, rgba(34,197,94,0.12), rgba(34,197,94,0.04))" },
          { icon: <Flame size={20} />, value: formatCurrency(totalExpense), label: "Total Expense", color: "#ef4444", gradient: "linear-gradient(135deg, rgba(239,68,68,0.12), rgba(239,68,68,0.04))" },
          { icon: <PiggyBank size={20} />, value: `${habits.savingsRate}%`, label: "Savings Rate", color: habits.savingsRate >= 20 ? "#22c55e" : "#f59e0b", gradient: `linear-gradient(135deg, ${habits.savingsRate >= 20 ? "rgba(34,197,94,0.12)" : "rgba(245,158,11,0.12)"}, ${habits.savingsRate >= 20 ? "rgba(34,197,94,0.04)" : "rgba(245,158,11,0.04)"})` },
        ].map((stat, i) => (
          <div key={i} style={{
            background: stat.gradient, border: `1px solid ${stat.color}18`,
            borderRadius: 18, padding: "20px 18px", textAlign: "center",
            position: "relative", overflow: "hidden",
            transition: "all 0.3s ease",
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = `0 12px 32px ${stat.color}18`; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
          >
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: stat.color, opacity: 0.4 }} />
            <div style={{
              width: 46, height: 46, borderRadius: 14,
              background: `${stat.color}14`, border: `1px solid ${stat.color}20`,
              display: "flex", alignItems: "center", justifyContent: "center",
              color: stat.color, margin: "0 auto 12px",
            }}>
              {stat.icon}
            </div>
            <div style={{ fontSize: 24, fontWeight: 900, color: stat.color, letterSpacing: "-0.5px" }}>{stat.value}</div>
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", marginTop: 4, textTransform: "uppercase", letterSpacing: 0.5 }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* ═══ TAB NAVIGATION ═══ */}
      <div style={{
        display: "flex", gap: 4, marginBottom: 24,
        padding: 4, borderRadius: 16,
        background: "var(--glass)", border: "1px solid var(--border)",
        width: "fit-content",
      }}>
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => switchTab(tab.id)} style={{
            padding: "10px 22px", borderRadius: 12, border: "none",
            background: activeTab === tab.id ? "linear-gradient(135deg, #6366f1, #4f46e5)" : "transparent",
            color: activeTab === tab.id ? "white" : "var(--muted)",
            fontSize: 13, fontWeight: 700, cursor: "pointer",
            display: "flex", alignItems: "center", gap: 6,
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            boxShadow: activeTab === tab.id ? "0 4px 16px rgba(99,102,241,0.25)" : "none",
            transform: activeTab === tab.id ? "scale(1)" : "scale(0.97)",
          }}>
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* ═══ TAB CONTENT WITH SLIDE EFFECT ═══ */}
      <div key={slideKey} className={slideDir === "right" ? "profile-slide-right" : slideDir === "left" ? "profile-slide-left" : "profile-fade-in"} style={{ minHeight: 200 }}>

        {/* ═══ TAB: OVERVIEW ═══ */}
        {activeTab === "overview" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>

            {/* Account Details */}
            <div style={{
              background: "var(--card)", border: "1px solid var(--border)",
              borderRadius: 20, padding: 24, position: "relative", overflow: "hidden",
            }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: "linear-gradient(90deg, #6366f1, #818cf8)" }} />
              <div className="section-title" style={{ marginTop: 4, marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 30, height: 30, borderRadius: 9, background: "rgba(99,102,241,0.12)", display: "flex", alignItems: "center", justifyContent: "center", color: "#6366f1" }}>
                  <User size={15} />
                </div>
                Account Details
              </div>

              {msg.text && (
                <div style={{
                  padding: "10px 14px", borderRadius: 12, marginBottom: 16, fontSize: 13, fontWeight: 700,
                  background: msg.type === "success" ? "rgba(34,197,94,0.08)" : "rgba(255,90,90,0.08)",
                  color: msg.type === "success" ? "#22c55e" : "#ff5a5a",
                  border: `1px solid ${msg.type === "success" ? "rgba(34,197,94,0.2)" : "rgba(255,90,90,0.2)"}`,
                  display: "flex", alignItems: "center", gap: 8,
                }}>
                  {msg.type === "success" ? <BadgeCheck size={14} /> : <X size={14} />} {msg.text}
                </div>
              )}

              <div style={{ display: "grid", gap: 14 }}>
                {[
                  { icon: <User size={13} />, label: "Full Name", field: "name", value: user?.name },
                  { icon: <Mail size={13} />, label: "Email Address", field: "email", value: user?.email },
                ].map((field, i) => (
                  <div key={i}>
                    <label style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>
                      {field.icon} {field.label}
                    </label>
                    {editing ? (
                      <input className="input" value={form[field.field]}
                        onChange={(e) => setForm({ ...form, [field.field]: e.target.value })}
                        style={{ borderRadius: 12, padding: "12px 14px" }}
                      />
                    ) : (
                      <div style={{
                        padding: "12px 16px", borderRadius: 12,
                        background: "var(--glass)", border: "1px solid var(--border)",
                        fontSize: 14, fontWeight: 600, color: "var(--text)",
                      }}>{field.value}</div>
                    )}
                  </div>
                ))}

                {/* Status */}
                <div>
                  <label style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>
                    <Shield size={13} /> Account Status
                  </label>
                  <div style={{
                    padding: "12px 16px", borderRadius: 12,
                    background: "rgba(34,197,94,0.05)", border: "1px solid rgba(34,197,94,0.12)",
                    fontSize: 14, fontWeight: 700, display: "flex", alignItems: "center", gap: 8,
                    color: "#22c55e",
                  }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e", animation: "pulse 2s infinite", boxShadow: "0 0 6px #22c55e66" }} />
                    Active — Premium Plan
                  </div>
                </div>
              </div>
            </div>

            {/* Spending Habits */}
            <div style={{
              background: "var(--card)", border: "1px solid var(--border)",
              borderRadius: 20, padding: 24, position: "relative", overflow: "hidden",
            }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: "linear-gradient(90deg, #a855f7, #ec4899, #f59e0b)" }} />
              <div className="section-title" style={{ marginTop: 4, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 30, height: 30, borderRadius: 9, background: "rgba(168,85,247,0.12)", display: "flex", alignItems: "center", justifyContent: "center", color: "#a855f7" }}>
                  <BarChart3 size={15} />
                </div>
                Spending Habits
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {[
                  { icon: <Flame size={14} />, label: "Fav Category", value: habits.favCat ? `${habits.favCat.name}` : "—", sub: habits.favCat ? `${habits.favCat.count} transactions` : "", color: "#f59e0b" },
                  { icon: <Target size={14} />, label: "Top Spending", value: habits.topSpendCat ? habits.topSpendCat.name : "—", sub: habits.topSpendCat ? formatCurrency(habits.topSpendCat.amount) : "", color: "#ef4444" },
                  { icon: <Clock size={14} />, label: "Account Age", value: habits.accountAge > 0 ? `${habits.accountAge}d` : "New", sub: "days active", color: "#6366f1" },
                  { icon: <CreditCard size={14} />, label: "Avg Transaction", value: formatCurrency(habits.avgTx), sub: "per transaction", color: "#22c55e" },
                  { icon: <Calendar size={14} />, label: "Most Active", value: habits.topDow ? habits.topDow.day.slice(0, 3) : "—", sub: habits.topDow ? `${habits.topDow.count} times` : "", color: "#818cf8" },
                  { icon: <Sparkles size={14} />, label: "Biggest Expense", value: habits.biggest ? formatCurrency(habits.biggest.amount) : "—", sub: habits.biggest?.title || "", color: "#ec4899" },
                  { icon: <TrendingUp size={14} />, label: "This Month", value: habits.thisMonthTx, sub: "transactions", color: "#a855f7" },
                  { icon: <Heart size={14} />, label: "Savings Rate", value: `${habits.savingsRate}%`, sub: habits.savingsRate >= 20 ? "Healthy!" : "Improve", color: habits.savingsRate >= 20 ? "#22c55e" : "#f59e0b" },
                ].map((item, i) => (
                  <div key={i} style={{
                    padding: "10px 12px", borderRadius: 12,
                    background: `${item.color}06`, border: `1px solid ${item.color}10`,
                    transition: "all 0.25s ease",
                    cursor: "default",
                  }}
                    onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px) scale(1.02)"; e.currentTarget.style.boxShadow = `0 6px 16px ${item.color}12`; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0) scale(1)"; e.currentTarget.style.boxShadow = "none"; }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 5 }}>
                      <span style={{ color: item.color }}>{item.icon}</span>
                      <span style={{ fontSize: 9, fontWeight: 800, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.5 }}>{item.label}</span>
                    </div>
                    <div style={{ fontSize: 16, fontWeight: 900, color: item.color, letterSpacing: "-0.3px" }}>{item.value}</div>
                    {item.sub && <div style={{ fontSize: 9, color: "var(--muted)", marginTop: 1, fontWeight: 600 }}>{item.sub}</div>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ═══ TAB: SETTINGS ═══ */}
        {activeTab === "settings" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>

            {/* Appearance */}
            <div style={{
              background: "var(--card)", border: "1px solid var(--border)",
              borderRadius: 20, padding: 24, position: "relative", overflow: "hidden",
            }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: "linear-gradient(90deg, #6366f1, #a855f7)" }} />
              <div className="section-title" style={{ marginTop: 4, marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 30, height: 30, borderRadius: 9, background: "rgba(99,102,241,0.12)", display: "flex", alignItems: "center", justifyContent: "center", color: "#6366f1" }}>
                  <Palette size={15} />
                </div>
                Appearance
              </div>

              {/* Theme Selector */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8, display: "block" }}>Theme</label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  {[
                    { id: "dark", icon: <Moon size={18} />, label: "Dark", desc: "Easy on the eyes", bg: "linear-gradient(135deg, #0f0a1a, #1a1035)" },
                    { id: "light", icon: <Sun size={18} />, label: "Light", desc: "Bright & clean", bg: "linear-gradient(135deg, #f8fafc, #e2e8f0)" },
                  ].map(t => (
                    <div key={t.id} onClick={() => setTheme(t.id)} style={{
                      padding: "16px", borderRadius: 14,
                      border: theme === t.id ? "2px solid #6366f1" : "1px solid var(--border)",
                      background: theme === t.id ? "rgba(99,102,241,0.06)" : "var(--glass)",
                      cursor: "pointer", textAlign: "center",
                      transition: "all 0.2s",
                    }}
                      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; }}
                      onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; }}
                    >
                      <div style={{
                        width: 44, height: 44, borderRadius: 12, margin: "0 auto 10px",
                        background: t.bg, border: "1px solid var(--border)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        color: theme === t.id ? "#6366f1" : "var(--muted)",
                      }}>
                        {t.icon}
                      </div>
                      <div style={{ fontWeight: 700, fontSize: 13, color: "var(--text)" }}>{t.label}</div>
                      <div style={{ fontSize: 10, color: "var(--muted)", marginTop: 2 }}>{t.desc}</div>
                      {theme === t.id && <div style={{ fontSize: 9, fontWeight: 800, color: "#6366f1", marginTop: 6 }}>✓ ACTIVE</div>}
                    </div>
                  ))}
                </div>
              </div>

              {/* Currency & Language */}
              <div style={{ display: "grid", gap: 14 }}>
                <div>
                  <label style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>
                    <Globe size={12} /> Currency
                  </label>
                  <select className="input" style={{ cursor: "pointer", borderRadius: 12, padding: "12px 14px" }}>
                    <option>INR (₹)</option><option>USD ($)</option><option>EUR (€)</option><option>GBP (£)</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>
                    <Globe size={12} /> Language
                  </label>
                  <select className="input" style={{ cursor: "pointer", borderRadius: 12, padding: "12px 14px" }}>
                    <option>English</option><option>Hindi</option><option>Spanish</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div style={{
              background: "var(--card)", border: "1px solid var(--border)",
              borderRadius: 20, padding: 24, position: "relative", overflow: "hidden",
            }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: "linear-gradient(90deg, #ec4899, #f59e0b)" }} />
              <div className="section-title" style={{ marginTop: 4, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 30, height: 30, borderRadius: 9, background: "rgba(236,72,153,0.12)", display: "flex", alignItems: "center", justifyContent: "center", color: "#ec4899" }}>
                  <Zap size={15} />
                </div>
                Quick Actions
              </div>

              <div style={{ display: "grid", gap: 8 }}>
                {[
                  { icon: <Camera size={16} />, label: "Change Profile Picture", sub: "Upload a new avatar (max 5MB)", color: "#6366f1", onClick: handleAvatarClick },
                  { icon: <Lock size={16} />, label: "Change Password", sub: "Update your security credentials", color: "#a855f7", onClick: () => { setPwMsg({ type: "", text: "" }); setPwForm({ current: "", new: "", confirm: "" }); setShowPasswordModal(true); } },
                  { icon: <Bell size={16} />, label: "Notifications", sub: "Configure alerts & reminders", color: "#f59e0b", onClick: () => setShowNotifModal(true) },
                  { icon: <Shield size={16} />, label: "Privacy & Security", sub: "Two-factor, sessions, data", color: "#22c55e", onClick: () => setShowPrivacyModal(true) },
                  { icon: <Star size={16} />, label: "Manage Subscription", sub: "Premium Plan — Active", color: "#ec4899", onClick: () => setShowSubModal(true) },
                  { icon: <LogOut size={16} />, label: "Sign Out", sub: "Log out from your account", color: "#ef4444", onClick: handleSignOut },
                ].map((item, i) => (
                  <div key={i} style={{
                    display: "flex", alignItems: "center", gap: 12,
                    padding: "12px 14px", borderRadius: 14,
                    border: "1px solid var(--border)", background: "var(--glass)",
                    cursor: "pointer", transition: "all 0.2s",
                  }}
                    onClick={item.onClick || undefined}
                    onMouseEnter={e => { e.currentTarget.style.background = `${item.color}06`; e.currentTarget.style.borderColor = `${item.color}25`; e.currentTarget.style.transform = "translateX(4px)"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "var(--glass)"; e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.transform = "translateX(0)"; }}
                  >
                    <div style={{
                      width: 38, height: 38, borderRadius: 11,
                      background: `${item.color}10`, border: `1px solid ${item.color}18`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: item.color, flexShrink: 0,
                    }}>
                      {item.icon}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: 13, color: "var(--text)" }}>{item.label}</div>
                      <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 1 }}>{item.sub}</div>
                    </div>
                    <ChevronRight size={14} style={{ opacity: 0.3, flexShrink: 0, color: item.color }} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ═══ TAB: ACHIEVEMENTS ═══ */}
        {activeTab === "achievements" && (
          <AchievementBadges />
        )}

      </div> {/* end slide wrapper */}

      <style>{`
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        @keyframes slideFromRight {
          0% { opacity: 0; transform: translateX(40px); }
          100% { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideFromLeft {
          0% { opacity: 0; transform: translateX(-40px); }
          100% { opacity: 1; transform: translateX(0); }
        }
        @keyframes fadeSlideUp {
          0% { opacity: 0; transform: translateY(16px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .profile-slide-right {
          animation: slideFromRight 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .profile-slide-left {
          animation: slideFromLeft 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .profile-fade-in {
          animation: fadeSlideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .profile-slide-right > *,
        .profile-slide-left > *,
        .profile-fade-in > * {
          animation: fadeSlideUp 0.45s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        .profile-slide-right > *:nth-child(2),
        .profile-slide-left > *:nth-child(2),
        .profile-fade-in > *:nth-child(2) {
          animation-delay: 0.06s;
        }
        .profile-slide-right > *:nth-child(3),
        .profile-slide-left > *:nth-child(3),
        .profile-fade-in > *:nth-child(3) {
          animation-delay: 0.12s;
        }
      `}</style>

      {/* ═══ CHANGE PASSWORD MODAL ═══ */}
      {showPasswordModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => setShowPasswordModal(false)}>
          <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 20, padding: 28, width: 420, maxWidth: "90vw", position: "relative" }} onClick={e => e.stopPropagation()}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: "linear-gradient(90deg, #a855f7, #6366f1)", borderRadius: "20px 20px 0 0" }} />
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(168,85,247,0.12)", display: "flex", alignItems: "center", justifyContent: "center", color: "#a855f7" }}><Lock size={18} /></div>
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "var(--text)" }}>Change Password</h3>
              </div>
              <button onClick={() => setShowPasswordModal(false)} style={{ background: "none", border: "none", color: "var(--muted)", cursor: "pointer", padding: 4 }}><X size={18} /></button>
            </div>
            {pwMsg.text && <div style={{ padding: "10px 14px", borderRadius: 10, marginBottom: 14, fontSize: 13, fontWeight: 700, background: pwMsg.type === "success" ? "rgba(34,197,94,0.08)" : "rgba(255,90,90,0.08)", color: pwMsg.type === "success" ? "#22c55e" : "#ff5a5a", border: `1px solid ${pwMsg.type === "success" ? "rgba(34,197,94,0.2)" : "rgba(255,90,90,0.2)"}` }}>{pwMsg.text}</div>}
            <div style={{ display: "grid", gap: 14 }}>
              {[{ label: "Current Password", key: "current" }, { label: "New Password", key: "new" }, { label: "Confirm New Password", key: "confirm" }].map(f => (
                <div key={f.key}>
                  <label style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6, display: "block" }}>{f.label}</label>
                  <input type="password" className="input" value={pwForm[f.key]} onChange={e => setPwForm({ ...pwForm, [f.key]: e.target.value })} style={{ borderRadius: 12, padding: "12px 14px", width: "100%", boxSizing: "border-box" }} placeholder={f.label} />
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 20, justifyContent: "flex-end" }}>
              <button className="btn small secondary" onClick={() => setShowPasswordModal(false)} style={{ fontSize: 13 }}>Cancel</button>
              <button className="btn small" onClick={handleChangePassword} disabled={pwSaving} style={{ fontSize: 13, gap: 6 }}><Save size={13} /> {pwSaving ? "Saving..." : "Update Password"}</button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ NOTIFICATIONS MODAL ═══ */}
      {showNotifModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => setShowNotifModal(false)}>
          <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 20, padding: 28, width: 420, maxWidth: "90vw", position: "relative" }} onClick={e => e.stopPropagation()}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: "linear-gradient(90deg, #f59e0b, #eab308)", borderRadius: "20px 20px 0 0" }} />
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(245,158,11,0.12)", display: "flex", alignItems: "center", justifyContent: "center", color: "#f59e0b" }}><Bell size={18} /></div>
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "var(--text)" }}>Notifications</h3>
              </div>
              <button onClick={() => setShowNotifModal(false)} style={{ background: "none", border: "none", color: "var(--muted)", cursor: "pointer", padding: 4 }}><X size={18} /></button>
            </div>
            <div style={{ display: "grid", gap: 12 }}>
              {[
                { key: "email", label: "Email Notifications", desc: "Receive updates via email" },
                { key: "push", label: "Push Notifications", desc: "Browser push notifications" },
                { key: "budgetAlert", label: "Budget Alerts", desc: "Alert when nearing budget limit" },
                { key: "weeklyReport", label: "Weekly Report", desc: "Spending summary every week" },
                { key: "monthlyReport", label: "Monthly Report", desc: "Detailed monthly breakdown" },
              ].map(item => (
                <div key={item.key} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", borderRadius: 12, border: "1px solid var(--border)", background: "var(--glass)" }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 13, color: "var(--text)" }}>{item.label}</div>
                    <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>{item.desc}</div>
                  </div>
                  <div onClick={() => setNotifSettings(s => ({ ...s, [item.key]: !s[item.key] }))} style={{ width: 44, height: 24, borderRadius: 12, background: notifSettings[item.key] ? "#22c55e" : "var(--border)", cursor: "pointer", position: "relative", transition: "all 0.3s" }}>
                    <div style={{ width: 18, height: 18, borderRadius: "50%", background: "white", position: "absolute", top: 3, left: notifSettings[item.key] ? 23 : 3, transition: "all 0.3s", boxShadow: "0 2px 4px rgba(0,0,0,0.2)" }} />
                  </div>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 20, justifyContent: "flex-end" }}>
              <button className="btn small secondary" onClick={() => setShowNotifModal(false)} style={{ fontSize: 13 }}>Cancel</button>
              <button className="btn small" onClick={handleSaveNotif} style={{ fontSize: 13, gap: 6 }}><Save size={13} /> Save Settings</button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ PRIVACY & SECURITY MODAL ═══ */}
      {showPrivacyModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => setShowPrivacyModal(false)}>
          <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 20, padding: 28, width: 420, maxWidth: "90vw", position: "relative" }} onClick={e => e.stopPropagation()}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: "linear-gradient(90deg, #22c55e, #16a34a)", borderRadius: "20px 20px 0 0" }} />
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(34,197,94,0.12)", display: "flex", alignItems: "center", justifyContent: "center", color: "#22c55e" }}><Shield size={18} /></div>
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "var(--text)" }}>Privacy & Security</h3>
              </div>
              <button onClick={() => setShowPrivacyModal(false)} style={{ background: "none", border: "none", color: "var(--muted)", cursor: "pointer", padding: 4 }}><X size={18} /></button>
            </div>
            <div style={{ display: "grid", gap: 12 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", borderRadius: 12, border: "1px solid var(--border)", background: "var(--glass)" }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 13, color: "var(--text)" }}>Two-Factor Authentication</div>
                  <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>Extra security for your account</div>
                </div>
                <div onClick={() => setPrivacySettings(s => ({ ...s, twoFactor: !s.twoFactor }))} style={{ width: 44, height: 24, borderRadius: 12, background: privacySettings.twoFactor ? "#22c55e" : "var(--border)", cursor: "pointer", position: "relative", transition: "all 0.3s" }}>
                  <div style={{ width: 18, height: 18, borderRadius: "50%", background: "white", position: "absolute", top: 3, left: privacySettings.twoFactor ? 23 : 3, transition: "all 0.3s", boxShadow: "0 2px 4px rgba(0,0,0,0.2)" }} />
                </div>
              </div>
              <div style={{ padding: "12px 14px", borderRadius: 12, border: "1px solid var(--border)", background: "var(--glass)" }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6, display: "block" }}>Session Timeout (minutes)</label>
                <select className="input" value={privacySettings.sessionTimeout} onChange={e => setPrivacySettings(s => ({ ...s, sessionTimeout: e.target.value }))} style={{ borderRadius: 10, padding: "10px 12px", width: "100%", boxSizing: "border-box" }}>
                  <option value="15">15 minutes</option>
                  <option value="30">30 minutes</option>
                  <option value="60">1 hour</option>
                  <option value="120">2 hours</option>
                </select>
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", borderRadius: 12, border: "1px solid var(--border)", background: "var(--glass)" }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 13, color: "var(--text)" }}>Export My Data</div>
                  <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>Download all your data as JSON</div>
                </div>
                <button className="btn small secondary" style={{ fontSize: 11, padding: "6px 14px" }} onClick={() => { const data = { user: { name: user?.name, email: user?.email }, transactions }; const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }); const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = "expense_tracker_data.json"; a.click(); URL.revokeObjectURL(url); }}>Download</button>
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 20, justifyContent: "flex-end" }}>
              <button className="btn small secondary" onClick={() => setShowPrivacyModal(false)} style={{ fontSize: 13 }}>Cancel</button>
              <button className="btn small" onClick={handleSavePrivacy} style={{ fontSize: 13, gap: 6 }}><Save size={13} /> Save Settings</button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ MANAGE SUBSCRIPTION MODAL ═══ */}
      {showSubModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => setShowSubModal(false)}>
          <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 20, padding: 28, width: 440, maxWidth: "90vw", position: "relative" }} onClick={e => e.stopPropagation()}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: "linear-gradient(90deg, #ec4899, #f59e0b)", borderRadius: "20px 20px 0 0" }} />
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(236,72,153,0.12)", display: "flex", alignItems: "center", justifyContent: "center", color: "#ec4899" }}><Star size={18} /></div>
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "var(--text)" }}>Manage Subscription</h3>
              </div>
              <button onClick={() => setShowSubModal(false)} style={{ background: "none", border: "none", color: "var(--muted)", cursor: "pointer", padding: 4 }}><X size={18} /></button>
            </div>
            <div style={{ padding: 20, borderRadius: 16, background: "linear-gradient(135deg, rgba(236,72,153,0.08), rgba(245,158,11,0.08))", border: "1px solid rgba(236,72,153,0.15)", marginBottom: 16, textAlign: "center" }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: "#f59e0b", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>Current Plan</div>
              <div style={{ fontSize: 28, fontWeight: 900, color: "var(--text)", letterSpacing: "-0.5px" }}>Premium</div>
              <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 4 }}>Unlimited access to all features</div>
              <div style={{ display: "inline-flex", padding: "4px 14px", borderRadius: 20, background: "rgba(34,197,94,0.1)", color: "#22c55e", fontSize: 11, fontWeight: 800, marginTop: 10, gap: 4, alignItems: "center" }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e" }} /> Active
              </div>
            </div>
            <div style={{ display: "grid", gap: 8 }}>
              {["Unlimited transactions", "Advanced analytics & reports", "Budget tracking & alerts", "Data export (PDF, Excel, JSON)", "Priority support", "Custom categories"].map((feature, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", borderRadius: 10, background: "var(--glass)", border: "1px solid var(--border)" }}>
                  <BadgeCheck size={14} style={{ color: "#22c55e", flexShrink: 0 }} />
                  <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>{feature}</span>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 20, justifyContent: "flex-end" }}>
              <button className="btn small secondary" onClick={() => setShowSubModal(false)} style={{ fontSize: 13 }}>Close</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

function Crown() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7z" />
      <path d="M5 16h14v2H5z" />
    </svg>
  );
}
