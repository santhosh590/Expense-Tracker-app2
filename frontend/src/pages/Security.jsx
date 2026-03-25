import { useState, useEffect, useCallback } from "react";
import useAuth from "../hooks/useAuth";
import api from "../services/api";
import {
    Shield, Fingerprint, Smartphone, Key, Lock,
    Monitor, Clock, Globe,
    CheckCircle, XCircle, Eye, LogOut,
    Activity, Laptop, MapPin, RefreshCw, ShieldCheck,
    Database, Server, FileKey, ShieldAlert, Info,
    Loader
} from "lucide-react";

export default function Security() {
    useAuth();

    // Loading states
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState("");

    // Security status from API
    const [secStatus, setSecStatus] = useState({
        twoFactorEnabled: false,
        biometricEnabled: false,
        biometricType: "",
        sessionTimeout: 30,
        encryption: { atRest: true, inTransit: true, passwordHashing: true, tokenSecurity: true },
    });

    // 2FA state
    const [show2FASetup, setShow2FASetup] = useState(false);
    const [qrCode, setQrCode] = useState("");
    const [twoFASecret, setTwoFASecret] = useState("");
    const [verifyCode, setVerifyCode] = useState("");
    const [twoFAMethod, setTwoFAMethod] = useState("app");

    // Biometric state
    const [biometricType, setBiometricType] = useState("fingerprint");

    // Session state
    const [sessions, setSessions] = useState([]);
    const [sessionTimeout, setSessionTimeout] = useState(30);
    const [showAllSessions, setShowAllSessions] = useState(false);

    // Activity logs
    const [activityLogs, setActivityLogs] = useState([]);
    const [activityFilter, setActivityFilter] = useState("all");
    const [activityTotal, setActivityTotal] = useState(0);

    // Messages
    const [msg, setMsg] = useState("");

    // Fetch all data on mount
    const fetchSecurityStatus = useCallback(async () => {
        try {
            const res = await api.get("/security/status");
            setSecStatus(res.data);
            setSessionTimeout(res.data.sessionTimeout);
            if (res.data.biometricType) {
                setBiometricType(res.data.biometricType);
            } else if (res.data.biometricEnabled) {
                setBiometricType("fingerprint"); // Default if somehow missing
            }
        } catch (err) {
            console.error("Failed to fetch security status:", err);
        }
    }, []);

    const fetchSessions = useCallback(async () => {
        try {
            const res = await api.get("/security/sessions");
            setSessions(res.data);
        } catch (err) {
            console.error("Failed to fetch sessions:", err);
        }
    }, []);

    const fetchActivityLogs = useCallback(async (filter) => {
        try {
            const res = await api.get(`/security/activity?type=${filter || "all"}`);
            setActivityLogs(res.data.logs);
            setActivityTotal(res.data.total);
        } catch (err) {
            console.error("Failed to fetch activity logs:", err);
        }
    }, []);

    useEffect(() => {
        const init = async () => {
            setLoading(true);
            await Promise.all([fetchSecurityStatus(), fetchSessions(), fetchActivityLogs("all")]);
            setLoading(false);
        };
        init();
    }, [fetchSecurityStatus, fetchSessions, fetchActivityLogs]);

    useEffect(() => {
        fetchActivityLogs(activityFilter);
    }, [activityFilter, fetchActivityLogs]);

    // Show message helper
    const showMsg = (text) => {
        setMsg(text);
        setTimeout(() => setMsg(""), 4000);
    };

    // ── 2FA Handlers ──────────────────────────────────

    const handle2FAToggle = async () => {
        if (secStatus.twoFactorEnabled) {
            // Disable 2FA
            setActionLoading("2fa");
            try {
                await api.delete("/security/2fa");
                setSecStatus(prev => ({ ...prev, twoFactorEnabled: false }));
                setShow2FASetup(false);
                showMsg("✅ Two-factor authentication disabled");
            } catch (err) {
                showMsg("❌ Failed to disable 2FA");
            }
            setActionLoading("");
        } else {
            // Start setup
            setActionLoading("2fa-setup");
            try {
                const res = await api.post("/security/2fa/setup");
                setQrCode(res.data.qrCode);
                setTwoFASecret(res.data.secret);
                setShow2FASetup(true);
            } catch (err) {
                showMsg("❌ Failed to generate 2FA secret");
            }
            setActionLoading("");
        }
    };

    const verify2FA = async () => {
        if (verifyCode.length !== 6) return;
        setActionLoading("2fa-verify");
        try {
            await api.post("/security/2fa/verify", { token: verifyCode });
            setSecStatus(prev => ({ ...prev, twoFactorEnabled: true }));
            setShow2FASetup(false);
            setVerifyCode("");
            setQrCode("");
            showMsg("✅ Two-factor authentication enabled!");
            fetchActivityLogs(activityFilter);
        } catch (err) {
            showMsg("❌ Invalid code. Please try again.");
        }
        setActionLoading("");
    };

    // ── Biometric Handlers ────────────────────────────

    const handleBiometricToggle = async () => {
        setActionLoading("biometric");
        try {
            const newEnabled = !secStatus.biometricEnabled;
            // Send request to backend
            const res = await api.put("/security/biometric", {
                enabled: newEnabled,
                type: newEnabled ? (biometricType || "fingerprint") : "",
            });
            // Immediately reflect in UI
            setSecStatus(prev => ({
                ...prev,
                biometricEnabled: res.data.biometricEnabled,
                biometricType: res.data.biometricType,
            }));
            
            setBiometricType(res.data.biometricType || "fingerprint");
            
            showMsg(newEnabled ? "✅ Biometric login enabled" : "✅ Biometric login disabled");
            fetchActivityLogs(activityFilter);
        } catch (err) {
            console.error("Biometric Toggle Error:", err.response?.data || err.message);
            showMsg("❌ Failed to update biometric settings");
        }
        setActionLoading("");
    };

    const handleBiometricTypeChange = async (type) => {
        setBiometricType(type);
        if (secStatus.biometricEnabled) {
            try {
                const res = await api.put("/security/biometric", { enabled: true, type });
                setSecStatus(prev => ({ ...prev, biometricType: res.data.biometricType }));
            } catch (err) { /* silent */ }
        }
    };

    // ── Session Handlers ──────────────────────────────

    const handleSessionTimeoutChange = async (val) => {
        setSessionTimeout(val);
        try {
            await api.put("/security/session-timeout", { timeout: val === "never" ? 0 : Number(val) });
            setSecStatus(prev => ({ ...prev, sessionTimeout: val === "never" ? 0 : Number(val) }));
            fetchActivityLogs(activityFilter);
        } catch (err) {
            showMsg("❌ Failed to update session timeout");
        }
    };

    const handleRevokeSession = async (sessionId) => {
        try {
            await api.delete(`/security/sessions/${sessionId}`);
            setSessions(prev => prev.filter(s => s._id !== sessionId));
            showMsg("✅ Session revoked");
            fetchActivityLogs(activityFilter);
        } catch (err) {
            showMsg("❌ Failed to revoke session");
        }
    };

    // Icons for activity log types
    const logIconMap = {
        "Login": <Key size={14} />,
        "Account Created": <CheckCircle size={14} />,
        "Password Changed": <Lock size={14} />,
        "2FA Enabled": <ShieldCheck size={14} />,
        "2FA Disabled": <ShieldAlert size={14} />,
        "2FA Setup Initiated": <Key size={14} />,
        "Biometric Enabled": <Fingerprint size={14} />,
        "Biometric Disabled": <Fingerprint size={14} />,
        "Session Revoked": <LogOut size={14} />,
        "All Sessions Revoked": <LogOut size={14} />,
        "Session Timeout Updated": <Clock size={14} />,
    };

    const logColorMap = {
        auth: "#22c55e",
        security: "#6366f1",
        transaction: "#f59e0b",
        profile: "#3b82f6",
        data: "#8b5cf6",
    };

    // Security Score
    const twoFA = secStatus.twoFactorEnabled;
    const biometric = secStatus.biometricEnabled;
    const hasTimeout = secStatus.sessionTimeout > 0;
    const securityScore = [twoFA, biometric, hasTimeout, true].filter(Boolean).length;
    const scorePercent = (securityScore / 4) * 100;
    const scoreColor = scorePercent >= 75 ? "#22c55e" : scorePercent >= 50 ? "#f59e0b" : "#ef4444";

    // Time ago helper
    const timeAgo = (date) => {
        const diff = Date.now() - new Date(date).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return "Just now";
        if (mins < 60) return `${mins}m ago`;
        const hrs = Math.floor(mins / 60);
        if (hrs < 24) return `${hrs}h ago`;
        const days = Math.floor(hrs / 24);
        return `${days}d ago`;
    };

    if (loading) {
        return (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 400 }}>
                <Loader size={28} style={{ animation: "spin 1s linear infinite", color: "#6366f1" }} />
            </div>
        );
    }

    return (
        <div>
            {/* Header */}
            <div className="page-header">
                <div>
                    <div className="page-title" style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{
                            width: 40, height: 40, borderRadius: 14,
                            background: "linear-gradient(135deg, rgba(34,197,94,0.15), rgba(22,163,74,0.1))",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            border: "1px solid rgba(34,197,94,0.2)",
                        }}><Shield size={20} style={{ color: "#22c55e" }} /></div>
                        Security Center
                    </div>
                    <div className="page-subtitle">Manage your account security and privacy settings 🔐</div>
                </div>
            </div>

            {msg && (
                <div style={{
                    padding: "14px 20px", borderRadius: 16, marginBottom: 24, fontSize: 13, fontWeight: 700,
                    background: msg.startsWith("✅") ? "rgba(34,197,94,0.08)" : "rgba(255,90,90,0.08)",
                    color: msg.startsWith("✅") ? "#22c55e" : "#ff5a5a",
                    border: `1px solid ${msg.startsWith("✅") ? "rgba(34,197,94,0.2)" : "rgba(255,90,90,0.2)"}`,
                    backdropFilter: "blur(10px)",
                }}>{msg}</div>
            )}

            {/* Security Score Card */}
            <div style={{
                padding: "28px", borderRadius: 24, marginBottom: 28,
                background: "var(--card)", border: "1px solid var(--border)",
                position: "relative", overflow: "hidden",
            }}>
                <div style={{
                    position: "absolute", top: 0, left: 0, right: 0, height: 3,
                    background: `linear-gradient(90deg, ${scoreColor}, ${scoreColor}88)`,
                }} />
                <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                    <div style={{ position: "relative", width: 80, height: 80 }}>
                        <svg width="80" height="80" viewBox="0 0 80 80" style={{ transform: "rotate(-90deg)" }}>
                            <circle cx="40" cy="40" r="34" fill="none" stroke="var(--border)" strokeWidth="6" />
                            <circle cx="40" cy="40" r="34" fill="none" stroke={scoreColor} strokeWidth="6"
                                strokeDasharray={`${scorePercent * 2.136} 999`}
                                strokeLinecap="round" style={{ transition: "stroke-dasharray 0.6s ease" }} />
                        </svg>
                        <div style={{
                            position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
                            fontWeight: 900, fontSize: 22, color: scoreColor,
                        }}>{Math.round(scorePercent)}%</div>
                    </div>
                    <div>
                        <div style={{ fontWeight: 800, fontSize: 20, color: "var(--text)" }}>Security Score</div>
                        <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 4 }}>
                            {scorePercent >= 75 ? "🛡️ Your account is well protected" : scorePercent >= 50 ? "⚠️ Good, but can be improved" : "🔴 Your account needs attention"}
                        </div>
                        <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
                            {[
                                { label: "2FA", active: twoFA },
                                { label: "Biometric", active: biometric },
                                { label: "Session Timeout", active: hasTimeout },
                                { label: "Encryption", active: true },
                            ].map((item, i) => (
                                <span key={i} style={{
                                    fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 8,
                                    background: item.active ? "rgba(34,197,94,0.08)" : "rgba(239,68,68,0.08)",
                                    color: item.active ? "#22c55e" : "#ef4444",
                                    border: `1px solid ${item.active ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)"}`,
                                    display: "flex", alignItems: "center", gap: 4,
                                }}>
                                    {item.active ? <CheckCircle size={10} /> : <XCircle size={10} />} {item.label}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
                {/* Left Column */}
                <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

                    {/* 2FA Section */}
                    <div style={{
                        padding: "24px 28px", borderRadius: 20,
                        background: "var(--card)", border: "1px solid var(--border)",
                        position: "relative", overflow: "hidden",
                    }}>
                        <div style={{
                            position: "absolute", top: 0, left: 0, width: 4, height: "100%",
                            background: twoFA ? "#22c55e" : "#f59e0b",
                        }} />
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                <div style={{
                                    width: 42, height: 42, borderRadius: 12,
                                    background: twoFA ? "rgba(34,197,94,0.1)" : "rgba(245,158,11,0.1)",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    border: `1px solid ${twoFA ? "rgba(34,197,94,0.15)" : "rgba(245,158,11,0.15)"}`,
                                }}>
                                    <Key size={20} style={{ color: twoFA ? "#22c55e" : "#f59e0b" }} />
                                </div>
                                <div>
                                    <div style={{ fontWeight: 800, fontSize: 16, color: "var(--text)" }}>Two-Factor Authentication</div>
                                    <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>
                                        {twoFA ? "✅ Enabled & protecting your account" : "⚠️ Recommended for extra security"}
                                    </div>
                                </div>
                            </div>
                            <div
                                onClick={actionLoading ? undefined : handle2FAToggle}
                                style={{
                                    width: 52, height: 28, borderRadius: 14,
                                    cursor: actionLoading ? "wait" : "pointer",
                                    background: twoFA ? "#22c55e" : "var(--glass)",
                                    border: `1px solid ${twoFA ? "#22c55e" : "var(--border)"}`,
                                    position: "relative", transition: "all 0.3s",
                                    opacity: actionLoading === "2fa" || actionLoading === "2fa-setup" ? 0.5 : 1,
                                }}>
                                <div style={{
                                    width: 22, height: 22, borderRadius: "50%", position: "absolute", top: 2,
                                    left: twoFA ? 27 : 2, background: "white",
                                    transition: "left 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                                    boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                                }} />
                            </div>
                        </div>

                        {/* 2FA Method Selector */}
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
                            {[
                                { id: "app", label: "Authenticator App", icon: <Smartphone size={16} />, desc: "Google / Microsoft" },
                                { id: "sms", label: "SMS Verification", icon: <Key size={16} />, desc: "Text message code" },
                            ].map(m => (
                                <div key={m.id}
                                    onClick={() => setTwoFAMethod(m.id)}
                                    style={{
                                        padding: "14px 16px", borderRadius: 14, cursor: "pointer",
                                        background: twoFAMethod === m.id ? "rgba(99,102,241,0.06)" : "var(--glass)",
                                        border: `1px solid ${twoFAMethod === m.id ? "rgba(99,102,241,0.2)" : "var(--border)"}`,
                                        transition: "all 0.2s",
                                    }}
                                    onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; }}
                                    onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; }}
                                >
                                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                                        <span style={{ color: twoFAMethod === m.id ? "#6366f1" : "var(--muted)" }}>{m.icon}</span>
                                        <span style={{ fontWeight: 700, fontSize: 13, color: twoFAMethod === m.id ? "#6366f1" : "var(--text)" }}>{m.label}</span>
                                    </div>
                                    <div style={{ fontSize: 11, color: "var(--muted)", paddingLeft: 24 }}>{m.desc}</div>
                                </div>
                            ))}
                        </div>

                        {/* 2FA Setup with real QR */}
                        {show2FASetup && (
                            <div style={{
                                padding: "20px", borderRadius: 16,
                                background: "rgba(99,102,241,0.04)", border: "1px solid rgba(99,102,241,0.1)",
                            }}>
                                <div style={{ fontWeight: 700, fontSize: 14, color: "var(--text)", marginBottom: 12 }}>
                                    🔐 Set Up Two-Factor Authentication
                                </div>
                                {qrCode ? (
                                    <div style={{
                                        width: 180, height: 180, borderRadius: 16,
                                        background: "white", margin: "0 auto 16px",
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                        overflow: "hidden",
                                    }}>
                                        <img src={qrCode} alt="QR Code" style={{ width: 160, height: 160 }} />
                                    </div>
                                ) : (
                                    <div style={{ textAlign: "center", padding: 20 }}>
                                        <Loader size={24} style={{ animation: "spin 1s linear infinite", color: "#6366f1" }} />
                                    </div>
                                )}
                                {twoFASecret && (
                                    <div style={{
                                        padding: "8px 12px", borderRadius: 10, marginBottom: 12,
                                        background: "rgba(99,102,241,0.06)", border: "1px solid rgba(99,102,241,0.1)",
                                        textAlign: "center",
                                    }}>
                                        <div style={{ fontSize: 10, color: "var(--muted)", marginBottom: 2 }}>Manual Entry Key:</div>
                                        <div style={{ fontSize: 12, fontWeight: 800, color: "#6366f1", letterSpacing: 2, fontFamily: "monospace", wordBreak: "break-all" }}>
                                            {twoFASecret}
                                        </div>
                                    </div>
                                )}
                                <div style={{ fontSize: 12, color: "var(--muted)", textAlign: "center", marginBottom: 14 }}>
                                    Scan this QR code with your authenticator app, then enter the 6-digit code below.
                                </div>
                                <div style={{ display: "flex", gap: 8 }}>
                                    <input
                                        className="input"
                                        value={verifyCode}
                                        onChange={e => setVerifyCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                                        placeholder="000000"
                                        style={{ flex: 1, textAlign: "center", fontSize: 18, fontWeight: 800, letterSpacing: 8, padding: "12px 16px", borderRadius: 14 }}
                                        maxLength={6}
                                    />
                                    <button
                                        onClick={verify2FA}
                                        disabled={verifyCode.length !== 6 || actionLoading === "2fa-verify"}
                                        style={{
                                            padding: "12px 20px", borderRadius: 14,
                                            cursor: verifyCode.length === 6 ? "pointer" : "not-allowed",
                                            background: verifyCode.length === 6 ? "linear-gradient(135deg, #22c55e, #16a34a)" : "var(--glass)",
                                            color: verifyCode.length === 6 ? "white" : "var(--muted)",
                                            border: "none", fontWeight: 700, fontSize: 13,
                                            transition: "all 0.2s",
                                            opacity: actionLoading === "2fa-verify" ? 0.5 : 1,
                                        }}
                                    >{actionLoading === "2fa-verify" ? "Verifying..." : "Verify"}</button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Biometric Login */}
                    <div style={{
                        padding: "24px 28px", borderRadius: 20,
                        background: "var(--card)", border: "1px solid var(--border)",
                        position: "relative", overflow: "hidden",
                    }}>
                        <div style={{
                            position: "absolute", top: 0, left: 0, width: 4, height: "100%",
                            background: secStatus.biometricEnabled ? "#6366f1" : "var(--border)",
                        }} />
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                <div style={{
                                    width: 42, height: 42, borderRadius: 12,
                                    background: secStatus.biometricEnabled ? "rgba(99,102,241,0.1)" : "var(--glass)",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    border: `1px solid ${secStatus.biometricEnabled ? "rgba(99,102,241,0.15)" : "var(--border)"}`,
                                }}>
                                    <Fingerprint size={20} style={{ color: secStatus.biometricEnabled ? "#6366f1" : "var(--muted)" }} />
                                </div>
                                <div>
                                    <div style={{ fontWeight: 800, fontSize: 16, color: "var(--text)" }}>Biometric Login</div>
                                    <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>
                                        {secStatus.biometricEnabled ? "🔓 Quick access enabled" : "Use fingerprint or face recognition"}
                                    </div>
                                </div>
                            </div>
                            <div
                                onClick={actionLoading ? undefined : handleBiometricToggle}
                                style={{
                                    width: 52, height: 28, borderRadius: 14,
                                    cursor: actionLoading ? "wait" : "pointer",
                                    background: secStatus.biometricEnabled ? "#6366f1" : "var(--glass)",
                                    border: `1px solid ${secStatus.biometricEnabled ? "#6366f1" : "var(--border)"}`,
                                    position: "relative", transition: "all 0.3s",
                                    opacity: actionLoading === "biometric" ? 0.5 : 1,
                                }}>
                                <div style={{
                                    width: 22, height: 22, borderRadius: "50%", position: "absolute", top: 2,
                                    left: secStatus.biometricEnabled ? 27 : 2, background: "white",
                                    transition: "left 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                                    boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                                }} />
                            </div>
                        </div>

                        {/* Biometric Type Options */}
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                            {[
                                { id: "fingerprint", label: "Fingerprint", icon: <Fingerprint size={20} />, color: "#6366f1" },
                                { id: "face", label: "Face ID", icon: <Eye size={20} />, color: "#ec4899" },
                                { id: "iris", label: "Iris Scan", icon: <Globe size={20} />, color: "#3b82f6" },
                            ].map(b => (
                                <div key={b.id}
                                    onClick={() => secStatus.biometricEnabled && handleBiometricTypeChange(b.id)}
                                    style={{
                                        padding: "18px 12px", borderRadius: 16, cursor: secStatus.biometricEnabled ? "pointer" : "default",
                                        textAlign: "center",
                                        background: biometricType === b.id ? `${b.color}08` : "var(--glass)",
                                        border: `2px solid ${biometricType === b.id ? b.color : "var(--border)"}`,
                                        transition: "all 0.2s", opacity: secStatus.biometricEnabled ? 1 : 0.4,
                                        pointerEvents: secStatus.biometricEnabled ? "auto" : "none",
                                    }}
                                    onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; }}
                                    onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; }}
                                >
                                    <div style={{ color: biometricType === b.id ? b.color : "var(--muted)", marginBottom: 6 }}>{b.icon}</div>
                                    <div style={{ fontSize: 12, fontWeight: 700, color: biometricType === b.id ? b.color : "var(--text)" }}>{b.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Data Encryption Notice */}
                    <div style={{
                        padding: "24px 28px", borderRadius: 20,
                        background: "linear-gradient(135deg, rgba(34,197,94,0.04), rgba(22,163,74,0.02))",
                        border: "1px solid rgba(34,197,94,0.12)",
                        position: "relative", overflow: "hidden",
                    }}>
                        <div style={{
                            position: "absolute", top: 0, left: 0, width: 4, height: "100%",
                            background: "linear-gradient(180deg, #22c55e, #16a34a)",
                        }} />
                        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                            <div style={{
                                width: 42, height: 42, borderRadius: 12,
                                background: "rgba(34,197,94,0.12)",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                border: "1px solid rgba(34,197,94,0.15)",
                            }}>
                                <ShieldCheck size={20} style={{ color: "#22c55e" }} />
                            </div>
                            <div>
                                <div style={{ fontWeight: 800, fontSize: 16, color: "var(--text)" }}>Data Encryption</div>
                                <div style={{ fontSize: 12, color: "#22c55e", fontWeight: 700, marginTop: 2 }}>✅ Active & Protected</div>
                            </div>
                        </div>

                        <div style={{ display: "grid", gap: 12 }}>
                            {[
                                { label: "Data at Rest", desc: "AES-256 encryption for stored data", icon: <Database size={16} />, active: secStatus.encryption?.atRest },
                                { label: "Data in Transit", desc: "TLS 1.3 / HTTPS encryption", icon: <Server size={16} />, active: secStatus.encryption?.inTransit },
                                { label: "Password Storage", desc: "bcrypt hashing with salt rounds", icon: <FileKey size={16} />, active: secStatus.encryption?.passwordHashing },
                                { label: "Token Security", desc: "JWT with HttpOnly secure cookies", icon: <Key size={16} />, active: secStatus.encryption?.tokenSecurity },
                            ].map((item, i) => (
                                <div key={i} style={{
                                    display: "flex", alignItems: "center", justifyContent: "space-between",
                                    padding: "12px 16px", borderRadius: 14,
                                    background: "rgba(34,197,94,0.04)", border: "1px solid rgba(34,197,94,0.08)",
                                }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                        <span style={{ color: "#22c55e" }}>{item.icon}</span>
                                        <div>
                                            <div style={{ fontWeight: 700, fontSize: 13, color: "var(--text)" }}>{item.label}</div>
                                            <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 1 }}>{item.desc}</div>
                                        </div>
                                    </div>
                                    <span style={{
                                        fontSize: 10, fontWeight: 800, padding: "3px 10px", borderRadius: 8,
                                        background: "rgba(34,197,94,0.1)", color: "#22c55e",
                                        border: "1px solid rgba(34,197,94,0.15)",
                                        display: "flex", alignItems: "center", gap: 4,
                                    }}>
                                        <CheckCircle size={10} /> Active
                                    </span>
                                </div>
                            ))}
                        </div>

                        <div style={{
                            marginTop: 16, padding: "12px 16px", borderRadius: 12,
                            background: "rgba(34,197,94,0.06)", border: "1px dashed rgba(34,197,94,0.15)",
                            display: "flex", alignItems: "center", gap: 8,
                        }}>
                            <Info size={14} style={{ color: "#22c55e", flexShrink: 0 }} />
                            <span style={{ fontSize: 11, color: "var(--muted)", lineHeight: 1.5 }}>
                                All your financial data is encrypted end-to-end. We never store passwords in plain text and all API communications are secured with TLS.
                            </span>
                        </div>
                    </div>
                </div>

                {/* Right Column */}
                <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

                    {/* Session Management */}
                    <div style={{
                        padding: "24px 28px", borderRadius: 20,
                        background: "var(--card)", border: "1px solid var(--border)",
                        position: "relative", overflow: "hidden",
                    }}>
                        <div style={{
                            position: "absolute", top: 0, left: 0, width: 4, height: "100%",
                            background: "linear-gradient(180deg, #3b82f6, #6366f1)",
                        }} />
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                <div style={{
                                    width: 42, height: 42, borderRadius: 12,
                                    background: "rgba(59,130,246,0.1)",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    border: "1px solid rgba(59,130,246,0.15)",
                                }}>
                                    <Monitor size={20} style={{ color: "#3b82f6" }} />
                                </div>
                                <div>
                                    <div style={{ fontWeight: 800, fontSize: 16, color: "var(--text)" }}>Session Management</div>
                                    <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>
                                        {sessions.length} active session{sessions.length !== 1 ? "s" : ""}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Session Timeout */}
                        <div style={{
                            padding: "14px 16px", borderRadius: 14, marginBottom: 16,
                            background: "rgba(59,130,246,0.04)", border: "1px solid rgba(59,130,246,0.1)",
                        }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                    <Clock size={14} style={{ color: "#3b82f6" }} />
                                    <span style={{ fontWeight: 700, fontSize: 13, color: "var(--text)" }}>Auto Logout Timer</span>
                                </div>
                                <select
                                    value={sessionTimeout}
                                    onChange={e => handleSessionTimeoutChange(e.target.value)}
                                    style={{
                                        padding: "6px 12px", borderRadius: 10, fontSize: 12, fontWeight: 700,
                                        background: "var(--glass)", border: "1px solid var(--border)",
                                        color: "var(--text)", cursor: "pointer",
                                    }}
                                >
                                    <option value="15">15 minutes</option>
                                    <option value="30">30 minutes</option>
                                    <option value="60">1 hour</option>
                                    <option value="120">2 hours</option>
                                    <option value="0">Never</option>
                                </select>
                            </div>
                        </div>

                        {/* Active Sessions List from API */}
                        <div style={{ display: "grid", gap: 10 }}>
                            {(showAllSessions ? sessions : sessions.slice(0, 3)).map(s => (
                                <div key={s._id} style={{
                                    display: "flex", alignItems: "center", justifyContent: "space-between",
                                    padding: "14px 16px", borderRadius: 14,
                                    background: s.isCurrent ? "rgba(34,197,94,0.04)" : "var(--glass)",
                                    border: `1px solid ${s.isCurrent ? "rgba(34,197,94,0.12)" : "var(--border)"}`,
                                    borderLeft: `3px solid ${s.isCurrent ? "#22c55e" : "#3b82f6"}`,
                                    transition: "all 0.2s",
                                }}
                                    onMouseEnter={e => { if (!s.isCurrent) e.currentTarget.style.transform = "translateX(3px)"; }}
                                    onMouseLeave={e => { e.currentTarget.style.transform = "translateX(0)"; }}
                                >
                                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                        <div style={{
                                            width: 36, height: 36, borderRadius: 10,
                                            background: s.isCurrent ? "rgba(34,197,94,0.1)" : "rgba(59,130,246,0.1)",
                                            display: "flex", alignItems: "center", justifyContent: "center",
                                            color: s.isCurrent ? "#22c55e" : "#3b82f6",
                                        }}>
                                            {s.os?.toLowerCase().includes("ios") || s.device?.toLowerCase().includes("iphone")
                                                ? <Smartphone size={18} />
                                                : <Laptop size={18} />
                                            }
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 700, fontSize: 13, color: "var(--text)", display: "flex", alignItems: "center", gap: 6 }}>
                                                {s.browser} on {s.os}
                                                {s.isCurrent && (
                                                    <span style={{
                                                        fontSize: 9, fontWeight: 800, padding: "2px 8px", borderRadius: 6,
                                                        background: "rgba(34,197,94,0.1)", color: "#22c55e",
                                                    }}>CURRENT</span>
                                                )}
                                            </div>
                                            <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2, display: "flex", alignItems: "center", gap: 6 }}>
                                                <MapPin size={10} /> {s.location} • {s.ip} • {timeAgo(s.lastActive)}
                                            </div>
                                        </div>
                                    </div>
                                    {!s.isCurrent && (
                                        <button
                                            onClick={() => handleRevokeSession(s._id)}
                                            style={{
                                                padding: "6px 10px", borderRadius: 8, cursor: "pointer",
                                                background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.12)",
                                                color: "#ef4444", fontSize: 11, fontWeight: 700,
                                                display: "flex", alignItems: "center", gap: 4,
                                                transition: "all 0.2s",
                                            }}
                                            onMouseEnter={e => { e.currentTarget.style.background = "rgba(239,68,68,0.15)"; }}
                                            onMouseLeave={e => { e.currentTarget.style.background = "rgba(239,68,68,0.08)"; }}
                                        >
                                            <LogOut size={12} /> Revoke
                                        </button>
                                    )}
                                </div>
                            ))}
                            {sessions.length === 0 && (
                                <div style={{ textAlign: "center", padding: 20, color: "var(--muted)", fontSize: 13 }}>
                                    No active sessions found
                                </div>
                            )}
                        </div>

                        {sessions.length > 3 && (
                            <button
                                onClick={() => setShowAllSessions(!showAllSessions)}
                                style={{
                                    width: "100%", marginTop: 12, padding: "10px",
                                    borderRadius: 12, cursor: "pointer",
                                    background: "var(--glass)", border: "1px solid var(--border)",
                                    color: "#6366f1", fontSize: 12, fontWeight: 700,
                                    transition: "all 0.2s",
                                }}
                            >
                                {showAllSessions ? "Show Less" : `View All ${sessions.length} Sessions`}
                            </button>
                        )}
                    </div>

                    {/* Activity Logs from API */}
                    <div style={{
                        padding: "24px 28px", borderRadius: 20,
                        background: "var(--card)", border: "1px solid var(--border)",
                        position: "relative", overflow: "hidden",
                    }}>
                        <div style={{
                            position: "absolute", top: 0, left: 0, width: 4, height: "100%",
                            background: "linear-gradient(180deg, #8b5cf6, #6366f1)",
                        }} />
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                <div style={{
                                    width: 42, height: 42, borderRadius: 12,
                                    background: "rgba(139,92,246,0.1)",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    border: "1px solid rgba(139,92,246,0.15)",
                                }}>
                                    <Activity size={20} style={{ color: "#8b5cf6" }} />
                                </div>
                                <div>
                                    <div style={{ fontWeight: 800, fontSize: 16, color: "var(--text)" }}>Activity Logs</div>
                                    <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>{activityTotal} total events</div>
                                </div>
                            </div>
                            <button
                                onClick={() => fetchActivityLogs(activityFilter)}
                                style={{
                                    padding: "6px 10px", borderRadius: 8, cursor: "pointer",
                                    background: "var(--glass)", border: "1px solid var(--border)",
                                    color: "var(--muted)", display: "flex", alignItems: "center", gap: 4,
                                    transition: "all 0.2s", fontSize: 11,
                                }}
                                onMouseEnter={e => { e.currentTarget.style.color = "#6366f1"; }}
                                onMouseLeave={e => { e.currentTarget.style.color = "var(--muted)"; }}
                            >
                                <RefreshCw size={12} /> Refresh
                            </button>
                        </div>

                        {/* Filter Tabs */}
                        <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
                            {[
                                { id: "all", label: "All" },
                                { id: "auth", label: "Auth" },
                                { id: "security", label: "Security" },
                                { id: "transaction", label: "Transactions" },
                                { id: "profile", label: "Profile" },
                                { id: "data", label: "Data" },
                            ].map(f => (
                                <button key={f.id}
                                    onClick={() => setActivityFilter(f.id)}
                                    style={{
                                        padding: "6px 14px", borderRadius: 10, cursor: "pointer",
                                        fontSize: 11, fontWeight: 700,
                                        background: activityFilter === f.id ? "rgba(139,92,246,0.1)" : "var(--glass)",
                                        color: activityFilter === f.id ? "#8b5cf6" : "var(--muted)",
                                        border: `1px solid ${activityFilter === f.id ? "rgba(139,92,246,0.2)" : "var(--border)"}`,
                                        transition: "all 0.2s",
                                    }}
                                >
                                    {f.label}
                                </button>
                            ))}
                        </div>

                        {/* Logs List */}
                        <div style={{ display: "grid", gap: 6, maxHeight: 380, overflowY: "auto" }}>
                            {activityLogs.length === 0 ? (
                                <div style={{ textAlign: "center", padding: 30, color: "var(--muted)", fontSize: 13 }}>
                                    No activity logs found
                                </div>
                            ) : (
                                activityLogs.map(log => {
                                    const color = logColorMap[log.type] || "#6b7280";
                                    return (
                                        <div key={log._id} style={{
                                            display: "flex", alignItems: "center", gap: 12,
                                            padding: "12px 14px", borderRadius: 12,
                                            background: "var(--glass)",
                                            border: "1px solid var(--border)",
                                            borderLeft: `3px solid ${color}`,
                                            transition: "all 0.2s",
                                        }}
                                            onMouseEnter={e => { e.currentTarget.style.transform = "translateX(3px)"; }}
                                            onMouseLeave={e => { e.currentTarget.style.transform = "translateX(0)"; }}
                                        >
                                            <div style={{
                                                width: 30, height: 30, borderRadius: 8, flexShrink: 0,
                                                background: `${color}12`,
                                                display: "flex", alignItems: "center", justifyContent: "center",
                                                color: color,
                                            }}>{logIconMap[log.action] || <Activity size={14} />}</div>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{ fontWeight: 700, fontSize: 13, color: "var(--text)" }}>{log.action}</div>
                                                <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 1 }}>{log.detail}</div>
                                            </div>
                                            <span style={{ fontSize: 10, color: "var(--muted)", fontWeight: 600, flexShrink: 0 }}>
                                                {timeAgo(log.createdAt)}
                                            </span>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
        </div>
    );
}
