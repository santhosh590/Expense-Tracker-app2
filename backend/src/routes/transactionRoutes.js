import express from "express";
import multer from "multer";
import {
  getTransactions,
  addTransaction,
  deleteTransaction,
  updateTransaction,
  exportTransactionsCSV,
  importTransactionsCSV,
} from "../controllers/transactionController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Multer setup for temporary file storage
const upload = multer({ dest: "uploads/" });

router.get("/export", protect, exportTransactionsCSV);
router.post("/import", protect, upload.single("file"), importTransactionsCSV);

router.get("/", protect, getTransactions);
router.post("/", protect, addTransaction);
router.put("/:id", protect, updateTransaction);
router.delete("/:id", protect, deleteTransaction);

export default router;
