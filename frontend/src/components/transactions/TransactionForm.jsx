import { useState, useContext } from "react";
import { TransactionContext } from "../../context/TransactionContext";
import { RefreshCw, Tag, FileText, ChevronDown, ChevronRight, Sparkles } from "lucide-react";

export default function TransactionForm({ onAdd, defaultType }) {
  const { addTransaction } = useContext(TransactionContext);

  const [form, setForm] = useState({
    title: "", amount: "", type: defaultType || "expense",
    category: defaultType === "income" ? "Salary" : "Food",
    date: new Date().toISOString().slice(0, 10),
    notes: "", tags: "", isRecurring: false, recurringInterval: "",
  });

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleChange = (e) => {
    const updated = { ...form, [e.target.name]: e.target.value };
    if (e.target.name === "type") {
      updated.category = e.target.value === "income" ? "Salary" : "Food";
    }
    setForm(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.amount) return;
    setLoading(true);
    setMsg("");

    const payload = {
      title: form.title, amount: Number(form.amount),
      type: form.type, category: form.category, date: form.date,
      notes: form.notes || "",
      tags: form.tags ? form.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
      isRecurring: form.isRecurring,
      recurringInterval: form.isRecurring ? form.recurringInterval : "",
    };

    const result = await addTransaction(payload);
    setLoading(false);

    if (result.success) {
      setMsg("✅ Transaction saved!");
      setForm({
        title: "", amount: "", type: defaultType || "expense",
        category: defaultType === "income" ? "Salary" : "Food",
        date: new Date().toISOString().slice(0, 10),
        notes: "", tags: "", isRecurring: false, recurringInterval: "",
      });
      if (onAdd) onAdd(result.data);
      setTimeout(() => setMsg(""), 3000);
    } else {
      setMsg(`❌ ${result.error || "Failed to save"}`);
    }
  };

  return (
    <div className="card" style={{ position: "relative", overflow: "hidden" }}>
      {/* Top gradient accent */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 3,
        background: form.type === "income"
          ? "linear-gradient(90deg, #22c55e, #16a34a)"
          : "linear-gradient(90deg, #6366f1, #ec4899)",
      }} />

      <div className="section-title" style={{ marginTop: 4 }}>
        <Sparkles size={18} style={{ color: "#6366f1" }} /> Add Transaction
      </div>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div>
          <label className="label">Title</label>
          <input className="input" name="title" value={form.title} onChange={handleChange}
            placeholder="Eg: Lunch / Salary / Recharge" required />
        </div>

        <div>
          <label className="label">Amount</label>
          <input className="input" type="number" name="amount" value={form.amount}
            onChange={handleChange} placeholder="Eg: 250" min="1" required />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <div>
            <label className="label">Type</label>
            <select className="input" name="type" value={form.type} onChange={handleChange} style={{ cursor: "pointer" }}>
              <option value="expense">💸 Expense</option>
              <option value="income">💰 Income</option>
            </select>
          </div>
          <div>
            <label className="label">Category</label>
            <select className="input" name="category" value={form.category} onChange={handleChange} style={{ cursor: "pointer" }}>
              {form.type === "income" ? (
                <>
                  <option>Salary</option><option>Freelance</option>
                  <option>Investment</option><option>Business</option><option>Other</option>
                </>
              ) : (
                <>
                  <option>Food</option><option>Travel</option><option>Shopping</option>
                  <option>Bills</option><option>Health</option><option>Entertainment</option><option>Other</option>
                </>
              )}
            </select>
          </div>
        </div>

        <div>
          <label className="label">Date</label>
          <input className="input" type="date" name="date" value={form.date} onChange={handleChange} required />
        </div>

        {/* Advanced toggle */}
        <button type="button" onClick={() => setShowAdvanced(!showAdvanced)}
          style={{
            background: showAdvanced ? "rgba(99,102,241,0.08)" : "var(--glass)",
            border: `1px solid ${showAdvanced ? "rgba(99,102,241,0.2)" : "var(--border)"}`,
            color: showAdvanced ? "#818cf8" : "var(--muted)",
            fontSize: 12, fontWeight: 700, padding: "10px 16px",
            borderRadius: 12, cursor: "pointer",
            display: "flex", alignItems: "center", gap: 8,
            transition: "all 0.2s ease",
          }}
        >
          {showAdvanced ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          Notes, Tags & Recurring
        </button>

        {showAdvanced && (
          <div style={{
            display: "grid", gap: 14, padding: "16px",
            borderRadius: 14, background: "var(--glass)",
            border: "1px solid var(--border)",
            animation: "fadeSlideDown 0.3s ease",
          }}>
            {/* Notes */}
            <div>
              <label className="label" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <FileText size={12} style={{ color: "#818cf8" }} /> Notes (optional)
              </label>
              <input className="input" name="notes" value={form.notes} onChange={handleChange} placeholder="Optional notes..." />
            </div>

            {/* Tags */}
            <div>
              <label className="label" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <Tag size={12} style={{ color: "#ec4899" }} /> Tags (comma separated)
              </label>
              <input className="input" name="tags" value={form.tags} onChange={handleChange}
                placeholder="e.g. food, monthly, subscription" />
              {form.tags && (
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 8 }}>
                  {form.tags.split(",").map((t, i) => t.trim()).filter(Boolean).map((tag, i) => (
                    <span key={i} style={{
                      padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700,
                      background: "rgba(236,72,153,0.1)", color: "#ec4899",
                      border: "1px solid rgba(236,72,153,0.2)",
                    }}>#{tag}</span>
                  ))}
                </div>
              )}
            </div>

            {/* Recurring */}
            <div>
              <label className="label" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <RefreshCw size={12} style={{ color: "#22c55e" }} /> Recurring Transaction
              </label>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 8 }}>
                <label style={{
                  display: "flex", alignItems: "center", gap: 8,
                  fontSize: 13, color: "var(--text)", cursor: "pointer",
                  padding: "8px 14px", borderRadius: 10,
                  background: form.isRecurring ? "rgba(34,197,94,0.08)" : "transparent",
                  border: `1px solid ${form.isRecurring ? "rgba(34,197,94,0.2)" : "var(--border)"}`,
                  transition: "all 0.2s",
                }}>
                  <input type="checkbox" checked={form.isRecurring}
                    onChange={(e) => setForm({ ...form, isRecurring: e.target.checked })}
                    style={{ width: 16, height: 16, cursor: "pointer", accentColor: "#22c55e" }} />
                  Repeat this transaction
                </label>
              </div>
              {form.isRecurring && (
                <select className="input" name="recurringInterval" value={form.recurringInterval}
                  onChange={handleChange} style={{ marginTop: 10, cursor: "pointer" }}>
                  <option value="">Select interval</option>
                  <option value="daily">🔄 Daily</option>
                  <option value="weekly">📅 Weekly</option>
                  <option value="monthly">🗓️ Monthly</option>
                  <option value="yearly">📆 Yearly</option>
                </select>
              )}
            </div>
          </div>
        )}

        {msg && (
          <div style={{
            padding: "10px 16px", borderRadius: 12, fontSize: 13, fontWeight: 700,
            background: msg.startsWith("✅") ? "rgba(34,197,94,0.08)" : "rgba(239,68,68,0.08)",
            color: msg.startsWith("✅") ? "#22c55e" : "#ef4444",
            border: `1px solid ${msg.startsWith("✅") ? "rgba(34,197,94,0.2)" : "rgba(239,68,68,0.2)"}`,
          }}>{msg}</div>
        )}

        <button className="btn" style={{ marginTop: 4 }} disabled={loading}>
          {loading ? "Saving..." : "💾 Add Transaction"}
        </button>
      </form>

      <style>{`
        @keyframes fadeSlideDown {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
