import { useState, useEffect } from "react";
import { formatCurrency } from "../../utils/formatCurrency";
import { formatDate } from "../../utils/formatDate";
import { RefreshCw, Trash2, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownLeft } from "lucide-react";

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
    return "";
  };
  const [text, setText] = useState(() => getTimeAgo(date));
  useEffect(() => {
    setText(getTimeAgo(date));
    const interval = setInterval(() => setText(getTimeAgo(date)), 30000);
    return () => clearInterval(interval);
  }, [date]);
  if (!text) return null;
  return <span style={{ color: "#818cf8", fontWeight: 600 }}>{text}</span>;
}

export default function TransactionList({ list = [], onDelete }) {
  const getCategoryIcon = (category) => {
    const map = {
      Food: "🍕", Rent: "🏠", Salary: "💰", Grocery: "🛒",
      Shopping: "🛍️", Transport: "🚗", Entertainment: "🎬",
      Health: "🏥", Education: "🎓", Travel: "✈️",
      Bills: "📃", Freelance: "💻", Investment: "📈",
      Business: "💼", Other: "📦", Recharge: "📱",
      Utilities: "💡", Insurance: "🛡️", Gift: "🎁",
    };
    return map[category] || "📄";
  };

  const totalIncome = list.filter(t => t.type === "income").reduce((a, b) => a + Number(b.amount), 0);
  const totalExpense = list.filter(t => t.type === "expense").reduce((a, b) => a + Number(b.amount), 0);
  const incomeCount = list.filter(t => t.type === "income").length;
  const expenseCount = list.filter(t => t.type === "expense").length;

  return (
    <div className="card" style={{ position: "relative", overflow: "hidden" }}>
      {/* Accent */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 3,
        background: "linear-gradient(90deg, #22c55e, #6366f1, #ef4444)",
      }} />

      <div className="section-title" style={{ marginTop: 4, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          📋 Transaction History
          <span style={{
            fontSize: 11, fontWeight: 800, color: "#818cf8", marginLeft: 4,
            padding: "2px 10px", borderRadius: 20,
            background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.15)",
          }}>
            {list.length}
          </span>
        </div>
      </div>

      {/* Summary mini-cards */}
      {list.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, margin: "16px 0" }}>
          <div style={{
            padding: "12px 14px", borderRadius: 14,
            background: "linear-gradient(135deg, rgba(34,197,94,0.08), rgba(34,197,94,0.02))",
            border: "1px solid rgba(34,197,94,0.12)",
            display: "flex", alignItems: "center", gap: 10,
          }}>
            <div style={{
              width: 34, height: 34, borderRadius: 10,
              background: "rgba(34,197,94,0.12)", display: "flex",
              alignItems: "center", justifyContent: "center",
            }}>
              <ArrowDownLeft size={16} style={{ color: "#22c55e" }} />
            </div>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#22c55e", textTransform: "uppercase", letterSpacing: 0.5 }}>Income ({incomeCount})</div>
              <div style={{ fontSize: 16, fontWeight: 900, color: "#22c55e", letterSpacing: "-0.3px" }}>+{formatCurrency(totalIncome)}</div>
            </div>
          </div>
          <div style={{
            padding: "12px 14px", borderRadius: 14,
            background: "linear-gradient(135deg, rgba(239,68,68,0.08), rgba(239,68,68,0.02))",
            border: "1px solid rgba(239,68,68,0.12)",
            display: "flex", alignItems: "center", gap: 10,
          }}>
            <div style={{
              width: 34, height: 34, borderRadius: 10,
              background: "rgba(239,68,68,0.12)", display: "flex",
              alignItems: "center", justifyContent: "center",
            }}>
              <ArrowUpRight size={16} style={{ color: "#ef4444" }} />
            </div>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#ef4444", textTransform: "uppercase", letterSpacing: 0.5 }}>Expense ({expenseCount})</div>
              <div style={{ fontSize: 16, fontWeight: 900, color: "#ef4444", letterSpacing: "-0.3px" }}>-{formatCurrency(totalExpense)}</div>
            </div>
          </div>
        </div>
      )}

      <div style={{ marginTop: 8, display: "grid", gap: 10 }}>
        {list.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px 20px" }}>
            <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.15 }}>💸</div>
            <div style={{ fontWeight: 800, fontSize: 16, color: "var(--text)", marginBottom: 8 }}>No transactions found</div>
            <div style={{ color: "var(--muted)", fontSize: 13, maxWidth: 280, margin: "0 auto" }}>
              Add your first transaction or adjust your filters to see results here.
            </div>
          </div>
        ) : (
          list.map((t) => {
            const isIncome = t.type === "income";
            const accentColor = isIncome ? "#22c55e" : "#ef4444";
            const bgTint = isIncome
              ? "linear-gradient(135deg, rgba(34,197,94,0.04), rgba(34,197,94,0.01))"
              : "linear-gradient(135deg, rgba(239,68,68,0.04), rgba(239,68,68,0.01))";

            return (
              <div
                key={t._id}
                style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "16px 18px", borderRadius: 16,
                  border: `1px solid ${accentColor}15`,
                  background: bgTint,
                  transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                  cursor: "default",
                  position: "relative",
                  overflow: "hidden",
                  borderLeft: `3px solid ${accentColor}`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateX(6px) scale(1.005)";
                  e.currentTarget.style.boxShadow = `0 8px 24px ${accentColor}12`;
                  e.currentTarget.style.borderColor = `${accentColor}30`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateX(0) scale(1)";
                  e.currentTarget.style.boxShadow = "none";
                  e.currentTarget.style.borderColor = `${accentColor}15`;
                }}
              >
                <div style={{ display: "flex", gap: 14, alignItems: "center", flex: 1, minWidth: 0 }}>
                  {/* Category Icon */}
                  <div style={{
                    width: 48, height: 48, borderRadius: 14, flexShrink: 0,
                    background: isIncome
                      ? "linear-gradient(135deg, rgba(34,197,94,0.15), rgba(34,197,94,0.06))"
                      : "linear-gradient(135deg, rgba(239,68,68,0.15), rgba(239,68,68,0.06))",
                    border: `1px solid ${accentColor}18`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 22, position: "relative",
                  }}>
                    {getCategoryIcon(t.category)}
                    {/* Mini type indicator */}
                    <div style={{
                      position: "absolute", bottom: -2, right: -2,
                      width: 16, height: 16, borderRadius: "50%",
                      background: accentColor, display: "flex",
                      alignItems: "center", justifyContent: "center",
                      border: "2px solid var(--card)",
                    }}>
                      {isIncome
                        ? <TrendingUp size={8} style={{ color: "white" }} />
                        : <TrendingDown size={8} style={{ color: "white" }} />
                      }
                    </div>
                  </div>

                  {/* Details */}
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                      <span style={{ fontWeight: 800, fontSize: 14, color: "var(--text)" }}>{t.title}</span>
                      {/* Type badge */}
                      <span style={{
                        fontSize: 9, fontWeight: 800, padding: "2px 8px",
                        borderRadius: 6, textTransform: "uppercase", letterSpacing: 0.5,
                        background: `${accentColor}12`,
                        color: accentColor,
                        border: `1px solid ${accentColor}18`,
                      }}>
                        {isIncome ? "Income" : "Expense"}
                      </span>
                      {t.isRecurring && (
                        <span style={{
                          display: "inline-flex", alignItems: "center", gap: 3,
                          padding: "2px 8px", borderRadius: 8, fontSize: 10, fontWeight: 700,
                          background: "rgba(99,102,241,0.08)", color: "#6366f1",
                          border: "1px solid rgba(99,102,241,0.15)",
                        }}>
                          <RefreshCw size={10} /> {t.recurringInterval}
                        </span>
                      )}
                    </div>
                    <div style={{ color: "var(--muted)", fontSize: 12, marginTop: 4, display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 3 }}>
                        📅 {formatDate(t.date)}
                      </span>
                      <span style={{ opacity: 0.3 }}>•</span>
                      <span>{getCategoryIcon(t.category)} {t.category}</span>
                      <LiveTimeAgo date={t.date || t.createdAt} />
                      {t.notes && (
                        <>
                          <span style={{ opacity: 0.3 }}>•</span>
                          <span style={{ fontStyle: "italic", opacity: 0.7 }}>"{t.notes}"</span>
                        </>
                      )}
                    </div>
                    {t.tags && t.tags.length > 0 && (
                      <div style={{ display: "flex", gap: 4, marginTop: 6, flexWrap: "wrap" }}>
                        {t.tags.map((tag, i) => (
                          <span key={i} style={{
                            fontSize: 10, fontWeight: 800, padding: "2px 8px",
                            borderRadius: 20,
                            background: "rgba(236,72,153,0.08)", color: "#ec4899",
                            border: "1px solid rgba(236,72,153,0.12)",
                          }}>
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Amount & Delete */}
                <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
                  <div style={{
                    padding: "8px 16px", borderRadius: 12,
                    background: `${accentColor}08`,
                    border: `1px solid ${accentColor}12`,
                  }}>
                    <div style={{
                      fontWeight: 900, fontSize: 17, letterSpacing: "-0.3px",
                      color: accentColor,
                    }}>
                      {isIncome ? "+" : "-"}{formatCurrency(t.amount)}
                    </div>
                  </div>
                  <div
                    onClick={() => onDelete(t._id)}
                    style={{
                      width: 32, height: 32, borderRadius: 10, cursor: "pointer",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      transition: "all 0.2s", opacity: 0.2,
                      background: "transparent",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.opacity = 1;
                      e.currentTarget.style.background = "rgba(239,68,68,0.1)";
                      e.currentTarget.style.color = "#ef4444";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.opacity = 0.2;
                      e.currentTarget.style.background = "transparent";
                      e.currentTarget.style.color = "inherit";
                    }}
                  >
                    <Trash2 size={15} />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

