import { useContext, useState, useMemo } from "react";
import PieChart from "../components/charts/PieChart";
import BarChart from "../components/charts/BarChart";
import WeeklyHeatmap from "../components/charts/WeeklyHeatmap";
import { TransactionContext } from "../context/TransactionContext";
import { formatCurrency } from "../utils/formatCurrency";
import { exportPDF, exportExcel, exportCSV } from "../utils/exportReport";
import {
  ArrowUpRight, ArrowDownRight, Calendar, Target, BarChart3,
  Flame
} from "lucide-react";

export default function Reports() {
  const { transactions } = useContext(TransactionContext);
  const [exporting, setExporting] = useState("");

  const handleExport = async (type) => {
    if (!transactions.length) { alert("No transactions to export!"); return; }
    setExporting(type);
    try {
      if (type === "pdf") exportPDF(transactions);
      if (type === "excel") exportExcel(transactions);
      if (type === "csv") exportCSV(transactions);
    } catch (err) { alert("Export failed: " + err.message); }
    setTimeout(() => setExporting(""), 1000);
  };

  // Analytics computations
  const analytics = useMemo(() => {
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();

    const expenses = transactions.filter(t => t.type === "expense");
    const incomes = transactions.filter(t => t.type === "income");

    const totalExpense = expenses.reduce((a, b) => a + Number(b.amount), 0);
    const totalIncome = incomes.reduce((a, b) => a + Number(b.amount), 0);

    // This month
    const thisMonthExpenses = expenses.filter(t => {
      const d = new Date(t.date);
      return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
    });
    const thisMonthIncome = incomes.filter(t => {
      const d = new Date(t.date);
      return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
    }).reduce((a, b) => a + Number(b.amount), 0);
    const thisMonthExpense = thisMonthExpenses.reduce((a, b) => a + Number(b.amount), 0);

    // Category breakdown
    const categoryMap = {};
    expenses.forEach(t => {
      if (!categoryMap[t.category]) categoryMap[t.category] = { amount: 0, count: 0 };
      categoryMap[t.category].amount += Number(t.amount);
      categoryMap[t.category].count++;
    });

    const categories = Object.entries(categoryMap)
      .map(([name, data]) => ({
        name, amount: data.amount, count: data.count,
        percentage: totalExpense > 0 ? (data.amount / totalExpense * 100).toFixed(1) : 0,
      }))
      .sort((a, b) => b.amount - a.amount);

    // Top 5 transactions
    const top5 = [...expenses].sort((a, b) => Number(b.amount) - Number(a.amount)).slice(0, 5);

    // Daily average
    const dayOfMonth = now.getDate();
    const dailyAvg = dayOfMonth > 0 ? thisMonthExpense / dayOfMonth : 0;

    // Projected monthly spending
    const daysInMonth = new Date(thisYear, thisMonth + 1, 0).getDate();
    const projectedMonthly = dailyAvg * daysInMonth;

    // Most active day of week
    const dayOfWeekMap = { 0: "Sun", 1: "Mon", 2: "Tue", 3: "Wed", 4: "Thu", 5: "Fri", 6: "Sat" };
    const dowCounts = {};
    expenses.forEach(t => {
      const dow = new Date(t.date).getDay();
      dowCounts[dow] = (dowCounts[dow] || 0) + 1;
    });
    const mostActiveDay = Object.entries(dowCounts).sort((a, b) => b[1] - a[1])[0];

    // Average transaction amount
    const avgTransaction = expenses.length > 0 ? totalExpense / expenses.length : 0;

    // Largest single expense
    const largestExpense = expenses.length > 0 ? Math.max(...expenses.map(t => Number(t.amount))) : 0;

    // Spending streak (consecutive days with expenses)
    const uniqueDays = [...new Set(thisMonthExpenses.map(t => new Date(t.date).getDate()))].sort((a, b) => b - a);
    let streak = 0;
    for (let i = 0; i < uniqueDays.length; i++) {
      if (i === 0 && uniqueDays[0] === dayOfMonth) streak++;
      else if (i > 0 && uniqueDays[i - 1] - uniqueDays[i] === 1) streak++;
      else if (i > 0) break;
    }

    return {
      totalExpense, totalIncome, thisMonthExpense, thisMonthIncome,
      categories, top5, dailyAvg, projectedMonthly,
      mostActiveDay: mostActiveDay ? dayOfWeekMap[mostActiveDay[0]] : "—",
      avgTransaction, largestExpense, streak,
      transactionCount: transactions.length,
      expenseCount: expenses.length,
      incomeCount: incomes.length,
    };
  }, [transactions]);

  const getCatIcon = (cat) => {
    const map = { Food: "🍕", Travel: "✈️", Shopping: "🛍️", Bills: "📃", Health: "🏥", Entertainment: "🎬", Salary: "💰", Freelance: "💻", Investment: "📈", Business: "💼", Other: "📦" };
    return map[cat] || "📄";
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Reports & Analytics</div>
          <div className="page-subtitle">Detailed insights into your spending patterns and financial habits 📊</div>
        </div>
      </div>

      {/* Quick Stats Row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
        {[
          { label: "Total Transactions", value: analytics.transactionCount, icon: <BarChart3 size={18} />, color: "#6366f1", bg: "rgba(99,102,241,0.08)" },
          { label: "Avg Transaction", value: formatCurrency(analytics.avgTransaction), icon: <Target size={18} />, color: "#f59e0b", bg: "rgba(245,158,11,0.08)" },
          { label: "Largest Expense", value: formatCurrency(analytics.largestExpense), icon: <Flame size={18} />, color: "#ef4444", bg: "rgba(239,68,68,0.08)" },
          { label: "Most Active Day", value: analytics.mostActiveDay, icon: <Calendar size={18} />, color: "#22c55e", bg: "rgba(34,197,94,0.08)" },
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

      {/* This Month Projection */}
      <div className="card" style={{ marginBottom: 24, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: "linear-gradient(90deg, #6366f1, #ec4899, #22c55e)" }} />
        <div className="section-title" style={{ marginTop: 4 }}>📈 This Month Overview</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginTop: 16 }}>
          <div style={{ padding: "14px 16px", borderRadius: 14, background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.12)", textAlign: "center" }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#22c55e", marginBottom: 4, textTransform: "uppercase" }}>Income</div>
            <div style={{ fontSize: 20, fontWeight: 900, color: "#22c55e" }}>{formatCurrency(analytics.thisMonthIncome)}</div>
          </div>
          <div style={{ padding: "14px 16px", borderRadius: 14, background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.12)", textAlign: "center" }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#ef4444", marginBottom: 4, textTransform: "uppercase" }}>Expenses</div>
            <div style={{ fontSize: 20, fontWeight: 900, color: "#ef4444" }}>{formatCurrency(analytics.thisMonthExpense)}</div>
          </div>
          <div style={{ padding: "14px 16px", borderRadius: 14, background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.12)", textAlign: "center" }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#f59e0b", marginBottom: 4, textTransform: "uppercase" }}>Daily Avg</div>
            <div style={{ fontSize: 20, fontWeight: 900, color: "#f59e0b" }}>{formatCurrency(analytics.dailyAvg)}</div>
          </div>
          <div style={{ padding: "14px 16px", borderRadius: 14, background: "rgba(99,102,241,0.06)", border: "1px solid rgba(99,102,241,0.12)", textAlign: "center" }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#818cf8", marginBottom: 4, textTransform: "uppercase" }}>Projected Total</div>
            <div style={{ fontSize: 20, fontWeight: 900, color: "#818cf8" }}>{formatCurrency(analytics.projectedMonthly)}</div>
          </div>
        </div>

        {analytics.streak > 0 && (
          <div style={{
            marginTop: 14, padding: "8px 14px", borderRadius: 10,
            background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.12)",
            fontSize: 12, fontWeight: 700, color: "#f59e0b",
            display: "flex", alignItems: "center", gap: 6,
          }}>
            <Flame size={14} /> {analytics.streak}-day spending streak this month
          </div>
        )}
      </div>

      {/* Charts */}
      <div className="grid-2" style={{ marginBottom: 24 }}>
        <div className="card" style={{ position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: "linear-gradient(90deg, #6366f1, #ec4899)" }} />
          <div className="section-title" style={{ marginTop: 4 }}>🍰 Expense by Category</div>
          <div style={{ marginTop: 16 }}>
            <PieChart transactions={transactions || []} />
          </div>
        </div>
        <div className="card" style={{ position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: "linear-gradient(90deg, #22c55e, #6366f1)" }} />
          <div className="section-title" style={{ marginTop: 4 }}>📊 Monthly Expense Trend</div>
          <div style={{ marginTop: 16 }}>
            <BarChart transactions={transactions || []} />
          </div>
        </div>
      </div>

      {/* Category Breakdown Table */}
      <div className="grid-2" style={{ marginBottom: 24 }}>
        <div className="card" style={{ position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: "linear-gradient(90deg, #f59e0b, #ef4444)" }} />
          <div className="section-title" style={{ marginTop: 4 }}>📋 Category Breakdown</div>

          {analytics.categories.length === 0 ? (
            <div style={{ textAlign: "center", padding: "30px 20px", color: "var(--muted)", fontSize: 13 }}>
              No expense data yet
            </div>
          ) : (
            <div style={{ display: "grid", gap: 8, marginTop: 12 }}>
              {analytics.categories.map((cat, i) => (
                <div key={i} style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "10px 14px", borderRadius: 12,
                  background: "var(--glass)", border: "1px solid var(--border)",
                  transition: "all 0.2s",
                }}
                  onMouseEnter={e => { e.currentTarget.style.transform = "translateX(4px)"; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = "translateX(0)"; }}
                >
                  <div style={{ fontSize: 20, width: 32, textAlign: "center" }}>{getCatIcon(cat.name)}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>{cat.name}</span>
                      <span style={{ fontSize: 13, fontWeight: 900, color: "var(--text)" }}>{formatCurrency(cat.amount)}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ flex: 1, height: 4, borderRadius: 4, background: "var(--glass)", overflow: "hidden" }}>
                        <div style={{
                          height: "100%", borderRadius: 4,
                          width: `${cat.percentage}%`,
                          background: i === 0 ? "linear-gradient(90deg, #ef4444, #f59e0b)" : "linear-gradient(90deg, #6366f1, #818cf8)",
                          transition: "width 0.5s ease",
                        }} />
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 800, color: "var(--muted)", minWidth: 40, textAlign: "right" }}>
                        {cat.percentage}%
                      </span>
                    </div>
                  </div>
                  <span style={{
                    fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 12,
                    background: "rgba(99,102,241,0.1)", color: "#818cf8",
                  }}>{cat.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Transactions */}
        <div className="card" style={{ position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: "linear-gradient(90deg, #ec4899, #6366f1)" }} />
          <div className="section-title" style={{ marginTop: 4 }}>🏆 Top 5 Expenses</div>

          {analytics.top5.length === 0 ? (
            <div style={{ textAlign: "center", padding: "30px 20px", color: "var(--muted)", fontSize: 13 }}>
              No expenses recorded yet
            </div>
          ) : (
            <div style={{ display: "grid", gap: 8, marginTop: 12 }}>
              {analytics.top5.map((t, i) => (
                <div key={t._id} style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "12px 14px", borderRadius: 12,
                  background: "var(--glass)", border: "1px solid var(--border)",
                  transition: "all 0.2s",
                }}
                  onMouseEnter={e => { e.currentTarget.style.transform = "translateX(4px)"; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = "translateX(0)"; }}
                >
                  <div style={{
                    width: 28, height: 28, borderRadius: 8,
                    background: i === 0 ? "linear-gradient(135deg, #f59e0b, #ef4444)" : "rgba(99,102,241,0.1)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 12, fontWeight: 900, color: i === 0 ? "white" : "#818cf8",
                  }}>#{i + 1}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 13, color: "var(--text)" }}>{t.title}</div>
                    <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>
                      {t.category} • {new Date(t.date).toLocaleDateString()}
                    </div>
                  </div>
                  <div style={{ fontWeight: 900, fontSize: 15, color: "#ef4444" }}>{formatCurrency(t.amount)}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Income vs Expense Summary */}
      <div className="card" style={{ marginBottom: 24, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: "linear-gradient(90deg, #22c55e, #ef4444)" }} />
        <div className="section-title" style={{ marginTop: 4 }}>⚖️ Income vs Expense Distribution</div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginTop: 16 }}>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <ArrowUpRight size={16} color="#22c55e" />
                <span style={{ fontWeight: 700, fontSize: 14, color: "var(--text)" }}>Income ({analytics.incomeCount})</span>
              </div>
              <span style={{ fontWeight: 900, fontSize: 18, color: "#22c55e" }}>{formatCurrency(analytics.totalIncome)}</span>
            </div>
            <div style={{ height: 8, borderRadius: 4, background: "var(--glass)", overflow: "hidden" }}>
              <div style={{
                height: "100%", borderRadius: 4,
                width: `${analytics.totalIncome + analytics.totalExpense > 0 ? (analytics.totalIncome / (analytics.totalIncome + analytics.totalExpense) * 100) : 50}%`,
                background: "linear-gradient(90deg, #22c55e, #16a34a)",
                transition: "width 0.5s ease",
              }} />
            </div>
          </div>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <ArrowDownRight size={16} color="#ef4444" />
                <span style={{ fontWeight: 700, fontSize: 14, color: "var(--text)" }}>Expense ({analytics.expenseCount})</span>
              </div>
              <span style={{ fontWeight: 900, fontSize: 18, color: "#ef4444" }}>{formatCurrency(analytics.totalExpense)}</span>
            </div>
            <div style={{ height: 8, borderRadius: 4, background: "var(--glass)", overflow: "hidden" }}>
              <div style={{
                height: "100%", borderRadius: 4,
                width: `${analytics.totalIncome + analytics.totalExpense > 0 ? (analytics.totalExpense / (analytics.totalIncome + analytics.totalExpense) * 100) : 50}%`,
                background: "linear-gradient(90deg, #ef4444, #dc2626)",
                transition: "width 0.5s ease",
              }} />
            </div>
          </div>
        </div>

        <div style={{
          marginTop: 16, padding: "10px 14px", borderRadius: 12,
          background: analytics.totalIncome >= analytics.totalExpense ? "rgba(34,197,94,0.06)" : "rgba(239,68,68,0.06)",
          border: `1px solid ${analytics.totalIncome >= analytics.totalExpense ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.12)"}`,
          fontSize: 13, fontWeight: 700,
          color: analytics.totalIncome >= analytics.totalExpense ? "#22c55e" : "#ef4444",
          textAlign: "center",
        }}>
          {analytics.totalIncome >= analytics.totalExpense
            ? `✅ Net positive: ${formatCurrency(analytics.totalIncome - analytics.totalExpense)} saved`
            : `⚠️ Net negative: ${formatCurrency(analytics.totalExpense - analytics.totalIncome)} overspent`
          }
        </div>
      </div>

      {/* Spending Heatmap */}
      <WeeklyHeatmap />

      {/* Export */}
      <div className="card" style={{ position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: "linear-gradient(90deg, #ef4444, #22c55e, #6366f1)" }} />
        <div className="section-title" style={{ marginTop: 4 }}>📤 Export Reports</div>
        <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 12 }}>Download your data in multiple formats</div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginTop: 16 }}>
          {[
            { type: "pdf", icon: "📕", label: "PDF Report", color: "#ef4444" },
            { type: "excel", icon: "📗", label: "Excel Sheet", color: "#22c55e" },
            { type: "csv", icon: "📘", label: "CSV Data", color: "#6366f1" },
          ].map(exp => (
            <button key={exp.type}
              className="btn secondary"
              onClick={() => handleExport(exp.type)}
              disabled={!!exporting}
              style={{
                padding: "14px 16px", justifyContent: "center", gap: 8,
                border: `1px solid ${exp.color}20`,
                background: `${exp.color}08`,
              }}
            >
              <span style={{ fontSize: 18 }}>{exp.icon}</span>
              {exporting === exp.type ? "⏳ Exporting..." : exp.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

