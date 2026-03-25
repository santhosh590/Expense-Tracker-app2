import { useState, useEffect, useContext, useMemo } from "react";
import { formatCurrency } from "../utils/formatCurrency";
import { TransactionContext } from "../context/TransactionContext";
import { useBudget } from "../context/BudgetContext";
import { Target, TrendingDown, AlertCircle, CheckCircle, Flame, PiggyBank, Calendar, DollarSign } from "lucide-react";

export default function Budget() {
  const { transactions } = useContext(TransactionContext);
  const { budget, budgetLoading, fetchBudget, saveBudget, getCurrentMonth } = useBudget();

  const currentMonth = getCurrentMonth();
  const [inputBudget, setInputBudget] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => { fetchBudget(currentMonth); }, [fetchBudget, currentMonth]);
  useEffect(() => { if (budget !== null) setInputBudget(budget.toString()); }, [budget]);

  const now = new Date();
  const thisMonth = now.getMonth();
  const thisYear = now.getFullYear();
  const dayOfMonth = now.getDate();
  const daysInMonth = new Date(thisYear, thisMonth + 1, 0).getDate();
  const daysLeft = daysInMonth - dayOfMonth;

  const thisMonthExpenses = transactions.filter(t => {
    const d = new Date(t.date);
    return t.type === "expense" && d.getMonth() === thisMonth && d.getFullYear() === thisYear;
  });

  const totalExpense = thisMonthExpenses.reduce((acc, curr) => acc + Number(curr.amount), 0);
  const budgetLimit = budget ?? 0;
  const rawProgress = budgetLimit > 0 ? (totalExpense / budgetLimit) * 100 : 0;
  const progress = Math.min(rawProgress, 100);
  const isOverBudget = budgetLimit > 0 && totalExpense > budgetLimit;
  const remaining = budgetLimit - totalExpense;

  // Daily spending rate
  const dailyAvg = dayOfMonth > 0 ? totalExpense / dayOfMonth : 0;
  const projectedMonthly = dailyAvg * daysInMonth;
  const dailyBudget = budgetLimit > 0 && daysLeft > 0 ? remaining / daysLeft : 0;

  // Category breakdown
  const categoryData = useMemo(() => {
    const catMap = {};
    thisMonthExpenses.forEach(t => {
      if (!catMap[t.category]) catMap[t.category] = { amount: 0, count: 0 };
      catMap[t.category].amount += Number(t.amount);
      catMap[t.category].count++;
    });
    return Object.entries(catMap)
      .map(([name, data]) => ({
        name, amount: data.amount, count: data.count,
        percentage: totalExpense > 0 ? (data.amount / totalExpense * 100) : 0,
        budgetPct: budgetLimit > 0 ? (data.amount / budgetLimit * 100) : 0,
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [thisMonthExpenses, totalExpense, budgetLimit]);

  const getCatIcon = (cat) => {
    const map = { Food: "🍕", Travel: "✈️", Shopping: "🛍️", Bills: "📃", Health: "🏥", Entertainment: "🎬", Salary: "💰", Freelance: "💻", Investment: "📈", Business: "💼", Other: "📦" };
    return map[cat] || "📄";
  };

  const handleSave = async () => {
    const limit = Number(inputBudget);
    if (!limit || limit <= 0) { setMsg("❌ Please enter a valid amount"); return; }
    setSaving(true); setMsg("");
    const ok = await saveBudget(limit, currentMonth);
    setSaving(false);
    setMsg(ok ? "✅ Budget saved!" : "❌ Failed to save budget");
    setTimeout(() => setMsg(""), 3000);
  };

  const getProgressColor = () => {
    if (rawProgress >= 100) return "#ef4444";
    if (rawProgress >= 80) return "#f59e0b";
    return "#22c55e";
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Budget Settings</div>
          <div className="page-subtitle">Set and manage your monthly spending limits 💰</div>
        </div>
        <div style={{
          padding: "8px 16px", borderRadius: 12,
          background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.15)",
          fontSize: 13, fontWeight: 700, color: "#818cf8",
          display: "flex", alignItems: "center", gap: 6,
        }}>
          <Calendar size={14} /> {currentMonth}
        </div>
      </div>

      {/* Quick Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
        {[
          { label: "Monthly Budget", value: budgetLimit > 0 ? formatCurrency(budgetLimit) : "Not Set", icon: <Target size={18} />, color: "#6366f1", bg: "rgba(99,102,241,0.08)" },
          { label: "Total Spent", value: formatCurrency(totalExpense), icon: <TrendingDown size={18} />, color: "#ef4444", bg: "rgba(239,68,68,0.08)" },
          { label: "Remaining", value: budgetLimit > 0 ? formatCurrency(Math.max(0, remaining)) : "—", icon: <PiggyBank size={18} />, color: "#22c55e", bg: "rgba(34,197,94,0.08)" },
          { label: "Daily Budget Left", value: budgetLimit > 0 && daysLeft > 0 ? formatCurrency(dailyBudget) : "—", icon: <DollarSign size={18} />, color: "#f59e0b", bg: "rgba(245,158,11,0.08)" },
        ].map((stat, i) => (
          <div key={i} className="card" style={{ padding: "18px 20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: 12, background: stat.bg, display: "flex", alignItems: "center", justifyContent: "center", color: stat.color }}>{stat.icon}</div>
              <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.5 }}>{stat.label}</span>
            </div>
            <div style={{ fontSize: 22, fontWeight: 900, color: stat.color, letterSpacing: "-0.3px" }}>{stat.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {/* Set Budget + Progress */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div className="card" style={{ position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: "linear-gradient(90deg, #6366f1, #ec4899)" }} />
            <div className="section-title" style={{ marginTop: 4 }}>💰 Monthly Budget</div>
            <div style={{ marginTop: 16 }}>
              <label className="label">
                Set Monthly Limit <span style={{ opacity: 0.5, fontWeight: 400 }}>({currentMonth})</span>
              </label>
              <div style={{ display: "flex", gap: 12 }}>
                <input className="input" type="number" value={inputBudget}
                  onChange={(e) => setInputBudget(e.target.value)} placeholder="Enter amount" min="1" disabled={budgetLoading} />
                <button className="btn small" style={{ width: "auto" }} onClick={handleSave} disabled={saving || budgetLoading}>
                  {saving ? "Saving..." : "💾 Save"}
                </button>
              </div>

              {msg && (
                <div style={{
                  marginTop: 10, padding: "8px 14px", borderRadius: 10, fontSize: 13, fontWeight: 700,
                  background: msg.startsWith("✅") ? "rgba(34,197,94,0.08)" : "rgba(239,68,68,0.08)",
                  color: msg.startsWith("✅") ? "#22c55e" : "#ef4444",
                }}>{msg}</div>
              )}

              {/* Big progress section */}
              <div style={{ marginTop: 24 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, alignItems: "baseline" }}>
                  <span style={{ fontSize: 13, color: "var(--muted)", fontWeight: 600 }}>
                    <strong style={{ color: "var(--text)" }}>{formatCurrency(totalExpense)}</strong> of{" "}
                    <strong style={{ color: "var(--text)" }}>{budgetLimit > 0 ? formatCurrency(budgetLimit) : "∞"}</strong>
                  </span>
                  <span style={{ fontSize: 22, fontWeight: 900, color: getProgressColor() }}>{Math.round(rawProgress)}%</span>
                </div>
                <div style={{
                  height: 12, background: "var(--glass)", border: "1px solid var(--border)",
                  borderRadius: 8, overflow: "hidden",
                }}>
                  <div style={{
                    width: `${progress}%`, height: "100%", borderRadius: 8,
                    background: `linear-gradient(90deg, ${getProgressColor()}, ${rawProgress >= 80 ? "#ef4444" : "#16a34a"})`,
                    transition: "width 0.5s ease",
                    boxShadow: `0 0 8px ${getProgressColor()}55`,
                  }} />
                </div>

                <div style={{
                  display: "flex", justifyContent: "space-between", marginTop: 8, fontSize: 12,
                }}>
                  <span style={{ color: "var(--muted)" }}>
                    {budgetLimit === 0 ? "No budget set yet"
                      : isOverBudget ? `Over budget by ${formatCurrency(Math.abs(remaining))} ⚠️`
                        : `${formatCurrency(remaining)} remaining 👏`}
                  </span>
                  <span style={{ fontWeight: 700, color: getProgressColor() }}>
                    {budgetLimit === 0 ? "—" : isOverBudget ? "Exceeded" : "On Track"}
                  </span>
                </div>
              </div>

              {/* Spending Pace Insight */}
              {budgetLimit > 0 && (
                <div style={{
                  marginTop: 16, padding: "12px 16px", borderRadius: 12,
                  background: projectedMonthly > budgetLimit ? "rgba(239,68,68,0.06)" : "rgba(34,197,94,0.06)",
                  border: `1px solid ${projectedMonthly > budgetLimit ? "rgba(239,68,68,0.12)" : "rgba(34,197,94,0.12)"}`,
                }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", marginBottom: 4 }}>
                    Spending Pace
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    <div>
                      <div style={{ fontSize: 10, color: "var(--muted)" }}>Daily Avg</div>
                      <div style={{ fontSize: 16, fontWeight: 900, color: "#f59e0b" }}>{formatCurrency(dailyAvg)}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 10, color: "var(--muted)" }}>Projected Total</div>
                      <div style={{
                        fontSize: 16, fontWeight: 900,
                        color: projectedMonthly > budgetLimit ? "#ef4444" : "#22c55e",
                      }}>{formatCurrency(projectedMonthly)}</div>
                    </div>
                  </div>
                  <div style={{
                    marginTop: 8, fontSize: 12, fontWeight: 600,
                    color: projectedMonthly > budgetLimit ? "#ef4444" : "#22c55e",
                  }}>
                    {projectedMonthly > budgetLimit
                      ? `⚠️ On track to exceed budget by ${formatCurrency(projectedMonthly - budgetLimit)}`
                      : `✅ On track to stay ${formatCurrency(budgetLimit - projectedMonthly)} under budget`}
                  </div>
                </div>
              )}

              {/* Days Remaining */}
              <div style={{
                marginTop: 12, padding: "10px 14px", borderRadius: 10,
                background: "rgba(99,102,241,0.06)", border: "1px solid rgba(99,102,241,0.1)",
                display: "flex", alignItems: "center", justifyContent: "space-between",
              }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: "var(--muted)" }}>
                  <Calendar size={12} style={{ display: "inline", marginRight: 4 }} />
                  {daysLeft} day{daysLeft !== 1 ? "s" : ""} left in {currentMonth}
                </span>
                <span style={{ fontSize: 12, fontWeight: 800, color: "#818cf8" }}>
                  Day {dayOfMonth} of {daysInMonth}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column — Category Breakdown + Alerts */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Category Breakdown */}
          <div className="card" style={{ position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: "linear-gradient(90deg, #f59e0b, #ef4444)" }} />
            <div className="section-title" style={{ marginTop: 4 }}>📊 Spending by Category</div>

            {categoryData.length === 0 ? (
              <div style={{ textAlign: "center", padding: "30px 20px", color: "var(--muted)", fontSize: 13 }}>
                No expenses this month yet
              </div>
            ) : (
              <div style={{ display: "grid", gap: 8, marginTop: 12 }}>
                {categoryData.map((cat, i) => (
                  <div key={i} style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "10px 12px", borderRadius: 12,
                    background: "var(--glass)", border: "1px solid var(--border)",
                    transition: "all 0.2s",
                  }}
                    onMouseEnter={e => { e.currentTarget.style.transform = "translateX(4px)"; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = "translateX(0)"; }}
                  >
                    <span style={{ fontSize: 18 }}>{getCatIcon(cat.name)}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text)" }}>{cat.name}</span>
                        <span style={{ fontSize: 12, fontWeight: 900, color: "var(--text)" }}>{formatCurrency(cat.amount)}</span>
                      </div>
                      <div style={{ height: 4, borderRadius: 3, background: "var(--glass)", overflow: "hidden" }}>
                        <div style={{
                          height: "100%", borderRadius: 3,
                          width: `${cat.percentage}%`,
                          background: i === 0 ? "linear-gradient(90deg, #ef4444, #f59e0b)" : "linear-gradient(90deg, #6366f1, #818cf8)",
                          transition: "width 0.5s ease",
                        }} />
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 2 }}>
                        <span style={{ fontSize: 10, color: "var(--muted)" }}>{cat.count} txn{cat.count !== 1 ? "s" : ""}</span>
                        <span style={{ fontSize: 10, fontWeight: 700, color: "var(--muted)" }}>{cat.percentage.toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Budget Alerts */}
          <div className="card" style={{ position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: "linear-gradient(90deg, #f59e0b, #22c55e)" }} />
            <div className="section-title" style={{ marginTop: 4 }}>🔔 Budget Alerts</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 12 }}>
              {[
                { icon: "💡", label: "80% Usage Alert", sub: "Notify when 80% of budget is spent", checked: true, color: "#f59e0b" },
                { icon: "⚠️", label: "90% Warning", sub: "Urgent warning at 90% usage", checked: true, color: "#ef4444" },
                { icon: "🚫", label: "Over Budget Alert", sub: "Notify when budget is exceeded", checked: true, color: "#ef4444" },
              ].map((alert, i) => (
                <div key={i} style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "12px 14px", borderRadius: 12,
                  background: "var(--glass)", border: "1px solid var(--border)",
                }}>
                  <span style={{ fontSize: 20 }}>{alert.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 13, color: "var(--text)" }}>{alert.label}</div>
                    <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>{alert.sub}</div>
                  </div>
                  <input type="checkbox" defaultChecked={alert.checked}
                    style={{ accentColor: alert.color, transform: "scale(1.2)", cursor: "pointer" }} />
                </div>
              ))}
            </div>
          </div>

          {/* Smart Tips */}
          <div className="card" style={{ position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: "linear-gradient(90deg, #22c55e, #6366f1)" }} />
            <div className="section-title" style={{ marginTop: 4 }}>💡 Budget Tips</div>
            <div style={{ display: "grid", gap: 8, marginTop: 12 }}>
              {[
                budgetLimit > 0 && dailyBudget > 0 && { icon: <DollarSign size={14} />, text: `You can spend ${formatCurrency(dailyBudget)}/day to stay within budget`, color: "#22c55e" },
                budgetLimit > 0 && rawProgress >= 80 && rawProgress < 100 && { icon: <AlertCircle size={14} />, text: `${Math.round(100 - rawProgress)}% of budget remaining — spend wisely!`, color: "#f59e0b" },
                isOverBudget && { icon: <Flame size={14} />, text: `Budget exceeded! Try to cut ${formatCurrency(Math.abs(remaining))} from spending`, color: "#ef4444" },
                !isOverBudget && budgetLimit > 0 && rawProgress < 50 && { icon: <CheckCircle size={14} />, text: "Great job! You're well within your budget 🎉", color: "#22c55e" },
                categoryData.length > 0 && { icon: <Target size={14} />, text: `Top spending: ${categoryData[0].name} (${formatCurrency(categoryData[0].amount)})`, color: "#6366f1" },
              ].filter(Boolean).map((tip, i) => (
                <div key={i} style={{
                  display: "flex", alignItems: "center", gap: 8,
                  padding: "8px 12px", borderRadius: 10,
                  background: `${tip.color}08`, border: `1px solid ${tip.color}15`,
                  fontSize: 12, fontWeight: 600, color: tip.color,
                }}>
                  {tip.icon} {tip.text}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
