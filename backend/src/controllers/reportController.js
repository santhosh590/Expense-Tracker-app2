import asyncHandler from "express-async-handler";
import {
  getSummaryService,
  getCategoryReportService,
  getMonthlyReportService,
} from "../services/reportService.js";

export const getSummary = asyncHandler(async (req, res) => {
  const data = await getSummaryService(req.user._id);
  res.json(data);
});

export const getCategoryReport = asyncHandler(async (req, res) => {
  const data = await getCategoryReportService(req.user._id);
  res.json(data);
});

export const getMonthlyReport = asyncHandler(async (req, res) => {
  const data = await getMonthlyReportService(req.user._id);
  res.json(data);
});
