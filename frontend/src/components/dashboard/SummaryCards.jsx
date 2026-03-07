import { formatCurrency } from "../../utils/formatCurrency";
import { Wallet, TrendingUp, TrendingDown, DollarSign, ArrowUpRight, ArrowDownRight, Activity } from "lucide-react";

export default function SummaryCards({ totalIncome, totalExpense, balance, transactions = [] }) {
  // Compute real month-over-month trends
  const now = new Date();
  const thisMonth = now.getMonth();
  const thisYear = now.getFullYear();

  const thisMonthIncome = transactions
    .filter(t => t.type === "income" && new Date(t.date).getMonth() === thisMonth && new Date(t.date).getFullYear() === thisYear)
    .reduce((a, b) => a + Number(b.amount), 0);
  const thisMonthExpense = transactions
    .filter(t => t.type === "expense" && new Date(t.date).getMonth() === thisMonth && new Date(t.date).getFullYear() === thisYear)
    .reduce((a, b) => a + Number(b.amount), 0);

  const lastMonth = thisMonth === 0 ? 11 : thisMonth - 1;
  const lastMonthYear = thisMonth === 0 ? thisYear - 1 : thisYear;
  const lastMonthIncome = transactions
    .filter(t => t.type === "income" && new Date(t.date).getMonth() === lastMonth && new Date(t.date).getFullYear() === lastMonthYear)
    .reduce((a, b) => a + Number(b.amount), 0);
  const lastMonthExpense = transactions
    .filter(t => t.type === "expense" && new Date(t.date).getMonth() === lastMonth && new Date(t.date).getFullYear() === lastMonthYear)
    .reduce((a, b) => a + Number(b.amount), 0);

  const incomeTrend = lastMonthIncome > 0 ? ((thisMonthIncome - lastMonthIncome) / lastMonthIncome * 100).toFixed(1) : thisMonthIncome > 0 ? 100 : 0;
  const expenseTrend = lastMonthExpense > 0 ? ((thisMonthExpense - lastMonthExpense) / lastMonthExpense * 100).toFixed(1) : thisMonthExpense > 0 ? 100 : 0;

  // Transaction count this month
  const thisMonthTxns = transactions.filter(t => new Date(t.date).getMonth() === thisMonth && new Date(t.date).getFullYear() === thisYear).length;

  // Daily average this month
  const dayOfMonth = now.getDate();
  const dailyAvgExpense = dayOfMonth > 0 ? thisMonthExpense / dayOfMonth : 0;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
      {/* Total Balance */}
      <div className="card" style={{
        background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)",
        position: "relative", overflow: "hidden",
        border: "1px solid rgba(255,255,255,0.1)"
      }}>
        <div style={{ position: "absolute", top: -20, right: -20, width: 150, height: 150, background: "rgba(99, 102, 241, 0.3)", filter: "blur(60px)", borderRadius: "50%" }} />
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12, position: "relative", zIndex: 1 }}>
          <div style={{ padding: 10, background: "rgba(255,255,255,0.1)", borderRadius: 12 }}>
            <Wallet size={22} color="#a5b4fc" />
          </div>
          <span className="label" style={{ marginBottom: 0, color: "#94a3b8" }}>Total Balance</span>
        </div>
        <div style={{ fontSize: 30, fontWeight: 900, color: "white", marginBottom: 6, position: "relative", zIndex: 1, letterSpacing: "-0.5px" }}>
          {formatCurrency(balance)}
        </div>
        <div style={{ fontSize: 12, color: "#94a3b8", position: "relative", zIndex: 1, display: "flex", alignItems: "center", gap: 6 }}>
          <Activity size={12} />
          {thisMonthTxns} transactions this month
        </div>
      </div>

      {/* Income */}
      <div className="card">
        <div style={{ display: "flex", alignItems: "start", justifyContent: "space-between", marginBottom: 12 }}>
          <div style={{ padding: 10, background: "rgba(16, 185, 129, 0.1)", borderRadius: 12 }}>
            <DollarSign size={22} color="#10b981" />
          </div>
          <div style={{
            padding: "4px 8px", borderRadius: 8,
            background: Number(incomeTrend) >= 0 ? "rgba(16, 185, 129, 0.1)" : "rgba(239, 68, 68, 0.1)",
            color: Number(incomeTrend) >= 0 ? "#10b981" : "#ef4444",
            fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", gap: 3
          }}>
            {Number(incomeTrend) >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
            {Math.abs(incomeTrend)}%
          </div>
        </div>
        <span className="label">Total Income</span>
        <div style={{ fontSize: 26, fontWeight: 900, color: "var(--text)", letterSpacing: "-0.5px" }}>
          {formatCurrency(totalIncome)}
        </div>
        <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 6 }}>
          This month: {formatCurrency(thisMonthIncome)}
        </div>
      </div>

      {/* Expense */}
      <div className="card">
        <div style={{ display: "flex", alignItems: "start", justifyContent: "space-between", marginBottom: 12 }}>
          <div style={{ padding: 10, background: "rgba(239, 68, 68, 0.1)", borderRadius: 12 }}>
            <TrendingDown size={22} color="#ef4444" />
          </div>
          <div style={{
            padding: "4px 8px", borderRadius: 8,
            background: Number(expenseTrend) <= 0 ? "rgba(16, 185, 129, 0.1)" : "rgba(239, 68, 68, 0.1)",
            color: Number(expenseTrend) <= 0 ? "#10b981" : "#ef4444",
            fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", gap: 3
          }}>
            {Number(expenseTrend) <= 0 ? <ArrowDownRight size={12} /> : <ArrowUpRight size={12} />}
            {Math.abs(expenseTrend)}%
          </div>
        </div>
        <span className="label">Total Expense</span>
        <div style={{ fontSize: 26, fontWeight: 900, color: "var(--text)", letterSpacing: "-0.5px" }}>
          {formatCurrency(totalExpense)}
        </div>
        <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 6 }}>
          This month: {formatCurrency(thisMonthExpense)}
        </div>
      </div>

      {/* Daily Average / Savings Rate */}
      <div className="card" style={{
        background: "linear-gradient(135deg, rgba(99,102,241,0.08), rgba(236,72,153,0.04))",
        border: "1px solid rgba(99,102,241,0.15)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
          <div style={{ padding: 10, background: "rgba(99,102,241,0.12)", borderRadius: 12 }}>
            <TrendingUp size={22} color="#6366f1" />
          </div>
          <span className="label" style={{ marginBottom: 0 }}>Daily Insights</span>
        </div>

        <div style={{ display: "grid", gap: 10 }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.5 }}>Avg Daily Spending</div>
            <div style={{ fontSize: 20, fontWeight: 900, color: "#ef4444", letterSpacing: "-0.3px" }}>{formatCurrency(dailyAvgExpense)}</div>
          </div>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.5 }}>Savings Rate</div>
            <div style={{
              fontSize: 20, fontWeight: 900, letterSpacing: "-0.3px",
              color: totalIncome > 0 ? (((totalIncome - totalExpense) / totalIncome * 100) >= 20 ? "#22c55e" : "#f59e0b") : "var(--muted)",
            }}>
              {totalIncome > 0 ? `${Math.round((totalIncome - totalExpense) / totalIncome * 100)}%` : "—"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
