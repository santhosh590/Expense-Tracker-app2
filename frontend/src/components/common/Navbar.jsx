import { useState, useRef, useEffect, useContext } from "react";
import { formatCurrency } from "../../utils/formatCurrency";
import { useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import { TransactionContext } from "../../context/TransactionContext";
import { useBudget } from "../../context/BudgetContext";
import { Menu } from "lucide-react";

export default function Navbar({ toggleSidebar }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { transactions } = useContext(TransactionContext);
  const { budget } = useBudget();
  const [showNotif, setShowNotif] = useState(false);
  const notifRef = useRef(null);

  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "light");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === "light" ? "dark" : "light");
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotif(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Build notifications from recent transactions & budget
  const recentTx = transactions.slice(0, 5);
  const totalExpense = transactions.filter(t => t.type === "expense").reduce((a, b) => a + Number(b.amount), 0);
  const budgetLimit = budget?.limit || 0;
  const budgetWarning = budgetLimit > 0 && totalExpense >= budgetLimit * 0.8;
  const notifCount = recentTx.length + (budgetWarning ? 1 : 0);

  const handleSettingsClick = () => {
    navigate("/profile?tab=settings");
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div
      style={{
        padding: "16px 22px",
        borderBottom: "1px solid var(--border)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        background: "var(--glass)",
        backdropFilter: "blur(18px)",
        position: "sticky",
        top: 0,
        zIndex: 50,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 16, flex: 1 }}>
        {/* Hamburger Menu (Mobile) */}
        <button 
          className="hide-on-desktop" 
          onClick={toggleSidebar}
          style={{ background: "none", border: "none", color: "var(--text-main)", padding: "8px 0", cursor: "pointer", display: "flex" }}
        >
          <Menu size={26} />
        </button>

        <div className="hide-on-mobile" style={{ fontWeight: 900, letterSpacing: "-0.4px", fontSize: 18 }}>
          ExpenseTracker
        </div>

        {/* Search Bar */}
        <div style={{ position: "relative", maxWidth: 400, width: "100%", marginLeft: 24 }}>
          <input
            placeholder="Search transactions..."
            className="input"
            style={{ borderRadius: 99, paddingLeft: 40, background: "var(--glass)", border: "none" }}
          />
          <div style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", opacity: 0.5 }}>
            🔍
          </div>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          style={{
            background: "none", border: "none", fontSize: 20,
            cursor: "pointer", padding: 8, borderRadius: "50%",
            color: "var(--muted)", transition: "all 0.2s",
            display: "flex", alignItems: "center", justifyContent: "center"
          }}
          onMouseEnter={e => { e.currentTarget.style.color = "var(--primary)"; e.currentTarget.style.background = "var(--glass)"; }}
          onMouseLeave={e => { e.currentTarget.style.color = "var(--muted)"; e.currentTarget.style.background = "none"; }}
          title={`Switch to ${theme === "light" ? "Dark" : "Light"} Mode`}
        >
          {theme === "light" ? "🌙" : "☀️"}
        </button>

        {/* Notification Bell */}
        <div ref={notifRef} style={{ position: "relative" }}>
          <button
            onClick={() => setShowNotif(!showNotif)}
            style={{
              background: showNotif ? "rgba(245,158,11,0.1)" : "none",
              border: showNotif ? "1px solid rgba(245,158,11,0.2)" : "none",
              fontSize: 20, cursor: "pointer", padding: 8, borderRadius: "50%",
              color: showNotif ? "#f59e0b" : "var(--muted)", position: "relative",
              transition: "all 0.2s",
            }}
          >
            🔔
            {notifCount > 0 && (
              <span style={{
                position: "absolute", top: 2, right: 2,
                width: 16, height: 16, borderRadius: "50%",
                background: "#ef4444", color: "white",
                fontSize: 9, fontWeight: 800,
                display: "flex", alignItems: "center", justifyContent: "center",
                border: "2px solid var(--bg)",
              }}>
                {notifCount > 9 ? "9+" : notifCount}
              </span>
            )}
          </button>

          {/* Notification Dropdown */}
          {showNotif && (
            <div style={{
              position: "absolute", top: "calc(100% + 8px)", right: 0,
              width: 360, maxHeight: 420, overflowY: "auto",
              background: "var(--card)", border: "1px solid var(--border)",
              borderRadius: 16, boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
              zIndex: 999, animation: "fadeSlideDown 0.2s ease",
            }}>
              <div style={{
                padding: "16px 18px 12px", borderBottom: "1px solid var(--border)",
                display: "flex", alignItems: "center", justifyContent: "space-between",
              }}>
                <div style={{ fontWeight: 800, fontSize: 15, color: "var(--text)" }}>Notifications</div>
                <span style={{
                  fontSize: 10, fontWeight: 700, padding: "3px 10px",
                  borderRadius: 20, background: "rgba(99,102,241,0.1)",
                  color: "#6366f1",
                }}>
                  {notifCount} new
                </span>
              </div>

              <div style={{ padding: 8 }}>
                {/* Budget warning */}
                {budgetWarning && (
                  <div
                    style={{
                      display: "flex", alignItems: "flex-start", gap: 10,
                      padding: "10px 12px", borderRadius: 12, margin: "0 0 4px",
                      background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.1)",
                      cursor: "pointer", transition: "all 0.2s",
                    }}
                    onClick={() => { setShowNotif(false); navigate("/budget"); }}
                    onMouseEnter={e => { e.currentTarget.style.transform = "translateX(3px)"; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = "translateX(0)"; }}
                  >
                    <div style={{
                      width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                      background: "rgba(239,68,68,0.12)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 14,
                    }}>⚠️</div>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: "#ef4444" }}>Budget Alert</div>
                      <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>
                        You've used {budgetLimit > 0 ? Math.round((totalExpense / budgetLimit) * 100) : 0}% of your budget
                      </div>
                    </div>
                  </div>
                )}

                {/* Recent transactions */}
                {recentTx.length > 0 ? recentTx.map((tx, i) => (
                  <div
                    key={tx._id || i}
                    style={{
                      display: "flex", alignItems: "flex-start", gap: 10,
                      padding: "10px 12px", borderRadius: 12, margin: "0 0 2px",
                      cursor: "pointer", transition: "all 0.2s",
                    }}
                    onClick={() => { setShowNotif(false); navigate("/transactions"); }}
                    onMouseEnter={e => { e.currentTarget.style.background = "var(--glass)"; e.currentTarget.style.transform = "translateX(3px)"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.transform = "translateX(0)"; }}
                  >
                    <div style={{
                      width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                      background: tx.type === "income" ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.12)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 14,
                    }}>
                      {tx.type === "income" ? "💰" : "💸"}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text)" }}>{tx.title || tx.category}</div>
                      <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 1 }}>
                        {tx.type === "income" ? "+" : "-"} {formatCurrency(tx.amount)} • {tx.category}
                      </div>
                    </div>
                    <div style={{ fontSize: 10, color: "var(--muted)", flexShrink: 0, marginTop: 2 }}>
                      {new Date(tx.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                    </div>
                  </div>
                )) : (
                  <div style={{ padding: "24px 12px", textAlign: "center", color: "var(--muted)", fontSize: 13 }}>
                    No recent notifications
                  </div>
                )}
              </div>

              <div style={{
                padding: "10px 18px", borderTop: "1px solid var(--border)",
                textAlign: "center",
              }}>
                <button
                  onClick={() => { setShowNotif(false); navigate("/transactions"); }}
                  style={{
                    background: "none", border: "none", color: "#6366f1",
                    fontSize: 12, fontWeight: 700, cursor: "pointer",
                  }}
                >
                  View All Transactions →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Settings Gear */}
        <button
          onClick={handleSettingsClick}
          style={{
            background: "none", border: "none", fontSize: 20,
            cursor: "pointer", padding: 8, borderRadius: "50%",
            color: "var(--muted)", transition: "all 0.2s",
          }}
          onMouseEnter={e => { e.currentTarget.style.color = "#6366f1"; e.currentTarget.style.transform = "rotate(45deg)"; }}
          onMouseLeave={e => { e.currentTarget.style.color = "var(--muted)"; e.currentTarget.style.transform = "rotate(0deg)"; }}
          title="Settings"
        >
          ⚙️
        </button>

        <div style={{ width: 1, height: 24, background: "var(--border)", margin: "0 4px" }}></div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 13, fontWeight: 700 }}>{user?.name || "User"}</div>
          </div>
          <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800 }}>
            {user?.name?.[0]?.toUpperCase() || "U"}
          </div>
        </div>

        <button className="btn small" onClick={handleLogout} style={{ background: "rgba(255,90,90,0.1)", color: "#ff5a5a", border: "1px solid rgba(255,90,90,0.2)", marginLeft: 8 }}>
          Logout
        </button>
      </div>

      <style>{`
        @keyframes fadeSlideDown {
          0% { opacity: 0; transform: translateY(-8px); }
          100% { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
