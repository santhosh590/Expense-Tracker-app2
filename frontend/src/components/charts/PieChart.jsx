import React, { useMemo } from "react";
import { formatCurrency } from "../../utils/formatCurrency";
import {
  ResponsiveContainer,
  PieChart as RePieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";

const PIE_COLORS = [
  "#6366f1", "#a855f7", "#10b981", "#f59e0b",
  "#ef4444", "#ec4899", "#8b5cf6", "#06b6d4",
];

function CustomTooltip({ active, payload }) {
  if (!active || !payload || !payload.length) return null;
  const isLight = document.documentElement.getAttribute("data-theme") === "light";

  return (
    <div
      style={{
        background: isLight ? "rgba(255, 255, 255, 0.95)" : "rgba(15, 23, 42, 0.92)",
        border: isLight ? "1px solid rgba(0,0,0,0.1)" : "1px solid rgba(255,255,255,0.12)",
        padding: "10px 12px",
        borderRadius: 12,
        color: isLight ? "#1a1a2e" : "#fff",
        boxShadow: isLight ? "0 10px 30px rgba(0,0,0,0.1)" : "0 10px 30px rgba(0,0,0,0.35)",
        backdropFilter: "blur(8px)",
      }}
    >
      <div style={{ fontWeight: 800, marginBottom: 6 }}>{payload[0]?.name}</div>
      <div style={{ fontSize: 13, opacity: 0.95 }}>
        Total: <span style={{ fontWeight: 800 }}>{formatCurrency(payload[0]?.value)}</span>
      </div>
    </div>
  );
}

export default function PieChart({ transactions = [] }) {
  const isLight = document.documentElement.getAttribute("data-theme") === "light";

  const categoryData = useMemo(() => {
    const map = new Map();
    transactions.forEach((t) => {
      const amount = Number(t.amount || 0);
      const type = (t.type || "expense").toLowerCase();
      const category = t.category || "Other";
      if (type !== "expense") return;
      map.set(category, (map.get(category) || 0) + amount);
    });
    return Array.from(map.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [transactions]);

  const totalExpense = useMemo(() => {
    return categoryData.reduce((sum, c) => sum + c.value, 0);
  }, [categoryData]);

  const finalData = categoryData.length > 0 ? categoryData : [
    { name: "Rent", value: 12000 },
    { name: "Food", value: 5000 },
    { name: "Shopping", value: 3000 },
    { name: "Bills", value: 2500 },
  ];

  const finalTotal = categoryData.length > 0 ? totalExpense : 22500;

  const centerLabelColor = isLight ? "rgba(0,0,0,0.6)" : "rgba(255,255,255,0.75)";
  const centerValueColor = isLight ? "#1a1a2e" : "#ffffff";
  const legendColor = isLight ? "rgba(0,0,0,0.7)" : "rgba(255,255,255,0.85)";
  const strokeColor = isLight ? "rgba(0,0,0,0.05)" : "rgba(255,255,255,0.08)";

  const renderCenterLabel = () => (
    <>
      <text
        x="50%" y="45%"
        textAnchor="middle" dominantBaseline="middle"
        fill={centerLabelColor}
        fontSize="13" fontWeight="700"
      >
        Total Expense
      </text>
      <text
        x="50%" y="54%"
        textAnchor="middle" dominantBaseline="middle"
        fill={centerValueColor}
        fontSize="18" fontWeight="800"
      >
        {formatCurrency(finalTotal)}
      </text>
    </>
  );

  return (
    <ResponsiveContainer width="100%" height={260}>
      <RePieChart>
        <Tooltip content={<CustomTooltip />} />
        <Legend
          verticalAlign="bottom"
          height={40}
          wrapperStyle={{ color: legendColor, fontSize: 12 }}
        />
        <Pie
          data={finalData}
          dataKey="value"
          nameKey="name"
          cx="50%" cy="45%"
          innerRadius={70} outerRadius={95}
          paddingAngle={2}
          stroke={strokeColor}
          strokeWidth={2}
        >
          {finalData.map((_, idx) => (
            <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
          ))}
        </Pie>
        {renderCenterLabel()}
      </RePieChart>
    </ResponsiveContainer>
  );
}
