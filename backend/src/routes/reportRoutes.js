import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  getSummary,
  getCategoryReport,
  getMonthlyReport,
} from "../controllers/reportController.js";

const router = express.Router();

router.get("/summary", protect, getSummary);
router.get("/category", protect, getCategoryReport);
router.get("/monthly", protect, getMonthlyReport);

export default router;
