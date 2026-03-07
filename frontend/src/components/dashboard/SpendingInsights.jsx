import { useContext, useMemo } from "react";
import { TransactionContext } from "../../context/TransactionContext";
import { formatCurrency } from "../../utils/formatCurrency";
import {
    TrendingUp, TrendingDown, Flame, Zap, Eye, Clock,
    ArrowUpRight, ArrowDownRight, Brain, Sparkles
} from "lucide-react";

export default function SpendingInsights() {
    const { transactions } = useContext(TransactionContext);

    const insights = useMemo(() => {
        const now = new Date();
        const thisMonth = now.getMonth();
        const thisYear = now.getFullYear();
        const dayOfMonth = now.getDate();
        const daysInMonth = new Date(thisYear, thisMonth + 1, 0).getDate();
        const dayOfWeek = now.getDay();

        const expenses = transactions.filter(t => t.type === "expense");
        const incomes = transactions.filter(t => t.type === "income");

        // This month
        const thisMonthExp = expenses.filter(t => {
            const d = new Date(t.date);
            return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
        });
        const thisMonthTotal = thisMonthExp.reduce((a, b) => a + Number(b.amount), 0);

        // Last month
        const lm = thisMonth === 0 ? 11 : thisMonth - 1;
        const lmY = thisMonth === 0 ? thisYear - 1 : thisYear;
        const lastMonthExp = expenses.filter(t => {
            const d = new Date(t.date);
            return d.getMonth() === lm && d.getFullYear() === lmY;
        });
        const lastMonthTotal = lastMonthExp.reduce((a, b) => a + Number(b.amount), 0);

        // Percentage change
        const pctChange = lastMonthTotal > 0
            ? ((thisMonthTotal - lastMonthTotal) / lastMonthTotal * 100).toFixed(1)
            : thisMonthTotal > 0 ? 100 : 0;

        // Daily average this month
        const dailyAvg = dayOfMonth > 0 ? thisMonthTotal / dayOfMonth : 0;

        // Projected
        const projected = dailyAvg * daysInMonth;

        // Highest spending day of week
        const dowNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        const dowMap = {};
        expenses.forEach(t => {
            const d = new Date(t.date).getDay();
            dowMap[d] = (dowMap[d] || 0) + Number(t.amount);
        });
        const highestDow = Object.entries(dowMap).sort((a, b) => b[1] - a[1])[0];

        // Most expensive category this month
        const catMap = {};
        thisMonthExp.forEach(t => {
            catMap[t.category] = (catMap[t.category] || 0) + Number(t.amount);
        });
        const topCat = Object.entries(catMap).sort((a, b) => b[1] - a[1])[0];

        // Spending velocity (last 7 days vs previous 7 days)
        const oneDay = 86400000;
        const last7 = expenses
            .filter(t => now - new Date(t.date) <= 7 * oneDay)
            .reduce((a, b) => a + Number(b.amount), 0);
        const prev7 = expenses
            .filter(t => { const diff = now - new Date(t.date); return diff > 7 * oneDay && diff <= 14 * oneDay; })
            .reduce((a, b) => a + Number(b.amount), 0);
        const velocityChange = prev7 > 0 ? ((last7 - prev7) / prev7 * 100).toFixed(0) : 0;

        // Today's spending
        const todaySpent = expenses
            .filter(t => {
                const d = new Date(t.date);
                return d.getDate() === dayOfMonth && d.getMonth() === thisMonth && d.getFullYear() === thisYear;
            })
            .reduce((a, b) => a + Number(b.amount), 0);

        // Savings this month
        const thisMonthIncome = incomes
            .filter(t => { const d = new Date(t.date); return d.getMonth() === thisMonth && d.getFullYear() === thisYear; })
            .reduce((a, b) => a + Number(b.amount), 0);
        const savingsRate = thisMonthIncome > 0
            ? Math.round((thisMonthIncome - thisMonthTotal) / thisMonthIncome * 100)
            : 0;

        return {
            thisMonthTotal, lastMonthTotal, pctChange, dailyAvg, projected,
            highestDow: highestDow ? { day: dowNames[highestDow[0]], amount: highestDow[1] } : null,
            topCat: topCat ? { name: topCat[0], amount: topCat[1] } : null,
            velocityChange, last7, todaySpent, savingsRate,
            daysLeft: daysInMonth - dayOfMonth,
        };
    }, [transactions]);

    const cards = [
        {
            icon: <Zap size={16} />, label: "Today's Spending",
            value: formatCurrency(insights.todaySpent),
            color: insights.todaySpent > insights.dailyAvg ? "#ef4444" : "#22c55e",
            sub: insights.todaySpent > insights.dailyAvg ? "Above daily average" : "Below daily average",
        },
        {
            icon: <TrendingDown size={16} />, label: "Last 7 Days",
            value: formatCurrency(insights.last7),
            color: Number(insights.velocityChange) > 0 ? "#ef4444" : "#22c55e",
            sub: `${Math.abs(insights.velocityChange)}% ${Number(insights.velocityChange) > 0 ? "↑" : "↓"} vs prev week`,
        },
        {
            icon: <Eye size={16} />, label: "Projected This Month",
            value: formatCurrency(insights.projected),
            color: "#818cf8",
            sub: `${insights.daysLeft} days remaining`,
        },
        {
            icon: <TrendingUp size={16} />, label: "Savings Rate",
            value: `${insights.savingsRate}%`,
            color: insights.savingsRate >= 20 ? "#22c55e" : insights.savingsRate > 0 ? "#f59e0b" : "#ef4444",
            sub: insights.savingsRate >= 20 ? "Healthy savings!" : "Try to save more",
        },
    ];

    const smartTips = [
        insights.topCat && { icon: <Flame size={13} />, text: `Top spending: ${insights.topCat.name} (${formatCurrency(insights.topCat.amount)})`, color: "#f59e0b" },
        insights.highestDow && { icon: <Clock size={13} />, text: `You spend most on ${insights.highestDow.day}s (${formatCurrency(insights.highestDow.amount)} total)`, color: "#818cf8" },
        Number(insights.pctChange) > 15 && { icon: <ArrowUpRight size={13} />, text: `Spending is ${insights.pctChange}% higher than last month`, color: "#ef4444" },
        Number(insights.pctChange) < -10 && { icon: <ArrowDownRight size={13} />, text: `Great! Spending is ${Math.abs(insights.pctChange)}% lower than last month`, color: "#22c55e" },
        insights.dailyAvg > 0 && { icon: <Brain size={13} />, text: `Your daily average is ${formatCurrency(insights.dailyAvg)}`, color: "#a855f7" },
    ].filter(Boolean);

    return (
        <div className="card" style={{ position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: "linear-gradient(90deg, #a855f7, #6366f1, #ec4899)" }} />

            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4, marginBottom: 16 }}>
                <div style={{
                    width: 32, height: 32, borderRadius: 10,
                    background: "linear-gradient(135deg, #a855f7, #6366f1)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                    <Sparkles size={16} color="white" />
                </div>
                <div>
                    <div style={{ fontWeight: 900, fontSize: 15, color: "var(--text)" }}>Smart Insights</div>
                    <div style={{ fontSize: 11, color: "var(--muted)" }}>AI-powered spending analysis</div>
                </div>
            </div>

            {/* Mini Stat Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 14 }}>
                {cards.map((card, i) => (
                    <div key={i} style={{
                        padding: "12px", borderRadius: 12,
                        background: `${card.color}06`, border: `1px solid ${card.color}15`,
                        transition: "all 0.2s",
                    }}
                        onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = `0 4px 12px ${card.color}15`; }}
                        onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
                    >
                        <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 6 }}>
                            <span style={{ color: card.color }}>{card.icon}</span>
                            <span style={{ fontSize: 10, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.3 }}>{card.label}</span>
                        </div>
                        <div style={{ fontSize: 18, fontWeight: 900, color: card.color, letterSpacing: "-0.3px" }}>{card.value}</div>
                        <div style={{ fontSize: 10, color: "var(--muted)", marginTop: 3 }}>{card.sub}</div>
                    </div>
                ))}
            </div>

            {/* Smart Tips */}
            {smartTips.length > 0 && (
                <div style={{ display: "grid", gap: 5 }}>
                    {smartTips.slice(0, 3).map((tip, i) => (
                        <div key={i} style={{
                            display: "flex", alignItems: "center", gap: 7,
                            padding: "7px 10px", borderRadius: 8,
                            background: `${tip.color}06`, border: `1px solid ${tip.color}12`,
                            fontSize: 11, fontWeight: 600, color: tip.color,
                        }}>
                            {tip.icon} {tip.text}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
