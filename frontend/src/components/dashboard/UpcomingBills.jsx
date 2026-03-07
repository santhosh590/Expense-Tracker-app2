import { useContext, useMemo } from "react";
import { TransactionContext } from "../../context/TransactionContext";
import { formatCurrency } from "../../utils/formatCurrency";
import { Bell, Calendar, RefreshCw, AlertCircle } from "lucide-react";

export default function UpcomingBills() {
    const { transactions } = useContext(TransactionContext);

    const upcomingBills = useMemo(() => {
        const now = new Date();
        const recurring = transactions.filter(t => t.isRecurring && t.type === "expense");

        // Predict next occurrence based on last transaction date and interval
        return recurring.map(t => {
            const lastDate = new Date(t.date);
            let nextDate = new Date(lastDate);

            switch (t.recurringInterval) {
                case "weekly":
                    while (nextDate <= now) nextDate.setDate(nextDate.getDate() + 7);
                    break;
                case "monthly":
                    while (nextDate <= now) nextDate.setMonth(nextDate.getMonth() + 1);
                    break;
                case "yearly":
                    while (nextDate <= now) nextDate.setFullYear(nextDate.getFullYear() + 1);
                    break;
                default:
                    while (nextDate <= now) nextDate.setMonth(nextDate.getMonth() + 1);
            }

            const daysUntil = Math.ceil((nextDate - now) / 86400000);

            return {
                ...t,
                nextDate,
                daysUntil,
                urgency: daysUntil <= 3 ? "urgent" : daysUntil <= 7 ? "soon" : "normal",
            };
        }).sort((a, b) => a.daysUntil - b.daysUntil);
    }, [transactions]);

    const totalUpcoming = upcomingBills.reduce((a, b) => a + Number(b.amount), 0);

    const getCatIcon = (cat) => {
        const map = { Food: "🍕", Travel: "✈️", Shopping: "🛍️", Bills: "📃", Health: "🏥", Entertainment: "🎬", Rent: "🏠", Other: "📦" };
        return map[cat] || "📄";
    };

    const getUrgencyColor = (urgency) => {
        if (urgency === "urgent") return "#ef4444";
        if (urgency === "soon") return "#f59e0b";
        return "#22c55e";
    };

    return (
        <div className="card" style={{ position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: "linear-gradient(90deg, #f59e0b, #ef4444)" }} />

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 4, marginBottom: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{
                        width: 32, height: 32, borderRadius: 10,
                        background: "linear-gradient(135deg, #f59e0b, #ef4444)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                        <Bell size={16} color="white" />
                    </div>
                    <div>
                        <div style={{ fontWeight: 900, fontSize: 15, color: "var(--text)" }}>Upcoming Bills</div>
                        <div style={{ fontSize: 11, color: "var(--muted)" }}>Recurring expenses due soon</div>
                    </div>
                </div>
                {totalUpcoming > 0 && (
                    <div style={{
                        padding: "4px 12px", borderRadius: 10,
                        background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.15)",
                        fontSize: 12, fontWeight: 900, color: "#ef4444",
                    }}>
                        {formatCurrency(totalUpcoming)}
                    </div>
                )}
            </div>

            {upcomingBills.length === 0 ? (
                <div style={{ textAlign: "center", padding: "24px 16px" }}>
                    <RefreshCw size={28} style={{ color: "var(--muted)", opacity: 0.2, marginBottom: 8 }} />
                    <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", marginBottom: 4 }}>No recurring bills</div>
                    <div style={{ fontSize: 11, color: "var(--muted)" }}>Mark transactions as recurring to see them here</div>
                </div>
            ) : (
                <div style={{ display: "grid", gap: 6 }}>
                    {upcomingBills.slice(0, 5).map((bill, i) => {
                        const color = getUrgencyColor(bill.urgency);
                        return (
                            <div key={i} style={{
                                display: "flex", alignItems: "center", gap: 10,
                                padding: "10px 12px", borderRadius: 12,
                                background: `${color}05`, border: `1px solid ${color}12`,
                                transition: "all 0.2s",
                            }}
                                onMouseEnter={e => { e.currentTarget.style.transform = "translateX(3px)"; }}
                                onMouseLeave={e => { e.currentTarget.style.transform = "translateX(0)"; }}
                            >
                                <span style={{ fontSize: 18 }}>{getCatIcon(bill.category)}</span>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontWeight: 700, fontSize: 12, color: "var(--text)" }}>{bill.title}</div>
                                    <div style={{ fontSize: 10, color: "var(--muted)", marginTop: 2, display: "flex", alignItems: "center", gap: 4 }}>
                                        <Calendar size={9} />
                                        {bill.nextDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                                        <span style={{ opacity: 0.4 }}>•</span>
                                        <RefreshCw size={9} />
                                        {bill.recurringInterval}
                                    </div>
                                </div>
                                <div style={{ textAlign: "right", flexShrink: 0 }}>
                                    <div style={{ fontWeight: 900, fontSize: 13, color }}>{formatCurrency(bill.amount)}</div>
                                    <div style={{
                                        fontSize: 9, fontWeight: 800, color,
                                        padding: "1px 6px", borderRadius: 6,
                                        background: `${color}10`,
                                        marginTop: 2,
                                    }}>
                                        {bill.daysUntil === 0 ? "TODAY" : bill.daysUntil === 1 ? "TOMORROW" : `${bill.daysUntil}d`}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
