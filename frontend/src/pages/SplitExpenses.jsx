import { useState, useEffect } from "react";
import api from "../services/api";
import { formatCurrency } from "../utils/formatCurrency";
import {
    Plus, Trash2, Users, CheckCircle, X,
    CreditCard, Receipt, Wallet, ArrowRight, Sparkles,
    UserPlus, DollarSign, PieChart, Clock, TrendingUp,
    ShoppingCart, Tag, List, Store, Utensils
} from "lucide-react";

const CATEGORIES = [
    { name: "Food", icon: "🍕", color: "#f59e0b" },
    { name: "Travel", icon: "✈️", color: "#3b82f6" },
    { name: "Shopping", icon: "🛍️", color: "#ec4899" },
    { name: "Entertainment", icon: "🎬", color: "#8b5cf6" },
    { name: "Bills", icon: "📃", color: "#22c55e" },
    { name: "Rent", icon: "🏠", color: "#f97316" },
    { name: "Other", icon: "📦", color: "#6b7280" },
];

const AVATARS_COLORS = [
    "linear-gradient(135deg, #6366f1, #8b5cf6)",
    "linear-gradient(135deg, #ec4899, #f43f5e)",
    "linear-gradient(135deg, #f59e0b, #f97316)",
    "linear-gradient(135deg, #22c55e, #16a34a)",
    "linear-gradient(135deg, #3b82f6, #6366f1)",
    "linear-gradient(135deg, #14b8a6, #06b6d4)",
];

const RESTAURANT_MENUS = [
    {
        id: "dominos", name: "Domino's Pizza", icon: "🍕", color: "#e31837",
        items: [
            { name: "Margherita Pizza", price: 150 },
            { name: "Peppy Paneer Pizza", price: 250 },
            { name: "Farmhouse Pizza", price: 300 },
            { name: "Garlic Breadsticks", price: 100 },
            { name: "Choco Lava Cake", price: 110 }
        ]
    },
    {
        id: "kfc", name: "KFC", icon: "🍗", color: "#e02020",
        items: [
            { name: "Zinger Burger", price: 180 },
            { name: "Hot Wings (4pc)", price: 150 },
            { name: "Chicken Popcorn", price: 120 },
            { name: "French Fries", price: 100 },
            { name: "Pepsi", price: 60 }
        ]
    },
    {
        id: "starbucks", name: "Starbucks", icon: "☕", color: "#00704a",
        items: [
            { name: "Caramel Macchiato", price: 280 },
            { name: "Java Chip Frappuccino", price: 320 },
            { name: "Iced Americano", price: 220 },
            { name: "Butter Croissant", price: 180 },
            { name: "Blueberry Muffin", price: 200 }
        ]
    },
    {
        id: "local_cafe", name: "Local Cafe", icon: "🥪", color: "#d97706",
        items: [
            { name: "Club Sandwich", price: 150 },
            { name: "Cold Coffee", price: 120 },
            { name: "Masala Chai", price: 40 },
            { name: "Samosa (2pc)", price: 50 },
            { name: "Paneer Wrap", price: 130 }
        ]
    }
];

export default function SplitExpenses() {
    const [splits, setSplits] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [showMenuBrowser, setShowMenuBrowser] = useState(false);
    const [selectedRestaurant, setSelectedRestaurant] = useState(null);
    const [form, setForm] = useState({
        title: "", totalAmount: "", paidBy: "", category: "Food",
        participantName: "", participants: [], items: [], itemName: "", itemPrice: "",
    });
    const [msg, setMsg] = useState("");

    useEffect(() => { fetchSplits(); }, []);

    const fetchSplits = async () => {
        try { const res = await api.get("/splits"); setSplits(res.data); } catch (err) { console.error(err); }
    };

    const addItem = () => {
        if (!form.itemName.trim() || !form.itemPrice) return;
        const newItems = [...form.items, { name: form.itemName.trim(), amount: Number(form.itemPrice) }];
        const newTotal = newItems.reduce((acc, obj) => acc + obj.amount, 0);
        const equalShare = newItems.length > 0 && form.participants.length > 0 ? newTotal / form.participants.length : (form.totalAmount && form.participants.length > 0 ? form.totalAmount / form.participants.length : 0);
        setForm({
            ...form, items: newItems, itemName: "", itemPrice: "", 
            totalAmount: newTotal,
            participants: form.participants.map(p => ({ ...p, share: Math.round(equalShare * 100) / 100 }))
        });
    };

    const addMenuItem = (item) => {
        const newItems = [...form.items, { name: item.name, amount: item.price }];
        const newTotal = newItems.reduce((acc, obj) => acc + obj.amount, 0);
        const equalShare = newItems.length > 0 && form.participants.length > 0 ? newTotal / form.participants.length : (form.totalAmount && form.participants.length > 0 ? form.totalAmount / form.participants.length : 0);
        setForm({
            ...form, items: newItems,
            totalAmount: newTotal,
            participants: form.participants.map(p => ({ ...p, share: Math.round(equalShare * 100) / 100 }))
        });
        setMsg(`✅ Added ${item.name} to receipt!`);
        setTimeout(() => setMsg(""), 2000);
    };

    const removeItem = (idx) => {
        const newItems = form.items.filter((_, i) => i !== idx);
        const newTotal = newItems.length > 0 ? newItems.reduce((acc, obj) => acc + obj.amount, 0) : form.totalAmount;
        const equalShare = form.participants.length > 0 ? newTotal / form.participants.length : 0;
        setForm({
            ...form, items: newItems, totalAmount: newTotal,
            participants: form.participants.map(p => ({ ...p, share: Math.round(equalShare * 100) / 100 }))
        });
    };

    const addParticipant = () => {
        if (!form.participantName.trim()) return;
        const updated = [...form.participants, { name: form.participantName.trim(), share: 0 }];
        const equalShare = form.totalAmount ? Number(form.totalAmount) / updated.length : 0;
        setForm({
            ...form, participantName: "",
            participants: updated.map((p) => ({ ...p, share: Math.round(equalShare * 100) / 100 })),
        });
    };

    const removeParticipant = (idx) => {
        const updated = form.participants.filter((_, i) => i !== idx);
        const equalShare = form.totalAmount && updated.length ? Number(form.totalAmount) / updated.length : 0;
        setForm({
            ...form,
            participants: updated.map((p) => ({ ...p, share: Math.round(equalShare * 100) / 100 })),
        });
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        if (form.participants.length < 2) { setMsg("❌ Add at least 2 participants"); return; }
        try {
            await api.post("/splits", {
                title: form.title, totalAmount: Number(form.totalAmount),
                paidBy: form.paidBy, category: form.category,
                participants: form.participants.map((p) => ({ name: p.name, share: p.share })),
                items: form.items?.map(i => ({ name: i.name, amount: i.amount })) || []
            });
            setForm({ title: "", totalAmount: "", paidBy: "", category: "Food", participantName: "", participants: [], items: [], itemName: "", itemPrice: "" });
            setShowForm(false); fetchSplits();
            setMsg("✅ Split created successfully!"); setTimeout(() => setMsg(""), 3000);
        } catch (err) { setMsg("❌ Failed to create split"); }
    };

    const handleSettle = async (splitId, participantId) => {
        try { await api.patch(`/splits/${splitId}/settle/${participantId}`); fetchSplits(); } catch (err) { console.error(err); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this split?")) return;
        try { await api.delete(`/splits/${id}`); fetchSplits(); } catch (err) { console.error(err); }
    };

    const getCatIcon = (cat) => CATEGORIES.find((c) => c.name === cat)?.icon || "📦";
    const getCatColor = (cat) => CATEGORIES.find((c) => c.name === cat)?.color || "#6b7280";

    // Summary stats
    const totalOwed = splits.reduce((s, sp) => {
        const unsettled = sp.participants.filter((p) => !p.settled).reduce((a, p) => a + p.share, 0);
        return s + unsettled;
    }, 0);
    const totalSettled = splits.reduce((s, sp) => {
        const settled = sp.participants.filter((p) => p.settled).reduce((a, p) => a + p.share, 0);
        return s + settled;
    }, 0);
    const totalAll = splits.reduce((s, sp) => s + sp.totalAmount, 0);

    return (
        <div>
            {/* Header */}
            <div className="page-header">
                <div>
                    <div className="page-title" style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{
                            width: 40, height: 40, borderRadius: 14,
                            background: "linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.1))",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            border: "1px solid rgba(99,102,241,0.2)",
                        }}><Receipt size={20} style={{ color: "#818cf8" }} /></div>
                        Split Expenses
                    </div>
                    <div className="page-subtitle">Split bills with friends and track who owes what 🤝</div>
                </div>
                <button
                    className="btn"
                    onClick={() => setShowForm(!showForm)}
                    style={{
                        background: showForm
                            ? "rgba(239,68,68,0.1)"
                            : "linear-gradient(135deg, #6366f1, #8b5cf6)",
                        color: showForm ? "#ef4444" : "white",
                        border: showForm ? "1px solid rgba(239,68,68,0.2)" : "none",
                        padding: "12px 24px", borderRadius: 14,
                        boxShadow: showForm ? "none" : "0 8px 20px rgba(99,102,241,0.25)",
                    }}
                >
                    {showForm ? <X size={16} /> : <Plus size={16} />}
                    {showForm ? "Cancel" : "New Split"}
                </button>
            </div>

            {msg && (
                <div style={{
                    padding: "14px 20px", borderRadius: 16, marginBottom: 24, fontSize: 13, fontWeight: 700,
                    background: msg.startsWith("✅") ? "rgba(34,197,94,0.08)" : "rgba(255,90,90,0.08)",
                    color: msg.startsWith("✅") ? "#22c55e" : "#ff5a5a",
                    border: `1px solid ${msg.startsWith("✅") ? "rgba(34,197,94,0.2)" : "rgba(255,90,90,0.2)"}`,
                    backdropFilter: "blur(10px)",
                    display: "flex", alignItems: "center", gap: 8,
                }}>{msg}</div>
            )}

            {/* Stats Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 28 }}>
                {[
                    { label: "Total Splits", value: splits.length, color: "#6366f1", icon: <PieChart size={20} />, bg: "rgba(99,102,241,0.1)" },
                    { label: "Total Amount", value: formatCurrency(totalAll), color: "#3b82f6", icon: <DollarSign size={20} />, bg: "rgba(59,130,246,0.1)" },
                    { label: "Outstanding", value: formatCurrency(totalOwed), color: "#f59e0b", icon: <Clock size={20} />, bg: "rgba(245,158,11,0.1)" },
                    { label: "Settled", value: formatCurrency(totalSettled), color: "#22c55e", icon: <TrendingUp size={20} />, bg: "rgba(34,197,94,0.1)" },
                ].map((stat, i) => (
                    <div key={i} style={{
                        padding: "20px", borderRadius: 18,
                        background: "var(--card)", border: "1px solid var(--border)",
                        position: "relative", overflow: "hidden",
                        transition: "all 0.3s",
                    }}
                        onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = `0 12px 30px ${stat.color}12`; }}
                        onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
                    >
                        <div style={{
                            position: "absolute", top: 0, left: 0, right: 0, height: 2,
                            background: stat.color, opacity: 0.6,
                        }} />
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                            <div style={{
                                width: 42, height: 42, borderRadius: 12,
                                background: stat.bg, display: "flex",
                                alignItems: "center", justifyContent: "center",
                                color: stat.color,
                            }}>{stat.icon}</div>
                            <div>
                                <div style={{ fontSize: 10, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.8 }}>{stat.label}</div>
                                <div style={{ fontSize: 22, fontWeight: 900, color: stat.color, letterSpacing: "-0.5px", marginTop: 2 }}>{stat.value}</div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Create Form */}
            {showForm && (
                <div style={{
                    marginBottom: 28, position: "relative", overflow: "hidden",
                    background: "var(--card)", border: "1px solid var(--border)",
                    borderRadius: 20, padding: "28px",
                }}>
                    <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: "linear-gradient(90deg, #6366f1, #8b5cf6, #ec4899)" }} />

                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24, marginTop: 4 }}>
                        <div style={{
                            width: 36, height: 36, borderRadius: 10,
                            background: "linear-gradient(135deg, rgba(99,102,241,0.12), rgba(139,92,246,0.08))",
                            display: "flex", alignItems: "center", justifyContent: "center",
                        }}><Users size={18} style={{ color: "#818cf8" }} /></div>
                        <div style={{ fontWeight: 800, fontSize: 17, color: "var(--text)" }}>Create New Split</div>
                        <Sparkles size={14} style={{ color: "#f59e0b" }} />
                    </div>

                    <form onSubmit={handleCreate} style={{ display: "grid", gap: 20 }}>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                            <div>
                                <label className="label" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                    <Receipt size={12} style={{ color: "var(--muted)" }} /> Title
                                </label>
                                <input className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                                    placeholder="e.g. Dinner at restaurant" required
                                    style={{ padding: "12px 16px", borderRadius: 14 }} />
                            </div>
                            <div>
                                <label className="label" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                    <DollarSign size={12} style={{ color: "var(--muted)" }} /> Total Amount
                                </label>
                                <input className="input" type="number" value={form.totalAmount} onChange={(e) => {
                                    const v = e.target.value;
                                    const eq = v && form.participants.length ? Number(v) / form.participants.length : 0;
                                    setForm({ ...form, totalAmount: v, participants: form.participants.map((p) => ({ ...p, share: Math.round(eq * 100) / 100 })) });
                                }} placeholder="₹2000" min="1" required
                                    style={{ padding: "12px 16px", borderRadius: 14 }} />
                            </div>
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                            <div>
                                <label className="label" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                    <Wallet size={12} style={{ color: "var(--muted)" }} /> Paid By
                                </label>
                                <input className="input" value={form.paidBy} onChange={(e) => setForm({ ...form, paidBy: e.target.value })}
                                    placeholder="Your name" required
                                    style={{ padding: "12px 16px", borderRadius: 14 }} />
                            </div>
                            <div>
                                <label className="label" style={{ display: "flex", alignItems: "center", gap: 6 }}>Category</label>
                                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                                    {CATEGORIES.map((c) => (
                                        <button key={c.name} type="button"
                                            onClick={() => setForm({ ...form, category: c.name })}
                                            style={{
                                                padding: "8px 12px", borderRadius: 10,
                                                border: form.category === c.name ? `2px solid ${c.color}` : "1px solid var(--border)",
                                                background: form.category === c.name ? `${c.color}12` : "var(--glass)",
                                                cursor: "pointer", fontSize: 12, fontWeight: 700,
                                                color: form.category === c.name ? c.color : "var(--muted)",
                                                transition: "all 0.2s", display: "flex", alignItems: "center", gap: 4,
                                            }}>
                                            {c.icon} {c.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Itemized Menu List */}
                        <div>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                                <label className="label" style={{ display: "flex", alignItems: "center", gap: 6, margin: 0 }}>
                                    <ShoppingCart size={12} style={{ color: "var(--muted)" }} /> Items (Menu List)
                                </label>
                                <button type="button" onClick={() => setShowMenuBrowser(!showMenuBrowser)}
                                    style={{
                                        padding: "6px 12px", borderRadius: 10, cursor: "pointer",
                                        background: showMenuBrowser ? "rgba(99,102,241,0.15)" : "rgba(255,255,255,0.05)",
                                        border: `1px solid ${showMenuBrowser ? "rgba(99,102,241,0.3)" : "rgba(255,255,255,0.1)"}`,
                                        color: showMenuBrowser ? "#818cf8" : "var(--muted)",
                                        fontWeight: 700, fontSize: 11, display: "flex", alignItems: "center", gap: 6,
                                        transition: "all 0.2s"
                                    }}>
                                    <Store size={12} /> {showMenuBrowser ? "Close Menus" : "Browse Menus"}
                                </button>
                            </div>
                            <div style={{ display: "flex", gap: 8 }}>
                                <input className="input" value={form.itemName}
                                    onChange={(e) => setForm({ ...form, itemName: e.target.value })}
                                    placeholder="Product name (e.g. Pizza)" style={{ flex: 2, padding: "12px 16px", borderRadius: 14 }}
                                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addItem(); } }}
                                />
                                <input className="input" type="number" value={form.itemPrice}
                                    onChange={(e) => setForm({ ...form, itemPrice: e.target.value })}
                                    placeholder="Amount" style={{ flex: 1, padding: "12px 16px", borderRadius: 14 }}
                                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addItem(); } }}
                                    min="1"
                                />
                                <button type="button" onClick={addItem}
                                    style={{
                                        padding: "12px 20px", borderRadius: 14, cursor: "pointer",
                                        background: "linear-gradient(135deg, rgba(245,158,11,0.12), rgba(249,115,22,0.08))",
                                        border: "1px solid rgba(245,158,11,0.2)",
                                        color: "#f59e0b", fontWeight: 700, fontSize: 13,
                                        display: "flex", alignItems: "center", gap: 6,
                                        transition: "all 0.2s",
                                    }}
                                    onMouseEnter={(e) => { e.currentTarget.style.background = "linear-gradient(135deg, #f59e0b, #f97316)"; e.currentTarget.style.color = "white"; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.background = "linear-gradient(135deg, rgba(245,158,11,0.12), rgba(249,115,22,0.08))"; e.currentTarget.style.color = "#f59e0b"; }}
                                >
                                    <Plus size={14} /> Add
                                </button>
                            </div>

                            {/* Menu Browser UI */}
                            {showMenuBrowser && (
                                <div style={{
                                    marginTop: 12, padding: "16px", borderRadius: 16,
                                    background: "rgba(0,0,0,0.15)", border: "1px solid var(--border)",
                                }}>
                                    {!selectedRestaurant ? (
                                        <>
                                            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
                                                <Store size={14} style={{ color: "#818cf8" }}/> Select a Restaurant
                                            </div>
                                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                                                {RESTAURANT_MENUS.map(rest => (
                                                    <div key={rest.id} onClick={() => setSelectedRestaurant(rest)}
                                                        style={{
                                                            padding: "12px", borderRadius: 12, background: "var(--glass)",
                                                            border: "1px solid rgba(255,255,255,0.05)", cursor: "pointer",
                                                            display: "flex", alignItems: "center", gap: 10, transition: "all 0.2s"
                                                        }}
                                                        onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.borderColor = rest.color; }}
                                                        onMouseLeave={(e) => { e.currentTarget.style.background = "var(--glass)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.05)"; }}
                                                    >
                                                        <div style={{ fontSize: 24 }}>{rest.icon}</div>
                                                        <div style={{ fontWeight: 700, fontSize: 13, color: "var(--text)", lineHeight: 1.2 }}>{rest.name}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                                                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                                    <div style={{ fontSize: 20 }}>{selectedRestaurant.icon}</div>
                                                    <div style={{ fontWeight: 800, fontSize: 15, color: "var(--text)" }}>{selectedRestaurant.name}</div>
                                                </div>
                                                <button type="button" onClick={() => setSelectedRestaurant(null)}
                                                    style={{
                                                        padding: "4px 10px", borderRadius: 8, background: "rgba(255,255,255,0.1)",
                                                        border: "none", color: "white", fontSize: 11, cursor: "pointer", fontWeight: 700
                                                    }}>
                                                    ← Back
                                                </button>
                                            </div>
                                            <div style={{ display: "grid", gap: 8 }}>
                                                {selectedRestaurant.items.map((item, idx) => (
                                                    <div key={idx} onClick={() => addMenuItem(item)}
                                                        style={{
                                                            display: "flex", justifyContent: "space-between", alignItems: "center",
                                                            padding: "12px 14px", borderRadius: 10, background: "var(--glass)",
                                                            border: "1px dashed rgba(255,255,255,0.1)", cursor: "pointer", transition: "all 0.2s"
                                                        }}
                                                        onMouseEnter={(e) => { e.currentTarget.style.transform = "translateX(4px)"; e.currentTarget.style.borderColor = "rgba(99,102,241,0.4)"; e.currentTarget.style.background = "rgba(99,102,241,0.05)"; }}
                                                        onMouseLeave={(e) => { e.currentTarget.style.transform = "translateX(0)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; e.currentTarget.style.background = "var(--glass)"; }}
                                                    >
                                                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                                            <Utensils size={14} style={{ color: "var(--muted)" }} />
                                                            <div style={{ fontWeight: 600, fontSize: 13, color: "var(--text)" }}>{item.name}</div>
                                                        </div>
                                                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                                            <div style={{ fontWeight: 800, fontSize: 14, color: selectedRestaurant.color }}>{formatCurrency(item.price)}</div>
                                                            <div style={{ width: 24, height: 24, borderRadius: "50%", background: "rgba(99,102,241,0.15)", color: "#818cf8", display: "flex", alignItems: "center", justifyContent: "center" }}><Plus size={12}/></div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}

                            {form.items && form.items.length > 0 && (
                                <div style={{ marginTop: 14, display: "grid", gap: 8 }}>
                                    {form.items.map((item, i) => (
                                        <div key={i} style={{
                                            display: "flex", justifyContent: "space-between", alignItems: "center",
                                            padding: "10px 16px", borderRadius: 12,
                                            background: "rgba(245,158,11,0.04)", border: "1px dashed rgba(245,158,11,0.2)",
                                        }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                                <Tag size={14} style={{ color: "#f59e0b" }} />
                                                <div style={{ fontWeight: 700, fontSize: 13, color: "var(--text)" }}>{item.name}</div>
                                            </div>
                                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                                <div style={{ fontWeight: 800, fontSize: 14, color: "#f59e0b" }}>{formatCurrency(item.amount)}</div>
                                                <div onClick={() => removeItem(i)}
                                                    style={{ cursor: "pointer", opacity: 0.4, color: "#ef4444" }}
                                                    onMouseEnter={(e) => e.currentTarget.style.opacity = 1}
                                                    onMouseLeave={(e) => e.currentTarget.style.opacity = 0.4}
                                                ><Trash2 size={14} /></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Participants */}
                        <div>
                            <label className="label" style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8, marginTop: 12 }}>
                                <UserPlus size={12} style={{ color: "var(--muted)" }} /> Participants
                            </label>
                            <div style={{ display: "flex", gap: 8 }}>
                                <input className="input" value={form.participantName}
                                    onChange={(e) => setForm({ ...form, participantName: e.target.value })}
                                    placeholder="Add person name..." style={{ flex: 1, padding: "12px 16px", borderRadius: 14 }}
                                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addParticipant(); } }}
                                />
                                <button type="button" onClick={addParticipant}
                                    style={{
                                        padding: "12px 20px", borderRadius: 14, cursor: "pointer",
                                        background: "linear-gradient(135deg, rgba(99,102,241,0.12), rgba(139,92,246,0.08))",
                                        border: "1px solid rgba(99,102,241,0.2)",
                                        color: "#818cf8", fontWeight: 700, fontSize: 13,
                                        display: "flex", alignItems: "center", gap: 6,
                                        transition: "all 0.2s",
                                    }}
                                    onMouseEnter={(e) => { e.currentTarget.style.background = "linear-gradient(135deg, #6366f1, #8b5cf6)"; e.currentTarget.style.color = "white"; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.background = "linear-gradient(135deg, rgba(99,102,241,0.12), rgba(139,92,246,0.08))"; e.currentTarget.style.color = "#818cf8"; }}
                                >
                                    <Plus size={14} /> Add
                                </button>
                            </div>
                            {form.participants.length > 0 && (
                                <div style={{ marginTop: 14, display: "grid", gap: 8 }}>
                                    {form.participants.map((p, i) => (
                                        <div key={i} style={{
                                            display: "flex", justifyContent: "space-between", alignItems: "center",
                                            padding: "12px 18px", borderRadius: 14,
                                            background: "var(--glass)", border: "1px solid var(--border)",
                                            transition: "all 0.2s",
                                        }}
                                            onMouseEnter={(e) => { e.currentTarget.style.transform = "translateX(4px)"; e.currentTarget.style.borderColor = "rgba(99,102,241,0.2)"; }}
                                            onMouseLeave={(e) => { e.currentTarget.style.transform = "translateX(0)"; e.currentTarget.style.borderColor = "var(--border)"; }}
                                        >
                                            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                                <div style={{
                                                    width: 36, height: 36, borderRadius: 10,
                                                    background: AVATARS_COLORS[i % AVATARS_COLORS.length],
                                                    display: "flex", alignItems: "center", justifyContent: "center",
                                                    fontSize: 14, fontWeight: 800, color: "white",
                                                    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                                                }}>{p.name[0]?.toUpperCase()}</div>
                                                <div>
                                                    <div style={{ fontWeight: 700, fontSize: 14, color: "var(--text)" }}>{p.name}</div>
                                                    <div style={{ fontSize: 11, color: "var(--muted)" }}>Equal share</div>
                                                </div>
                                            </div>
                                            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                                <div style={{
                                                    padding: "6px 14px", borderRadius: 10,
                                                    background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.12)",
                                                }}>
                                                    <span style={{ fontSize: 15, fontWeight: 800, color: "#6366f1" }}>{formatCurrency(p.share)}</span>
                                                </div>
                                                <div
                                                    onClick={() => removeParticipant(i)}
                                                    style={{
                                                        width: 30, height: 30, borderRadius: 8, cursor: "pointer",
                                                        display: "flex", alignItems: "center", justifyContent: "center",
                                                        opacity: 0.3, transition: "all 0.2s",
                                                    }}
                                                    onMouseEnter={(e) => { e.currentTarget.style.opacity = 1; e.currentTarget.style.background = "rgba(239,68,68,0.1)"; e.currentTarget.style.color = "#ef4444"; }}
                                                    onMouseLeave={(e) => { e.currentTarget.style.opacity = 0.3; e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "inherit"; }}
                                                ><Trash2 size={14} /></div>
                                            </div>
                                        </div>
                                    ))}
                                    {/* Total row */}
                                    <div style={{
                                        display: "flex", justifyContent: "space-between", padding: "10px 18px",
                                        borderRadius: 12, background: "rgba(99,102,241,0.04)",
                                        border: "1px dashed rgba(99,102,241,0.15)",
                                    }}>
                                        <span style={{ fontSize: 12, fontWeight: 700, color: "var(--muted)" }}>
                                            {form.participants.length} participants • Equal split
                                        </span>
                                        <span style={{ fontSize: 12, fontWeight: 800, color: "#6366f1" }}>
                                            Total: {form.totalAmount ? formatCurrency(Number(form.totalAmount)) : "₹0"}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                        <button className="btn" type="submit" style={{
                            marginTop: 4, padding: "14px 28px", borderRadius: 14,
                            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                            boxShadow: "0 8px 20px rgba(99,102,241,0.25)",
                            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                        }}>
                            <CreditCard size={16} /> Create Split <ArrowRight size={14} />
                        </button>
                    </form>
                </div>
            )}

            {/* Split Cards */}
            <div style={{ display: "grid", gap: 20 }}>
                {splits.length === 0 && !showForm && (
                    <div style={{
                        textAlign: "center", padding: "80px 40px",
                        background: "var(--card)", border: "1px solid var(--border)",
                        borderRadius: 24, position: "relative", overflow: "hidden",
                    }}>
                        <div style={{
                            position: "absolute", top: 0, left: 0, right: 0, height: 3,
                            background: "linear-gradient(90deg, #6366f1, #8b5cf6, #ec4899)",
                        }} />
                        <div style={{
                            width: 80, height: 80, borderRadius: 24, margin: "0 auto 20px",
                            background: "linear-gradient(135deg, rgba(99,102,241,0.1), rgba(139,92,246,0.06))",
                            border: "1px solid rgba(99,102,241,0.12)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                            <Users size={36} style={{ color: "#818cf8", opacity: 0.6 }} />
                        </div>
                        <div style={{ fontWeight: 800, fontSize: 20, color: "var(--text)", marginBottom: 10 }}>No split expenses yet</div>
                        <div style={{ color: "var(--muted)", fontSize: 14, maxWidth: 360, margin: "0 auto", lineHeight: 1.6 }}>
                            Split a bill with friends and keep track of who owes what! Click "New Split" to get started.
                        </div>
                        <button
                            className="btn"
                            onClick={() => setShowForm(true)}
                            style={{
                                marginTop: 24, padding: "12px 28px", borderRadius: 14,
                                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                                boxShadow: "0 8px 20px rgba(99,102,241,0.25)",
                            }}
                        >
                            <Plus size={16} /> Create Your First Split
                        </button>
                    </div>
                )}

                {splits.map((s) => {
                    const settledCount = s.participants.filter((p) => p.settled).length;
                    const allSettled = settledCount === s.participants.length;
                    const pct = s.participants.length ? (settledCount / s.participants.length) * 100 : 0;
                    const catColor = getCatColor(s.category);

                    return (
                        <div key={s._id} style={{
                            position: "relative", overflow: "hidden",
                            background: "var(--card)", border: "1px solid var(--border)",
                            borderRadius: 20, padding: "24px 28px",
                            transition: "all 0.3s",
                        }}
                            onMouseEnter={(e) => { e.currentTarget.style.boxShadow = `0 12px 40px ${allSettled ? "rgba(34,197,94,0.08)" : "rgba(99,102,241,0.08)"}`; }}
                            onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "none"; }}
                        >
                            {/* Status accent */}
                            <div style={{
                                position: "absolute", top: 0, left: 0, width: 4, height: "100%",
                                borderRadius: "4px 0 0 4px",
                                background: allSettled
                                    ? "linear-gradient(180deg, #22c55e, #16a34a)"
                                    : `linear-gradient(180deg, ${catColor}, ${catColor}88)`,
                            }} />

                            {/* Header Row */}
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                                    <div style={{
                                        width: 54, height: 54, borderRadius: 16, position: "relative",
                                        background: allSettled
                                            ? "linear-gradient(135deg, rgba(34,197,94,0.12), rgba(34,197,94,0.04))"
                                            : `linear-gradient(135deg, ${catColor}18, ${catColor}08)`,
                                        border: `1px solid ${allSettled ? "rgba(34,197,94,0.15)" : `${catColor}20`}`,
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                        fontSize: 26,
                                    }}>
                                        {getCatIcon(s.category)}
                                        {allSettled && (
                                            <div style={{
                                                position: "absolute", bottom: -3, right: -3,
                                                width: 18, height: 18, borderRadius: "50%",
                                                background: "#22c55e", display: "flex",
                                                alignItems: "center", justifyContent: "center",
                                                border: "2px solid var(--card)",
                                            }}>
                                                <CheckCircle size={10} style={{ color: "white" }} />
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                            <span style={{ fontWeight: 800, fontSize: 18, color: "var(--text)" }}>{s.title}</span>
                                            <span style={{
                                                fontSize: 9, fontWeight: 800, padding: "3px 10px",
                                                borderRadius: 8, textTransform: "uppercase", letterSpacing: 0.5,
                                                background: allSettled ? "rgba(34,197,94,0.08)" : `${catColor}10`,
                                                color: allSettled ? "#22c55e" : catColor,
                                                border: `1px solid ${allSettled ? "rgba(34,197,94,0.15)" : `${catColor}20`}`,
                                            }}>
                                                {allSettled ? "✓ Settled" : s.category}
                                            </span>
                                        </div>
                                        <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 4, display: "flex", alignItems: "center", gap: 8 }}>
                                            <span>💳 Paid by <strong style={{ color: "#818cf8" }}>{s.paidBy}</strong></span>
                                            <span style={{ opacity: 0.3 }}>•</span>
                                            <span>📅 {new Date(s.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                                            <span style={{ opacity: 0.3 }}>•</span>
                                            <span>👥 {s.participants.length} people</span>
                                        </div>
                                    </div>
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                                    <div style={{
                                        padding: "10px 20px", borderRadius: 14,
                                        background: allSettled ? "rgba(34,197,94,0.06)" : "rgba(99,102,241,0.06)",
                                        border: `1px solid ${allSettled ? "rgba(34,197,94,0.12)" : "rgba(99,102,241,0.12)"}`,
                                    }}>
                                        <div style={{
                                            fontSize: 22, fontWeight: 900,
                                            color: allSettled ? "#22c55e" : "#6366f1",
                                            letterSpacing: "-0.5px",
                                        }}>{formatCurrency(s.totalAmount)}</div>
                                    </div>
                                    <div
                                        onClick={() => handleDelete(s._id)}
                                        style={{
                                            width: 34, height: 34, borderRadius: 10, cursor: "pointer",
                                            display: "flex", alignItems: "center", justifyContent: "center",
                                            opacity: 0.2, transition: "all 0.2s",
                                        }}
                                        onMouseEnter={(e) => { e.currentTarget.style.opacity = 1; e.currentTarget.style.background = "rgba(239,68,68,0.1)"; e.currentTarget.style.color = "#ef4444"; }}
                                        onMouseLeave={(e) => { e.currentTarget.style.opacity = 0.2; e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "inherit"; }}
                                    >
                                        <Trash2 size={16} />
                                    </div>
                                </div>
                            </div>

                            {/* Progress Bar */}
                            <div style={{ margin: "20px 0 6px" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                                    <span style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)" }}>Settlement Progress</span>
                                    <span style={{ fontSize: 11, fontWeight: 800, color: allSettled ? "#22c55e" : "#6366f1" }}>{Math.round(pct)}%</span>
                                </div>
                                <div style={{
                                    height: 6, borderRadius: 6, background: "var(--glass)",
                                    border: "1px solid var(--border)", overflow: "hidden",
                                }}>
                                    <div style={{
                                        height: "100%", borderRadius: 6, width: `${pct}%`,
                                        background: allSettled
                                            ? "linear-gradient(90deg, #22c55e, #16a34a)"
                                            : `linear-gradient(90deg, ${catColor}, ${catColor}cc)`,
                                        transition: "width 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
                                        boxShadow: `0 0 8px ${allSettled ? "#22c55e" : catColor}33`,
                                    }} />
                                </div>
                            </div>

                            {/* Itemized Menu List */}
                            {s.items && s.items.length > 0 && (
                                <div style={{ marginTop: 24, marginBottom: 12 }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                                        <List size={14} style={{ color: catColor }} />
                                        <span style={{ fontSize: 12, fontWeight: 800, color: "var(--text)", textTransform: "uppercase", letterSpacing: 0.5 }}>Menu Order</span>
                                    </div>
                                    <div style={{ display: "grid", gap: 8, padding: "16px 20px", borderRadius: 16, background: "var(--glass)", border: "1px dashed var(--border)" }}>
                                        {s.items.map((item, idx) => (
                                            <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: idx !== s.items.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none", paddingBottom: idx !== s.items.length - 1 ? 8 : 0 }}>
                                                <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}>{item.name}</div>
                                                <div style={{ fontSize: 14, fontWeight: 800, color: "var(--text)" }}>{formatCurrency(item.amount)}</div>
                                            </div>
                                        ))}
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 8, borderTop: "2px dashed rgba(255,255,255,0.1)", marginTop: 4 }}>
                                            <div style={{ fontSize: 13, fontWeight: 800, color: "var(--muted)" }}>Total Amount</div>
                                            <div style={{ fontSize: 15, fontWeight: 900, color: catColor }}>{formatCurrency(s.totalAmount)}</div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Participants */}
                            <div style={{ display: "grid", gap: 8, marginTop: 16 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                                    <Users size={14} style={{ color: "var(--muted)" }} />
                                    <span style={{ fontSize: 12, fontWeight: 800, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.5 }}>Split Details</span>
                                </div>
                                {s.participants.map((p, idx) => (
                                    <div key={p._id} style={{
                                        display: "flex", justifyContent: "space-between", alignItems: "center",
                                        padding: "14px 18px", borderRadius: 14,
                                        background: p.settled ? "rgba(34,197,94,0.04)" : "var(--glass)",
                                        border: `1px solid ${p.settled ? "rgba(34,197,94,0.12)" : "var(--border)"}`,
                                        transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                                        cursor: "pointer",
                                        borderLeft: `3px solid ${p.settled ? "#22c55e" : catColor}`,
                                    }}
                                        onClick={() => !p.settled && handleSettle(s._id, p._id)}
                                        onMouseEnter={(e) => {
                                            if (!p.settled) {
                                                e.currentTarget.style.transform = "translateX(6px)";
                                                e.currentTarget.style.background = "rgba(34,197,94,0.04)";
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            if (!p.settled) {
                                                e.currentTarget.style.transform = "translateX(0)";
                                                e.currentTarget.style.background = "var(--glass)";
                                            }
                                        }}
                                    >
                                        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                                            <div style={{ position: "relative" }}>
                                                <div style={{
                                                    width: 38, height: 38, borderRadius: 10,
                                                    background: p.settled ? "rgba(34,197,94,0.15)" : AVATARS_COLORS[idx % AVATARS_COLORS.length],
                                                    display: "flex", alignItems: "center", justifyContent: "center",
                                                    fontSize: 14, fontWeight: 800, color: p.settled ? "#22c55e" : "white",
                                                    boxShadow: p.settled ? "none" : "0 4px 12px rgba(0,0,0,0.12)",
                                                    transition: "all 0.3s",
                                                }}>
                                                    {p.settled ? <CheckCircle size={18} /> : p.name[0]?.toUpperCase()}
                                                </div>
                                            </div>
                                            <div>
                                                <span style={{
                                                    fontWeight: 700, fontSize: 14, color: "var(--text)",
                                                    textDecoration: p.settled ? "line-through" : "none",
                                                    opacity: p.settled ? 0.5 : 1,
                                                }}>{p.name}</span>
                                                <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 1 }}>
                                                    {p.settled ? "✅ Payment settled" : "⏳ Click to mark as settled"}
                                                </div>
                                            </div>
                                        </div>
                                        <div style={{
                                            padding: "6px 14px", borderRadius: 10,
                                            background: p.settled ? "rgba(34,197,94,0.08)" : `${catColor}08`,
                                            border: `1px solid ${p.settled ? "rgba(34,197,94,0.12)" : `${catColor}12`}`,
                                        }}>
                                            <span style={{
                                                fontWeight: 900, fontSize: 15,
                                                color: p.settled ? "#22c55e" : catColor,
                                            }}>
                                                {formatCurrency(p.share)}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Footer */}
                            <div style={{
                                marginTop: 16, padding: "10px 16px", borderRadius: 12,
                                background: allSettled ? "rgba(34,197,94,0.04)" : "rgba(99,102,241,0.03)",
                                border: `1px dashed ${allSettled ? "rgba(34,197,94,0.12)" : "rgba(99,102,241,0.1)"}`,
                                display: "flex", justifyContent: "space-between", alignItems: "center",
                            }}>
                                <span style={{
                                    fontSize: 12, fontWeight: 700,
                                    color: allSettled ? "#22c55e" : "var(--muted)",
                                }}>
                                    {allSettled ? "🎉 All settled!" : `${settledCount}/${s.participants.length} settled`}
                                </span>
                                {!allSettled && (
                                    <span style={{ fontSize: 11, fontWeight: 700, color: "#f59e0b" }}>
                                        ⏳ {formatCurrency(s.participants.filter(p => !p.settled).reduce((a, p) => a + p.share, 0))} remaining
                                    </span>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
