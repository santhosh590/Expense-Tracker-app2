import { useState, useEffect } from "react";
import api from "../services/api";
import { formatCurrency } from "../utils/formatCurrency";
import {
    Target, Plus, Trash2, TrendingUp, Calendar, Sparkles, X
} from "lucide-react";

const ICONS = ["🎯", "🏖️", "🚗", "🏠", "💻", "🎓", "💍", "🎁", "✈️", "📱", "🎮", "👗"];
const COLORS = ["#6366f1", "#ec4899", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#14b8a6"];

export default function SavingsGoals() {
    const [goals, setGoals] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ title: "", targetAmount: "", deadline: "", icon: "🎯", color: "#6366f1" });
    const [addAmount, setAddAmount] = useState({});
    const [msg, setMsg] = useState("");

    useEffect(() => { fetchGoals(); }, []);

    const fetchGoals = async () => {
        try { const res = await api.get("/savings"); setGoals(res.data); } catch (err) { console.error(err); }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await api.post("/savings", { ...form, targetAmount: Number(form.targetAmount) });
            setForm({ title: "", targetAmount: "", deadline: "", icon: "🎯", color: "#6366f1" });
            setShowForm(false);
            fetchGoals();
            setMsg("✅ Goal created!");
            setTimeout(() => setMsg(""), 3000);
        } catch (err) { setMsg("❌ Failed to create goal"); }
    };

    const handleAddSavings = async (id) => {
        const amount = Number(addAmount[id]);
        if (!amount || amount <= 0) return;
        const goal = goals.find((g) => g._id === id);
        try {
            await api.put(`/savings/${id}`, { currentAmount: (goal.currentAmount || 0) + amount });
            setAddAmount({ ...addAmount, [id]: "" });
            fetchGoals();
        } catch (err) { console.error(err); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this savings goal?")) return;
        try { await api.delete(`/savings/${id}`); fetchGoals(); } catch (err) { console.error(err); }
    };

    const totalSaved = goals.reduce((s, g) => s + (g.currentAmount || 0), 0);
    const totalTarget = goals.reduce((s, g) => s + (g.targetAmount || 0), 0);

    return (
        <div>
            {/* Header */}
            <div className="page-header">
                <div>
                    <div className="page-title">Savings Goals</div>
                    <div className="page-subtitle">Track your savings targets and reach your financial dreams ✨</div>
                </div>
                <button className="btn" onClick={() => setShowForm(!showForm)}>
                    {showForm ? <X size={16} /> : <Plus size={16} />}
                    {showForm ? "Cancel" : "New Goal"}
                </button>
            </div>

            {msg && (
                <div style={{
                    padding: "12px 18px", borderRadius: 16, marginBottom: 20, fontSize: 13, fontWeight: 700,
                    background: msg.startsWith("✅") ? "rgba(34,197,94,0.08)" : "rgba(255,90,90,0.08)",
                    color: msg.startsWith("✅") ? "#22c55e" : "#ff5a5a",
                    border: `1px solid ${msg.startsWith("✅") ? "rgba(34,197,94,0.2)" : "rgba(255,90,90,0.2)"}`,
                    backdropFilter: "blur(10px)",
                }}>{msg}</div>
            )}

            {/* Stats Row */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 28 }}>
                {[
                    { label: "Total Saved", value: formatCurrency(totalSaved), color: "#22c55e", icon: "💰" },
                    { label: "Total Target", value: formatCurrency(totalTarget), color: "#6366f1", icon: "🎯" },
                    { label: "Active Goals", value: goals.length, color: "#f59e0b", icon: "🔥" },
                ].map((stat, i) => (
                    <div key={i} className="card" style={{ padding: "20px 24px", textAlign: "center" }}>
                        <div style={{ fontSize: 28, marginBottom: 4 }}>{stat.icon}</div>
                        <div style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 1 }}>{stat.label}</div>
                        <div style={{ fontSize: 24, fontWeight: 900, color: stat.color, marginTop: 6 }}>{stat.value}</div>
                    </div>
                ))}
            </div>

            {/* Create Form */}
            {showForm && (
                <div className="card" style={{ marginBottom: 28, position: "relative", overflow: "hidden" }}>
                    {/* Gradient accent */}
                    <div style={{
                        position: "absolute", top: 0, left: 0, right: 0, height: 3,
                        background: "linear-gradient(90deg, #6366f1, #ec4899, #f59e0b)",
                    }} />
                    <div className="section-title" style={{ marginTop: 8 }}><Sparkles size={18} /> Create Savings Goal</div>
                    <form onSubmit={handleCreate} style={{ display: "grid", gap: 16 }}>
                        <div>
                            <label className="label">Goal Title</label>
                            <input className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Vacation Fund, New Laptop" required />
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                            <div>
                                <label className="label">Target Amount</label>
                                <input className="input" type="number" value={form.targetAmount} onChange={(e) => setForm({ ...form, targetAmount: e.target.value })} placeholder="50000" min="1" required />
                            </div>
                            <div>
                                <label className="label">Deadline (optional)</label>
                                <input className="input" type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} />
                            </div>
                        </div>
                        <div>
                            <label className="label">Choose Icon</label>
                            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                                {ICONS.map((ic) => (
                                    <span key={ic} onClick={() => setForm({ ...form, icon: ic })}
                                        style={{
                                            fontSize: 24, cursor: "pointer", padding: "6px 10px", borderRadius: 12,
                                            background: form.icon === ic ? "rgba(99,102,241,0.15)" : "var(--glass)",
                                            border: form.icon === ic ? "2px solid #6366f1" : "1px solid var(--border)",
                                            transition: "all 0.2s", transform: form.icon === ic ? "scale(1.1)" : "scale(1)",
                                        }}>{ic}</span>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="label">Accent Color</label>
                            <div style={{ display: "flex", gap: 10 }}>
                                {COLORS.map((c) => (
                                    <div key={c} onClick={() => setForm({ ...form, color: c })}
                                        style={{
                                            width: 32, height: 32, borderRadius: 10, background: c, cursor: "pointer",
                                            border: form.color === c ? "3px solid white" : "3px solid transparent",
                                            boxShadow: form.color === c ? `0 0 0 2px ${c}, 0 4px 12px ${c}44` : `0 2px 8px ${c}33`,
                                            transition: "all 0.2s", transform: form.color === c ? "scale(1.15)" : "scale(1)",
                                        }} />
                                ))}
                            </div>
                        </div>
                        <button className="btn" style={{ marginTop: 4 }}>
                            <Sparkles size={16} /> Create Goal
                        </button>
                    </form>
                </div>
            )}

            {/* Goals Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 20 }}>
                {goals.length === 0 && !showForm && (
                    <div className="card" style={{ textAlign: "center", gridColumn: "1/-1", padding: "60px 40px" }}>
                        <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.3 }}>🎯</div>
                        <div style={{ fontWeight: 800, fontSize: 18, color: "var(--text)", marginBottom: 8 }}>No savings goals yet</div>
                        <div style={{ color: "var(--muted)", fontSize: 14 }}>Create your first goal and start saving towards your dreams!</div>
                    </div>
                )}
                {goals.map((g) => {
                    const pct = g.targetAmount > 0 ? Math.min(100, (g.currentAmount / g.targetAmount) * 100) : 0;
                    const isComplete = pct >= 100;
                    return (
                        <div key={g._id} className="card" style={{ position: "relative", overflow: "hidden" }}>
                            {/* Top accent bar */}
                            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: isComplete ? "linear-gradient(90deg, #22c55e, #16a34a)" : `linear-gradient(90deg, ${g.color || "#6366f1"}, ${g.color || "#6366f1"}88)` }} />

                            {/* Glow effect */}
                            <div style={{
                                position: "absolute", top: -60, right: -60, width: 120, height: 120,
                                borderRadius: "50%", background: `${g.color || "#6366f1"}15`,
                                filter: "blur(40px)", pointerEvents: "none",
                            }} />

                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginTop: 8, position: "relative" }}>
                                <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                                    <div style={{
                                        width: 52, height: 52, borderRadius: 16,
                                        background: `linear-gradient(135deg, ${g.color || "#6366f1"}22, ${g.color || "#6366f1"}08)`,
                                        border: `1px solid ${g.color || "#6366f1"}33`,
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                        fontSize: 26, boxShadow: `0 4px 12px ${g.color || "#6366f1"}22`,
                                    }}>{g.icon || "🎯"}</div>
                                    <div>
                                        <div style={{ fontWeight: 800, fontSize: 16, color: "var(--text)" }}>{g.title}</div>
                                        {g.deadline && (
                                            <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 3, display: "flex", alignItems: "center", gap: 4 }}>
                                                <Calendar size={10} /> {new Date(g.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <Trash2 size={15} onClick={() => handleDelete(g._id)}
                                    style={{ opacity: 0.25, cursor: "pointer", transition: "all 0.3s", padding: 4 }}
                                    onMouseEnter={(e) => { e.currentTarget.style.opacity = 1; e.currentTarget.style.color = "#ef4444"; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.opacity = 0.25; e.currentTarget.style.color = "inherit"; }} />
                            </div>

                            {/* Progress */}
                            <div style={{ marginTop: 24 }}>
                                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 10 }}>
                                    <span style={{ fontWeight: 700, color: g.color || "#6366f1" }}>{formatCurrency(g.currentAmount || 0)}</span>
                                    <span style={{ fontWeight: 600, color: "var(--muted)" }}>{formatCurrency(g.targetAmount)}</span>
                                </div>
                                <div style={{
                                    height: 10, borderRadius: 10,
                                    background: "var(--glass)", border: "1px solid var(--border)",
                                    overflow: "hidden", position: "relative",
                                }}>
                                    <div style={{
                                        height: "100%", borderRadius: 10,
                                        width: `${pct}%`,
                                        background: isComplete
                                            ? "linear-gradient(90deg, #22c55e, #16a34a)"
                                            : `linear-gradient(90deg, ${g.color || "#6366f1"}, ${g.color || "#6366f1"}aa)`,
                                        transition: "width 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
                                        boxShadow: `0 0 12px ${isComplete ? "#22c55e" : g.color || "#6366f1"}44`,
                                    }} />
                                </div>
                                <div style={{
                                    textAlign: "center", fontSize: 14, fontWeight: 900, marginTop: 10,
                                    color: isComplete ? "#22c55e" : "var(--text)",
                                    letterSpacing: "-0.3px",
                                }}>
                                    {pct.toFixed(0)}% {isComplete && "🎉 Goal Reached!"}
                                </div>
                            </div>

                            {/* Add savings */}
                            {!isComplete && (
                                <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
                                    <input className="input" type="number" placeholder="Add savings"
                                        value={addAmount[g._id] || ""}
                                        onChange={(e) => setAddAmount({ ...addAmount, [g._id]: e.target.value })}
                                        onKeyDown={(e) => { if (e.key === "Enter") handleAddSavings(g._id); }}
                                        style={{ flex: 1, padding: "10px 14px" }} />
                                    <button className="btn" onClick={() => handleAddSavings(g._id)}
                                        style={{ padding: "10px 18px", fontSize: 13 }}>
                                        <TrendingUp size={14} /> Add
                                    </button>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
