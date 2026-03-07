import { useContext, useMemo } from "react";
import { TransactionContext } from "../../context/TransactionContext";
import { formatCurrency } from "../../utils/formatCurrency";
import { Flame } from "lucide-react";

export default function WeeklyHeatmap() {
    const { transactions } = useContext(TransactionContext);

    const heatmap = useMemo(() => {
        const now = new Date();
        const expenses = transactions.filter(t => t.type === "expense");

        // Build 7 days x 4 weeks (last 28 days)
        const days = [];
        for (let i = 27; i >= 0; i--) {
            const d = new Date(now);
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().slice(0, 10);
            const dayExpenses = expenses.filter(t => new Date(t.date).toISOString().slice(0, 10) === dateStr);
            const total = dayExpenses.reduce((a, b) => a + Number(b.amount), 0);
            days.push({
                date: d,
                total,
                count: dayExpenses.length,
                dayName: d.toLocaleDateString("en-US", { weekday: "short" }),
                dateLabel: d.getDate(),
                month: d.toLocaleDateString("en-US", { month: "short" }),
            });
        }

        // Find max for color scaling
        const maxAmount = Math.max(...days.map(d => d.total), 1);

        return { days, maxAmount };
    }, [transactions]);

    const getColor = (amount, max) => {
        if (amount === 0) return "rgba(255,255,255,0.03)";
        const intensity = Math.min(amount / max, 1);
        if (intensity > 0.75) return "rgba(239,68,68,0.7)";
        if (intensity > 0.5) return "rgba(245,158,11,0.6)";
        if (intensity > 0.25) return "rgba(99,102,241,0.5)";
        return "rgba(99,102,241,0.2)";
    };

    const getBorderColor = (amount, max) => {
        if (amount === 0) return "rgba(255,255,255,0.05)";
        const intensity = Math.min(amount / max, 1);
        if (intensity > 0.75) return "rgba(239,68,68,0.3)";
        if (intensity > 0.5) return "rgba(245,158,11,0.3)";
        return "rgba(99,102,241,0.2)";
    };

    // Organize into weeks (rows of 7)
    const weeks = [];
    for (let i = 0; i < heatmap.days.length; i += 7) {
        weeks.push(heatmap.days.slice(i, i + 7));
    }

    // Summary stats
    const totalLast28 = heatmap.days.reduce((a, b) => a + b.total, 0);
    const activeDays = heatmap.days.filter(d => d.count > 0).length;
    const avgPerActiveDay = activeDays > 0 ? totalLast28 / activeDays : 0;

    return (
        <div className="card" style={{ position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: "linear-gradient(90deg, #6366f1, #a855f7, #ec4899)" }} />

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 4, marginBottom: 16 }}>
                <div className="section-title" style={{ marginBottom: 0 }}>
                    🔥 Spending Heatmap <span style={{ fontSize: 11, fontWeight: 500, color: "var(--muted)" }}>Last 28 days</span>
                </div>
                <div style={{ display: "flex", gap: 12 }}>
                    <div style={{ textAlign: "center" }}>
                        <div style={{ fontSize: 16, fontWeight: 900, color: "#6366f1" }}>{activeDays}</div>
                        <div style={{ fontSize: 9, color: "var(--muted)", fontWeight: 700 }}>ACTIVE DAYS</div>
                    </div>
                    <div style={{ textAlign: "center" }}>
                        <div style={{ fontSize: 16, fontWeight: 900, color: "#f59e0b" }}>{formatCurrency(avgPerActiveDay)}</div>
                        <div style={{ fontSize: 9, color: "var(--muted)", fontWeight: 700 }}>AVG/DAY</div>
                    </div>
                </div>
            </div>

            {/* Day labels */}
            <div style={{ display: "grid", gridTemplateColumns: "32px repeat(7, 1fr)", gap: 4, marginBottom: 4 }}>
                <div />
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
                    <div key={d} style={{ textAlign: "center", fontSize: 9, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>{d}</div>
                ))}
            </div>

            {/* Heatmap Grid */}
            <div style={{ display: "grid", gap: 4 }}>
                {weeks.map((week, wi) => (
                    <div key={wi} style={{ display: "grid", gridTemplateColumns: "32px repeat(7, 1fr)", gap: 4 }}>
                        <div style={{ fontSize: 9, fontWeight: 700, color: "var(--muted)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            {week[0]?.month}
                        </div>
                        {week.map((day, di) => (
                            <div
                                key={di}
                                title={`${day.date.toLocaleDateString()}: ${day.count} transactions, ${formatCurrency(day.total)}`}
                                style={{
                                    aspectRatio: "1", borderRadius: 8,
                                    background: getColor(day.total, heatmap.maxAmount),
                                    border: `1px solid ${getBorderColor(day.total, heatmap.maxAmount)}`,
                                    display: "flex", flexDirection: "column",
                                    alignItems: "center", justifyContent: "center",
                                    cursor: "default", transition: "all 0.2s",
                                    position: "relative",
                                }}
                                onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.15)"; e.currentTarget.style.zIndex = 2; }}
                                onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.zIndex = 0; }}
                            >
                                <span style={{ fontSize: 11, fontWeight: 800, color: day.total > 0 ? "white" : "var(--muted)", opacity: day.total > 0 ? 1 : 0.4 }}>
                                    {day.dateLabel}
                                </span>
                                {day.count > 0 && (
                                    <span style={{ fontSize: 7, fontWeight: 900, color: "rgba(255,255,255,0.7)" }}>
                                        {day.count}
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>
                ))}
            </div>

            {/* Legend */}
            <div style={{
                display: "flex", alignItems: "center", justifyContent: "center",
                gap: 8, marginTop: 14, paddingTop: 12,
                borderTop: "1px solid var(--border)",
            }}>
                <span style={{ fontSize: 10, color: "var(--muted)", fontWeight: 600 }}>Less</span>
                {[0, 0.25, 0.5, 0.75, 1].map((level, i) => (
                    <div key={i} style={{
                        width: 14, height: 14, borderRadius: 4,
                        background: getColor(level * heatmap.maxAmount, heatmap.maxAmount),
                        border: `1px solid ${getBorderColor(level * heatmap.maxAmount, heatmap.maxAmount)}`,
                    }} />
                ))}
                <span style={{ fontSize: 10, color: "var(--muted)", fontWeight: 600 }}>More</span>
            </div>
        </div>
    );
}
