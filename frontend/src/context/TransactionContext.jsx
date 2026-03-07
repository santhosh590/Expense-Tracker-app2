import { createContext, useEffect, useContext, useState, useCallback, useRef } from "react";
import {
  getTransactionsAPI,
  addTransactionAPI,
  deleteTransactionAPI,
} from "../services/transactionService";
import { useAuth } from "./AuthContext";

export const TransactionContext = createContext();

const AUTO_REFRESH_INTERVAL = 30000; // 30 seconds

export function TransactionProvider({ children }) {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastRefreshed, setLastRefreshed] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const intervalRef = useRef(null);

  const fetchTransactions = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      else setIsRefreshing(true);
      setError(null);
      const data = await getTransactionsAPI();
      setTransactions(Array.isArray(data) ? data : []);
      setLastRefreshed(new Date());
    } catch (err) {
      console.log("Fetch Transactions Error:", err);
      if (!silent) setError(err?.response?.data?.message || err.message);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // Add transaction: calls backend, then updates local state
  const addTransaction = async (tx) => {
    try {
      const saved = await addTransactionAPI(tx);
      setTransactions((prev) => [saved, ...prev]);
      setLastRefreshed(new Date());
      return { success: true, data: saved };
    } catch (err) {
      console.log("Add Transaction Error:", err);
      return { success: false, error: err?.response?.data?.message || err.message };
    }
  };

  // Delete transaction by _id
  const removeTransaction = async (id) => {
    try {
      await deleteTransactionAPI(id);
      setTransactions((prev) => prev.filter((t) => t._id !== id));
      setLastRefreshed(new Date());
      return { success: true };
    } catch (err) {
      console.log("Delete Transaction Error:", err);
      return { success: false, error: err?.response?.data?.message || err.message };
    }
  };

  // Fetch on mount only if user is logged in
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) fetchTransactions();
  }, [user, fetchTransactions]);

  // Auto-refresh every 30 seconds (silent — no loading spinner)
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    intervalRef.current = setInterval(() => {
      fetchTransactions(true); // silent refresh
    }, AUTO_REFRESH_INTERVAL);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [user, fetchTransactions]);

  // Refresh when window regains focus
  useEffect(() => {
    const handleFocus = () => {
      const token = localStorage.getItem("token");
      if (token) fetchTransactions(true);
    };
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [fetchTransactions]);

  return (
    <TransactionContext.Provider
      value={{
        transactions,
        loading,
        error,
        fetchTransactions,
        addTransaction,
        removeTransaction,
        lastRefreshed,
        isRefreshing,
      }}
    >
      {children}
    </TransactionContext.Provider>
  );
}

export const useTransactions = () => useContext(TransactionContext);
