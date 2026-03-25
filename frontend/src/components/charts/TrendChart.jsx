import { useContext, useMemo } from "react";
import { TransactionContext } from "../../context/TransactionContext";
import { formatCurrency } from "../../utils/formatCurrency";
import {
    Line, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, Legend, Area, AreaChart
} from "recharts";
import { TrendingUp } from "lucide-react";

export default function TrendChart() {
    const { transactions } = useContext(TransactionContext);

    const theme = document.documentElement.getAttribute("data-theme");
    const isLight = theme === "light";
    const tickColor = isLight ? "rgba(0,0,0,0.4)" : "rgba(255,255,255,0.35)";
    const gridColor = isLight ? "rgba(0,0,0,0.04)" : "rgba(255,255,255,0.04)";

    const data = useMemo(() => {
        const monthMap = {};
        transactions.forEach((t) => {
            const d = new Date(t.date);
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
            if (!monthMap[key]) monthMap[key] = { month: key, income: 0, expense: 0 };
            if (t.type === "income") monthMap[key].income += Number(t.amount);
            else monthMap[key].expense += Number(t.amount);
        });
        return Object.values(monthMap)
            .sort((a, b) => a.month.localeCompare(b.month))
            .slice(-12)
            .map((item) => ({
                ...item,
                label: new Date(item.month + "-01").toLocaleString("default", { month: "short", year: "2-digit" }),
                savings: item.income - item.expense,
            }));
    }, [transactions]);

    if (data.length === 0) {
        return (
            <div className="card" style={{ textAlign: "center", padding: "48px 30px" }}>
                <div style={{ fontSize: 40, marginBottom: 14, opacity: 0.2 }}>📈</div>
                <div style={{ fontWeight: 800, fontSize: 16, color: "var(--text)", marginBottom: 6 }}>No trend data yet</div>
                <div style={{ color: "var(--muted)", fontSize: 13 }}>Add transactions to see your income vs expense trends</div>
            </div>
        );
    }

    const CustomTooltip = ({ active, payload, label }) => {
        if (!active || !payload) return null;
        return (
            <div style={{
                background: isLight ? "rgba(255,255,255,0.96)" : "rgba(10,14,28,0.96)",
                border: `1px solid ${isLight ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.08)"} `,
                borderRadius: 16, padding: "14px 18px",
                backdropFilter: "blur(12px)",
                boxShadow: "0 12px 32px rgba(0,0,0,0.3)",
            }}>
                <div style={{ fontWeight: 900, marginBottom: 8, color: isLight ? "#1a1a2e" : "#fff", fontSize: 13 }}>{label}</div>
                {payload.map((p, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: p.color, boxShadow: `0 0 6px ${p.color}66` }} />
                        <span style={{ fontSize: 12, fontWeight: 700, color: p.color }}>{p.name}:</span>
                        <span style={{ fontSize: 12, fontWeight: 800, color: isLight ? "#1a1a2e" : "#fff" }}>{formatCurrency(p.value)}</span>
                    </div>
                ))}
            </div>
        );
    };

    const CustomLegend = ({ payload }) => (
        <div style={{ display: "flex", justifyContent: "center", gap: 20, paddingTop: 12 }}>
            {payload?.map((entry, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div style={{
                        width: 10, height: 10, borderRadius: 3,
                        background: entry.color, boxShadow: `0 0 8px ${entry.color}44`,
                    }} />
                    <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)" }}>{entry.value}</span>
                </div>
            ))}
        </div>
    );

    return (
        <div className="card" style={{ position: "relative", overflow: "hidden" }}>
            {/* Gradient accent */}
            <div style={{
                position: "absolute", top: 0, left: 0, right: 0, height: 3,
                background: "linear-gradient(90deg, #22c55e, #6366f1, #ef4444)",
            }} />
            <div className="section-title" style={{ marginTop: 4 }}>
                <TrendingUp size={18} style={{ color: "#6366f1" }} /> Income vs Expense Trends
            </div>
            <div style={{ marginTop: 16, height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data}>
                        <defs>
                            <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.15} />
                                <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.15} />
                                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                        <XAxis dataKey="label" tick={{ fill: tickColor, fontSize: 11, fontWeight: 600 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: tickColor, fontSize: 11, fontWeight: 600 }} axisLine={false} tickLine={false} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend content={<CustomLegend />} />
                        <Area type="monotone" dataKey="income" stroke="#22c55e" strokeWidth={2.5}
                            fill="url(#incomeGrad)" dot={{ fill: "#22c55e", r: 4, strokeWidth: 2, stroke: isLight ? "#fff" : "#0b1020" }}
                            activeDot={{ r: 6, stroke: "#22c55e", strokeWidth: 2, fill: isLight ? "#fff" : "#0b1020" }}
                            name="Income" />
                        <Area type="monotone" dataKey="expense" stroke="#ef4444" strokeWidth={2.5}
                            fill="url(#expenseGrad)" dot={{ fill: "#ef4444", r: 4, strokeWidth: 2, stroke: isLight ? "#fff" : "#0b1020" }}
                            activeDot={{ r: 6, stroke: "#ef4444", strokeWidth: 2, fill: isLight ? "#fff" : "#0b1020" }}
                            name="Expense" />
                        <Line type="monotone" dataKey="savings" stroke="#818cf8" strokeWidth={2}
                            strokeDasharray="6 4" dot={{ fill: "#818cf8", r: 3 }} name="Net Savings" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
