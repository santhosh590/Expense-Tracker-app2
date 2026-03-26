import { NavLink, useLocation } from "react-router-dom";
import { useContext, useState, useEffect } from "react";
import {
  LayoutDashboard, Receipt, BarChart3, Wallet, User as UserIcon,
  Target, CalendarDays, Users, Wifi, WifiOff, Shield, Sparkles
} from "lucide-react";
import useAuth from "../../hooks/useAuth";
import { TransactionContext } from "../../context/TransactionContext";

export default function Sidebar({ isOpen, close }) {
  const location = useLocation();
  const { user } = useAuth();
  const { isRefreshing } = useContext(TransactionContext);

  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const links = [
    { name: "Dashboard", path: "/dashboard", icon: <LayoutDashboard size={20} /> },
    { name: "Transactions", path: "/transactions", icon: <Receipt size={20} /> },
    { name: "Calendar", path: "/calendar", icon: <CalendarDays size={20} /> },
    { name: "Reports", path: "/reports", icon: <BarChart3 size={20} /> },
    { name: "AI Advisor", path: "/ai-advisor", icon: <Sparkles size={20} /> },
    { name: "Budget", path: "/budget", icon: <Wallet size={20} /> },
    { name: "Savings Goals", path: "/savings", icon: <Target size={20} /> },
    { name: "Split Bills", path: "/split", icon: <Users size={20} /> },
    { name: "Security", path: "/security", icon: <Shield size={20} /> },
    { name: "Profile", path: "/profile", icon: <UserIcon size={20} /> },
  ];

  const initial = user?.name
    ? user.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  const timeStr = currentTime.toLocaleTimeString("en-US", {
    hour: "2-digit", minute: "2-digit",
  });

  const dateStr = currentTime.toLocaleDateString("en-US", {
    month: "short", day: "numeric",
  });

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          onClick={close}
          style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 998,
            backdropFilter: "blur(4px)"
          }}
          className="hide-on-desktop"
        />
      )}
      <div
        className={`sidebar sidebar-container ${isOpen ? 'open' : ''}`}
        style={{
          width: 280, height: "100vh",
          background: "var(--card-dark)",
          borderRight: "1px solid var(--border)",
          display: "flex", flexDirection: "column",
          padding: "24px",
          position: "sticky", top: 0
        }}
      >
      <div style={{ marginBottom: 32, paddingLeft: 12 }}>
        <div style={{
          fontSize: 22, fontWeight: 800, color: "var(--text-main)",
          display: "flex", alignItems: "center", gap: 10
        }}>
          ExpensePro
        </div>
        {/* Live Clock in Sidebar */}
        <div style={{
          marginTop: 8, display: "flex", alignItems: "center", gap: 8,
          paddingLeft: 2,
        }}>
          <span style={{
            fontSize: 18, fontWeight: 900, letterSpacing: "-0.5px",
            fontFamily: "'SF Mono', 'Cascadia Code', monospace",
            background: "linear-gradient(90deg, #6366f1, #ec4899)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>{timeStr}</span>
          <span style={{ fontSize: 11, color: "var(--muted)", fontWeight: 600 }}>{dateStr}</span>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1 }}>
        {links.map((link) => {
          const isActive = location.pathname === link.path;
          return (
            <NavLink
              key={link.path}
              to={link.path}
              style={{
                textDecoration: "none",
                display: "flex", alignItems: "center", gap: 14,
                padding: "12px 16px", borderRadius: "14px",
                color: isActive ? "#fff" : "var(--text-muted)",
                background: isActive ? "linear-gradient(90deg, var(--primary), #4f46e5)" : "transparent",
                fontWeight: isActive ? 600 : 500,
                fontSize: 14,
                transition: "all 0.2s ease",
                boxShadow: isActive ? "0 10px 20px -5px rgba(99, 102, 241, 0.4)" : "none",
              }}
            >
              {link.icon}
              {link.name}
            </NavLink>
          );
        })}
      </div>

      {/* Connection Status */}
      <div style={{
        padding: "10px 14px", borderRadius: 12,
        background: "var(--glass)", border: "1px solid var(--border)",
        marginBottom: 14,
        display: "flex", alignItems: "center", gap: 8,
      }}>
        <div style={{
          width: 8, height: 8, borderRadius: "50%",
          background: isRefreshing ? "#f59e0b" : "#22c55e",
          boxShadow: `0 0 8px ${isRefreshing ? "#f59e0b" : "#22c55e"}55`,
          animation: "pulse 2s infinite",
        }} />
        <span style={{ fontSize: 11, fontWeight: 700, color: isRefreshing ? "#f59e0b" : "#22c55e" }}>
          {isRefreshing ? "Syncing data..." : "Connected"}
        </span>
        <span style={{ marginLeft: "auto", fontSize: 10, color: "var(--muted)" }}>
          {isRefreshing ? <WifiOff size={12} /> : <Wifi size={12} />}
        </span>
      </div>

      <div style={{ borderTop: "1px solid var(--border)", paddingTop: 16 }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 12,
          padding: "12px",
          borderRadius: 14, background: "var(--glass)",
          cursor: "pointer"
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: "50%",
            background: "var(--secondary)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 700, fontSize: 13
          }}>
            {initial}
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600 }}>{user?.name || "User"}</div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
    </>
  );
}
