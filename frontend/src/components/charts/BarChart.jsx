import React, { useMemo } from "react";
import {
  ResponsiveContainer,
  BarChart as ReBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

import { formatCurrency } from "../../utils/formatCurrency";

function useTheme() {
  return document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark";
}

function CustomTooltip({ active, payload, label }) {
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
      <div style={{ fontWeight: 800, marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 13, opacity: 0.95 }}>
        Expense:{" "}
        <span style={{ fontWeight: 800 }}>
          {formatCurrency(payload[0]?.value)}
        </span>
      </div>
    </div>
  );
}

export default function BarChart({ transactions = [] }) {
  const theme = useTheme();
  const isLight = theme === "light";

  const tickColor = isLight ? "rgba(0,0,0,0.6)" : "rgba(255,255,255,0.75)";
  const lineColor = isLight ? "rgba(0,0,0,0.1)" : "rgba(255,255,255,0.12)";
  const gridColor = isLight ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.08)";

  const monthlyData = useMemo(() => {
    const map = new Map();

    transactions.forEach((t) => {
      const amount = Number(t.amount || 0);
      const type = (t.type || "expense").toLowerCase();
      if (type !== "expense") return;

      const rawDate = t.date || t.createdAt;
      const d = rawDate ? new Date(rawDate) : new Date();
      if (isNaN(d.getTime())) return;

      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      map.set(key, (map.get(key) || 0) + amount);
    });

    const sortedKeys = Array.from(map.keys()).sort();

    return sortedKeys.map((k) => {
      const [y, m] = k.split("-");
      const monthShort = new Date(Number(y), Number(m) - 1, 1).toLocaleString("en-US", { month: "short" });
      return { month: `${monthShort} ${y}`, total: map.get(k) };
    });
  }, [transactions]);

  const finalData = monthlyData.length > 0 ? monthlyData : [
    { month: "Jan 2025", total: 15000 },
    { month: "Feb 2025", total: 22000 },
    { month: "Mar 2025", total: 18000 },
    { month: "Apr 2025", total: 24000 },
    { month: "May 2025", total: 12000 },
    { month: "Jun 2025", total: 28000 },
  ];

  return (
    <ResponsiveContainer width="100%" height={260}>
      <ReBarChart data={finalData} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
        <CartesianGrid stroke={gridColor} strokeDasharray="3 3" />
        <XAxis
          dataKey="month"
          tick={{ fill: tickColor, fontSize: 12 }}
          axisLine={{ stroke: lineColor }}
          tickLine={{ stroke: lineColor }}
        />
        <YAxis
          tickFormatter={(v) => formatCurrency(v)}
          tick={{ fill: tickColor, fontSize: 12 }}
          axisLine={{ stroke: lineColor }}
          tickLine={{ stroke: lineColor }}
        />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="total" name="Monthly Expense" radius={[10, 10, 0, 0]} fill="url(#colorBar)" />
        <defs>
          <linearGradient id="colorBar" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.9} />
            <stop offset="95%" stopColor="#6366f1" stopOpacity={0.3} />
          </linearGradient>
        </defs>
      </ReBarChart>
    </ResponsiveContainer>
  );
}
