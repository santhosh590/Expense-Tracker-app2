import { useContext, useState } from "react";
import TransactionForm from "../components/transactions/TransactionForm";
import TransactionList from "../components/transactions/TransactionList";
import TransactionFilter from "../components/transactions/TransactionFilter";
import { TransactionContext } from "../context/TransactionContext";
import BankSyncModal from "../components/transactions/BankSyncModal";
import { FileSpreadsheet, RefreshCw, Download, Building2 } from "lucide-react";
import api from "../services/api";

export default function Transactions() {
  const { transactions, removeTransaction, loading, fetchTransactions, isRefreshing } = useContext(TransactionContext);
  const [filters, setFilters] = useState({
    type: "", category: "", search: "", dateFrom: "", dateTo: "", amountMin: "", amountMax: "",
  });
  const [importMsg, setImportMsg] = useState("");
  const [showSyncModal, setShowSyncModal] = useState(false);

  const filtered = transactions.filter((t) => {
    if (filters.type && t.type !== filters.type) return false;
    if (filters.category && t.category !== filters.category) return false;

    if (filters.search) {
      const q = filters.search.toLowerCase();
      const inTitle = t.title?.toLowerCase().includes(q);
      const inNotes = t.notes?.toLowerCase().includes(q);
      const inTags = t.tags?.some((tag) => tag.toLowerCase().includes(q));
      if (!inTitle && !inNotes && !inTags) return false;
    }

    if (filters.dateFrom && new Date(t.date) < new Date(filters.dateFrom)) return false;
    if (filters.dateTo && new Date(t.date) > new Date(filters.dateTo + "T23:59:59")) return false;
    if (filters.amountMin && t.amount < Number(filters.amountMin)) return false;
    if (filters.amountMax && t.amount > Number(filters.amountMax)) return false;

    return true;
  });

  const onDelete = async (id) => {
    const ok = window.confirm("Delete this transaction?");
    if (!ok) return;
    const result = await removeTransaction(id);
    if (!result.success) alert("Failed to delete: " + result.error);
  };

  // CSV Import
  const handleCSVImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      setImportMsg("⏳ Importing...");
      const res = await api.post("/transactions/import", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setImportMsg(`✅ ${res.data.message}`);
      if (fetchTransactions) fetchTransactions();
    } catch (err) {
      setImportMsg("❌ Import failed: " + (err?.response?.data?.message || err.message));
    }

    e.target.value = "";
    setTimeout(() => setImportMsg(""), 5000);
  };

  // CSV Export
  const handleCSVExport = async () => {
    try {
      const res = await api.get("/transactions/export", { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "transactions.csv");
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (err) {
      alert("Failed to export transactions");
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Transactions</div>
          <div className="page-subtitle">Add, view and manage all your income & expenses 💳</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {/* Live Sync Indicator */}
          <div style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "6px 12px", borderRadius: 10,
            background: "var(--glass)", border: "1px solid var(--border)",
            fontSize: 11, fontWeight: 600, color: "var(--muted)",
          }}>
            <div style={{
              width: 7, height: 7, borderRadius: "50%",
              background: isRefreshing ? "#f59e0b" : "#22c55e",
              animation: "pulse 2s infinite",
              boxShadow: `0 0 6px ${isRefreshing ? "#f59e0b" : "#22c55e"}66`,
            }} />
            {isRefreshing ? "Syncing..." : "Live"}
          </div>

          <button
            className="btn small secondary"
            onClick={() => fetchTransactions(true)}
            disabled={isRefreshing}
            style={{ padding: "6px 10px" }}
            title="Refresh data"
          >
            <RefreshCw size={14} style={{ animation: isRefreshing ? "spin 1s linear infinite" : "none" }} />
          </button>

          <button
            className="btn small secondary"
            onClick={handleCSVExport}
            style={{ padding: "8px 16px", borderRadius: 14, fontSize: 13, gap: 6, display: "flex", alignItems: "center" }}
            title="Export to CSV"
          >
            <Download size={14} /> Export CSV
          </button>

          <button
            className="btn small secondary"
            onClick={() => setShowSyncModal(true)}
            style={{ padding: "8px 16px", borderRadius: 14, fontSize: 13, gap: 6, display: "flex", alignItems: "center", background: "linear-gradient(135deg, rgba(59,130,246,0.1), rgba(16,185,129,0.05))", color: "#3b82f6", border: "1px solid rgba(59,130,246,0.2)" }}
            title="Auto-Sync Bank"
          >
            <Building2 size={14} /> Connect Bank
          </button>

          <label style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "10px 20px", borderRadius: 14,
            background: "linear-gradient(135deg, rgba(99,102,241,0.1), rgba(236,72,153,0.05))",
            border: "1px solid rgba(99,102,241,0.2)",
            cursor: "pointer", fontSize: 13, fontWeight: 700,
            color: "#818cf8", transition: "all 0.2s",
            boxShadow: "0 4px 12px rgba(99,102,241,0.1)",
          }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 8px 20px rgba(99,102,241,0.2)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 12px rgba(99,102,241,0.1)"; }}
          >
            <FileSpreadsheet size={16} /> Import CSV
            <input type="file" accept=".csv" onChange={handleCSVImport} style={{ display: "none" }} />
          </label>
        </div>
      </div>

      {importMsg && (
        <div style={{
          padding: "12px 18px", borderRadius: 16, marginBottom: 20, fontSize: 13, fontWeight: 700,
          background: importMsg.startsWith("✅") ? "rgba(34,197,94,0.08)" : "rgba(255,90,90,0.08)",
          color: importMsg.startsWith("✅") ? "#22c55e" : "#ff5a5a",
          border: `1px solid ${importMsg.startsWith("✅") ? "rgba(34,197,94,0.2)" : "rgba(255,90,90,0.2)"}`,
          backdropFilter: "blur(10px)",
        }}>{importMsg}</div>
      )}

      {showSyncModal && (
          <BankSyncModal 
              onClose={() => setShowSyncModal(false)}
              onSuccess={() => {
                  setImportMsg("✅ Bank synced successfully!");
                  if (fetchTransactions) fetchTransactions();
                  setTimeout(() => setImportMsg(""), 5000);
              }}
          />
      )}

      <div className="grid-3">
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <TransactionForm />
          <TransactionFilter filters={filters} setFilters={setFilters} />
        </div>
        <div style={{ gridColumn: "span 2" }}>
          {loading ? (
            <div className="card" style={{ textAlign: "center", padding: "60px 20px" }}>
              <div style={{ fontSize: 32, marginBottom: 12, animation: "spin 1s linear infinite" }}>⏳</div>
              <div style={{ fontWeight: 700, color: "var(--muted)" }}>Loading transactions...</div>
            </div>
          ) : (
            <TransactionList list={filtered} onDelete={onDelete} />
          )}
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
