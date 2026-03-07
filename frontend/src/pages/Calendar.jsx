import { useState, useContext, useEffect } from "react";
import { TransactionContext } from "../context/TransactionContext";
import { formatCurrency } from "../utils/formatCurrency";
import { ChevronLeft, ChevronRight, TrendingUp, TrendingDown, Minus, Clock } from "lucide-react";

export default function CalendarPage() {
    const { transactions } = useContext(TransactionContext);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDay, setSelectedDay] = useState(null);
    const [now, setNow] = useState(new Date());

    // Real-time clock — update every second
    useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const monthName = currentDate.toLocaleString("default", { month: "long" });

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const prevMonth = () => { setCurrentDate(new Date(year, month - 1, 1)); setSelectedDay(null); };
    const nextMonth = () => { setCurrentDate(new Date(year, month + 1, 1)); setSelectedDay(null); };
    const goToToday = () => { setCurrentDate(new Date()); setSelectedDay(now.getDate()); };

    // Group transactions by day
    const dayMap = {};
    const dayTransactions = {};
    transactions.forEach((t) => {
        const d = new Date(t.date);
        if (d.getMonth() === month && d.getFullYear() === year) {
            const day = d.getDate();
            if (!dayMap[day]) dayMap[day] = { income: 0, expense: 0, count: 0 };
            if (!dayTransactions[day]) dayTransactions[day] = [];
            if (t.type === "income") dayMap[day].income += Number(t.amount);
            else dayMap[day].expense += Number(t.amount);
            dayMap[day].count++;
            dayTransactions[day].push(t);
        }
    });

    const totalIncome = Object.values(dayMap).reduce((s, d) => s + d.income, 0);
    const totalExpense = Object.values(dayMap).reduce((s, d) => s + d.expense, 0);
    const totalNet = totalIncome - totalExpense;

    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const cells = [];
    for (let i = 0; i < firstDay; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);

    const isToday = (day) => day === now.getDate() && month === now.getMonth() && year === now.getFullYear();
    const isCurrentMonth = month === now.getMonth() && year === now.getFullYear();
    const maxExpense = Math.max(...Object.values(dayMap).map((d) => d.expense), 1);

    // Format real-time clock
    const clockTime = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true });
    const fullDate = now.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

    return (
        <div>
            {/* Header with live clock */}
            <div className="page-header">
                <div>
                    <div className="page-title">Calendar</div>
                    <div className="page-subtitle">View your daily income and expenses at a glance 📅</div>
                </div>
                <div style={{ textAlign: "right" }}>
                    <div style={{
                        fontSize: 28, fontWeight: 900, letterSpacing: "-1px",
                        fontVariantNumeric: "tabular-nums",
                        background: "linear-gradient(90deg, #6366f1, #ec4899)",
                        WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                    }}>{clockTime}</div>
                    <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2, fontWeight: 600 }}>{fullDate}</div>
                </div>
            </div>

            {/* Month Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 24 }}>
                {[
                    { label: "Monthly Income", value: formatCurrency(totalIncome), color: "#22c55e", icon: <TrendingUp size={18} />, bg: "rgba(34,197,94,0.08)" },
                    { label: "Monthly Expense", value: formatCurrency(totalExpense), color: "#ef4444", icon: <TrendingDown size={18} />, bg: "rgba(239,68,68,0.08)" },
                    { label: "Net Balance", value: formatCurrency(totalNet), color: totalNet >= 0 ? "#22c55e" : "#ef4444", icon: <Minus size={18} />, bg: totalNet >= 0 ? "rgba(34,197,94,0.08)" : "rgba(239,68,68,0.08)" },
                ].map((stat, i) => (
                    <div key={i} className="card" style={{ padding: "20px 24px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                            <div style={{
                                width: 36, height: 36, borderRadius: 12, background: stat.bg,
                                display: "flex", alignItems: "center", justifyContent: "center", color: stat.color,
                            }}>{stat.icon}</div>
                            <span style={{ fontSize: 12, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.8 }}>{stat.label}</span>
                        </div>
                        <div style={{ fontSize: 26, fontWeight: 900, color: stat.color, letterSpacing: "-0.5px" }}>{stat.value}</div>
                    </div>
                ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: selectedDay ? "1fr 340px" : "1fr", gap: 20, transition: "all 0.3s" }}>
                {/* Calendar */}
                <div className="card" style={{ position: "relative", overflow: "hidden" }}>
                    {/* Accent */}
                    <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: "linear-gradient(90deg, #6366f1, #ec4899, #f59e0b)" }} />

                    {/* Month Nav */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, marginTop: 8 }}>
                        <button onClick={prevMonth} className="btn secondary" style={{ padding: "10px 14px" }}>
                            <ChevronLeft size={18} />
                        </button>
                        <div style={{ textAlign: "center" }}>
                            <div style={{
                                fontSize: 22, fontWeight: 900, letterSpacing: "-0.3px",
                                background: "linear-gradient(90deg, var(--text), var(--muted))",
                                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                            }}>
                                {monthName} {year}
                            </div>
                            {!isCurrentMonth && (
                                <button onClick={goToToday} style={{
                                    background: "none", border: "none", color: "#6366f1",
                                    fontSize: 11, fontWeight: 700, cursor: "pointer",
                                    marginTop: 4, textDecoration: "underline",
                                }}>↩ Back to today</button>
                            )}
                        </div>
                        <button onClick={nextMonth} className="btn secondary" style={{ padding: "10px 14px" }}>
                            <ChevronRight size={18} />
                        </button>
                    </div>

                    {/* Day headers */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, marginBottom: 8 }}>
                        {dayNames.map((d) => (
                            <div key={d} style={{
                                textAlign: "center", fontSize: 11, fontWeight: 800,
                                color: "var(--muted)", padding: "8px 0",
                                textTransform: "uppercase", letterSpacing: 1,
                            }}>{d}</div>
                        ))}
                    </div>

                    {/* Day cells */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
                        {cells.map((day, i) => {
                            if (day === null) return <div key={i} />;
                            const data = dayMap[day];
                            const intensity = data ? Math.max(0.04, (data.expense / maxExpense) * 0.15) : 0;
                            const isSelected = selectedDay === day;
                            const todayCell = isToday(day);

                            return (
                                <div key={i} onClick={() => setSelectedDay(data ? day : selectedDay === day ? null : null)}
                                    style={{
                                        minHeight: 85, padding: "8px 10px", borderRadius: 14,
                                        border: todayCell ? "2px solid #6366f1"
                                            : isSelected ? "2px solid #f59e0b"
                                                : "1px solid var(--border)",
                                        background: todayCell ? "rgba(99,102,241,0.06)"
                                            : isSelected ? "rgba(245,158,11,0.06)"
                                                : data ? `rgba(239,68,68,${intensity})` : "var(--glass)",
                                        cursor: data ? "pointer" : "default",
                                        transition: "all 0.2s ease",
                                        position: "relative",
                                    }}
                                    onMouseEnter={(e) => { if (data) e.currentTarget.style.transform = "scale(1.03)"; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
                                >
                                    {/* Day number */}
                                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                                        <span style={{
                                            fontSize: 13, fontWeight: todayCell ? 900 : 600,
                                            color: todayCell ? "#6366f1" : "var(--text)",
                                        }}>{day}</span>
                                        {/* Live pulse on today */}
                                        {todayCell && (
                                            <span style={{
                                                width: 6, height: 6, borderRadius: "50%",
                                                background: "#6366f1",
                                                animation: "pulse 2s ease-in-out infinite",
                                                boxShadow: "0 0 6px #6366f1",
                                            }} />
                                        )}
                                    </div>

                                    {data && (
                                        <div style={{ marginTop: 4 }}>
                                            {data.income > 0 && (
                                                <div style={{ fontSize: 10, color: "#22c55e", fontWeight: 800 }}>
                                                    +{formatCurrency(data.income)}
                                                </div>
                                            )}
                                            {data.expense > 0 && (
                                                <div style={{ fontSize: 10, color: "#ef4444", fontWeight: 800 }}>
                                                    -{formatCurrency(data.expense)}
                                                </div>
                                            )}
                                            <div style={{
                                                position: "absolute", top: 6, right: 6,
                                                width: 18, height: 18, borderRadius: "50%",
                                                background: "linear-gradient(135deg, #6366f1, #4f46e5)",
                                                color: "#fff", fontSize: 9, fontWeight: 900,
                                                display: "flex", alignItems: "center", justifyContent: "center",
                                                boxShadow: "0 2px 6px rgba(99,102,241,0.4)",
                                            }}>{data.count}</div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* Live time bar for today */}
                    {isCurrentMonth && (
                        <div style={{
                            marginTop: 20, padding: "12px 16px", borderRadius: 14,
                            background: "rgba(99,102,241,0.06)", border: "1px solid rgba(99,102,241,0.15)",
                            display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                        }}>
                            <Clock size={14} style={{ color: "#6366f1" }} />
                            <span style={{ fontSize: 13, fontWeight: 700, color: "#818cf8", fontVariantNumeric: "tabular-nums" }}>
                                {now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true })}
                            </span>
                            <span style={{ fontSize: 11, color: "var(--muted)" }}>•</span>
                            <span style={{ fontSize: 12, color: "var(--muted)", fontWeight: 600 }}>
                                {now.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
                            </span>
                            {/* Day progress */}
                            <div style={{ flex: 1, maxWidth: 120, height: 4, borderRadius: 4, background: "var(--glass)", marginLeft: 8, overflow: "hidden" }}>
                                <div style={{
                                    height: "100%", borderRadius: 4,
                                    width: `${((now.getHours() * 60 + now.getMinutes()) / 1440) * 100}%`,
                                    background: "linear-gradient(90deg, #6366f1, #ec4899)",
                                    transition: "width 1s linear",
                                }} />
                            </div>
                            <span style={{ fontSize: 10, color: "var(--muted)" }}>
                                {Math.round(((now.getHours() * 60 + now.getMinutes()) / 1440) * 100)}% of day
                            </span>
                        </div>
                    )}
                </div>

                {/* Day Detail Panel */}
                {selectedDay && dayTransactions[selectedDay] && (
                    <div className="card" style={{ alignSelf: "start", position: "relative", overflow: "hidden" }}>
                        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: "linear-gradient(90deg, #f59e0b, #ec4899)" }} />
                        <div className="section-title" style={{ marginTop: 8 }}>
                            📋 {monthName} {selectedDay}
                            {isToday(selectedDay) && (
                                <span style={{
                                    fontSize: 10, fontWeight: 800, padding: "2px 8px", borderRadius: 20,
                                    background: "rgba(99,102,241,0.1)", color: "#818cf8",
                                    border: "1px solid rgba(99,102,241,0.2)", marginLeft: 6,
                                }}>TODAY</span>
                            )}
                        </div>

                        {/* Day summary */}
                        {dayMap[selectedDay] && (
                            <div style={{
                                display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 16,
                            }}>
                                <div style={{
                                    padding: "10px 12px", borderRadius: 10,
                                    background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.12)",
                                    textAlign: "center",
                                }}>
                                    <div style={{ fontSize: 10, fontWeight: 700, color: "#22c55e" }}>INCOME</div>
                                    <div style={{ fontSize: 16, fontWeight: 900, color: "#22c55e" }}>{formatCurrency(dayMap[selectedDay].income)}</div>
                                </div>
                                <div style={{
                                    padding: "10px 12px", borderRadius: 10,
                                    background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.12)",
                                    textAlign: "center",
                                }}>
                                    <div style={{ fontSize: 10, fontWeight: 700, color: "#ef4444" }}>EXPENSE</div>
                                    <div style={{ fontSize: 16, fontWeight: 900, color: "#ef4444" }}>{formatCurrency(dayMap[selectedDay].expense)}</div>
                                </div>
                            </div>
                        )}

                        <div style={{ display: "grid", gap: 8 }}>
                            {dayTransactions[selectedDay].map((t) => (
                                <div key={t._id} style={{
                                    padding: "12px 14px", borderRadius: 12,
                                    background: "var(--glass)", border: "1px solid var(--border)",
                                    display: "flex", justifyContent: "space-between", alignItems: "center",
                                    transition: "all 0.2s",
                                }}
                                    onMouseEnter={(e) => { e.currentTarget.style.transform = "translateX(4px)"; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.transform = "translateX(0)"; }}
                                >
                                    <div>
                                        <div style={{ fontWeight: 700, fontSize: 13, color: "var(--text)" }}>{t.title}</div>
                                        <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>
                                            {t.category}
                                            {t.notes ? ` • ${t.notes}` : ""}
                                        </div>
                                        {t.tags && t.tags.length > 0 && (
                                            <div style={{ display: "flex", gap: 4, marginTop: 4 }}>
                                                {t.tags.map((tag, i) => (
                                                    <span key={i} style={{
                                                        fontSize: 9, fontWeight: 800, padding: "1px 6px", borderRadius: 12,
                                                        background: "rgba(236,72,153,0.08)", color: "#ec4899",
                                                    }}>#{tag}</span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <div style={{
                                        fontWeight: 900, fontSize: 14,
                                        color: t.type === "income" ? "#22c55e" : "#ef4444",
                                    }}>
                                        {t.type === "income" ? "+" : "-"}{formatCurrency(t.amount)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(1.5); }
        }
      `}</style>
        </div>
    );
}
