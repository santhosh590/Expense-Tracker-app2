import TransactionForm from "../transactions/TransactionForm";

export default function AddTransactionModal({ type, onClose }) {
    return (
        <div
            style={{
                position: "fixed",
                inset: 0,
                zIndex: 9999,
                background: "rgba(0,0,0,0.6)",
                backdropFilter: "blur(4px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 24,
            }}
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div style={{ width: "100%", maxWidth: 480, position: "relative" }}>
                {/* Close button */}
                <button
                    onClick={onClose}
                    style={{
                        position: "absolute",
                        top: -12,
                        right: -12,
                        zIndex: 1,
                        background: "rgba(255,255,255,0.1)",
                        border: "1px solid rgba(255,255,255,0.15)",
                        borderRadius: "50%",
                        width: 32,
                        height: 32,
                        color: "white",
                        cursor: "pointer",
                        fontSize: 16,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    ✕
                </button>

                <TransactionForm
                    defaultType={type}
                    onAdd={() => setTimeout(onClose, 800)}
                />
            </div>
        </div>
    );
}
