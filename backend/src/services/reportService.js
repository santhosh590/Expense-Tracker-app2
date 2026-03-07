import Transaction from "../models/Transaction.js";

export const getSummaryService = async (userId) => {
  const all = await Transaction.find({ userId });

  let income = 0;
  let expense = 0;

  all.forEach((t) => {
    if (t.type === "income") income += t.amount;
    if (t.type === "expense") expense += t.amount;
  });

  return {
    totalIncome: income,
    totalExpense: expense,
    balance: income - expense,
    totalTransactions: all.length,
  };
};

export const getCategoryReportService = async (userId) => {
  const data = await Transaction.aggregate([
    { $match: { userId } },
    { $match: { type: "expense" } },
    {
      $group: {
        _id: "$category",
        total: { $sum: "$amount" },
      },
    },
    { $sort: { total: -1 } },
  ]);

  return data.map((x) => ({
    category: x._id,
    total: x.total,
  }));
};

export const getMonthlyReportService = async (userId) => {
  const data = await Transaction.aggregate([
    { $match: { userId } },
    { $match: { type: "expense" } },
    {
      $group: {
        _id: {
          year: { $year: "$date" },
          month: { $month: "$date" },
        },
        total: { $sum: "$amount" },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } },
  ]);

  return data.map((x) => ({
    year: x._id.year,
    month: x._id.month,
    total: x.total,
  }));
};
