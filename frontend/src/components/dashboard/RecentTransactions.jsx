import { useState, useEffect } from "react";
import { formatCurrency } from "../../utils/formatCurrency";
import { Pizza, Home, Banknote, ShoppingCart, ShoppingBag, Car, Clapperboard, HeartPulse, GraduationCap, Package, FileText, Clock } from "lucide-react";

function LiveTimeAgo({ date }) {
  const getTimeAgo = (dateStr) => {
    if (!dateStr) return "";
    const now = new Date();
    const d = new Date(dateStr);
    const seconds = Math.floor((now - d) / 1000);
    if (seconds < 10) return "just now";
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    if (days < 30) return `${Math.floor(days / 7)}w ago`;
    return d.toLocaleDateString();
  };

  const [text, setText] = useState(() => getTimeAgo(date));

  useEffect(() => {
    setText(getTimeAgo(date));
    const interval = setInterval(() => setText(getTimeAgo(date)), 30000);
    return () => clearInterval(interval);
  }, [date]);

  return <span>{text}</span>;
}

export default function RecentTransactions({ list = [] }) {
  const getCategoryIcon = (category) => {
    const map = {
      Food: <Pizza size={18} />, Rent: <Home size={18} />, Salary: <Banknote size={18} />,
      Grocery: <ShoppingCart size={18} />, Shopping: <ShoppingBag size={18} />,
      Transport: <Car size={18} />, Entertainment: <Clapperboard size={18} />,
      Health: <HeartPulse size={18} />, Education: <GraduationCap size={18} />,
      Other: <Package size={18} />,
    };
    return map[category] || <FileText size={18} />;
  };

  // Sort by date, newest first
  const sorted = [...list].sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <div className="card" style={{ flex: 1, position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: "linear-gradient(90deg, #6366f1, #ec4899)" }} />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 4 }}>
        <div className="section-title" style={{ marginBottom: 0 }}>Recent Transactions</div>
        <div style={{
          padding: "3px 10px", borderRadius: 12,
          background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.15)",
          fontSize: 11, fontWeight: 700, color: "#818cf8",
          display: "flex", alignItems: "center", gap: 4,
        }}>
          <div style={{
            width: 6, height: 6, borderRadius: "50%", background: "#22c55e",
            animation: "pulse 2s infinite",
          }} />
          Live
        </div>
      </div>

      <div style={{ marginTop: 14, display: "grid", gap: 8 }}>
        {sorted.length === 0 ? (
          <div style={{ opacity: 0.6, fontSize: 13, textAlign: "center", padding: 20 }}>No transactions yet.</div>
        ) : (
          sorted.slice(0, 8).map((t, i) => (
            <div
              key={t._id}
              style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "10px 14px", borderRadius: 14,
                border: "1px solid var(--border)", background: "var(--glass)",
                transition: "all 0.3s ease",
                animation: `fadeSlideIn 0.3s ease ${i * 0.05}s both`,
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateX(4px)"; e.currentTarget.style.borderColor = "rgba(99,102,241,0.3)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "translateX(0)"; e.currentTarget.style.borderColor = "var(--border)"; }}
            >
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 12,
                  background: t.type === "income"
                    ? "linear-gradient(135deg, rgba(16,185,129,0.15), rgba(16,185,129,0.05))"
                    : "linear-gradient(135deg, rgba(239,68,68,0.15), rgba(239,68,68,0.05))",
                  color: t.type === "income" ? "#10b981" : "#ef4444",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  {getCategoryIcon(t.category)}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 13, color: "var(--text)" }}>
                    {t.title || t.category}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2, display: "flex", alignItems: "center", gap: 4 }}>
                    <span>{t.category}</span>
                    <span style={{ opacity: 0.4 }}>•</span>
                    <Clock size={10} style={{ opacity: 0.6 }} />
                    <LiveTimeAgo date={t.date || t.createdAt} />
                  </div>
                </div>
              </div>

              <div style={{
                fontWeight: 900, fontSize: 14,
                color: t.type === "income" ? "#22c55e" : "#ef4444",
              }}>
                {t.type === "income" ? "+" : "−"}{formatCurrency(t.amount)}
              </div>
            </div>
          ))
        )}
      </div>

      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
