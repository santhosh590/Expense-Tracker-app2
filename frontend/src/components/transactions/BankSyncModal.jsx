import { useState } from "react";
import { X, Building2, CheckCircle2, ShieldCheck, Loader2, ArrowRight } from "lucide-react";
import api from "../../services/api";

const BANKS = [
    { id: "sbi", name: "State Bank of India", logo: "🏛️" },
    { id: "canara", name: "Canara Bank", logo: "🏦" },
    { id: "kvb", name: "Karur Vysya Bank", logo: "🏢" },
    { id: "indian", name: "Indian Bank", logo: "🏛️" },
    { id: "chase", name: "Chase", logo: "🏦" },
    { id: "bof", name: "Bank of America", logo: "🏛️" },
    { id: "citi", name: "Citibank", logo: "🏙️" },
    { id: "wells", name: "Wells Fargo", logo: "🏦" },
];

const MOCK_TRANSACTIONS = {
    sbi: [
        { title: "SBI ATM Withdrawal", amount: 5000, type: "expense", category: "Cash" },
        { title: "Salary Deposit - TCS", amount: 95000, type: "income", category: "Salary" },
        { title: "IRCTC Ticketing", amount: 1250, type: "expense", category: "Transport" },
        { title: "Jio Recharge", amount: 749, type: "expense", category: "Subscription" },
    ],
    canara: [
        { title: "Home Loan EMI", amount: 15000, type: "expense", category: "Housing" },
        { title: "Amazon India", amount: 2499, type: "expense", category: "Shopping" },
        { title: "Zomato Delivery", amount: 450, type: "expense", category: "Food" },
        { title: "Dividend Income", amount: 4500, type: "income", category: "Investments" },
    ],
    kvb: [
        { title: "Grocery Mart", amount: 3200, type: "expense", category: "Food" },
        { title: "Apollo Pharmacy", amount: 850, type: "expense", category: "Health" },
        { title: "NEFT Transfer - Rent", amount: 12000, type: "expense", category: "Housing" },
    ],
    indian: [
        { title: "Indian Oil Petrol", amount: 2000, type: "expense", category: "Transport" },
        { title: "Freelance Client", amount: 25000, type: "income", category: "Business" },
        { title: "Swiggy Order", amount: 350, type: "expense", category: "Food" },
        { title: "Electricity Bill", amount: 1800, type: "expense", category: "Housing" },
    ],
    chase: [
        { title: "Starbucks Coffee", amount: 250, type: "expense", category: "Food" },
        { title: "Whole Foods Market", amount: 3500, type: "expense", category: "Food" },
        { title: "Chase Credit Card Bill", amount: 8000, type: "expense", category: "Bills" },
        { title: "Direct Deposit - Apple", amount: 120000, type: "income", category: "Salary" },
    ],
    bof: [
        { title: "Netflix Subscription", amount: 649, type: "expense", category: "Subscription" },
        { title: "Uber Ride", amount: 450, type: "expense", category: "Transport" },
        { title: "Airbnb Booking", amount: 7500, type: "expense", category: "Travel" },
        { title: "Stock Dividend", amount: 1200, type: "income", category: "Investments" },
    ],
    citi: [
        { title: "Amazon Prime", amount: 1499, type: "expense", category: "Shopping" },
        { title: "Spotify Premium", amount: 119, type: "expense", category: "Subscription" },
        { title: "Gym Membership", amount: 2000, type: "expense", category: "Health" },
        { title: "Upwork Payment", amount: 35000, type: "income", category: "Business" },
    ],
    wells: [
        { title: "Auto Insurance", amount: 4500, type: "expense", category: "Bills" },
        { title: "Shell Gas Station", amount: 1800, type: "expense", category: "Transport" },
        { title: "Home Depot", amount: 5600, type: "expense", category: "Shopping" },
        { title: "Salary Deposit - Google", amount: 150000, type: "income", category: "Salary" },
    ],
    default: [
        { title: "Miscellaneous Store", amount: 500, type: "expense", category: "Shopping" }
    ]
};

export default function BankSyncModal({ onClose, onSuccess }) {
    const [step, setStep] = useState("select"); // "select" | "connecting" | "success"
    const [selectedBank, setSelectedBank] = useState(null);
    const [syncedCount, setSyncedCount] = useState(0);

    const handleConnect = async () => {
        if (!selectedBank) return;
        setStep("connecting");
        
        // Simulate network / Plaid delay
        await new Promise(resolve => setTimeout(resolve, 2500));
        
        // Post mock transactions securely
        try {
            const txsToSync = MOCK_TRANSACTIONS[selectedBank] || MOCK_TRANSACTIONS.default;
            setSyncedCount(txsToSync.length);
            await Promise.all(txsToSync.map(tx => 
                api.post("/transactions", { ...tx, date: new Date().toISOString() })
            ));
        } catch (error) {
            console.error("Mock sync failed:", error);
        }

        setStep("success");
    };

    return (
        <div style={{
            position: "fixed", inset: 0, zIndex: 9999,
            background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)",
            display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
        }}>
            <div style={{
                background: "var(--card)", border: "1px solid var(--border)",
                borderRadius: 24, width: "100%", maxWidth: 440,
                boxShadow: "0 24px 60px rgba(0,0,0,0.3)", position: "relative",
                overflow: "hidden"
            }}>
                <button
                    onClick={onClose}
                    style={{
                        position: "absolute", top: 16, right: 16, zIndex: 10,
                        background: "var(--glass)", border: "1px solid var(--border)",
                        borderRadius: "50%", width: 32, height: 32, cursor: "pointer",
                        display: "flex", alignItems: "center", justifyContent: "center", color: "var(--muted)"
                    }}
                ><X size={16} /></button>

                <div style={{ height: 4, background: "linear-gradient(90deg, #10b981, #3b82f6)", width: "100%" }} />

                <div style={{ padding: "32px 32px 24px", textAlign: "center" }}>
                    
                    {step === "select" && (
                        <div className="fade-in">
                            <div style={{
                                width: 56, height: 56, borderRadius: 16, margin: "0 auto 20px",
                                background: "rgba(59,130,246,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#3b82f6"
                            }}>
                                <Building2 size={28} />
                            </div>
                            <h2 style={{ margin: "0 0 8px", fontSize: 24, fontWeight: 900 }}>Connect your bank</h2>
                            <p style={{ color: "var(--muted)", fontSize: 13, marginBottom: 28 }}>
                                Securely link your account to automatically sync transactions.
                            </p>

                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 24 }}>
                                {BANKS.map(bank => (
                                    <button
                                        key={bank.id}
                                        onClick={() => setSelectedBank(bank.id)}
                                        style={{
                                            padding: "16px", borderRadius: 16,
                                            border: selectedBank === bank.id ? "2px solid #3b82f6" : "1px solid var(--border)",
                                            background: selectedBank === bank.id ? "rgba(59,130,246,0.06)" : "var(--glass)",
                                            cursor: "pointer", transition: "all 0.2s",
                                            display: "flex", flexDirection: "column", alignItems: "center", gap: 8
                                        }}
                                    >
                                        <div style={{ fontSize: 28 }}>{bank.logo}</div>
                                        <div style={{ fontWeight: 700, fontSize: 13, color: "var(--text)" }}>{bank.name}</div>
                                    </button>
                                ))}
                            </div>

                            <button
                                onClick={handleConnect}
                                disabled={!selectedBank}
                                style={{
                                    width: "100%", padding: "14px", borderRadius: 14,
                                    border: "none", cursor: selectedBank ? "pointer" : "not-allowed",
                                    background: selectedBank ? "linear-gradient(135deg, #10b981, #3b82f6)" : "var(--glass)",
                                    color: selectedBank ? "white" : "var(--muted)",
                                    fontWeight: 800, fontSize: 15, display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                                    transition: "all 0.2s"
                                }}
                            >
                                Continue <ArrowRight size={16} />
                            </button>
                            
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 16, color: "#10b981", fontSize: 11, fontWeight: 700 }}>
                                <ShieldCheck size={14} /> Bank-level 256-bit encryption
                            </div>
                        </div>
                    )}

                    {step === "connecting" && (
                        <div className="fade-in" style={{ padding: "40px 0" }}>
                            <div style={{
                                width: 80, height: 80, borderRadius: "50%", margin: "0 auto 24px",
                                border: "4px solid rgba(59,130,246,0.1)", borderTopColor: "#3b82f6",
                                animation: "spin 1s linear infinite",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                color: "#3b82f6"
                            }}>
                                <Building2 size={28} style={{ animation: "spinReverse 1s linear infinite" }} />
                            </div>
                            <h2 style={{ margin: "0 0 8px", fontSize: 22, fontWeight: 900 }}>Authenticating & Syncing...</h2>
                            <p style={{ color: "var(--muted)", fontSize: 13 }}>
                                Establishing secure connection with {BANKS.find(b => b.id === selectedBank)?.name}. This may take a moment.
                            </p>
                        </div>
                    )}

                    {step === "success" && (
                        <div className="fade-in" style={{ padding: "20px 0" }}>
                            <div style={{
                                width: 72, height: 72, borderRadius: "50%", margin: "0 auto 20px",
                                background: "rgba(16,185,129,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#10b981"
                            }}>
                                <CheckCircle2 size={36} />
                            </div>
                            <h2 style={{ margin: "0 0 8px", fontSize: 24, fontWeight: 900, color: "#10b981" }}>Successfully Synced!</h2>
                            <p style={{ color: "var(--muted)", fontSize: 13, marginBottom: 24 }}>
                                Imported {syncedCount} new transactions from your bank account securely.
                            </p>
                            <button
                                onClick={() => {
                                    onSuccess();
                                    onClose();
                                }}
                                style={{
                                    width: "100%", padding: "14px", borderRadius: 14,
                                    border: "none", cursor: "pointer",
                                    background: "rgba(16,185,129,0.1)", color: "#10b981",
                                    fontWeight: 800, fontSize: 15, transition: "all 0.2s"
                                }}
                            >
                                View Transactions
                            </button>
                        </div>
                    )}

                </div>
            </div>

            <style>{`
                @keyframes spin { 100% { transform: rotate(360deg); } }
                @keyframes spinReverse { 100% { transform: rotate(-360deg); } }
                .fade-in { animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
        </div>
    );
}
