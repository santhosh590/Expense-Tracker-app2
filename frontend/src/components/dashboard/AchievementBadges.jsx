import { useContext, useMemo } from "react";
import { TransactionContext } from "../../context/TransactionContext";
import { useBudget } from "../../context/BudgetContext";
import { Award, Flame, PiggyBank, Target, Zap, Shield, Star, Crown } from "lucide-react";

const BADGE_DEFS = [
    { id: "first_tx", name: "First Step", desc: "Made your first transaction", icon: <Zap size={20} />, gradient: "linear-gradient(135deg, #6366f1, #4f46e5)", check: (data) => data.totalTx >= 1 },
    { id: "tx_10", name: "Getting Started", desc: "Logged 10+ transactions", icon: <Star size={20} />, gradient: "linear-gradient(135deg, #22c55e, #16a34a)", check: (data) => data.totalTx >= 10 },
    { id: "tx_50", name: "Power Logger", desc: "Logged 50+ transactions", icon: <Crown size={20} />, gradient: "linear-gradient(135deg, #f59e0b, #d97706)", check: (data) => data.totalTx >= 50 },
    { id: "tx_100", name: "Century Club", desc: "Logged 100+ transactions", icon: <Award size={20} />, gradient: "linear-gradient(135deg, #ec4899, #be185d)", check: (data) => data.totalTx >= 100 },
    { id: "saver_20", name: "Smart Saver", desc: "Savings rate above 20%", icon: <PiggyBank size={20} />, gradient: "linear-gradient(135deg, #22c55e, #059669)", check: (data) => data.savingsRate >= 20 },
    { id: "saver_50", name: "Super Saver", desc: "Savings rate above 50%", icon: <PiggyBank size={20} />, gradient: "linear-gradient(135deg, #10b981, #047857)", check: (data) => data.savingsRate >= 50 },
    { id: "budget_set", name: "Budget Master", desc: "Set a monthly budget", icon: <Target size={20} />, gradient: "linear-gradient(135deg, #6366f1, #7c3aed)", check: (data) => data.hasBudget },
    { id: "under_budget", name: "Disciplined", desc: "Stayed under budget", icon: <Shield size={20} />, gradient: "linear-gradient(135deg, #14b8a6, #0d9488)", check: (data) => data.hasBudget && data.expense <= data.budgetLimit },
    { id: "streak_7", name: "7-Day Streak", desc: "7 consecutive days of tracking", icon: <Flame size={20} />, gradient: "linear-gradient(135deg, #f59e0b, #ef4444)", check: (data) => data.streak >= 7 },
    { id: "categories_5", name: "Diversified", desc: "Used 5+ expense categories", icon: <Star size={20} />, gradient: "linear-gradient(135deg, #a855f7, #6366f1)", check: (data) => data.categories >= 5 },
];

export default function AchievementBadges() {
    const { transactions } = useContext(TransactionContext);
    const { budget } = useBudget();

    const data = useMemo(() => {
        const now = new Date();
        const thisMonth = now.getMonth();
        const thisYear = now.getFullYear();

        const expenses = transactions.filter(t => t.type === "expense");
        const incomes = transactions.filter(t => t.type === "income");

        const totalIncome = incomes.reduce((a, b) => a + Number(b.amount), 0);
        const totalExpense = expenses.reduce((a, b) => a + Number(b.amount), 0);
        const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome * 100) : 0;

        // This month expense
        const thisMonthExpense = expenses
            .filter(t => { const d = new Date(t.date); return d.getMonth() === thisMonth && d.getFullYear() === thisYear; })
            .reduce((a, b) => a + Number(b.amount), 0);

        // Unique categories
        const categories = new Set(expenses.map(t => t.category)).size;

        // Spending streak (consecutive days)
        const thisMonthExpenses = expenses.filter(t => {
            const d = new Date(t.date);
            return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
        });
        const uniqueDays = [...new Set(thisMonthExpenses.map(t => new Date(t.date).getDate()))].sort((a, b) => b - a);
        let streak = 0;
        const dayOfMonth = now.getDate();
        for (let i = 0; i < uniqueDays.length; i++) {
            if (i === 0 && uniqueDays[0] === dayOfMonth) streak++;
            else if (i > 0 && uniqueDays[i - 1] - uniqueDays[i] === 1) streak++;
            else if (i > 0) break;
        }

        return {
            totalTx: transactions.length,
            savingsRate,
            hasBudget: budget != null && budget > 0,
            budgetLimit: budget ?? 0,
            expense: thisMonthExpense,
            streak,
            categories,
        };
    }, [transactions, budget]);

    const earned = BADGE_DEFS.filter(b => b.check(data));
    const locked = BADGE_DEFS.filter(b => !b.check(data));

    return (
        <div className="card" style={{ position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: "linear-gradient(90deg, #f59e0b, #ec4899, #6366f1)" }} />

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 4, marginBottom: 16 }}>
                <div className="section-title" style={{ marginBottom: 0 }}>🏆 Achievements</div>
                <div style={{
                    padding: "3px 10px", borderRadius: 12,
                    background: "linear-gradient(135deg, rgba(245,158,11,0.1), rgba(236,72,153,0.1))",
                    border: "1px solid rgba(245,158,11,0.15)",
                    fontSize: 11, fontWeight: 900,
                    color: "#f59e0b",
                }}>
                    {earned.length}/{BADGE_DEFS.length}
                </div>
            </div>

            {/* Progress bar */}
            <div style={{
                height: 6, borderRadius: 4,
                background: "var(--glass)", border: "1px solid var(--border)",
                overflow: "hidden", marginBottom: 16,
            }}>
                <div style={{
                    height: "100%", borderRadius: 4,
                    width: `${(earned.length / BADGE_DEFS.length) * 100}%`,
                    background: "linear-gradient(90deg, #f59e0b, #ec4899, #6366f1)",
                    transition: "width 0.6s ease",
                }} />
            </div>

            {/* Earned Badges */}
            {earned.length > 0 && (
                <>
                    <div style={{ fontSize: 10, fontWeight: 800, color: "#f59e0b", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>
                        ✨ Earned ({earned.length})
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 8, marginBottom: 16 }}>
                        {earned.map((badge) => (
                            <div key={badge.id} style={{
                                padding: "14px 12px", borderRadius: 14, textAlign: "center",
                                background: "var(--glass)", border: "1px solid var(--border)",
                                transition: "all 0.3s",
                            }}
                                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(99,102,241,0.15)"; }}
                                onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
                            >
                                <div style={{
                                    width: 44, height: 44, borderRadius: 14, margin: "0 auto 8px",
                                    background: badge.gradient,
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    color: "white", boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                                }}>
                                    {badge.icon}
                                </div>
                                <div style={{ fontWeight: 800, fontSize: 12, color: "var(--text)", marginBottom: 2 }}>{badge.name}</div>
                                <div style={{ fontSize: 10, color: "var(--muted)" }}>{badge.desc}</div>
                            </div>
                        ))}
                    </div>
                </>
            )}

            {/* Locked Badges */}
            {locked.length > 0 && (
                <>
                    <div style={{ fontSize: 10, fontWeight: 800, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>
                        🔒 Locked ({locked.length})
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 8 }}>
                        {locked.map((badge) => (
                            <div key={badge.id} style={{
                                padding: "14px 12px", borderRadius: 14, textAlign: "center",
                                background: "var(--glass)", border: "1px solid var(--border)",
                                opacity: 0.45, filter: "grayscale(0.8)",
                            }}>
                                <div style={{
                                    width: 44, height: 44, borderRadius: 14, margin: "0 auto 8px",
                                    background: "rgba(255,255,255,0.05)",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    color: "var(--muted)",
                                }}>
                                    {badge.icon}
                                </div>
                                <div style={{ fontWeight: 800, fontSize: 12, color: "var(--text)", marginBottom: 2 }}>{badge.name}</div>
                                <div style={{ fontSize: 10, color: "var(--muted)" }}>{badge.desc}</div>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
