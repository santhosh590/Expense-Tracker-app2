import { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import { getBudgetAPI, saveBudgetAPI } from "../services/budgetService";

const BudgetContext = createContext();

const AUTO_REFRESH_INTERVAL = 60000; // 60 seconds

export function BudgetProvider({ children }) {
    const [budget, setBudget] = useState(null);
    const [budgetLoading, setBudgetLoading] = useState(false);
    const [lastRefreshed, setLastRefreshed] = useState(null);

    const getCurrentMonth = () => {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    };

    const fetchBudget = useCallback(async (month = getCurrentMonth(), silent = false) => {
        try {
            if (!silent) setBudgetLoading(true);
            const data = await getBudgetAPI(month);
            setBudget(data?.monthlyLimit ?? null);
            setLastRefreshed(new Date());
        } catch (err) {
            console.log("Fetch Budget Error:", err.message);
            if (!silent) setBudget(null);
        } finally {
            setBudgetLoading(false);
        }
    }, []);

    const saveBudget = async (monthlyLimit, month = getCurrentMonth()) => {
        try {
            const data = await saveBudgetAPI(month, monthlyLimit);
            setBudget(data.monthlyLimit);
            setLastRefreshed(new Date());
            return true;
        } catch (err) {
            console.log("Save Budget Error:", err.message);
            return false;
        }
    };

    // Auto-refresh budget
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) return;

        const interval = setInterval(() => {
            fetchBudget(getCurrentMonth(), true);
        }, AUTO_REFRESH_INTERVAL);

        return () => clearInterval(interval);
    }, [fetchBudget]);

    return (
        <BudgetContext.Provider
            value={{ budget, budgetLoading, fetchBudget, saveBudget, getCurrentMonth, lastRefreshed }}
        >
            {children}
        </BudgetContext.Provider>
    );
}

export const useBudget = () => useContext(BudgetContext);
