import { useContext, useState, useEffect } from "react";
import { TransactionContext } from "../context/TransactionContext";
import { useBudget } from "../context/BudgetContext";
import SummaryCards from "../components/dashboard/SummaryCards";
import RecentTransactions from "../components/dashboard/RecentTransactions";
import BudgetProgress from "../components/dashboard/BudgetProgress";
import FinancialHealth from "../components/dashboard/FinancialHealth";
import SpendingInsights from "../components/dashboard/SpendingInsights";
import UpcomingBills from "../components/dashboard/UpcomingBills";
import PieChart from "../components/charts/PieChart";
import BarChart from "../components/charts/BarChart";
import TrendChart from "../components/charts/TrendChart";
import AddTransactionModal from "../components/dashboard/AddTransactionModal";
import { useToast } from "../components/common/ToastNotification";
import { useLiveClock } from "../hooks/useRealTime";
import { Plus, Wallet, Calendar, RefreshCw, Clock, Activity } from "lucide-react";

export default function Dashboard() {
  const { transactions, lastRefreshed, isRefreshing, fetchTransactions } = useContext(TransactionContext);
  const { budget, fetchBudget, getCurrentMonth } = useBudget();
  const { addToast } = useToast();
  const now = useLiveClock();

  const [modal, setModal] = useState(null);
  const [alertShown, setAlertShown] = useState({});

  useEffect(() => {
    fetchBudget(getCurrentMonth());
  }, []);

  const income = transactions
    .filter((x) => x.type === "income")
    .reduce((a, b) => a + Number(b.amount), 0);

  const expense = transactions
    .filter((x) => x.type === "expense")
    .reduce((a, b) => a + Number(b.amount), 0);

  const balance = income - expense;
  const budgetLimit = budget ?? 0;

  // Budget alerts
  useEffect(() => {
    if (budgetLimit <= 0) return;
    const pct = (expense / budgetLimit) * 100;

    if (pct >= 100 && !alertShown["100"]) {
      addToast(`🚫 Budget exceeded! You've spent ₹${expense.toLocaleString()} of ₹${budgetLimit.toLocaleString()} budget.`, "error", 8000);
      setAlertShown((p) => ({ ...p, "100": true }));
    } else if (pct >= 90 && !alertShown["90"]) {
      addToast(`⚠️ 90% budget used! ₹${(budgetLimit - expense).toLocaleString()} remaining.`, "warning", 7000);
      setAlertShown((p) => ({ ...p, "90": true }));
    } else if (pct >= 80 && !alertShown["80"]) {
      addToast(`💡 80% budget used. Consider reducing expenses this month.`, "warning", 6000);
      setAlertShown((p) => ({ ...p, "80": true }));
    }
  }, [expense, budgetLimit]);

  const currentDate = now.toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  const currentTime = now.toLocaleTimeString("en-US", {
    hour: "2-digit", minute: "2-digit", second: "2-digit",
  });

  const refreshedAgo = lastRefreshed ? (() => {
    const secs = Math.floor((now - lastRefreshed) / 1000);
    if (secs < 5) return "just now";
    if (secs < 60) return `${secs}s ago`;
    return `${Math.floor(secs / 60)}m ago`;
  })() : null;

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Dashboard</div>
          <div className="page-subtitle" style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Calendar size={14} />
            {currentDate}
            <span style={{ opacity: 0.3 }}>|</span>
            <Clock size={13} />
            <span style={{
              fontWeight: 700,
              background: "linear-gradient(90deg, #6366f1, #ec4899)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              fontFamily: "'SF Mono', 'Cascadia Code', monospace",
            }}>{currentTime}</span>
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          {/* Live Refresh Indicator */}
          <div style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "6px 12px", borderRadius: 10,
            background: "var(--glass)", border: "1px solid var(--border)",
            fontSize: 11, fontWeight: 600, color: "var(--muted)",
          }}>
            <div style={{
              width: 7, height: 7, borderRadius: "50%",
              background: isRefreshing ? "#f59e0b" : "#22c55e",
              animation: isRefreshing ? "pulse 0.5s infinite" : "pulse 2s infinite",
              boxShadow: `0 0 6px ${isRefreshing ? "#f59e0b" : "#22c55e"}66`,
            }} />
            {isRefreshing ? "Syncing..." : refreshedAgo ? `Updated ${refreshedAgo}` : "Live"}
          </div>

          <button
            className="btn small secondary"
            onClick={() => fetchTransactions(true)}
            disabled={isRefreshing}
            style={{ padding: "6px 10px" }}
            title="Refresh data"
          >
            <RefreshCw size={14} style={{
              animation: isRefreshing ? "spin 1s linear infinite" : "none",
            }} />
          </button>

          <button className="btn secondary" onClick={() => setModal("income")}>
            <Wallet size={16} /> Add Income
          </button>
          <button className="btn" onClick={() => setModal("expense")}>
            <Plus size={16} /> Add Expense
          </button>
        </div>
      </div>

      {modal && (
        <AddTransactionModal
          type={modal}
          onClose={() => setModal(null)}
        />
      )}

      <SummaryCards
        totalIncome={income}
        totalExpense={expense}
        balance={balance}
        transactions={transactions}
      />

      {/* Main Grid */}
      <div className="grid-2" style={{ gridTemplateColumns: "2fr 1fr", alignItems: "start" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div className="card">
            <div className="flex-between" style={{ marginBottom: 20 }}>
              <div className="section-title" style={{ marginBottom: 0 }}>Monthly Activity</div>
              <select className="input" style={{ width: "auto", padding: "6px 12px" }}>
                <option>This Year</option>
                <option>Last Year</option>
              </select>
            </div>
            <BarChart transactions={transactions} />
          </div>

          {/* Income vs Expense Trends */}
          <TrendChart />

          <RecentTransactions list={transactions} />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <FinancialHealth
            balance={balance}
            income={income}
            expense={expense}
            budget={budgetLimit}
            transactions={transactions}
          />

          <div className="card">
            <div className="section-title">Expense Breakdown</div>
            <PieChart transactions={transactions} />
          </div>

          <BudgetProgress budget={budgetLimit} spent={expense} />

          <SpendingInsights />

          <UpcomingBills />
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}
