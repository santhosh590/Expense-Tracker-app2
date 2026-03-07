import asyncHandler from "express-async-handler";
import { getBudgetService, setBudgetService } from "../services/budgetService.js";

export const getBudget = asyncHandler(async (req, res) => {
  const data = await getBudgetService(req.user._id, req.query.month);
  res.json(data || null);
});

export const setBudget = asyncHandler(async (req, res) => {
  const data = await setBudgetService(req.user._id, req.body);
  res.status(201).json(data);
});
