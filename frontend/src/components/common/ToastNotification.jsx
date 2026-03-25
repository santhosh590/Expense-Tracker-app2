import { useState, createContext, useContext, useCallback } from "react";

const ToastContext = createContext();

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((message, type = "info", duration = 5000) => {
        const id = Date.now() + Math.random();
        setToasts((prev) => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, duration);
    }, []);

    const removeToast = (id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    };

    return (
        <ToastContext.Provider value={{ addToast }}>
            {children}
            {/* Toast container */}
            <div style={{
                position: "fixed",
                top: 24,
                right: 24,
                zIndex: 10000,
                display: "flex",
                flexDirection: "column",
                gap: 12,
                maxWidth: 400,
                pointerEvents: "none",
            }}>
                {toasts.map((toast) => {
                    const colors = {
                        success: {
                            bg: "linear-gradient(135deg, rgba(34,197,94,0.12), rgba(34,197,94,0.06))",
                            border: "rgba(34,197,94,0.25)", text: "#22c55e", glow: "rgba(34,197,94,0.15)", icon: "✅"
                        },
                        error: {
                            bg: "linear-gradient(135deg, rgba(239,68,68,0.12), rgba(239,68,68,0.06))",
                            border: "rgba(239,68,68,0.25)", text: "#ef4444", glow: "rgba(239,68,68,0.15)", icon: "🚫"
                        },
                        warning: {
                            bg: "linear-gradient(135deg, rgba(245,158,11,0.12), rgba(245,158,11,0.06))",
                            border: "rgba(245,158,11,0.25)", text: "#f59e0b", glow: "rgba(245,158,11,0.15)", icon: "⚠️"
                        },
                        info: {
                            bg: "linear-gradient(135deg, rgba(99,102,241,0.12), rgba(99,102,241,0.06))",
                            border: "rgba(99,102,241,0.25)", text: "#818cf8", glow: "rgba(99,102,241,0.15)", icon: "💡"
                        },
                    };
                    const c = colors[toast.type] || colors.info;
                    return (
                        <div
                            key={toast.id}
                            onClick={() => removeToast(toast.id)}
                            style={{
                                padding: "16px 20px",
                                borderRadius: 18,
                                background: c.bg,
                                border: `1px solid ${c.border}`,
                                backdropFilter: "blur(16px)",
                                WebkitBackdropFilter: "blur(16px)",
                                cursor: "pointer",
                                pointerEvents: "auto",
                                animation: "toastSlideIn 0.4s cubic-bezier(0.22, 1, 0.36, 1)",
                                display: "flex",
                                alignItems: "center",
                                gap: 12,
                                boxShadow: `0 16px 48px -8px ${c.glow}, 0 4px 16px rgba(0,0,0,0.2)`,
                                position: "relative",
                                overflow: "hidden",
                            }}
                        >
                            {/* Glow accent */}
                            <div style={{
                                position: "absolute", top: 0, left: 0, bottom: 0, width: 3,
                                background: c.text, borderRadius: "3px 0 0 3px",
                            }} />
                            <span style={{ fontSize: 20, flexShrink: 0 }}>{c.icon}</span>
                            <span style={{
                                fontSize: 13, fontWeight: 700, color: c.text,
                                lineHeight: 1.5, letterSpacing: "-0.1px",
                            }}>
                                {toast.message}
                            </span>
                        </div>
                    );
                })}
            </div>
            <style>{`
        @keyframes toastSlideIn {
          0% { transform: translateX(120%) scale(0.9); opacity: 0; }
          100% { transform: translateX(0) scale(1); opacity: 1; }
        }
      `}</style>
        </ToastContext.Provider>
    );
}

export const useToast = () => useContext(ToastContext);
