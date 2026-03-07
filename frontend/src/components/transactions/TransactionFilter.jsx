import { Search, Filter, X, CalendarDays, DollarSign } from "lucide-react";

export default function TransactionFilter({ filters, setFilters }) {
  const handleChange = (name, value) => {
    setFilters({ ...filters, [name]: value });
  };

  const hasFilters = filters.type || filters.category || filters.search ||
    filters.dateFrom || filters.dateTo || filters.amountMin || filters.amountMax;

  return (
    <div className="card" style={{ position: "relative", overflow: "hidden" }}>
      {/* Accent */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 3,
        background: "linear-gradient(90deg, #f59e0b, #ec4899, #6366f1)",
      }} />

      <div className="section-title" style={{ marginTop: 4 }}>
        <Filter size={16} style={{ color: "#f59e0b" }} /> Filters
        {hasFilters && (
          <span style={{
            fontSize: 10, fontWeight: 800, padding: "2px 8px", borderRadius: 20,
            background: "rgba(245,158,11,0.1)", color: "#f59e0b",
            border: "1px solid rgba(245,158,11,0.2)", marginLeft: 6,
          }}>ACTIVE</span>
        )}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {/* Search */}
        <div>
          <label className="label" style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Search size={11} style={{ color: "#818cf8" }} /> Search
          </label>
          <input className="input" placeholder="Search by title, notes, tags..."
            value={filters.search || ""} onChange={(e) => handleChange("search", e.target.value)} />
        </div>

        {/* Type */}
        <div>
          <label className="label">Type</label>
          <div style={{ display: "flex", gap: 8 }}>
            {[
              { value: "", label: "All", icon: "📊" },
              { value: "income", label: "Income", icon: "💰" },
              { value: "expense", label: "Expense", icon: "💸" },
            ].map((opt) => (
              <button key={opt.value} type="button"
                onClick={() => handleChange("type", opt.value)}
                style={{
                  flex: 1, padding: "8px 10px", borderRadius: 10,
                  fontSize: 12, fontWeight: 700, cursor: "pointer",
                  border: `1px solid ${filters.type === opt.value ? "rgba(99,102,241,0.3)" : "var(--border)"}`,
                  background: filters.type === opt.value ? "rgba(99,102,241,0.1)" : "var(--glass)",
                  color: filters.type === opt.value ? "#818cf8" : "var(--muted)",
                  transition: "all 0.2s",
                }}
              >{opt.icon} {opt.label}</button>
            ))}
          </div>
        </div>

        {/* Category */}
        <div>
          <label className="label">Category</label>
          <select className="input" value={filters.category || ""}
            onChange={(e) => handleChange("category", e.target.value)} style={{ cursor: "pointer" }}>
            <option value="">All Categories</option>
            <option>🍕 Food</option><option>✈️ Travel</option><option>🛍️ Shopping</option>
            <option>📃 Bills</option><option>🏥 Health</option><option>🎬 Entertainment</option>
            <option>💰 Salary</option><option>💻 Freelance</option><option>📈 Investment</option>
            <option>💼 Business</option><option>📦 Other</option>
          </select>
        </div>

        {/* Date Range */}
        <div>
          <label className="label" style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <CalendarDays size={11} style={{ color: "#22c55e" }} /> Date Range
          </label>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <input className="input" type="date" value={filters.dateFrom || ""}
              onChange={(e) => handleChange("dateFrom", e.target.value)} />
            <input className="input" type="date" value={filters.dateTo || ""}
              onChange={(e) => handleChange("dateTo", e.target.value)} />
          </div>
        </div>

        {/* Amount Range */}
        <div>
          <label className="label" style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <DollarSign size={11} style={{ color: "#f59e0b" }} /> Amount Range
          </label>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <input className="input" type="number" placeholder="Min"
              value={filters.amountMin || ""} onChange={(e) => handleChange("amountMin", e.target.value)} />
            <input className="input" type="number" placeholder="Max"
              value={filters.amountMax || ""} onChange={(e) => handleChange("amountMax", e.target.value)} />
          </div>
        </div>

        {/* Clear All */}
        {hasFilters && (
          <button type="button"
            onClick={() => setFilters({ type: "", category: "", search: "", dateFrom: "", dateTo: "", amountMin: "", amountMax: "" })}
            style={{
              background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.15)",
              color: "#ef4444", fontSize: 12, fontWeight: 800,
              padding: "10px 16px", borderRadius: 12, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(239,68,68,0.12)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(239,68,68,0.06)"; }}
          >
            <X size={14} /> Clear All Filters
          </button>
        )}
      </div>
    </div>
  );
}
