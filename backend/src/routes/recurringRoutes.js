import express from "express";
import asyncHandler from "express-async-handler";
import { protect } from "../middleware/authMiddleware.js";
import Recurring from "../models/Recurring.js";
import Transaction from "../models/Transaction.js";
import Notification from "../models/Notification.js";

const router = express.Router();
router.use(protect);

// Get all recurring items
router.get("/", asyncHandler(async (req, res) => {
    const items = await Recurring.find({ userId: req.user._id }).sort({ nextDueDate: 1 });
    res.json(items);
}));

// Create recurring
router.post("/", asyncHandler(async (req, res) => {
    const item = await Recurring.create({ ...req.body, userId: req.user._id });
    res.status(201).json(item);
}));

// Update recurring
router.put("/:id", asyncHandler(async (req, res) => {
    const item = await Recurring.findOneAndUpdate(
        { _id: req.params.id, userId: req.user._id },
        req.body,
        { new: true }
    );
    if (!item) { res.status(404); throw new Error("Not found"); }
    res.json(item);
}));

// Delete recurring
router.delete("/:id", asyncHandler(async (req, res) => {
    const item = await Recurring.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!item) { res.status(404); throw new Error("Not found"); }
    res.json({ message: "Deleted" });
}));

// Mark bill as paid (creates a transaction)
router.post("/:id/pay", asyncHandler(async (req, res) => {
    const item = await Recurring.findOne({ _id: req.params.id, userId: req.user._id });
    if (!item) { res.status(404); throw new Error("Not found"); }

    // Create actual transaction
    const tx = await Transaction.create({
        userId: req.user._id,
        title: item.title,
        amount: item.amount,
        type: item.type,
        category: item.category,
        date: new Date(),
        notes: `Auto-paid from recurring: ${item.title}`,
        tags: item.tags,
        isRecurring: true,
        recurringInterval: item.frequency,
    });

    // Advance next due date
    const nextDate = new Date(item.nextDueDate);
    switch (item.frequency) {
        case "daily": nextDate.setDate(nextDate.getDate() + 1); break;
        case "weekly": nextDate.setDate(nextDate.getDate() + 7); break;
        case "biweekly": nextDate.setDate(nextDate.getDate() + 14); break;
        case "monthly": nextDate.setMonth(nextDate.getMonth() + 1); break;
        case "quarterly": nextDate.setMonth(nextDate.getMonth() + 3); break;
        case "yearly": nextDate.setFullYear(nextDate.getFullYear() + 1); break;
    }
    item.nextDueDate = nextDate;
    item.lastProcessed = new Date();
    item.isPaid = false;
    await item.save();

    res.json({ transaction: tx, recurring: item });
}));

// Get upcoming bills (next 30 days)
router.get("/upcoming", asyncHandler(async (req, res) => {
    const thirtyDays = new Date();
    thirtyDays.setDate(thirtyDays.getDate() + 30);
    const items = await Recurring.find({
        userId: req.user._id,
        isActive: true,
        isBillReminder: true,
        nextDueDate: { $lte: thirtyDays },
    }).sort({ nextDueDate: 1 });
    res.json(items);
}));

export default router;
