import { useState, useEffect, useCallback } from "react";
import { formatCurrency } from "../utils/formatCurrency";
import api from "../services/api";
import {
    RefreshCw, Plus, Calendar, Clock, DollarSign, Bell, CreditCard,
    Trash2, CheckCircle, ToggleLeft, ToggleRight, ChevronRight, Zap,
    AlertTriangle, X
} from "lucide-react";

export default function RecurringBills() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [msg, setMsg] = useState("");
    const [form, setForm] = useState({
        title: "", amount: "", type: "expense", category: "Utilities",
        frequency: "monthly", nextDueDate: new Date().toISOString().slice(0, 10),
        isBillReminder: true, reminderDaysBefore: 3, notes: "", payee: "",
    });

    const categories = ["Rent", "Utilities", "Insurance", "Subscription", "Loan", "Food", "Transport", "Other"];
    const frequencies = ["daily", "weekly", "biweekly", "monthly", "quarterly", "yearly"];

    const fetchItems = useCallback(async () => {
        try {
            setLoading(true);
            const res = await api.get("/recurring");
            setItems(res.data);
        } catch (err) { console.error(err); }
        setLoading(false);
    }, []);

    useEffect(() => { fetchItems(); }, [fetchItems]);

    const showMsg = (text) => { setMsg(text); setTimeout(() => setMsg(""), 4000); };

    const handleCreate = async (e) => {
        e.preventDefault();
        if (!form.title || !form.amount) return showMsg("❌ Title and amount required");
        try {
            await api.post("/recurring", { ...form, amount: Number(form.amount) });
            setShowForm(false);
            setForm({ title: "", amount: "", type: "expense", category: "Utilities", frequency: "monthly", nextDueDate: new Date().toISOString().slice(0, 10), isBillReminder: true, reminderDaysBefore: 3, notes: "", payee: "" });
            fetchItems();
            showMsg("✅ Recurring item created!");
        } catch (err) { showMsg("❌ " + (err?.response?.data?.message || err.message)); }
    };

    const handlePay = async (id) => {
        try {
            await api.post(`/recurring/${id}/pay`);
            fetchItems();
            showMsg("✅ Payment recorded & next date advanced!");
        } catch (err) { showMsg("❌ " + (err?.response?.data?.message || err.message)); }
    };

    const handleToggle = async (item) => {
        try {
            await api.put(`/recurring/${item._id}`, { isActive: !item.isActive });
            fetchItems();
        } catch (err) { showMsg("❌ Failed to update"); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this recurring item?")) return;
        try {
            await api.delete(`/recurring/${id}`);
            fetchItems();
            showMsg("✅ Deleted");
        } catch (err) { showMsg("❌ Failed to delete"); }
    };

    const daysUntil = (date) => {
        const diff = Math.ceil((new Date(date) - new Date()) / (1000 * 60 * 60 * 24));
        if (diff < 0) return "Overdue";
        if (diff === 0) return "Today";
        if (diff === 1) return "Tomorrow";
        return `${diff} days`;
    };

    const totalMonthly = items
        .filter(i => i.isActive && i.type === "expense")
        .reduce((s, i) => {
            const mult = { daily: 30, weekly: 4, biweekly: 2, monthly: 1, quarterly: 1 / 3, yearly: 1 / 12 };
            return s + i.amount * (mult[i.frequency] || 1);
        }, 0);

    const upcomingCount = items.filter(i => {
        const diff = Math.ceil((new Date(i.nextDueDate) - new Date()) / (1000 * 60 * 60 * 24));
        return i.isActive && diff <= 7 && diff >= 0;
    }).length;

    const overdueCount = items.filter(i => {
        return i.isActive && new Date(i.nextDueDate) < new Date();
    }).length;

    const freqColors = { daily: "#6366f1", weekly: "#3b82f6", biweekly: "#8b5cf6", monthly: "#22c55e", quarterly: "#f59e0b", yearly: "#ec4899" };

    return (
        <div>
            <div className="page-header">
                <div>
                    <div className="page-title" style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{
                            width: 40, height: 40, borderRadius: 14,
                            background: "linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.1))",
                            display: "flex", alignItems: "center", justifyContent: "center",
                        }}><RefreshCw size={20} style={{ color: "#6366f1" }} /></div>
                        Recurring & Bills
                    </div>
                    <div className="page-subtitle">Manage subscriptions, recurring payments & bill reminders 📅</div>
                </div>
                <button onClick={() => setShowForm(!showForm)} style={{
                    padding: "12px 24px", borderRadius: 14, cursor: "pointer",
                    background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                    color: "white", border: "none", fontWeight: 700, fontSize: 13,
                    display: "flex", alignItems: "center", gap: 8,
                }}>
                    {showForm ? <X size={16} /> : <Plus size={16} />}
                    {showForm ? "Cancel" : "Add Recurring"}
                </button>
            </div>

            {msg && (
                <div style={{
                    padding: "14px 20px", borderRadius: 16, marginBottom: 20, fontSize: 13, fontWeight: 700,
                    background: msg.startsWith("✅") ? "rgba(34,197,94,0.08)" : "rgba(255,90,90,0.08)",
                    color: msg.startsWith("✅") ? "#22c55e" : "#ff5a5a",
                    border: `1px solid ${msg.startsWith("✅") ? "rgba(34,197,94,0.2)" : "rgba(255,90,90,0.2)"}`,
                }}>{msg}</div>
            )}

            {/* Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
                {[
                    { label: "Active Items", value: items.filter(i => i.isActive).length, icon: <RefreshCw size={18} />, color: "#6366f1" },
                    { label: "Monthly Total", value: formatCurrency(totalMonthly), icon: <DollarSign size={18} />, color: "#22c55e" },
                    { label: "Due This Week", value: upcomingCount, icon: <Calendar size={18} />, color: "#f59e0b" },
                    { label: "Overdue", value: overdueCount, icon: <AlertTriangle size={18} />, color: "#ef4444" },
                ].map((s, i) => (
                    <div key={i} style={{
                        padding: "20px", borderRadius: 18, background: "var(--card)", border: "1px solid var(--border)",
                        display: "flex", alignItems: "center", gap: 14,
                    }}>
                        <div style={{
                            width: 42, height: 42, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center",
                            background: `${s.color}12`, color: s.color, border: `1px solid ${s.color}20`,
                        }}>{s.icon}</div>
                        <div>
                            <div style={{ fontSize: 22, fontWeight: 900, color: "var(--text)" }}>{s.value}</div>
                            <div style={{ fontSize: 11, color: "var(--muted)", fontWeight: 600 }}>{s.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Create Form */}
            {showForm && (
                <form onSubmit={handleCreate} style={{
                    padding: "24px 28px", borderRadius: 20, marginBottom: 24,
                    background: "var(--card)", border: "1px solid var(--border)",
                }}>
                    <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 16, color: "var(--text)" }}>New Recurring Item</div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginBottom: 14 }}>
                        <input className="input" placeholder="Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
                        <input className="input" placeholder="Amount" type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} />
                        <input className="input" placeholder="Payee" value={form.payee} onChange={e => setForm({ ...form, payee: e.target.value })} />
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 14, marginBottom: 14 }}>
                        <select className="input" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                            <option value="expense">Expense</option>
                            <option value="income">Income</option>
                        </select>
                        <select className="input" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                            {categories.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                        <select className="input" value={form.frequency} onChange={e => setForm({ ...form, frequency: e.target.value })}>
                            {frequencies.map(f => <option key={f} value={f}>{f.charAt(0).toUpperCase() + f.slice(1)}</option>)}
                        </select>
                        <input className="input" type="date" value={form.nextDueDate} onChange={e => setForm({ ...form, nextDueDate: e.target.value })} />
                    </div>
                    <div style={{ display: "flex", gap: 14, alignItems: "center", marginBottom: 14 }}>
                        <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600, color: "var(--text)", cursor: "pointer" }}>
                            <input type="checkbox" checked={form.isBillReminder} onChange={e => setForm({ ...form, isBillReminder: e.target.checked })} />
                            <Bell size={14} /> Bill Reminder
                        </label>
                        <input className="input" placeholder="Notes" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} style={{ flex: 1 }} />
                    </div>
                    <button type="submit" style={{
                        padding: "12px 28px", borderRadius: 14, border: "none", cursor: "pointer",
                        background: "linear-gradient(135deg, #6366f1, #8b5cf6)", color: "white", fontWeight: 700,
                    }}>Create</button>
                </form>
            )}

            {/* Items List */}
            {loading ? (
                <div style={{ textAlign: "center", padding: 40, color: "var(--muted)" }}>Loading...</div>
            ) : items.length === 0 ? (
                <div style={{
                    textAlign: "center", padding: "60px 20px", borderRadius: 20,
                    background: "var(--card)", border: "1px solid var(--border)",
                }}>
                    <div style={{ fontSize: 48, marginBottom: 12 }}>📅</div>
                    <div style={{ fontWeight: 800, fontSize: 18, color: "var(--text)", marginBottom: 8 }}>No Recurring Items</div>
                    <div style={{ color: "var(--muted)", fontSize: 13 }}>Add subscriptions and bill reminders to track them here.</div>
                </div>
            ) : (
                <div style={{ display: "grid", gap: 12 }}>
                    {items.map(item => {
                        const days = daysUntil(item.nextDueDate);
                        const isOverdue = days === "Overdue";
                        const isDueSoon = !isOverdue && ["Today", "Tomorrow"].includes(days);
                        return (
                            <div key={item._id} style={{
                                padding: "20px 24px", borderRadius: 18,
                                background: "var(--card)", border: "1px solid var(--border)",
                                borderLeft: `4px solid ${isOverdue ? "#ef4444" : isDueSoon ? "#f59e0b" : freqColors[item.frequency] || "#6366f1"}`,
                                opacity: item.isActive ? 1 : 0.5,
                                display: "flex", alignItems: "center", justifyContent: "space-between",
                                transition: "all 0.2s",
                            }}
                                onMouseEnter={e => { e.currentTarget.style.transform = "translateX(4px)"; }}
                                onMouseLeave={e => { e.currentTarget.style.transform = "translateX(0)"; }}
                            >
                                <div style={{ display: "flex", alignItems: "center", gap: 16, flex: 1 }}>
                                    <div style={{
                                        width: 44, height: 44, borderRadius: 14,
                                        background: `${freqColors[item.frequency] || "#6366f1"}12`,
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                        color: freqColors[item.frequency] || "#6366f1",
                                        border: `1px solid ${freqColors[item.frequency] || "#6366f1"}20`,
                                    }}><CreditCard size={20} /></div>
                                    <div>
                                        <div style={{ fontWeight: 800, fontSize: 15, color: "var(--text)", display: "flex", alignItems: "center", gap: 8 }}>
                                            {item.title}
                                            <span style={{
                                                fontSize: 9, fontWeight: 800, padding: "2px 10px", borderRadius: 8,
                                                background: `${freqColors[item.frequency]}15`,
                                                color: freqColors[item.frequency],
                                                textTransform: "uppercase",
                                            }}>{item.frequency}</span>
                                            {item.isBillReminder && (
                                                <span style={{ fontSize: 9, fontWeight: 800, padding: "2px 8px", borderRadius: 8, background: "rgba(245,158,11,0.1)", color: "#f59e0b" }}>
                                                    <Bell size={8} /> BILL
                                                </span>
                                            )}
                                        </div>
                                        <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 3, display: "flex", alignItems: "center", gap: 8 }}>
                                            <span>{item.category}</span>
                                            {item.payee && <span>• {item.payee}</span>}
                                            <span>• Due: {days}</span>
                                        </div>
                                    </div>
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                                    <div style={{
                                        fontWeight: 900, fontSize: 18,
                                        color: item.type === "income" ? "#22c55e" : "#ef4444",
                                    }}>{item.type === "income" ? "+" : "-"} {formatCurrency(item.amount)}</div>
                                    <button onClick={() => handlePay(item._id)} style={{
                                        padding: "8px 14px", borderRadius: 10, cursor: "pointer", border: "none",
                                        background: "rgba(34,197,94,0.08)", color: "#22c55e", fontWeight: 700, fontSize: 11,
                                        display: "flex", alignItems: "center", gap: 4,
                                    }}><CheckCircle size={12} /> Pay</button>
                                    <div onClick={() => handleToggle(item)} style={{ cursor: "pointer", color: item.isActive ? "#22c55e" : "var(--muted)" }}>
                                        {item.isActive ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
                                    </div>
                                    <button onClick={() => handleDelete(item._id)} style={{
                                        padding: "6px 8px", borderRadius: 8, cursor: "pointer", border: "1px solid rgba(239,68,68,0.12)",
                                        background: "rgba(239,68,68,0.06)", color: "#ef4444",
                                    }}><Trash2 size={14} /></button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
