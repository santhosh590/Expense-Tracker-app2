import Budget from "../models/Budget.js";

export const getBudgetService = async (userId, month) => {
  if (!month) throw new Error("Month is required");
  return await Budget.findOne({ userId, month });
};

export const setBudgetService = async (userId, body) => {
  const { month, monthlyLimit } = body;

  if (!month || monthlyLimit === undefined) {
    throw new Error("Month and monthlyLimit required");
  }

  const existing = await Budget.findOne({ userId, month });

  if (existing) {
    existing.monthlyLimit = monthlyLimit;
    await existing.save();
    return existing;
  }

  return await Budget.create({ userId, month, monthlyLimit });
};
