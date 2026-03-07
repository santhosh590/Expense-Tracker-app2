import { formatCurrency } from "../../utils/formatCurrency";

export default function BudgetProgress({ budget = 0, spent = 0 }) {
  const percent = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0;

  return (
    <div className="card">
      <div className="section-title">Budget Status</div>

      <div style={{ marginTop: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: "var(--muted)" }}>Monthly Limit</span>
          <span style={{ fontSize: 13, fontWeight: 800 }}>{formatCurrency(budget)}</span>
        </div>

        <div
          style={{
            height: 8,
            borderRadius: 99,
            background: "rgba(255,255,255,0.1)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${percent}%`,
              height: "100%",
              borderRadius: 99,
              background: percent > 100 ? "var(--danger)" : "var(--p2)",
              boxShadow: "0 0 15px rgba(92, 70, 255, 0.4)",
              transition: "width 0.5s ease",
            }}
          />
        </div>

        <div style={{ marginTop: 15, display: "flex", alignItems: "center", gap: 15 }}>
          <div style={{ flex: 1, padding: "10px", background: "rgba(255,255,255,0.03)", borderRadius: 12 }}>
            <div style={{ fontSize: 11, color: "var(--muted)" }}>Spent</div>
            <div style={{ fontSize: 16, fontWeight: 800, color: "var(--text)" }}>{formatCurrency(spent)}</div>
          </div>
          <div style={{ flex: 1, padding: "10px", background: "rgba(255,255,255,0.03)", borderRadius: 12 }}>
            <div style={{ fontSize: 11, color: "var(--muted)" }}>Remaining</div>
            <div style={{ fontSize: 16, fontWeight: 800, color: percent > 100 ? "var(--danger)" : "var(--p2)" }}>
              {formatCurrency(budget - spent)}
            </div>
          </div>
        </div>

        {percent > 100 && (
          <div
            style={{
              marginTop: 14,
              padding: "10px 12px",
              borderRadius: 12,
              background: "rgba(255, 90, 90, 0.1)",
              border: "1px solid rgba(255, 90, 90, 0.2)",
              color: "#ff5a5a",
              fontWeight: 700,
              fontSize: 12,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <span>⚠️</span> You have exceeded your monthly budget.
          </div>
        )}
      </div>
    </div>
  );
}
