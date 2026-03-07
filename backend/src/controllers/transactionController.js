import asyncHandler from "express-async-handler";
import {
  getTransactionsService,
  addTransactionService,
  deleteTransactionService,
  updateTransactionService,
} from "../services/transactionService.js";

export const getTransactions = asyncHandler(async (req, res) => {
  const data = await getTransactionsService(req.user._id);
  res.json(data);
});

export const addTransaction = asyncHandler(async (req, res) => {
  const data = await addTransactionService(req.user._id, req.body);
  res.status(201).json(data);
});

export const deleteTransaction = asyncHandler(async (req, res) => {
  await deleteTransactionService(req.user._id, req.params.id);
  res.json({ message: "Transaction deleted" });
});

export const updateTransaction = asyncHandler(async (req, res) => {
  const data = await updateTransactionService(req.user._id, req.params.id, req.body);
  res.json(data);
});
