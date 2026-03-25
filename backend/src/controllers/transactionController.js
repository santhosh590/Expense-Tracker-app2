import asyncHandler from "express-async-handler";
import { format } from "fast-csv";
import csvParser from "csv-parser";
import fs from "fs";
import Transaction from "../models/Transaction.js";
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

export const exportTransactionsCSV = asyncHandler(async (req, res) => {
  const transactions = await Transaction.find({ userId: req.user._id }).sort({ date: -1 });

  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", 'attachment; filename="transactions.csv"');

  const csvStream = format({ headers: true });
  csvStream.pipe(res);

  transactions.forEach((tx) => {
    csvStream.write({
      Title: tx.title,
      Amount: tx.amount,
      Type: tx.type,
      Category: tx.category,
      Date: new Date(tx.date).toISOString().split("T")[0],
      Notes: tx.notes || "",
    });
  });

  csvStream.end();
});

export const importTransactionsCSV = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error("Please upload a CSV file");
  }

  const results = [];
  const errors = [];

  fs.createReadStream(req.file.path)
    .pipe(csvParser())
    .on("data", (data) => {
      if (data.Title && data.Amount && data.Type && data.Category && data.Date) {
        results.push({
          userId: req.user._id,
          title: data.Title,
          amount: Number(data.Amount),
          type: data.Type.toLowerCase(),
          category: data.Category,
          date: new Date(data.Date),
          notes: data.Notes || "",
        });
      } else {
        errors.push(data);
      }
    })
    .on("end", async () => {
      // Delete the temporary file uploaded by multer
      fs.unlinkSync(req.file.path);

      if (results.length > 0) {
        await Transaction.insertMany(results);
      }

      res.json({
        success: true,
        message: `Successfully imported ${results.length} transactions.`,
        errors: errors.length > 0 ? `${errors.length} rows failed validation.` : null,
      });
    });
});
