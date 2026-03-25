import { TrendingUp, AlertCircle, CheckCircle, Lightbulb, PiggyBank, Flame, ShieldCheck } from 'lucide-react';
import { formatCurrency } from '../../utils/formatCurrency';

export default function FinancialHealth({ balance, income, expense, budget, transactions = [] }) {
    const savingsRate = income > 0 ? ((income - expense) / income) * 100 : 0;
    const budgetAdherence = budget > 0 ? ((budget - expense) / budget) * 100 : 0;
    const score = Math.min(100, Math.max(0, (savingsRate * 0.6) + (budgetAdherence * 0.4)));

    const getStatus = (s) => {
        if (s >= 80) return { label: 'Excellent', color: '#10b981', icon: <CheckCircle size={16} /> };
        if (s >= 60) return { label: 'Good', color: '#22c55e', icon: <TrendingUp size={16} /> };
        if (s >= 40) return { label: 'Fair', color: '#f59e0b', icon: <AlertCircle size={16} /> };
        return { label: 'Needs Attention', color: '#ef4444', icon: <AlertCircle size={16} /> };
    };

    const status = getStatus(score);
    const radius = 34;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (score / 100) * circumference;

    // Smart tips
    const tips = [];
    if (savingsRate < 20 && income > 0) tips.push({ icon: <PiggyBank size={14} />, text: "Try to save at least 20% of your income", color: "#f59e0b" });
    if (savingsRate >= 30) tips.push({ icon: <Flame size={14} />, text: `Great savings rate — ${Math.round(savingsRate)}%!`, color: "#22c55e" });
    if (budget > 0 && expense > budget) tips.push({ icon: <AlertCircle size={14} />, text: `Over budget by ${formatCurrency(expense - budget)}`, color: "#ef4444" });
    if (budget > 0 && expense <= budget * 0.5) tips.push({ icon: <ShieldCheck size={14} />, text: "Well within budget — keep going!", color: "#22c55e" });
    if (expense > income && income > 0) tips.push({ icon: <AlertCircle size={14} />, text: "Spending exceeds income this period", color: "#ef4444" });
    if (tips.length === 0) tips.push({ icon: <Lightbulb size={14} />, text: "Add more transactions for better insights", color: "#818cf8" });

    // Metric bars
    const metrics = [
        { label: "Savings Rate", value: Math.round(savingsRate), color: savingsRate >= 20 ? "#22c55e" : "#f59e0b" },
        { label: "Budget Adherence", value: Math.max(0, Math.min(100, Math.round(budgetAdherence))), color: budgetAdherence >= 50 ? "#6366f1" : "#ef4444" },
    ];

    return (
        <div className="card" style={{ position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${status.color}, #6366f1)` }} />

            <div className="section-title" style={{ width: '100%', justifyContent: 'center', marginBottom: 14, marginTop: 4 }}>
                💡 Financial Health
            </div>

            {/* Score Ring */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 10 }}>
                <div style={{ position: 'relative', width: 88, height: 88 }}>
                    <svg width="88" height="88" style={{ transform: 'rotate(-90deg)' }}>
                        <circle cx="44" cy="44" r={radius} stroke="var(--border)" strokeWidth="6" fill="transparent" />
                        <circle cx="44" cy="44" r={radius} stroke={status.color} strokeWidth="6" fill="transparent"
                            strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
                            style={{ transition: 'stroke-dashoffset 1s ease', filter: `drop-shadow(0 0 4px ${status.color}66)` }} />
                    </svg>
                    <div style={{
                        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <span style={{ fontWeight: 900, fontSize: 22, color: status.color }}>{Math.round(score)}</span>
                        <span style={{ fontSize: 9, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>Score</span>
                    </div>
                </div>
            </div>

            <div style={{
                display: "flex", justifyContent: "center", marginBottom: 16,
            }}>
                <span style={{
                    color: status.color, fontWeight: 700, fontSize: 13,
                    display: 'flex', alignItems: 'center', gap: 5,
                    background: `${status.color}15`, padding: '5px 14px', borderRadius: 20,
                }}>
                    {status.icon} {status.label}
                </span>
            </div>

            {/* Detailed Metrics */}
            <div style={{ display: "grid", gap: 12, marginBottom: 16 }}>
                {metrics.map((m, i) => (
                    <div key={i}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)" }}>{m.label}</span>
                            <span style={{ fontSize: 11, fontWeight: 900, color: m.color }}>{m.value}%</span>
                        </div>
                        <div style={{ height: 5, borderRadius: 3, background: "var(--glass)", border: "1px solid var(--border)", overflow: "hidden" }}>
                            <div style={{ height: "100%", borderRadius: 3, width: `${m.value}%`, background: m.color, transition: "width 0.6s ease" }} />
                        </div>
                    </div>
                ))}
            </div>

            {/* Key Stats Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 16 }}>
                <div style={{
                    padding: "10px 12px", borderRadius: 10, textAlign: "center",
                    background: "rgba(34,197,94,0.05)", border: "1px solid rgba(34,197,94,0.1)",
                }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: "#22c55e", marginBottom: 3 }}>SAVED</div>
                    <div style={{ fontSize: 16, fontWeight: 900, color: balance >= 0 ? "#22c55e" : "#ef4444" }}>{formatCurrency(Math.max(0, income - expense))}</div>
                </div>
                <div style={{
                    padding: "10px 12px", borderRadius: 10, textAlign: "center",
                    background: budget > 0 ? "rgba(99,102,241,0.05)" : "rgba(245,158,11,0.05)",
                    border: `1px solid ${budget > 0 ? "rgba(99,102,241,0.1)" : "rgba(245,158,11,0.1)"}`,
                }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: budget > 0 ? "#818cf8" : "#f59e0b", marginBottom: 3 }}>
                        {budget > 0 ? "REMAINING" : "NO BUDGET"}
                    </div>
                    <div style={{ fontSize: 16, fontWeight: 900, color: budget > 0 ? (budget - expense >= 0 ? "#818cf8" : "#ef4444") : "#f59e0b" }}>
                        {budget > 0 ? formatCurrency(budget - expense) : "Set it →"}
                    </div>
                </div>
            </div>

            {/* Smart Tips */}
            <div style={{ display: "grid", gap: 6 }}>
                {tips.map((tip, i) => (
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
    );
}
