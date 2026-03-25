import { useState } from "react";
import TransactionForm from "../transactions/TransactionForm";
import { formatCurrency } from "../../utils/formatCurrency";

export default function AddTransactionModal({ type, onClose }) {
    const [added, setAdded] = useState(null);

    const handleAdd = (data) => {
        setAdded(data);
        setTimeout(onClose, 2000);
    };

    return (
        <div
            style={{
                position: "fixed", inset: 0, zIndex: 9999,
                background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)",
                display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
            }}
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div style={{ width: "100%", maxWidth: 480, position: "relative" }}>
                <button
                    onClick={onClose}
                    style={{
                        position: "absolute", top: -12, right: -12, zIndex: 1,
                        background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)",
                        borderRadius: "50%", width: 32, height: 32,
                        color: "white", cursor: "pointer", fontSize: 16,
                        display: "flex", alignItems: "center", justifyContent: "center",
                    }}
                >✕</button>

                {added ? (
                    <div className="card" style={{
                        textAlign: "center", padding: "48px 32px",
                        background: "linear-gradient(135deg, rgba(34,197,94,0.08), rgba(34,197,94,0.03))",
                        border: "1px solid rgba(34,197,94,0.25)",
                    }}>
                        <div style={{ fontSize: 56, marginBottom: 16 }}>✅</div>
                        <div style={{ fontSize: 20, fontWeight: 800, color: "#22c55e", marginBottom: 8 }}>
                            {type === "income" ? "Income Added!" : "Expense Added!"}
                        </div>
                        <div style={{ fontSize: 32, fontWeight: 800, color: "var(--text)", marginBottom: 6 }}>
                            {formatCurrency(added.amount)}
                        </div>
                        <div style={{ fontSize: 14, color: "var(--muted)" }}>
                            {added.title} · {added.category}
                        </div>
                        <div style={{
                            marginTop: 24, fontSize: 12, color: "var(--muted)",
                            display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                        }}>
                            <div style={{
                                width: 6, height: 6, borderRadius: "50%",
                                background: "#22c55e", animation: "pulse 1s infinite",
                            }} />
                            Closing automatically...
                        </div>
                    </div>
                ) : (
                    <TransactionForm defaultType={type} onAdd={handleAdd} />
                )}
            </div>

            <style>{`
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.3; }
                }
            `}</style>
        </div>
    );
}
