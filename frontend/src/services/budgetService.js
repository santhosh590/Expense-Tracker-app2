import api from "./api";

// Get budget for a specific month (format: "YYYY-MM")
export const getBudgetAPI = async (month) => {
  const res = await api.get("/budget", { params: { month } });
  return res.data;
};

// Create or update budget for a specific month
export const saveBudgetAPI = async (month, monthlyLimit) => {
  const res = await api.post("/budget", { month, monthlyLimit });
  return res.data;
};
