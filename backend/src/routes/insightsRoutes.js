import express from "express";
import asyncHandler from "express-async-handler";
import { protect } from "../middleware/authMiddleware.js";
import Transaction from "../models/Transaction.js";
import Budget from "../models/Budget.js";

const router = express.Router();
router.use(protect);

// Get spending insights
router.get("/", asyncHandler(async (req, res) => {
    const userId = req.user._id;

    // Get all transactions
    const transactions = await Transaction.find({ userId }).sort({ date: -1 });

    if (transactions.length === 0) {
        return res.json({
            totalIncome: 0, totalExpenses: 0, savings: 0, savingsRate: 0,
            topCategories: [], monthlyTrend: [], insights: [],
            weekdaySpending: [], averageTransaction: 0,
        });
    }

    // Basic aggregates
    const income = transactions.filter(t => t.type === "income");
    const expenses = transactions.filter(t => t.type === "expense");
    const totalIncome = income.reduce((s, t) => s + t.amount, 0);
    const totalExpenses = expenses.reduce((s, t) => s + t.amount, 0);
    const savings = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? Math.round((savings / totalIncome) * 100) : 0;
    const averageTransaction = expenses.length > 0 ? Math.round(totalExpenses / expenses.length) : 0;

    // Top expense categories
    const categoryMap = {};
    expenses.forEach(t => {
        if (!categoryMap[t.category]) categoryMap[t.category] = 0;
        categoryMap[t.category] += t.amount;
    });
    const topCategories = Object.entries(categoryMap)
        .map(([name, total]) => ({
            name, total,
            percentage: Math.round((total / totalExpenses) * 100),
        }))
        .sort((a, b) => b.total - a.total)
        .slice(0, 8);

    // Monthly trend (last 6 months)
    const monthlyTrend = [];
    for (let i = 5; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        const month = d.getMonth();
        const year = d.getFullYear();
        const monthLabel = d.toLocaleString("default", { month: "short" });

        const mIncome = transactions
            .filter(t => t.type === "income" && new Date(t.date).getMonth() === month && new Date(t.date).getFullYear() === year)
            .reduce((s, t) => s + t.amount, 0);
        const mExpense = transactions
            .filter(t => t.type === "expense" && new Date(t.date).getMonth() === month && new Date(t.date).getFullYear() === year)
            .reduce((s, t) => s + t.amount, 0);

        monthlyTrend.push({ month: monthLabel, income: mIncome, expense: mExpense, savings: mIncome - mExpense });
    }

    // Weekday spending pattern
    const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const weekdayTotals = new Array(7).fill(0);
    const weekdayCounts = new Array(7).fill(0);
    expenses.forEach(t => {
        const day = new Date(t.date).getDay();
        weekdayTotals[day] += t.amount;
        weekdayCounts[day]++;
    });
    const weekdaySpending = weekdays.map((name, i) => ({
        day: name,
        total: weekdayTotals[i],
        average: weekdayCounts[i] > 0 ? Math.round(weekdayTotals[i] / weekdayCounts[i]) : 0,
    }));

    // Generate smart insights
    const insights = [];

    // Highest spending category
    if (topCategories.length > 0) {
        insights.push({
            type: "warning",
            title: "Biggest Expense Category",
            message: `${topCategories[0].name} accounts for ${topCategories[0].percentage}% of your total expenses (₹${topCategories[0].total.toLocaleString()}).`,
            icon: "📊",
        });
    }

    // Savings rate insight
    if (savingsRate > 30) {
        insights.push({
            type: "success",
            title: "Great Savings Rate!",
            message: `You're saving ${savingsRate}% of your income. Keep up the excellent work!`,
            icon: "🎉",
        });
    } else if (savingsRate > 10) {
        insights.push({
            type: "info",
            title: "Moderate Savings",
            message: `You're saving ${savingsRate}% of your income. Try to push it above 30% for financial security.`,
            icon: "💡",
        });
    } else {
        insights.push({
            type: "danger",
            title: "Low Savings Alert",
            message: `Your savings rate is only ${savingsRate}%. Consider cutting back on discretionary spending.`,
            icon: "⚠️",
        });
    }

    // Spending trend
    if (monthlyTrend.length >= 2) {
        const lastMonth = monthlyTrend[monthlyTrend.length - 1];
        const prevMonth = monthlyTrend[monthlyTrend.length - 2];
        if (prevMonth.expense > 0) {
            const change = Math.round(((lastMonth.expense - prevMonth.expense) / prevMonth.expense) * 100);
            if (change > 20) {
                insights.push({
                    type: "warning",
                    title: "Spending Increase",
                    message: `Your expenses increased by ${change}% compared to last month. Review your recent transactions.`,
                    icon: "📈",
                });
            } else if (change < -10) {
                insights.push({
                    type: "success",
                    title: "Spending Decreased",
                    message: `Your expenses decreased by ${Math.abs(change)}% compared to last month. Great progress!`,
                    icon: "📉",
                });
            }
        }
    }

    // Most expensive day
    const maxDay = weekdaySpending.reduce((prev, curr) => curr.total > prev.total ? curr : prev);
    if (maxDay.total > 0) {
        insights.push({
            type: "info",
            title: "Peak Spending Day",
            message: `You tend to spend the most on ${maxDay.day}s (avg ₹${maxDay.average.toLocaleString()}).`,
            icon: "📅",
        });
    }

    // Average transaction size
    if (averageTransaction > 0) {
        insights.push({
            type: "info",
            title: "Average Transaction",
            message: `Your average expense transaction is ₹${averageTransaction.toLocaleString()}.`,
            icon: "💳",
        });
    }

    // Budget check
    try {
        const budgets = await Budget.find({ userId });
        const overBudget = budgets.filter(b => {
            const spent = expenses
                .filter(t => t.category === b.category && new Date(t.date).getMonth() === new Date().getMonth())
                .reduce((s, t) => s + t.amount, 0);
            return spent > b.limit;
        });
        if (overBudget.length > 0) {
            insights.push({
                type: "danger",
                title: "Over Budget!",
                message: `You've exceeded your budget in ${overBudget.length} categor${overBudget.length > 1 ? "ies" : "y"}: ${overBudget.map(b => b.category).join(", ")}.`,
                icon: "🚨",
            });
        }
    } catch (e) { /* budgets optional */ }

    res.json({
        totalIncome, totalExpenses, savings, savingsRate,
        topCategories, monthlyTrend, insights,
        weekdaySpending, averageTransaction,
        transactionCount: transactions.length,
    });
}));

export default router;
